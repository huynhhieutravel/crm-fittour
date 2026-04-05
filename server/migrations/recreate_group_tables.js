const db = require('../db');

async function recreate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const entities = [
            { group: 'group_hotels', std: 'hotels' },
            { group: 'group_restaurants', std: 'restaurants' },
            { group: 'group_transports', std: 'transports' },
            { group: 'group_tickets', std: 'tickets' },
            { group: 'group_airlines', std: 'airlines' },
            { group: 'group_landtours', std: 'landtours' },
            { group: 'group_insurances', std: 'insurances' }
        ];

        // 1. Drop all Group tables first
        for (const { group } of entities) {
            console.log(`Dropping ${group}...`);
            await client.query(`DROP TABLE IF EXISTS ${group}_notes CASCADE`);
            await client.query(`DROP TABLE IF EXISTS ${group}_services CASCADE`);
            await client.query(`DROP TABLE IF EXISTS ${group}_contracts CASCADE`);
            await client.query(`DROP TABLE IF EXISTS ${group}_contacts CASCADE`);
            if (group === 'group_hotels') {
                await client.query(`DROP TABLE IF EXISTS ${group}_allotments CASCADE`);
                await client.query(`DROP TABLE IF EXISTS ${group}_contract_rates CASCADE`);
                await client.query(`DROP TABLE IF EXISTS ${group}_room_types CASCADE`);
            }
            await client.query(`DROP TABLE IF EXISTS ${group} CASCADE`);
        }

        // 2. Function to generate DDL based on standard table
        async function copySchema(stdTable, newTable) {
            const res = await client.query(`
                SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [stdTable]);
            
            let cols = res.rows.map(r => {
                let def = '';
                // Ignore the default id sequence from the original table to create a new one automatically
                if (r.column_default && !r.column_default.includes('nextval')) {
                    def = `DEFAULT ${r.column_default}`;
                }
                let type = r.data_type;
                if (type === 'character varying') type = `VARCHAR(${r.character_maximum_length})`;
                if (r.column_name === 'id') {
                    return 'id SERIAL PRIMARY KEY';
                }
                return `${r.column_name} ${type} ${r.is_nullable === 'NO' ? 'NOT NULL' : ''} ${def}`;
            });
            
            await client.query(`CREATE TABLE ${newTable} (${cols.join(', ')})`);
        }

        // 3. Recreate them
        for (const { group, std } of entities) {
            console.log(`Recreating ${group}...`);
            await copySchema(std, group);
            await copySchema(`${std.replace(/s$/, '')}_contacts`, `${group.replace(/s$/, '')}_contacts`);
            await copySchema(`${std.replace(/s$/, '')}_contracts`, `${group.replace(/s$/, '')}_contracts`);
            await copySchema(`${std.replace(/s$/, '')}_notes`, `${group.replace(/s$/, '')}_notes`);
            
            if (group === 'group_hotels') {
                await copySchema(`hotel_room_types`, `group_hotel_room_types`);
                await copySchema(`hotel_contract_rates`, `group_hotel_contract_rates`);
                await copySchema(`hotel_allotments`, `group_hotel_allotments`);
            } else {
                if (std === 'tickets') { // standard is ticket_services_v2 and ticket_services ?
                    await copySchema(`ticket_services`, `group_ticket_services`).catch(async () => {
                         await copySchema(`ticket_services_v2`, `group_ticket_services`);
                    });
                } else {
                    await copySchema(`${std.replace(/s$/, '')}_services`, `${group.replace(/s$/, '')}_services`);
                }
            }
        // Add foreign keys later if strictly needed, but the current crash is just missing columns.
        }

        await client.query('COMMIT');
        console.log('✅ Group tables recreated successfully matching standard schemas!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error recreating tables:', err);
    } finally {
        client.release();
    }
}

recreate();
