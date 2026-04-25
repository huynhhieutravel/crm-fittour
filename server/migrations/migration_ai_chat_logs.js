/**
 * Migration: Tạo bảng ai_chat_logs
 * Lưu trữ mọi cuộc hội thoại AI Copilot cho audit, analytics, training
 */
const db = require('../db');

async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ai_chat_logs (
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER REFERENCES users(id),
      user_name       VARCHAR(255),
      
      -- Nội dung
      user_message    TEXT NOT NULL,
      ai_reply        TEXT,
      
      -- Metadata kỹ thuật
      function_called VARCHAR(100),
      function_args   JSONB,
      action_type     VARCHAR(20),
      
      -- Chất lượng
      model_used      VARCHAR(50),
      response_time_ms INTEGER,
      token_input     INTEGER,
      token_output    INTEGER,
      
      -- Feedback (Phase tương lai)
      user_rating     SMALLINT,
      flagged         BOOLEAN DEFAULT FALSE,
      
      created_at      TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON ai_chat_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_chat_date ON ai_chat_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_ai_chat_function ON ai_chat_logs(function_called);
  `);
  console.log('✅ Migration: ai_chat_logs table created');
}

up().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
