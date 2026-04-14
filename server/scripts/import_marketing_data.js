/**
 * Import marketing ads data from JSON exports to VPS database
 * Run this ON THE VPS after rsync
 * 
 * Usage: node server/scripts/import_marketing_data.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function importData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Import marketing_ads_reports
        const reportsPath = path.resolve(__dirname, '../exports/marketing_ads_reports.json');
        if (fs.existsSync(reportsPath)) {
            const reports = JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
            console.log(`\n📦 Importing ${reports.length} marketing_ads_reports...`);
            
            // Clear existing data first
            await client.query('DELETE FROM marketing_ads_reports');
            console.log('  🗑️  Cleared existing reports data');
            
            for (const r of reports) {
                await client.query(`
                    INSERT INTO marketing_ads_reports 
                    (id, bu_name, year, month, week_number, campaign_name, ad_set_name, ad_name, 
                     spend, messages, cpl_msg, leads, cpl_lead, created_at, crm_leads_manual, crm_won_manual, is_locked)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                `, [
                    r.id, r.bu_name, r.year, r.month, r.week_number, 
                    r.campaign_name, r.ad_set_name, r.ad_name,
                    r.spend, r.messages, r.cpl_msg, r.leads, r.cpl_lead, 
                    r.created_at, r.crm_leads_manual || 0, r.crm_won_manual || 0, r.is_locked || false
                ]);
            }
            console.log(`  ✅ Imported ${reports.length} reports`);
        } else {
            console.log('⏩ No reports export file found, skipping');
        }

        // 2. Import marketing_ads_kpis
        const kpisPath = path.resolve(__dirname, '../exports/marketing_ads_kpis.json');
        if (fs.existsSync(kpisPath)) {
            const kpis = JSON.parse(fs.readFileSync(kpisPath, 'utf8'));
            console.log(`\n📦 Importing ${kpis.length} marketing_ads_kpis...`);
            
            for (const k of kpis) {
                await client.query(`
                    INSERT INTO marketing_ads_kpis 
                    (bu_name, year, month, budget, target_routes, target_groups, target_customers, 
                     target_cpa, target_leads, target_cpl, pic_name, notes, updated_at)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CURRENT_TIMESTAMP)
                    ON CONFLICT (bu_name, year, month) DO UPDATE SET
                        budget = EXCLUDED.budget,
                        target_routes = EXCLUDED.target_routes,
                        target_groups = EXCLUDED.target_groups,
                        target_customers = EXCLUDED.target_customers,
                        target_cpa = EXCLUDED.target_cpa,
                        target_leads = EXCLUDED.target_leads,
                        target_cpl = EXCLUDED.target_cpl,
                        pic_name = EXCLUDED.pic_name,
                        notes = EXCLUDED.notes,
                        updated_at = CURRENT_TIMESTAMP
                `, [
                    k.bu_name, k.year, k.month, k.budget, 
                    k.target_routes || 0, k.target_groups || 0, k.target_customers || 0,
                    k.target_cpa || 0, k.target_leads || 0, k.target_cpl || 0,
                    k.pic_name || '', k.notes || ''
                ]);
            }
            console.log(`  ✅ Imported ${kpis.length} KPI records`);
        } else {
            console.log('⏩ No KPI export file found, skipping');
        }

        await client.query('COMMIT');
        console.log('\n🎉 Data import completed successfully!');
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Import failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

importData().catch(() => process.exit(1));
