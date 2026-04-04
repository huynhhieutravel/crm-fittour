const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../raw/BU1-MKT.xlsx');
const workbook = xlsx.readFile(filePath, { cellDates: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

function parsePhone(phone) {
    if (!phone) return null;
    let str = phone.toString().trim();
    if (str.length === 9 && !str.startsWith('0')) str = '0' + str;
    return str;
}

function titleCase(str) {
    if (!str) return 'Khách hàng mới';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

let uniqueDestinations = new Set();
const customers = data.map(row => {
    let destinations = [];
    if (row['Tuyến đã đi']) {
        const trips = row['Tuyến đã đi'].split(',').map(x => x.trim()).filter(x => x.length > 0);
        destinations = trips;
        trips.forEach(t => uniqueDestinations.add(t));
    }
    
    let formattedDate = null;
    if (row['Date of Birth'] instanceof Date) {
        formattedDate = new Date(row['Date of Birth'].getTime() - (row['Date of Birth'].getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
    } else if (typeof row['Date of Birth'] === 'string' && row['Date of Birth'].length > 0) {
        let dStr = row['Date of Birth'];
        if (dStr.includes('/')) {
            const parts = dStr.split('/');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
                formattedDate = dStr;
            }
        } else {
            formattedDate = dStr; 
        }
    }

    return {
        name: titleCase(row['Full name']),
        birth_date: formattedDate,
        gender: row['Gender'] || null,
        phone: parsePhone(row['Phone Number']),
        destinations: destinations,
        notes: row['Ghi chú'] || null,
        tags: 'BU1, VIP',
        // Because we will generate real bookings for them, we set past_trip_count to 0 so we don't double count!
        past_trip_count: 0
    };
});

const destinationsList = Array.from(uniqueDestinations);

let scriptContext = `require('dotenv').config();
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

const customers = ${JSON.stringify(customers, null, 2)};
const destinations = ${JSON.stringify(destinationsList, null, 2)};

async function run() {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        let destMap = {}; // name -> departure_id

        // 1. Create Templates & Departures for all unique destinations
        console.log('Tạo Lịch trình và Lịch khởi hành...');
        for (const dest of destinations) {
            // Find existing or create template
            const templateName = \`[Tour Cũ] \${dest}\`;
            let res = await client.query('SELECT id FROM tour_templates WHERE name = $1 LIMIT 1', [templateName]);
            let tplId;
            if (res.rows.length === 0) {
                const insRes = await client.query(
                    \`INSERT INTO tour_templates (name, status, is_active, description) VALUES ($1, 'archived', false, 'Tour cũ map từ dữ liệu lịch sử') RETURNING id\`,
                    [templateName]
                );
                tplId = insRes.rows[0].id;
            } else {
                tplId = res.rows[0].id;
            }

            // Create departure (2025-01-01)
            let depRes = await client.query('SELECT id FROM tour_departures WHERE tour_template_id = $1 AND start_date = \\'2025-01-01\\' LIMIT 1', [tplId]);
            let depId;
            if (depRes.rows.length === 0) {
                const insDep = await client.query(
                    \`INSERT INTO tour_departures (tour_template_id, start_date, end_date, status, code, price_adult) 
                     VALUES ($1, '2025-01-01', '2025-01-05', 'Completed', $2, 0) RETURNING id\`,
                    [tplId, 'LEGACY-' + tplId]
                );
                depId = insDep.rows[0].id;
            } else {
                depId = depRes.rows[0].id;
            }

            destMap[dest] = depId;
        }

        let insertedCustomers = 0;
        let insertedBookings = 0;

        // 2. Insert Customers & Bookings
        console.log('Chèn thông tin Khách hàng và Lịch sử Booking...');
        for (const c of customers) {
            // Check if customer exists by phone or create new string
            let custId;
            if (c.phone) {
                let existing = await client.query('SELECT id FROM customers WHERE phone = $1', [c.phone]);
                if (existing.rows.length > 0) {
                    custId = existing.rows[0].id; // update? Or just use existing
                }
            }
            if (!custId) {
                const insCust = await client.query(
                    \`INSERT INTO customers (name, birth_date, gender, phone, past_trip_count, notes, tags) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING id\`,
                    [c.name, c.birth_date, c.gender, c.phone, c.past_trip_count, c.notes, c.tags]
                );
                custId = insCust.rows[0].id;
                insertedCustomers++;
            }
            
            // 3. Create Bookings
            if (c.destinations && c.destinations.length > 0) {
                for (const destName of c.destinations) {
                    const depId = destMap[destName];
                    const bookingCode = 'LEGACY-' + custId + '-' + depId;
                    
                    // Check if already booked
                    const bkRes = await client.query('SELECT id FROM bookings WHERE booking_code = $1', [bookingCode]);
                    if (bkRes.rows.length === 0) {
                        const tplRes = await client.query('SELECT tour_template_id FROM tour_departures WHERE id = $1', [depId]);
                        const tplId = tplRes.rows[0].tour_template_id;
                        await client.query(
                            \`INSERT INTO bookings (customer_id, tour_id, tour_departure_id, booking_code, booking_status, payment_status, pax_count, total_price)
                             VALUES ($1, $2, $3, $4, 'confirmed', 'paid', 1, 0)\`,
                            [custId, tplId, depId, bookingCode]
                        );
                        insertedBookings++;
                    }
                }
            }
        }

        await client.query('COMMIT');
        console.log(\`Đã hoàn thành! Nạp \${insertedCustomers} Khách hàng mới và tạo \${insertedBookings} Lịch sử Đặt Tour.\`);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Lỗi nghiêm trọng, đã Rollback:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}
run();
`;

fs.writeFileSync(path.join(__dirname, 'vps_generate_bookings.js'), scriptContext);
console.log(`Script generated successfully! Ready to push to VPS.`);
