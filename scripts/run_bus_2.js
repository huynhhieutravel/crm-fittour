const db = require('../server/db');

async function runKtMkt() {
    try {
        const res = await db.query('SELECT id, username, full_name, bus FROM users');
        const users = res.rows;
        
        let counts = { KETOAN: 0, MARKETING: 0 };
        
        for (const u of users) {
            if (!u.username) continue;
            const uname = u.username.toLowerCase();
            
            let targetBU = null;
            if (uname.endsWith('.kt')) targetBU = 'KETOAN';
            else if (uname.endsWith('.mkt')) targetBU = 'MARKETING';
            
            if (targetBU) {
                const currentBus = u.bus || [];
                if (!currentBus.includes(targetBU)) {
                    currentBus.push(targetBU);
                    await db.query('UPDATE users SET bus = $1 WHERE id = $2', [currentBus, u.id]);
                    counts[targetBU]++;
                    console.log(`Updated ${u.full_name} (${u.username}) => ${currentBus.join(', ')}`);
                }
            }
        }
        
        console.log("=== HOÀN TẤT CẬP NHẬT (KETOAN & MARKETING) ===");
        console.log(`Đã gán KETOAN: ${counts.KETOAN} nhân sự`);
        console.log(`Đã gán MARKETING: ${counts.MARKETING} nhân sự`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

runKtMkt();
