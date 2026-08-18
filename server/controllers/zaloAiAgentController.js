/**
 * Controller: Quản lý Cài đặt Zalo AI Agent & Knowledge Base
 */
const db = require('../db');
const zaloAiService = require('../services/zaloAiService');

// 1. Lấy toàn bộ cài đặt
exports.getSettings = async (req, res) => {
  try {
    const config = await zaloAiService.getAiConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    console.error('Lỗi getSettings:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Cập nhật một nhóm cài đặt
exports.updateSettings = async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;
    if (!setting_key || setting_value === undefined) {
      return res.status(400).json({ success: false, error: 'Thiếu setting_key hoặc setting_value' });
    }

    await db.query(`
      INSERT INTO ai_agent_settings (setting_key, setting_value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (setting_key) DO UPDATE 
      SET setting_value = $2, updated_at = NOW();
    `, [setting_key, JSON.stringify(setting_value)]);

    res.json({ success: true, message: 'Đã lưu cấu hình thành công' });
  } catch (err) {
    console.error('Lỗi updateSettings:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Lấy danh sách tài liệu RAG
exports.getKnowledgeList = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `SELECT * FROM rag_knowledge_chunks WHERE 1=1`;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR content ILIKE $${params.length})`;
    }

    query += ` ORDER BY id DESC`;
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Lỗi getKnowledgeList:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. Thêm tài liệu mới
exports.createKnowledge = async (req, res) => {
  try {
    const { title, category = 'general', content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Tiêu đề và nội dung là bắt buộc' });
    }

    const result = await db.query(`
      INSERT INTO rag_knowledge_chunks (title, category, content, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *;
    `, [title.trim(), category, content.trim()]);

    res.json({ success: true, data: result.rows[0], message: 'Đã thêm tài liệu kiến thức' });
  } catch (err) {
    console.error('Lỗi createKnowledge:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. Cập nhật tài liệu
exports.updateKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content, is_active } = req.body;

    const result = await db.query(`
      UPDATE rag_knowledge_chunks 
      SET title = COALESCE($1, title),
          category = COALESCE($2, category),
          content = COALESCE($3, content),
          is_active = COALESCE($4, is_active),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `, [title, category, content, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy tài liệu' });
    }

    res.json({ success: true, data: result.rows[0], message: 'Đã cập nhật tài liệu' });
  } catch (err) {
    console.error('Lỗi updateKnowledge:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 6. Xóa tài liệu
exports.deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM rag_knowledge_chunks WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Đã xóa tài liệu thành công' });
  } catch (err) {
    console.error('Lỗi deleteKnowledge:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 7. Test phản hồi AI từ giao diện Sandbox/Settings
exports.testAiResponse = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tin nhắn thử nghiệm' });
    }

    const result = await zaloAiService.processCustomerMessage({
      message,
      conversationHistory
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Lỗi testAiResponse:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
