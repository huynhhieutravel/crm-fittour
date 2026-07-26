const db = require('../server/db');

async function updateBUs() {
    try {
        console.log('Fetching BU2...');
        const res2 = await db.query("SELECT * FROM business_units WHERE id = 'BU2'");
        
        if (res2.rows.length === 0) {
            console.error('BU2 not found in DB!');
            process.exit(1);
        }

        let bu2Countries = res2.rows[0].countries || [];
        
        // Remove countries going to BU5 from BU2
        const removeList = ['Mông Cổ', 'Nam Mỹ', 'Maroc', 'Mỹ', 'Canada', 'Châu Mỹ', 'Tây Á', 'Trung Đông']; 
        bu2Countries = bu2Countries.filter(c => !removeList.includes(c));

        const bu5Countries = [
            "Alaska", "Bắc Mỹ", "Bắc Cực", "Nam Mỹ", 
            "Mông Cổ", "Con đường Tơ Lụa", "Trung Á", 
            "Thổ Nhĩ Kỳ", "Ma Rốc", "African Bespoke", "Châu Phi", "Canada", "Mỹ"
        ];

        console.log('Updating BU2...');
        await db.query("UPDATE business_units SET countries = $1 WHERE id = 'BU2'", [bu2Countries]);

        console.log('Upserting BU5...');
        const upsertQuery = `
            INSERT INTO business_units (id, label, countries, is_active, sort_order, created_at, updated_at) 
            VALUES ('BU5', 'BU5', $1, true, 4, NOW(), NOW()) 
            ON CONFLICT (id) DO UPDATE SET countries = EXCLUDED.countries, updated_at = NOW();
        `;
        await db.query(upsertQuery, [bu5Countries]);

        console.log('Successfully updated BU2 and upserted BU5 countries!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
updateBUs();
