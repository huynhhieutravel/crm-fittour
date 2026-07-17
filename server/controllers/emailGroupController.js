const db = require('../db');

const populateGroupUsers = async (groups) => {
  if (!groups || groups.length === 0) return [];
  
  // Collect all unique user IDs from explicit users array
  const explicitUserIds = new Set();
  const allBusToFetch = new Set();
  
  groups.forEach(g => {
    if (Array.isArray(g.users)) {
      g.users.forEach(id => {
        if (id) explicitUserIds.add(Number(id));
      });
    }
    if (Array.isArray(g.target_bus)) {
      g.target_bus.forEach(b => {
        if (b) allBusToFetch.add(b);
      });
    }
  });
  
  const userMap = new Map();
  
  if (explicitUserIds.size > 0 || allBusToFetch.size > 0) {
    let query = 'SELECT id, username, full_name, email, bus FROM users WHERE is_active = true AND (';
    let conditions = [];
    let params = [];
    let paramCount = 1;
    
    if (explicitUserIds.size > 0) {
      conditions.push(`id = ANY($${paramCount}::int[])`);
      params.push(Array.from(explicitUserIds));
      paramCount++;
    }
    if (allBusToFetch.size > 0) {
      conditions.push(`bus && $${paramCount}::text[]`);
      params.push(Array.from(allBusToFetch));
      paramCount++;
    }
    
    query += conditions.join(' OR ') + ')';
    
    const usersRes = await db.query(query, params);
    
    usersRes.rows.forEach(u => {
      userMap.set(u.id, {
        value: u.id,
        label: `${u.full_name || 'Chưa có tên'} (@${u.username}) - ${u.email || 'Chưa có thông tin'}`,
        bus: u.bus || []
      });
    });
  }
  
  return groups.map(g => {
    const explicitIds = new Set((g.users || []).map(Number));
    const groupBus = g.target_bus || [];
    
    const explicitUsersList = [];
    const dynamicUsersList = [];
    
    userMap.forEach((u, id) => {
      const isExplicit = explicitIds.has(id);
      const isDynamic = groupBus.length > 0 && u.bus.some(b => groupBus.includes(b));
      
      if (isExplicit) {
        explicitUsersList.push({ ...u, isDynamic: false });
      }
      if (isDynamic && !isExplicit) {
        dynamicUsersList.push({ ...u, isDynamic: true });
      }
    });
    
    return {
      ...g,
      users: explicitUsersList,
      dynamic_users: dynamicUsersList
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
    const { code, name, description, users, external_emails, is_active, target_bus } = req.body;
    
    // Check unique code
    const check = await db.query('SELECT id FROM email_groups WHERE code = $1', [code]);
    if (check.rows.length > 0) return res.status(400).json({ error: 'Mã nhóm (CODE) đã tồn tại' });

    const result = await db.query(`
      INSERT INTO email_groups (code, name, description, users, external_emails, is_active, target_bus)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [
      code, 
      name, 
      description, 
      JSON.stringify(users || []), 
      JSON.stringify(external_emails || []), 
      is_active ?? true,
      JSON.stringify(target_bus || [])
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating email group:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo nhóm' });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, users, external_emails, is_active, target_bus } = req.body; // Cố tình KHÔNG nhận 'code' để đảm bảo Immutable

    const result = await db.query(`
      UPDATE email_groups 
      SET name = $1, description = $2, users = $3, external_emails = $4, is_active = $5, target_bus = $6, updated_at = NOW()
      WHERE id = $7 RETURNING *
    `, [
      name, 
      description, 
      JSON.stringify(users || []), 
      JSON.stringify(external_emails || []), 
      is_active ?? true, 
      JSON.stringify(target_bus || []),
      id
    ]);

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
