const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '/var/www/fittour-crm/server/.env' });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
}
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixCompanyAndSigner() {
    const client = await pool.connect();
    try {
        console.log('Fixing company name and signer...');

        // Update signer details
        await client.query(`
            UPDATE official_announcements 
            SET 
                signer_name = 'NGUYỄN NHẤT VŨ',
                signer_position = 'Giám Đốc',
                content_html = REPLACE(
                    REPLACE(
                        REPLACE(content_html, 'Công ty Cổ phần FIT Tour', 'Công ty TNHH Du lịch Quốc tế FIT TOUR'),
                        'CÔNG TY CỔ PHẦN FIT TOUR',
                        'CÔNG TY TNHH DU LỊCH QUỐC TẾ FIT TOUR'
                    ),
                    'Công ty Cổ phần',
                    'Công ty TNHH Du lịch Quốc tế'
                )
        `);

        console.log('✅ Updated all announcements with official company name & Giám Đốc NGUYỄN NHẤT VŨ');
    } catch (err) {
        console.error('Error fixing:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixCompanyAndSigner();
