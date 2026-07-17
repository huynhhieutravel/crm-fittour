const db = require('../server/db');

async function run() {
    try {
        const res = await db.query('SELECT id, username, full_name, bus FROM users');
        const users = res.rows;
        
        let counts = { BU1: 0, BU2: 0, BU3: 0, BU4: 0 };
        
        for (const u of users) {
            if (!u.username) continue;
            const uname = u.username.toLowerCase();
            
            let targetBU = null;
            if (/^sv\d+\./.test(uname)) targetBU = 'BU3';
            else if (/^tq\d+\./.test(uname)) targetBU = 'BU1';
            else if (/^gu\d+\./.test(uname)) targetBU = 'BU2';
            else if (/^hi\d+\./.test(uname)) targetBU = 'BU4';
            
            if (targetBU) {
                // Check if already in array to avoid duplicates
                const currentBus = u.bus || [];
                if (!currentBus.includes(targetBU)) {
                    currentBus.push(targetBU);
                    await db.query('UPDATE users SET bus = $1 WHERE id = $2', [currentBus, u.id]);
                    counts[targetBU]++;
                    console.log(`Updated ${u.full_name} (${u.username}) => ${currentBus.join(', ')}`);
                }
            }
        }
        
        console.log("=== HOÀN TẤT CẬP NHẬT ===");
        console.log(`Đã gán BU1: ${counts.BU1} nhân sự`);
        console.log(`Đã gán BU2: ${counts.BU2} nhân sự`);
        console.log(`Đã gán BU3: ${counts.BU3} nhân sự`);
        console.log(`Đã gán BU4: ${counts.BU4} nhân sự`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
