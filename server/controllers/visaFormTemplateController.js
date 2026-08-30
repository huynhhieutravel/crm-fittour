const pool = require('../db');

exports.getAllTemplates = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM visa_form_templates
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi lấy danh sách template form:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM visa_form_templates WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy template" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi lấy template:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.createTemplate = async (req, res) => {
    try {
        const { name, fields, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO visa_form_templates (name, fields, is_active) VALUES ($1, $2, $3) RETURNING *',
            [name, JSON.stringify(fields), is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi tạo template form:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, fields, is_active } = req.body;
        
        const check = await pool.query('SELECT id FROM visa_form_templates WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy template" });
        }

        const result = await pool.query(
            `UPDATE visa_form_templates 
             SET name = $1, fields = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [name, JSON.stringify(fields), is_active, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi cập nhật template form:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if template is being used by any visa
        const checkUsage = await pool.query('SELECT id FROM visas WHERE form_template_id = $1 LIMIT 1', [id]);
        if (checkUsage.rows.length > 0) {
            return res.status(400).json({ message: "Không thể xoá mẫu Form này vì đang có hồ sơ Visa sử dụng. Bạn chỉ có thể Tắt (Vô hiệu hoá) nó." });
        }

        const result = await pool.query('DELETE FROM visa_form_templates WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy template" });
        }
        res.json({ message: "Xoá thành công" });
    } catch (err) {
        console.error("Lỗi xoá template:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};
