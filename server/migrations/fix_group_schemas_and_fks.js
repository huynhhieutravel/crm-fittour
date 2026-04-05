const db = require('../db');

async function fix() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const entities = [
            { group: 'group_hotels', std: 'hotels', singular: 'hotel' },
            { group: 'group_restaurants', std: 'restaurants', singular: 'restaurant' },
            { group: 'group_transports', std: 'transports', singular: 'transport' },
            { group: 'group_tickets', std: 'tickets', singular: 'ticket' },
            { group: 'group_airlines', std: 'airlines', singular: 'airline' },
            { group: 'group_landtours', std: 'landtours', singular: 'landtour' },
            { group: 'group_insurances', std: 'insurances', singular: 'insurance' }
        ];

        // 1. Drop existing group tables (flawed schemas)
        for (const { group, singular } of entities) {
            console.log(`Dropping ${group}...`);
            await client.query(`DROP TABLE IF EXISTS group_${singular}_notes CASCADE`);
            await client.query(`DROP TABLE IF EXISTS group_${singular}_services CASCADE`);
            await client.query(`DROP TABLE IF EXISTS group_${singular}_contracts CASCADE`);
            await client.query(`DROP TABLE IF EXISTS group_${singular}_contacts CASCADE`);
            if (group === 'group_hotels') {
                await client.query(`DROP TABLE IF EXISTS group_hotel_allotments CASCADE`);
                await client.query(`DROP TABLE IF EXISTS group_hotel_contract_rates CASCADE`);
                await client.query(`DROP TABLE IF EXISTS group_hotel_room_types CASCADE`);
            }
            await client.query(`DROP TABLE IF EXISTS ${group} CASCADE`);
        }

        // 2. Clone schema from standard modules
        async function copySchema(stdTable, newTable) {
            const res = await client.query(`
                SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [stdTable]);
            let cols = res.rows.map(r => {
                let def = (r.column_default && !r.column_default.includes('nextval')) ? `DEFAULT ${r.column_default}` : '';
                let type = r.data_type === 'character varying' ? `VARCHAR(${r.character_maximum_length})` : r.data_type;
                return r.column_name === 'id' ? 'id SERIAL PRIMARY KEY' : `${r.column_name} ${type} ${r.is_nullable === 'NO' ? 'NOT NULL' : ''} ${def}`;
            });
            await client.query(`CREATE TABLE ${newTable} (${cols.join(', ')})`);
        }

        for (const { group, std, singular } of entities) {
            console.log(`Recreating ${group}...`);
            await copySchema(std, group);
            await copySchema(`${singular}_contacts`, `group_${singular}_contacts`);
            await copySchema(`${singular}_contracts`, `group_${singular}_contracts`);
            await copySchema(`${singular}_notes`, `group_${singular}_notes`);
            if (group === 'group_hotels') {
                await copySchema(`hotel_room_types`, `group_hotel_room_types`);
                await copySchema(`hotel_contract_rates`, `group_hotel_contract_rates`);
                await copySchema(`hotel_allotments`, `group_hotel_allotments`);
            } else {
                if (std === 'tickets') {
                    await copySchema(`ticket_services`, `group_ticket_services`).catch(async () => {
                         await copySchema(`ticket_services_v2`, `group_ticket_services`);
                    });
                } else {
                    await copySchema(`${singular}_services`, `group_${singular}_services`);
                }
            }
        }

        // 3. Add FK constraints
        for (let { singular: e } of entities) {
            let p = e + 's';
            await client.query(`ALTER TABLE group_${e}_contacts ADD CONSTRAINT fk_gc_${e}_contacts FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            await client.query(`ALTER TABLE group_${e}_contracts ADD CONSTRAINT fk_gc_${e}_contracts FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            await client.query(`ALTER TABLE group_${e}_notes ADD CONSTRAINT fk_gc_${e}_notes FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            if (e === 'hotel') {
                await client.query(`ALTER TABLE group_hotel_room_types ADD CONSTRAINT fk_gc_h_rt FOREIGN KEY (hotel_id) REFERENCES group_hotels(id) ON DELETE CASCADE;`).catch(()=>{});
                await client.query(`ALTER TABLE group_hotel_allotments ADD CONSTRAINT fk_gc_h_al FOREIGN KEY (hotel_id) REFERENCES group_hotels(id) ON DELETE CASCADE;`).catch(()=>{});
                await client.query(`ALTER TABLE group_hotel_contract_rates ADD CONSTRAINT fk_gc_h_cr FOREIGN KEY (contract_id) REFERENCES group_hotel_contracts(id) ON DELETE CASCADE;`).catch(()=>{});
            } else {
                await client.query(`ALTER TABLE group_${e}_services ADD CONSTRAINT fk_gc_${e}_srv FOREIGN KEY (${e}_id) REFERENCES group_${p}(id) ON DELETE CASCADE;`).catch(()=>{});
            }
        }

        await client.query('COMMIT');
        console.log('✅ Group tables recreated AND Foreign Keys added successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}
fix();
