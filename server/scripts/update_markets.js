const db = require('../db');

(async () => {
    try {
        const mRes = await db.query('SELECT name FROM markets');
        const validMarkets = mRes.rows.map(r => r.name);
        
        const tRes = await db.query('SELECT id, market FROM tour_departures WHERE market IS NOT NULL');
        let count = 0;
        
        for (const r of tRes.rows) {
            let originalArr = r.market.split(',').map(m => m.trim());
            let newArr = [];
            let changed = false;
            
            for (const m of originalArr) {
                 const match = validMarkets.find(v => v.toLowerCase() === m.toLowerCase());
                 if (match) {
                     newArr.push(match);
                     if (match !== m) changed = true;
                 } else {
                     newArr.push(m);
                 }
            }
            
            if (changed) {
                 const newMarketStr = newArr.join(',');
                 await db.query('UPDATE tour_departures SET market = $1 WHERE id = $2', [newMarketStr, r.id]);
                 console.log(`Updated ${r.market} => ${newMarketStr}`);
                 count++;
            }
        }
        console.log(`Fixed ${count} tours`);
    } catch(err) {
        console.error(err);
    } finally {
        db.pool.end();
    }
})();
