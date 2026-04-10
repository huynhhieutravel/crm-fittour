require('dotenv').config();
const db = require('./db');

async function createLeads() {
    try {
        console.log("Fetching users and tours...");
        const users = await db.query("SELECT id, username FROM users WHERE is_active = true");
        const tours = await db.query("SELECT id FROM tour_templates LIMIT 5");
        
        const userIds = users.rows.map(u => u.id);
        const tourIds = tours.rows.map(t => t.id);

        if (userIds.length === 0) {
            console.log("No users found");
            return;
        }

        console.log(`Found ${userIds.length} users... Inserting 10 Leads...`);
        for (let i = 1; i <= 10; i++) {
            // Assign: 0-3 Unassigned, 4-9 assigned uniformly
            const assigned_to = i <= 3 ? null : userIds[i % userIds.length];
            const name = `Mock Lead ${i} (Data Test ${Math.random().toString(36).substring(7)})`;
            const phone = `0989${Math.floor(100000 + Math.random() * 900000)}`;
            const email = `testlead${i}@example.com`;
            const source = ['Facebook', 'Zalo', 'Website', 'Hotline'][i % 4];
            const classification = ['Mới', 'Ấm', 'Nóng', 'Lạnh'][i % 4];
            const status = ['Mới', 'Đang liên hệ', 'Tiềm năng'][i % 3];
            const tour_id = tourIds.length > 0 ? tourIds[i % tourIds.length] : null;

            await db.query(`
                INSERT INTO leads (name, phone, email, source, classification, status, assigned_to, tour_id, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `, [name, phone, email, source, classification, status, assigned_to, tour_id]);
        }
        
        console.log("✅ 10 Mock Leads generated successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createLeads();
