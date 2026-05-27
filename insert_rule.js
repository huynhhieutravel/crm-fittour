const db = require('./db');

async function run() {
  const rule = {
    event_code: 'MEETING_ROOM_BOOKED',
    event_name: 'Thông báo đặt phòng họp',
    description: 'Gửi thông báo khi có phòng họp được đặt mới.',
    email_groups: JSON.stringify(['ALL_STAFF']),
    external_emails: JSON.stringify([]),
    is_active: true
  };
  
  const q = `INSERT INTO email_rules (event_code, event_name, description, email_groups, external_emails, is_active)
  VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6) RETURNING *`;
  
  const values = [
    rule.event_code, 
    rule.event_name, 
    rule.description, 
    rule.email_groups, 
    rule.external_emails, 
    rule.is_active
  ];
  
  try {
    const res = await db.query(q, values);
    console.log('Inserted rule:', res.rows[0]);
  } catch(e) { 
    console.error(e); 
  }
  process.exit(0);
}

run();
