const db = require('../db');

function generateCode(date) {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DEP-${date.toISOString().slice(2, 10).replace(/-/g, '')}-${randomChars}`;
}

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seedDepartures() {
    try {
        console.log('Seeding fake departures data...');
        
        // Find existing tour templates
        const templatesRes = await db.query('SELECT id, base_price, duration FROM tour_templates LIMIT 5');
        const templates = templatesRes.rows;
        
        if (templates.length === 0) {
            console.log('❌ No tour templates found. Please create some templates first.');
            process.exit(1);
        }

        // Find existing guides
        const guidesRes = await db.query('SELECT id FROM guides LIMIT 3');
        const guides = guidesRes.rows;
        
        const statuses = ['Open', 'Guaranteed', 'Full'];
        const numDeparturesToCreate = 6;
        
        for (let i = 0; i < numDeparturesToCreate; i++) {
            const template = getRandomElement(templates);
            const guide = guides.length > 0 ? getRandomElement(guides) : null;
            
            // Generate some random realistic dates in the near future
            const start_date = new Date();
            start_date.setDate(start_date.getDate() + Math.floor(Math.random() * 60) + 7); // +7 to +67 days
            
            // Duration parsing like '5 days', '4N3D'
            let days = 5;
            if (template.duration && template.duration.match(/\d+/)) {
                days = parseInt(template.duration.match(/\d+/)[0], 10);
            }
            
            const end_date = new Date(start_date);
            end_date.setDate(end_date.getDate() + days - 1);
            
            const actual_price = template.base_price ? Number(template.base_price) + 2000000 : 15000000;
            const status = getRandomElement(statuses);
            
            const max_participants = 20 + Math.floor(Math.random() * 10); // 20 - 30
            const break_even_pax = 15;
            
            const code = generateCode(start_date);
            
            const sql = `
                INSERT INTO tour_departures (
                    code, tour_template_id, start_date, end_date, max_participants, status,
                    actual_price, break_even_pax, guide_id,
                    price_adult
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id;
            `;
            
            const result = await db.query(sql, [
                code,
                template.id,
                start_date,
                end_date,
                max_participants,
                status,
                actual_price,
                break_even_pax,
                guide ? guide.id : null,
                actual_price
            ]);
            
            const depId = result.rows[0].id;
            console.log(`✅ Inserted departure ${code} (ID: ${depId})`);
            
            // Generate some random fake bookings to simulate load factor
            const numBookings = status === 'Full' 
                ? max_participants 
                : Math.floor(Math.random() * (max_participants - 2)) + 2; // 2 to max-1
                
            let currentPax = 0;
            
            // Insert 1 to 5 random bookings for this departure
            const numBookingOrders = Math.floor(Math.random() * 5) + 1;
            
            for (let j = 0; j < numBookingOrders; j++) {
                if (currentPax >= numBookings) break;
                
                const paxCount = Math.min(Math.floor(Math.random() * 4) + 1, numBookings - currentPax);
                if (paxCount <= 0) break;
                
                // Get a random customer
                const custRes = await db.query('SELECT id FROM customers ORDER BY RANDOM() LIMIT 1');
                if (custRes.rows.length === 0) break; // no customers
                
                const customer_id = custRes.rows[0].id;
                const bookingCode = 'BK-' + Date.now().toString().slice(-6) + '-' + j;
                const totalPrice = actual_price * paxCount;
                
                await db.query(`
                    INSERT INTO bookings (
                        booking_code, customer_id, tour_departure_id, 
                        pax_count, total_price, payment_status, booking_status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    bookingCode, customer_id, depId, 
                    paxCount, totalPrice, 'paid', 'confirmed'
                ]);
                
                currentPax += paxCount;
            }
            console.log(`   └─ Added ${currentPax} pax booked via random bookings.`);
        }
        
        console.log('🎉 Done seeding fake departures.');
    } catch (err) {
        console.error('❌ Failed to seed:', err);
    } finally {
        process.exit(0);
    }
}

seedDepartures();
