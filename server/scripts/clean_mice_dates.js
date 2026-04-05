const db = require('../db');

async function cleanDates() {
    const client = await db.pool.connect();
    try {
        console.log("Starting date cleaning process...");
        
        const res = await client.query("SELECT id, notes FROM group_projects WHERE notes LIKE 'Thời gian gốc: %'");
        const rows = res.rows;
        
        console.log(`Found ${rows.length} rows to process.`);
        
        await client.query('BEGIN');
        
        let updateCount = 0;
        
        for (let row of rows) {
            let raw = row.notes.replace("Thời gian gốc:", "").trim();
            let p1, p2, startDay, startMonth, endDay, endMonth;
            let year = 2026;
            let departure_date = null, return_date = null;

            if (raw.includes('-')) {
                let parts = raw.split('-');
                p1 = parts[0].trim();
                p2 = parts[1].trim();

                let p2Parts = p2.split('/');
                endDay = parseInt(p2Parts[0]);
                endMonth = parseInt(p2Parts[1]);

                let p1Parts = p1.split('/');
                startDay = parseInt(p1Parts[0]);
                startMonth = p1Parts.length > 1 ? parseInt(p1Parts[1]) : endMonth;

                if (!isNaN(startDay) && !isNaN(startMonth)) {
                    let d = `${year}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
                    if (Date.parse(d)) departure_date = d;
                }
                if (!isNaN(endDay) && !isNaN(endMonth)) {
                    let d = `${year}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
                    if (Date.parse(d)) return_date = d;
                }
            }
            
            if ((departure_date && !isNaN(Date.parse(departure_date))) || (return_date && !isNaN(Date.parse(return_date)))) {
                try {
                    await client.query(
                        `UPDATE group_projects SET departure_date = $1, return_date = $2 WHERE id = $3`,
                        [departure_date, return_date, row.id]
                    );
                    updateCount++;
                    console.log(`Row ${row.id} updated: ${raw} => ${departure_date} to ${return_date}`);
                } catch(err) {
                    console.error(`Row ${row.id} SQL Error: ${err.message}. Skipping...`);
                }
            } else {
                console.log(`Row ${row.id} skipped, cannot parse: ${raw}`);
            }
        }
        
        await client.query('COMMIT');
        console.log(`Successfully updated ${updateCount} rows.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Clean failed:", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

cleanDates();
