/**
 * Migration: Cập nhật debounce_seconds = 10s cho Zalo AI trong ai_agent_settings
 */
const db = require('../db');

async function up() {
  console.log('[Migration] Bắt đầu cập nhật debounce_seconds = 10s cho Zalo AI...');
  try {
    const res = await db.query("SELECT setting_value FROM ai_agent_settings WHERE setting_key = 'system_config'");
    let currentVal = res.rows[0]?.setting_value || {
      is_sandbox_bot_enabled: true,
      mute_on_sales_assigned: true
    };

    currentVal.debounce_seconds = 10;

    await db.query(`
      INSERT INTO ai_agent_settings (setting_key, setting_value, updated_at)
      VALUES ('system_config', $1, NOW())
      ON CONFLICT (setting_key) DO UPDATE
      SET setting_value = $1, updated_at = NOW()
    `, [JSON.stringify(currentVal)]);

    console.log('✅ [Migration] Cập nhật system_config.debounce_seconds = 10 thành công!');
  } catch (err) {
    console.error('❌ [Migration] Lỗi cập nhật debounce_seconds:', err.message);
  } finally {
    if (db.pool) {
      await db.pool.end();
    }
  }
}

up().catch(console.error);

