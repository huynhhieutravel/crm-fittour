const db = require('./server/db');
async function fix() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const ents = ['hotel', 'restaurant', 'transport', 'ticket', 'airline', 'landtour', 'insurance'];
        for (let e of ents) {
            let p = e + 's';
            await client.query(`ALTER TABLE group_${e}_contacts ADD CONSTRAINT fk_${e}_contacts FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            await client.query(`ALTER TABLE group_${e}_contracts ADD CONSTRAINT fk_${e}_contracts FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            await client.query(`ALTER TABLE group_${e}_notes ADD CONSTRAINT fk_${e}_notes FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            if (e === 'hotel') {
                await client.query(`ALTER TABLE group_hotel_room_types ADD CONSTRAINT fk_h_rt FOREIGN KEY (hotel_id) REFERENCES group_hotels(id) ON DELETE CASCADE;`).catch(()=>{});
                await client.query(`ALTER TABLE group_hotel_allotments ADD CONSTRAINT fk_h_al FOREIGN KEY (hotel_id) REFERENCES group_hotels(id) ON DELETE CASCADE;`).catch(()=>{});
                await client.query(`ALTER TABLE group_hotel_contract_rates ADD CONSTRAINT fk_h_cr FOREIGN KEY (contract_id) REFERENCES group_hotel_contracts(id) ON DELETE CASCADE;`).catch(()=>{});
            } else {
                await client.query(`ALTER TABLE group_${e}_services ADD CONSTRAINT fk_${e}_srv FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            }
        }
        await client.query('COMMIT');
        console.log('FKs added.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    } finally {
        client.release();
        process.exit();
    }
}
fix();
