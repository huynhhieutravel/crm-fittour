const db = require('../db');

(async () => {
  try {
    // Find lead
    const lead = await db.query("SELECT id, name, bu_group, consultation_note FROM leads WHERE name ILIKE '%Nguyen Thu Thuy%' ORDER BY created_at DESC LIMIT 1");
    if (!lead.rows[0]) { console.log('Lead not found'); process.exit(0); }
    const l = lead.rows[0];
    console.log('=== LEAD ===');
    console.log('ID:', l.id, '| Name:', l.name, '| BU:', l.bu_group);
    console.log('Note:', l.consultation_note);

    // Get messages
    const msgs = await db.query("SELECT m.content, m.sender_type, m.created_at FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.lead_id = $1 ORDER BY m.created_at ASC", [l.id]);
    console.log('\n=== MESSAGES ===');
    msgs.rows.forEach(m => console.log(`[${m.sender_type}] ${m.content}`));

    // Get all text combined
    const allText = msgs.rows.map(m => m.content).join(' ').toLowerCase();
    console.log('\n=== ALL TEXT COMBINED ===');
    console.log(allText.substring(0, 500));

    // Check BU rules
    const bus = await db.query("SELECT id, label, countries, keywords FROM business_units ORDER BY id");
    console.log('\n=== BU MATCHING ===');
    for (const bu of bus.rows) {
      const allKeywords = [];
      if (bu.countries) allKeywords.push(...bu.countries.map(c => c.toLowerCase()));
      if (bu.keywords) allKeywords.push(...bu.keywords.map(k => k.toLowerCase()));
      
      const matched = allKeywords.filter(kw => allText.includes(kw));
      if (matched.length > 0) {
        console.log(`${bu.id} (${bu.label}): MATCHED [${matched.join(', ')}]`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
