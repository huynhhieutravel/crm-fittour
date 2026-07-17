const db = require('../server/db');

async function dryRun() {
    try {
        const res = await db.query('SELECT id, username, full_name, bus FROM users');
        const users = res.rows;
        
        let counts = { BU1: 0, BU2: 0, BU3: 0, BU4: 0, UNMATCHED: 0 };
        let logs = [];
        
        for (const u of users) {
            if (!u.username) continue;
            const uname = u.username.toLowerCase();
            
            let targetBU = null;
            if (/^sv\d+\./.test(uname)) targetBU = 'BU3';
            else if (/^tq\d+\./.test(uname)) targetBU = 'BU1';
            else if (/^gu\d+\./.test(uname)) targetBU = 'BU2';
            else if (/^hi\d+\./.test(uname)) targetBU = 'BU4';
            
            if (targetBU) {
                counts[targetBU]++;
                logs.push(`- ${u.full_name} (${u.username}) => [${targetBU}]`);
            } else {
                counts.UNMATCHED++;
            }
        }
        
        console.log("=== KẾT QUẢ QUÉT (DRY RUN) ===");
        console.log(`BU1 (tq): ${counts.BU1} nhân sự`);
        console.log(`BU2 (gu): ${counts.BU2} nhân sự`);
        console.log(`BU3 (sv): ${counts.BU3} nhân sự`);
        console.log(`BU4 (hi): ${counts.BU4} nhân sự`);
        console.log(`Không khớp: ${counts.UNMATCHED} nhân sự\n`);
        
        console.log("=== DANH SÁCH CHI TIẾT ===");
        console.log(logs.join('\n'));
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

dryRun();
