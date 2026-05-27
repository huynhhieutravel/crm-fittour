const db = require('../db');
const SystemEvents = require('../constants/SystemEvents');

exports.getSystemEvents = (req, res) => {
  res.json(SystemEvents);
};


exports.getAllRules = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM email_rules ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching email rules:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy cấu hình gửi email' });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { email_groups, external_emails, is_active, cc_groups, cc_external_emails, bcc_groups, bcc_external_emails, subject_template, body_template } = req.body;

    const result = await db.query(`
      UPDATE email_rules
      SET email_groups = $1, external_emails = $2, is_active = $3, 
          cc_groups = $5, cc_external_emails = $6, bcc_groups = $7, bcc_external_emails = $8,
          subject_template = $9, body_template = $10,
          updated_at = NOW()
      WHERE id = $4 RETURNING *
    `, [
      JSON.stringify(email_groups || []),
      JSON.stringify(external_emails || []),
      is_active !== undefined ? is_active : true,
      id,
      JSON.stringify(cc_groups || []),
      JSON.stringify(cc_external_emails || []),
      JSON.stringify(bcc_groups || []),
      JSON.stringify(bcc_external_emails || []),
      subject_template || null,
      body_template || null
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy cấu hình gửi email' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating email rule:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật cấu hình gửi email' });
  }
};

exports.createRule = async (req, res) => {
  try {
    const { event_code, event_name, description, email_groups, external_emails, is_active,
            cc_groups, cc_external_emails, bcc_groups, bcc_external_emails, subject_template, body_template } = req.body;
    
    // Check if event_code already exists
    const existing = await db.query('SELECT id FROM email_rules WHERE event_code = $1', [event_code]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Mã sự kiện (event_code) đã tồn tại.' });
    }

    const result = await db.query(`
      INSERT INTO email_rules (event_code, event_name, description, email_groups, external_emails, is_active, cc_groups, cc_external_emails, bcc_groups, bcc_external_emails, subject_template, body_template)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      event_code, 
      event_name, 
      description,
      JSON.stringify(email_groups || []),
      JSON.stringify(external_emails || []),
      is_active !== undefined ? is_active : true,
      JSON.stringify(cc_groups || []),
      JSON.stringify(cc_external_emails || []),
      JSON.stringify(bcc_groups || []),
      JSON.stringify(bcc_external_emails || []),
      subject_template || null,
      body_template || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating email rule:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo cấu hình gửi email' });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM email_rules WHERE id = $1', [id]);
    res.json({ message: 'Đã xóa cấu hình gửi email' });
  } catch (err) {
    console.error('Error deleting email rule:', err);
    res.status(500).json({ error: 'Lỗi server khi xóa cấu hình gửi email' });
  }
};
