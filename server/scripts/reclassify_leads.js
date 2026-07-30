const db = require('../db');
const { classifyBUFromMessage, classifyTourFromMessage } = require('../services/facebookService');

(async () => {
    try {
        console.log('Starting retroactive classification for unassigned leads in the last 7 days...');
        const leadsRes = await db.query(`
            SELECT id, name FROM leads 
            WHERE bu_group IS NULL 
            AND created_at >= NOW() - INTERVAL '7 days'
        `);
        console.log(`Found ${leadsRes.rows.length} unassigned leads in the last 7 days.`);

        let updatedCount = 0;
        for (const lead of leadsRes.rows) {
            const convRes = await db.query('SELECT id FROM conversations WHERE lead_id = $1', [lead.id]);
            if (convRes.rows.length === 0) continue;

            for (const conv of convRes.rows) {
                const msgRes = await db.query('SELECT content FROM messages WHERE conversation_id = $1', [conv.id]);
                if (msgRes.rows.length === 0) continue;

                const allText = msgRes.rows.map(m => m.content || '').join(' ');
                
                let assignedBU = null;
                let assignedTour = null;

                const autoBU = await classifyBUFromMessage(allText);
                if (autoBU) {
                    assignedBU = autoBU;
                }

                const autoTour = await classifyTourFromMessage(allText);
                if (autoTour && autoTour.tour_id) {
                    assignedTour = autoTour.tour_id;
                    if (!assignedBU && autoTour.bu_group) {
                        assignedBU = autoTour.bu_group;
                    }
                }

                if (assignedBU || assignedTour) {
                    const q = assignedBU ? 
                        (assignedTour ? 'UPDATE leads SET bu_group = $1, tour_id = $2 WHERE id = $3' : 'UPDATE leads SET bu_group = $1 WHERE id = $2') :
                        'UPDATE leads SET tour_id = $1 WHERE id = $2';
                    const params = assignedBU ?
                        (assignedTour ? [assignedBU, assignedTour, lead.id] : [assignedBU, lead.id]) :
                        [assignedTour, lead.id];
                    
                    await db.query(q, params);
                    updatedCount++;
                    console.log(`Lead #${lead.id} (${lead.name}) updated: BU=${assignedBU || 'NULL'}, Tour=${assignedTour || 'NULL'}`);
                    break; // Move to the next lead once classified
                }
            }
        }
        console.log(`Finished! Reclassified ${updatedCount} leads.`);
    } catch (e) {
        console.error('Error during reclassification:', e);
    } finally {
        process.exit();
    }
})();
