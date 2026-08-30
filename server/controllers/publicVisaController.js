const db = require('../db');

exports.getDetails = async (req, res) => {
    try {
        const { token } = req.params;
        const entityRes = await db.query(`
            SELECT v.id, v.code, v.customer_name, v.customer_phone, v.status, v.market, v.visa_type, v.notes, v.created_at, v.public_token, v.form_template_id,
            t.fields as template_fields, t.name as template_name
            FROM visas v 
            LEFT JOIN visa_form_templates t ON v.form_template_id = t.id
            WHERE v.public_token = $1
        `, [token]);
        
        if (entityRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hồ sơ Visa hoặc Link đã hết hạn' });
        const entity = entityRes.rows[0];

        // Format template response with fallback to default active template
        let templateFields = entity.template_fields;
        let templateName = entity.template_name;
        let templateId = entity.form_template_id;

        if (!templateFields || !Array.isArray(templateFields) || templateFields.length === 0) {
            const defTpl = await db.query('SELECT id, name, fields FROM visa_form_templates WHERE is_active = true ORDER BY (name ILIKE \'%Pháp%\' OR name ILIKE \'%Tiêu Chuẩn%\') DESC, id ASC LIMIT 1');
            if (defTpl.rows.length > 0) {
                templateId = defTpl.rows[0].id;
                templateName = defTpl.rows[0].name;
                templateFields = defTpl.rows[0].fields;
            }
        }

        entity.template = {
            id: templateId,
            name: templateName,
            fields: templateFields || []
        };
        delete entity.template_fields;
        delete entity.template_name;

        const membersRes = await db.query('SELECT id, fullname, age_type, checklist_data, evaluation_data FROM visa_members WHERE visa_id = $1 ORDER BY id ASC', [entity.id]);
        entity.members = membersRes.rows;

        res.json(entity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.submitAssessment = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { token } = req.params;
        const { memberId, evaluationData } = req.body; // Expect evaluation data per member

        await client.query('BEGIN');

        // Check token validity
        const visaRes = await client.query('SELECT id FROM visas WHERE public_token = $1', [token]);
        if (visaRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Link khảo sát không hợp lệ' });
        }
        const visaId = visaRes.rows[0].id;

        // Ensure member belongs to this visa
        const memberRes = await client.query('SELECT id FROM visa_members WHERE id = $1 AND visa_id = $2', [memberId, visaId]);
        if (memberRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Khách hàng không thuộc hồ sơ này' });
        }

        // Update evaluation data
        await client.query('UPDATE visa_members SET evaluation_data = $1 WHERE id = $2', [JSON.stringify(evaluationData), memberId]);

        await client.query('COMMIT');
        res.json({ message: 'Nộp khảo sát thành công', memberId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};
