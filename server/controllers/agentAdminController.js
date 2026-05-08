/**
 * ═══════════════════════════════════════════════════════════════
 *  AI Agent Admin — Controller
 *  Quản lý Brain files, Chat Logs, Stats — chỉ cho Admin
 * ═══════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');
const { logActivity } = require('../utils/logger');

const BRAIN_DIR = path.join(__dirname, '..', 'ai', 'brain');

// ─── GET /api/ai/brain — Liệt kê tất cả brain files ─────
exports.listBrainFiles = async (req, res) => {
  try {
    const files = [];

    const scanDir = (dir, category) => {
      if (!fs.existsSync(dir)) return;
      fs.readdirSync(dir)
        .filter(f => f.endsWith('.md') && !f.startsWith('._'))
        .sort()
        .forEach(f => {
          const filePath = path.join(dir, f);
          const stat = fs.statSync(filePath);
          files.push({
            filename: f,
            category,
            path: `${category}/${f}`,
            size: stat.size,
            tokens_est: Math.round(stat.size / 3.5),
            modified_at: stat.mtime
          });
        });
    };

    // Root files
    ['personality.md', 'rules.md'].forEach(f => {
      const fp = path.join(BRAIN_DIR, f);
      if (fs.existsSync(fp)) {
        const stat = fs.statSync(fp);
        files.push({ filename: f, category: 'core', path: f, size: stat.size, tokens_est: Math.round(stat.size / 3.5), modified_at: stat.mtime });
      }
    });

    scanDir(path.join(BRAIN_DIR, 'knowledge'), 'knowledge');
    scanDir(path.join(BRAIN_DIR, 'examples'), 'examples');

    const totalTokens = files.reduce((s, f) => s + f.tokens_est, 0);
    res.json({ files, total_files: files.length, total_tokens_est: totalTokens });
  } catch (err) {
    console.error('[Agent Admin] listBrainFiles error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/ai/brain/:category/:filename — Đọc nội dung 1 file ─────
exports.readBrainFile = async (req, res) => {
  try {
    const { category, filename } = req.params;
    let filePath;
    if (category === 'core') {
      filePath = path.join(BRAIN_DIR, filename);
    } else {
      filePath = path.join(BRAIN_DIR, category, filename);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ filename, category, content, size: content.length, tokens_est: Math.round(content.length / 3.5) });
  } catch (err) {
    console.error('[Agent Admin] readBrainFile error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── PUT /api/ai/brain/:category/:filename — Cập nhật file ─────
exports.updateBrainFile = async (req, res) => {
  try {
    const { category, filename } = req.params;
    const { content } = req.body;

    if (!content && content !== '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    let filePath;
    if (category === 'core') {
      filePath = path.join(BRAIN_DIR, filename);
    } else {
      filePath = path.join(BRAIN_DIR, category, filename);
    }

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, content, 'utf-8');

    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'UPDATE',
        entity_type: 'SYSTEM',
        entity_id: 0,
        details: `Cập nhật AI Brain File: ${category}/${filename}`
    });

    res.json({ success: true, message: `File ${filename} đã được cập nhật. Cần reload để áp dụng.`, tokens_est: Math.round(content.length / 3.5) });
  } catch (err) {
    console.error('[Agent Admin] updateBrainFile error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── POST /api/ai/reload — Reload brain (không cần restart server) ─────
exports.reloadBrain = async (req, res) => {
  try {
    // Xóa cache của require
    delete require.cache[require.resolve('../ai/brainLoader')];
    delete require.cache[require.resolve('../ai/skillRegistry')];
    delete require.cache[require.resolve('../ai/agentRouter')];

    // Re-require sẽ trigger load lại
    const { SYSTEM_INSTRUCTION } = require('../ai/brainLoader');
    const { functionDeclarations } = require('../ai/skillRegistry');

    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'UPDATE',
        entity_type: 'SYSTEM',
        entity_id: 0,
        details: `Reload AI Brain: ${functionDeclarations.length} skills loaded`
    });

    res.json({
      success: true,
      message: 'Brain đã được reload!',
      brain_chars: SYSTEM_INSTRUCTION.length,
      brain_tokens_est: Math.round(SYSTEM_INSTRUCTION.length / 3.5),
      skills_count: functionDeclarations.length
    });
  } catch (err) {
    console.error('[Agent Admin] reloadBrain error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/ai/logs — Lấy chat logs (paginated) ─────
exports.getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const userFilter = req.query.user_id || null;

    let query = `SELECT id, user_id, user_name, user_message, ai_reply,
                        function_called, action_type, model_used,
                        response_time_ms, token_input, token_output, created_at
                 FROM ai_chat_logs`;
    const params = [];

    if (userFilter) {
      query += ` WHERE user_id = $1`;
      params.push(userFilter);
    }

    query += ` ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Total count
    let countQuery = 'SELECT COUNT(*) FROM ai_chat_logs';
    const countParams = [];
    if (userFilter) {
      countQuery += ' WHERE user_id = $1';
      countParams.push(userFilter);
    }
    const countResult = await db.query(countQuery, countParams);

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page, limit,
      total_pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    });
  } catch (err) {
    console.error('[Agent Admin] getLogs error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/ai/stats — Thống kê tổng hợp ─────
exports.getStats = async (req, res) => {
  try {
    const period = req.query.period || 'month'; // month, week, all
    let dateFilter = '';
    if (period === 'month') dateFilter = "AND created_at >= date_trunc('month', CURRENT_DATE)";
    else if (period === 'week') dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";

    const stats = await db.query(`
      SELECT
        COUNT(*) as total_chats,
        COUNT(DISTINCT user_id) as unique_users,
        COALESCE(SUM(token_input), 0) as total_token_input,
        COALESCE(SUM(token_output), 0) as total_token_output,
        COALESCE(AVG(token_input), 0) as avg_token_input,
        COALESCE(AVG(response_time_ms), 0) as avg_response_time,
        COUNT(CASE WHEN function_called IS NOT NULL THEN 1 END) as skill_calls,
        COUNT(CASE WHEN function_called IS NULL THEN 1 END) as text_chats
      FROM ai_chat_logs WHERE 1=1 ${dateFilter}
    `);

    // Top skills
    const topSkills = await db.query(`
      SELECT function_called, COUNT(*) as count
      FROM ai_chat_logs
      WHERE function_called IS NOT NULL ${dateFilter}
      GROUP BY function_called
      ORDER BY count DESC LIMIT 10
    `);

    // Top users
    const topUsers = await db.query(`
      SELECT user_name, COUNT(*) as count
      FROM ai_chat_logs
      WHERE 1=1 ${dateFilter}
      GROUP BY user_name
      ORDER BY count DESC LIMIT 10
    `);

    const s = stats.rows[0];
    const totalTokens = parseInt(s.total_token_input) + parseInt(s.total_token_output);
    const costInput = (parseInt(s.total_token_input) / 1000000) * 0.30;
    const costOutput = (parseInt(s.total_token_output) / 1000000) * 2.50;

    res.json({
      period,
      total_chats: parseInt(s.total_chats),
      unique_users: parseInt(s.unique_users),
      total_tokens: totalTokens,
      total_token_input: parseInt(s.total_token_input),
      total_token_output: parseInt(s.total_token_output),
      avg_token_input: Math.round(parseFloat(s.avg_token_input)),
      avg_response_time_ms: Math.round(parseFloat(s.avg_response_time)),
      skill_calls: parseInt(s.skill_calls),
      text_chats: parseInt(s.text_chats),
      estimated_cost_usd: Math.round((costInput + costOutput) * 100) / 100,
      estimated_cost_vnd: Math.round((costInput + costOutput) * 25000),
      top_skills: topSkills.rows,
      top_users: topUsers.rows
    });
  } catch (err) {
    console.error('[Agent Admin] getStats error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET /api/ai/skills — Liệt kê skills ─────
exports.listSkills = async (req, res) => {
  try {
    const { functionDeclarations } = require('../ai/skillRegistry');
    res.json({
      skills: functionDeclarations.map(d => ({
        name: d.name,
        description: d.description,
        params: d.parameters?.properties ? Object.keys(d.parameters.properties) : []
      })),
      total: functionDeclarations.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
