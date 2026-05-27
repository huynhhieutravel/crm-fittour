const db = require('../db');

const populateGroupUsers = async (groups) => {
  if (!groups || groups.length === 0) return [];
  
  // Collect all unique user IDs
  const userIds = new Set();
  groups.forEach(g => {
    if (Array.isArray(g.users)) {
      g.users.forEach(id => {
        if (id) userIds.add(Number(id));
      });
    }
  });
  
  if (userIds.size === 0) {
    return groups.map(g => ({
      ...g,
      users: []
    }));
  }
  
  // Fetch user details
  const usersRes = await db.query(
    'SELECT id, username, full_name, email FROM users WHERE id = ANY($1::int[])',
    [Array.from(userIds)]
  );
  
  const userMap = new Map();
  usersRes.rows.forEach(u => {
    userMap.set(u.id, {
      value: u.id,
      label: `${u.full_name || u.username} (${u.email})`
    });
  });
  
  return groups.map(g => {
    const populatedUsers = [];
    if (Array.isArray(g.users)) {
      g.users.forEach(id => {
        const u = userMap.get(Number(id));
        if (u) populatedUsers.push(u);
      });
    }
    return {
      ...g,
      users: populatedUsers
    };
  });
};

exports.getAllGroups = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM email_groups ORDER BY created_at DESC');
    const populated = await populateGroupUsers(result.rows);
    res.json(populated);
  } catch (err) {
    console.error('Error fetching email groups:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách nhóm' });
  }
};

exports.getGroupByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await db.query('SELECT * FROM email_groups WHERE code = $1', [code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhóm' });
    const populated = await populateGroupUsers(result.rows);
    res.json(populated[0]);
  } catch (err) {
    console.error('Error fetching email group by code:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { code, name, description, users, external_emails, is_active } = req.body;
    
    // Check unique code
    const check = await db.query('SELECT id FROM email_groups WHERE code = $1', [code]);
    if (check.rows.length > 0) return res.status(400).json({ error: 'Mã nhóm (CODE) đã tồn tại' });

    const result = await db.query(`
      INSERT INTO email_groups (code, name, description, users, external_emails, is_active)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [code, name, description, JSON.stringify(users || []), JSON.stringify(external_emails || []), is_active ?? true]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating email group:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo nhóm' });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, users, external_emails, is_active } = req.body; // Cố tình KHÔNG nhận 'code' để đảm bảo Immutable

    const result = await db.query(`
      UPDATE email_groups 
      SET name = $1, description = $2, users = $3, external_emails = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6 RETURNING *
    `, [name, description, JSON.stringify(users || []), JSON.stringify(external_emails || []), is_active ?? true, id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhóm' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating email group:', err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật nhóm' });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM email_groups WHERE id = $1', [id]);
    res.json({ message: 'Xóa nhóm thành công' });
  } catch (err) {
    console.error('Error deleting email group:', err);
    res.status(500).json({ error: 'Lỗi server khi xóa nhóm' });
  }
};
