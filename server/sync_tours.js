require('dotenv').config();
const db = require('./db');
const facebookService = require('./services/facebookService');

async function syncTours() {
    console.log("=== STARTING TOUR SYNC ===");
    const leads = await db.query("SELECT id, name, bu_group FROM leads WHERE tour_id IS NULL AND source = 'Messenger'");
    let count = 0;
    
    for (const lead of leads.rows) {
        const convRes = await db.query("SELECT id FROM conversations WHERE lead_id = $1 LIMIT 1", [lead.id]);
        if (convRes.rows.length > 0) {
            const msgs = await db.query("SELECT content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC", [convRes.rows[0].id]);
            const allText = msgs.rows.map(m => m.content || '').join(' ');
            
            const autoTour = await facebookService.classifyTourFromMessage(allText);
            if (autoTour && autoTour.tour_id) {
                if (lead.bu_group) {
                    await db.query("UPDATE leads SET tour_id = $1 WHERE id = $2", [autoTour.tour_id, lead.id]);
                } else {
                    await db.query("UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3", [autoTour.tour_id, autoTour.bu_group, lead.id]);
                }
                console.log(`✅ Updated Lead #${lead.id} (${lead.name}) -> Tour ${autoTour.tour_id}`);
                count++;
            }
        }
    }
    console.log(`=== Finished. Updated ${count} leads. ===`);
    process.exit(0);
}

syncTours().catch(err => {
    console.error(err);
    process.exit(1);
});
