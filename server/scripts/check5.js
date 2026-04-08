const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const res = await db.query(`SELECT id, raw_details FROM op_tour_bookings WHERE raw_details->'passenger_list' IS NOT NULL`);
        
        for(let row of res.rows) {
            const details = row.raw_details;
            if(details.passenger_list) {
                details.members = details.passenger_list.map(p => ({
                    name: p.full_name,
                    phone: p.phone,
                    gender: Math.random() > 0.5 ? 'Nam' : 'Nữ',
                    ageType: 'Người lớn',
                    dob: '01/01/1990',
                    docId: '079090012345',
                    issueDate: '01/01/2020',
                    expiryDate: '01/01/2030',
                    roomType: 'Twin',
                    roomCode: 'R01',
                    note: 'Khách VIP (Seeded)'
                }));
                // Delete old passenger_list to clean up
                delete details.passenger_list;
                
                await db.query(
                    `UPDATE op_tour_bookings SET raw_details = $1 WHERE id = $2`,
                    [details, row.id]
                );
            }
        }
        console.log("Fixed members list in raw_details!");
    } catch(e) { console.error(e); } finally { db.end(); }
}
run();
