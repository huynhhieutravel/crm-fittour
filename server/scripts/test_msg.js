const db = require('./db');
require('dotenv').config({ path: '.env' });
async function run() {
    const res = await db.query("SELECT c.id, m.content, m.sender_type, m.created_at FROM messages m JOIN conversations c ON m.conversation_id = c.id JOIN leads l ON c.lead_id = l.id WHERE l.name = 'Bao Ngoc Nguyen' ORDER BY m.created_at ASC");
    console.log(res.rows);
    process.exit(0);
}
run();
