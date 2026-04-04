const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../raw/BU1-MKT.xlsx');
const workbook = xlsx.readFile(filePath, { cellDates: true, dateNF: "yyyy-mm-dd" });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

function parsePhone(phone) {
    if (!phone) return "";
    let str = phone.toString().trim();
    if (str.length === 9 && !str.startsWith('0')) str = '0' + str;
    return str;
}

const cleaned = data.map(row => {
    let pastTrips = 0;
    if (row['Tuyến đã đi']) {
        const trips = row['Tuyến đã đi'].split(',').filter(x => x.trim().length > 0);
        pastTrips = trips.length;
    }
    
    let formattedDate = null;
    if (row['Date of Birth'] instanceof Date) {
        // Fix for timezone shifts reading dates natively
        formattedDate = new Date(row['Date of Birth'].getTime() - (row['Date of Birth'].getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
    } else if (typeof row['Date of Birth'] === 'string' && row['Date of Birth'].length > 0) {
        let dStr = row['Date of Birth'];
        if (dStr.includes('/')) {
            const parts = dStr.split('/');
            if (parts.length === 3) {
                // assume DD/MM/YYYY
                formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
                formattedDate = dStr;
            }
        } else {
            formattedDate = dStr; 
        }
    }

    return {
        name: row['Full name'] || "Khách hàng Mới",
        birth_date: formattedDate,
        gender: row['Gender'] || null,
        phone: parsePhone(row['Phone Number']) || null,
        past_trip_count: pastTrips,
        internal_notes: row['Tuyến đã đi'] ? `Các tuyến đã đi: ${row['Tuyến đã đi']}` : null,
        notes: row['Ghi chú'] || null,
        tags: 'BU1, VIP'
    };
});

// We generate an executable node script to place on the VPS
let scriptContext = `require('dotenv').config();
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

const customers = ${JSON.stringify(cleaned, null, 2)};

async function run() {
    let inserted = 0;
    for (const c of customers) {
        try {
            await db.query(
                \`INSERT INTO customers (name, birth_date, gender, phone, past_trip_count, internal_notes, notes, tags) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT DO NOTHING\`,
                [c.name, c.birth_date, c.gender, c.phone, c.past_trip_count, c.internal_notes, c.notes, c.tags]
            );
            inserted++;
        } catch (err) {
            console.error('Lỗi khi chèn khách hàng:', c.name, err.message);
        }
    }
    console.log(\`Đã import thành công \${inserted} khách hàng VIP BU1!\`);
    process.exit(0);
}
run();
`;

fs.writeFileSync(path.join(__dirname, 'vps_import_bu1.js'), scriptContext);
console.log(`Generated migration script for ${cleaned.length} customers.`);
