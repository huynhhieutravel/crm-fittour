const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const defaultFields = [
    {
        name: "purpose",
        label: "Mục đích chuyến đi",
        type: "select",
        allow_custom: true,
        options: ["Du lịch", "Thăm thân", "Công tác", "Du học/Định cư"]
    },
    {
        name: "job_type",
        label: "Công việc hiện tại",
        type: "select",
        allow_custom: true,
        options: ["Chủ doanh nghiệp", "Nhân viên hợp đồng", "Kinh doanh tự do", "Học sinh - Sinh viên", "Hưu trí", "Nội trợ / Thất nghiệp"]
    },
    {
        name: "travel_history",
        label: "Lịch sử du lịch (Những nước từng đi)",
        type: "textarea",
        placeholder: "VD: Đã đi Thái Lan, Singapore, Hàn Quốc, Nhật Bản..."
    },
    {
        name: "itinerary",
        label: "Lịch trình dự kiến (Đi cùng ai?)",
        type: "textarea",
        placeholder: "VD: Dự kiến đi tháng 10, đi cùng chồng và 2 con..."
    },
    {
        name: "assets",
        label: "Tài sản hiện có",
        type: "textarea",
        placeholder: "VD: Có 1 căn nhà mặt đất, 1 xe ô tô đứng tên cá nhân..."
    },
    {
        name: "finance",
        label: "Tài chính",
        type: "textarea",
        placeholder: "VD: Sổ tiết kiệm 500 triệu (đã gửi 3 tháng)..."
    }
];

async function runMigration() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Started migration...");

        // 1. Create table
        await client.query(`
            CREATE TABLE IF NOT EXISTS visa_form_templates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                fields JSONB NOT NULL DEFAULT '[]',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table visa_form_templates created/verified.");

        // 2. Insert Default Template if not exists
        const checkRes = await client.query(`SELECT id FROM visa_form_templates WHERE name = 'Mẫu Tiêu Chuẩn FIT Tour' LIMIT 1`);
        let defaultTemplateId;
        if (checkRes.rows.length === 0) {
            const insertRes = await client.query(
                `INSERT INTO visa_form_templates (name, fields) VALUES ($1, $2) RETURNING id`,
                ['Mẫu Tiêu Chuẩn FIT Tour', JSON.stringify(defaultFields)]
            );
            defaultTemplateId = insertRes.rows[0].id;
            console.log("Inserted default template. ID:", defaultTemplateId);
        } else {
            defaultTemplateId = checkRes.rows[0].id;
            console.log("Default template already exists. ID:", defaultTemplateId);
        }

        // 3. Add column to visas table
        const columnCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='visas' AND column_name='form_template_id'
        `);
        if (columnCheck.rows.length === 0) {
            await client.query(`ALTER TABLE visas ADD COLUMN form_template_id INTEGER REFERENCES visa_form_templates(id)`);
            console.log("Added form_template_id column to visas table.");
        }

        // 4. Update existing visas to use default template
        const updateRes = await client.query(`
            UPDATE visas 
            SET form_template_id = $1 
            WHERE form_template_id IS NULL
        `, [defaultTemplateId]);
        console.log(`Updated ${updateRes.rowCount} existing visas with default template.`);

        await client.query('COMMIT');
        console.log("Migration completed successfully!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Migration failed:", err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
