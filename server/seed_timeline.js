const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function seedTimeline() {
  await client.connect();
  try {
    console.log('Seeding Guide Assignments for Timeline...');
    
    // Get first guide
    const guides = await client.query('SELECT id FROM guides LIMIT 2');
    if (guides.rows.length === 0) {
        console.log('No guides found to seed.');
        return;
    }
    const guide1 = guides.rows[0].id;
    const guide2 = guides.rows[1]?.id || guide1;

    // Get a template
    const templates = await client.query('SELECT id FROM tour_templates LIMIT 1');
    if (templates.rows.length === 0) {
        console.log('No templates found.');
        return;
    }
    const templateId = templates.rows[0].id;

    // Create assignments across next 30 days
    const assignments = [
        { start: '2026-04-01', end: '2026-04-08', guide: guide1, name: 'Tour Nhật Bản Anh Đào' },
        { start: '2026-04-12', end: '2026-04-20', guide: guide1, name: 'Tour Hàn Quốc Mùa Xuân' },
        { start: '2026-04-05', end: '2026-04-15', guide: guide2, name: 'Tour Tibet Huyền Bí' },
        { start: '2026-04-22', end: '2026-04-30', guide: guide2, name: 'Tour Mông Cổ Thảo Nguyên' }
    ];

    for (const ass of assignments) {
        await client.query(`
            INSERT INTO tour_departures (
                tour_template_id, start_date, end_date, guide_id, status, max_participants
            ) VALUES ($1, $2, $3, $4, 'Confirmed', 20)
        `, [templateId, ass.start, ass.end, ass.guide]);
    }

    console.log('Seeding completed.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await client.end();
  }
}

seedTimeline();
