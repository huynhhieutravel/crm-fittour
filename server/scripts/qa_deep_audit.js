require('dotenv').config();
const db = require('../db');
const { getGlobalCenterLeads } = require('../controllers/notificationController');

async function runQA() {
  const results = [];
  const addResult = (category, testName, passed, details) => {
    results.push({ category, testName, passed, details });
    console.log((passed ? '✅ [PASS]' : '❌ [FAIL]') + ' ' + category + ' -> ' + testName + ': ' + details);
  };

  try {
    // 1. Check DB connection
    const dbTest = await db.query('SELECT NOW()');
    addResult('SYSTEM', 'Database connection', true, 'Connected to PostgreSQL: ' + dbTest.rows[0].now);

    // 2. Test getGlobalCenterLeads with assignment=has_phone
    await new Promise((resolve) => {
      const req = { query: { timeRange: 'today', bu: 'all', assignment: 'has_phone' }, user: { id: 1 } };
      const res = {
        json: (data) => {
          const leads = data.notifications || [];
          const nonPhone = leads.filter(l => !l.phone || l.phone.trim() === '');
          if (nonPhone.length === 0 && leads.length > 0) {
            addResult('GLOBAL_CENTER', 'assignment=has_phone filter', true, 'Returned ' + leads.length + ' leads, 0 missing phone');
          } else if (leads.length === 0) {
            addResult('GLOBAL_CENTER', 'assignment=has_phone filter', true, '0 leads returned (empty database for today)');
          } else {
            addResult('GLOBAL_CENTER', 'assignment=has_phone filter', false, 'Found ' + nonPhone.length + ' leads without phone!');
          }
          resolve();
        },
        status: () => ({ json: () => { addResult('GLOBAL_CENTER', 'assignment=has_phone filter', false, 'API error'); resolve(); } })
      };
      getGlobalCenterLeads(req, res);
    });

    // 3. Test getGlobalCenterLeads with assignment=unassigned
    await new Promise((resolve) => {
      const req = { query: { timeRange: 'today', bu: 'all', assignment: 'unassigned' }, user: { id: 1 } };
      const res = {
        json: (data) => {
          const leads = data.notifications || [];
          const assigned = leads.filter(l => l.assigned_to_name);
          if (assigned.length === 0) {
            addResult('GLOBAL_CENTER', 'assignment=unassigned filter', true, 'Returned ' + leads.length + ' unassigned leads');
          } else {
            addResult('GLOBAL_CENTER', 'assignment=unassigned filter', false, 'Found ' + assigned.length + ' assigned leads in unassigned filter');
          }
          resolve();
        },
        status: () => ({ json: () => { addResult('GLOBAL_CENTER', 'assignment=unassigned filter', false, 'API error'); resolve(); } })
      };
      getGlobalCenterLeads(req, res);
    });

    // 4. Test Returning customer inclusion (e.g. lead 13312)
    await new Promise((resolve) => {
      const req = { query: { timeRange: 'today', bu: 'all', assignment: 'all' }, user: { id: 1 } };
      const res = {
        json: (data) => {
          const leads = data.notifications || [];
          const huan = leads.find(l => l.reference_id === 13312 || (l.message && l.message.includes('Thế Huân')));
          if (huan) {
            addResult('GLOBAL_CENTER', 'Returning customer in Hôm nay', true, 'Found lead ' + huan.reference_id + ' in Hôm nay stream');
          } else {
            addResult('GLOBAL_CENTER', 'Returning customer in Hôm nay', false, 'Lead 13312 not found in Hôm nay stream');
          }
          resolve();
        },
        status: () => ({ json: () => { addResult('GLOBAL_CENTER', 'Returning customer in Hôm nay', false, 'API error'); resolve(); } })
      };
      getGlobalCenterLeads(req, res);
    });

    // 5. Test BU groups filtering (BU1 -> BU5)
    for (const bu of ['BU1', 'BU2', 'BU3', 'BU4', 'BU5']) {
      await new Promise((resolve) => {
        const req = { query: { timeRange: 'today', bu, assignment: 'all' }, user: { id: 1 } };
        const res = {
          json: (data) => {
            const leads = data.notifications || [];
            const invalid = leads.filter(l => l.bu_group !== bu);
            if (invalid.length === 0) {
              addResult('BU_FILTER', bu + ' filter strictly matches', true, 'Returned ' + leads.length + ' leads all for ' + bu);
            } else {
              addResult('BU_FILTER', bu + ' filter strictly matches', false, 'Found ' + invalid.length + ' leads with different BU');
            }
            resolve();
          },
          status: () => ({ json: () => { addResult('BU_FILTER', bu, false, 'API error'); resolve(); } })
        };
        getGlobalCenterLeads(req, res);
      });
    }

    // 6. Test deduplication on recent messages (since the fix was deployed ~3 hours ago)
    const dupeCheck = await db.query(`
      SELECT conversation_id, content, sender_type, COUNT(*), MIN(created_at) as first_sent, MAX(created_at) as last_sent
      FROM messages 
      WHERE created_at >= NOW() - INTERVAL '3 HOURS' 
        AND sender_type IN ('user', 'page') 
        AND content IS NOT NULL AND TRIM(content) != ''
      GROUP BY conversation_id, content, sender_type 
      HAVING COUNT(*) > 1
    `);
    if (dupeCheck.rows.length === 0) {
      addResult('MESSAGES_DEDUP', 'Zero duplicated messages since fix', true, '0 duplicates found in DB');
    } else {
      addResult('MESSAGES_DEDUP', 'Zero duplicated messages since fix', false, 'Found ' + dupeCheck.rows.length + ' duplicates: ' + JSON.stringify(dupeCheck.rows));
    }

    // 7. Verify BU4 keywords (ensure 'himalaya' is gone)
    const bu4Kw = await db.query("SELECT keywords, countries FROM business_units WHERE id = 'BU4'");
    if (bu4Kw.rows.length > 0) {
      const kw = bu4Kw.rows[0].keywords || [];
      const countries = bu4Kw.rows[0].countries || [];
      const hasHimalaya = [...kw, ...countries].some(k => k.toLowerCase().includes('himalaya'));
      if (!hasHimalaya) {
        addResult('ROUTING_RULES', 'BU4 keywords & countries clean', true, 'No himalaya in BU4');
      } else {
        addResult('ROUTING_RULES', 'BU4 keywords & countries clean', false, 'Himalaya still present in BU4');
      }
    } else {
      addResult('ROUTING_RULES', 'BU4 exists', false, 'BU4 not found in business_units');
    }

    // 8. Verify Tour Template 312
    const t312 = await db.query("SELECT id, name, keywords, destination FROM tour_templates WHERE id = 312");
    if (t312.rows.length > 0 && t312.rows[0].destination === 'Ladakh') {
      addResult('ROUTING_RULES', 'Tour 312 Destination', true, 'Tour 312 destination is Ladakh');
    } else {
      addResult('ROUTING_RULES', 'Tour 312 Destination', false, 'Tour 312 destination mismatch: ' + (t312.rows[0]?.destination));
    }

    // 9. Verify Tour Template 313 (Pakistan)
    const t313 = await db.query("SELECT id, name, keywords, destination FROM tour_templates WHERE id = 313");
    if (t313.rows.length > 0 && t313.rows[0].destination && t313.rows[0].destination.includes('Pakistan')) {
      addResult('ROUTING_RULES', 'Tour 313 Destination', true, 'Tour 313 destination is ' + t313.rows[0].destination);
    } else {
      addResult('ROUTING_RULES', 'Tour 313 Destination', false, 'Tour 313 destination mismatch: ' + (t313.rows[0]?.destination));
    }

    console.log('--- FINAL SUMMARY ---');
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    console.log('Passed: ' + passed + '/' + total);
    process.exit(passed === total ? 0 : 1);
  } catch (e) {
    console.error('QA Script Error:', e);
    process.exit(1);
  }
}

runQA();
