require('dotenv').config();
const pool = require('../db');
const dashboardController = require('../controllers/dashboardController');
const departureCashflowController = require('../controllers/departureCashflowController');

let passed = 0;
let failed = 0;

function mockRes(name, expectedCode = 200, checkFn = null) {
  let statusCode = 200;
  return {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          if (statusCode === expectedCode) {
            if (checkFn) {
              try {
                checkFn(data);
                console.log(`✅ [PASS] ${name} (status ${statusCode})`);
                passed++;
              } catch (e) {
                console.error(`❌ [FAIL] ${name} assertion error:`, e.message);
                failed++;
              }
            } else {
              console.log(`✅ [PASS] ${name} (status ${statusCode})`);
              passed++;
            }
          } else {
            console.error(`❌ [FAIL] ${name}: expected ${expectedCode}, got ${statusCode}`, data);
            failed++;
          }
        },
        send: (msg) => {
          console.log(`[STATUS ${statusCode}] ${name}:`, msg);
        }
      };
    },
    json: (data) => {
      if (statusCode === expectedCode) {
        if (checkFn) {
          try {
            checkFn(data);
            console.log(`✅ [PASS] ${name} (status ${statusCode})`);
            passed++;
          } catch (e) {
            console.error(`❌ [FAIL] ${name} assertion error:`, e.message);
            failed++;
          }
        } else {
          console.log(`✅ [PASS] ${name} (status ${statusCode})`);
          passed++;
        }
      } else {
        console.error(`❌ [FAIL] ${name}: expected ${expectedCode}, got ${statusCode}`, data);
        failed++;
      }
    }
  };
}

async function runQA() {
  console.log('🚀 Starting Comprehensive Backend & Data QA...\n');

  // Test 1: Leader overview - Month
  await dashboardController.getLeaderOverview(
    { query: { period: 'month', year: '2026', month: '10', quarter: '4' }, user: { id: 1, role: 'admin' } },
    mockRes('Leader Overview (Month)', 200, (d) => {
      if (!d.topMetrics || !d.tourPerformance || !d.funnel) throw new Error('Missing core keys');
    })
  );

  // Test 2: Leader overview - Quarter
  await dashboardController.getLeaderOverview(
    { query: { period: 'quarter', year: '2026', month: '10', quarter: '4' }, user: { id: 1, role: 'admin' } },
    mockRes('Leader Overview (Quarter)', 200)
  );

  // Test 3: Leader overview - Year
  await dashboardController.getLeaderOverview(
    { query: { period: 'year', year: '2026', month: '10', quarter: '4' }, user: { id: 1, role: 'admin' } },
    mockRes('Leader Overview (Year)', 200)
  );

  // Test 4: Cashflow Stats - Single month
  await departureCashflowController.getCashflowStats(
    { query: { year: '2026', months: '10', month: '10', bu: 'all', route: '', debtStatus: 'all' }, user: { id: 1, role: 'admin' } },
    mockRes('Cashflow Stats (Month 10, All BU)', 200, (d) => {
      if (!d.metrics || !d.routesBreakdown || !d.departures) throw new Error('Missing stats structure');
    })
  );

  // Test 5: Cashflow Stats - Multi-month
  await departureCashflowController.getCashflowStats(
    { query: { year: '2026', months: '10,11,12', month: '10,11,12', bu: 'BU1', route: '', debtStatus: 'debt' }, user: { id: 1, role: 'admin' } },
    mockRes('Cashflow Stats (Multi-month Q4, BU1, Debt filter)', 200)
  );

  // Test 6: Personal Cashflow - Admin
  await departureCashflowController.getPersonalCashflow(
    { query: { userId: '1', year: '2026', months: '10', month: '10', bu: 'all' }, user: { id: 1, role: 'admin' } },
    mockRes('Personal Cashflow (Admin id 1)', 200, (d) => {
      if (!d.personalMetrics || !d.salesUsers) throw new Error('Missing personal structure');
    })
  );

  // Test 7: Personal Cashflow - Staff Sales (User 46)
  await departureCashflowController.getPersonalCashflow(
    { query: { userId: '46', year: '2026', months: '10', month: '10', bu: 'BU1' }, user: { id: 46, role: 'staff', bus: ['BU1'] } },
    mockRes('Personal Cashflow (Staff id 46)', 200)
  );

  // Test 8: Get Quick Logistics for first available departure
  const depRes = await pool.query("SELECT id FROM tour_departures_raw WHERE status NOT IN ('Huỷ', 'Hủy', 'CANCELLED') LIMIT 1");
  if (depRes.rows.length > 0) {
    const depId = depRes.rows[0].id;
    await departureCashflowController.getDepartureQuickLogistics(
      { params: { id: String(depId) }, user: { id: 1, role: 'admin' } },
      mockRes(`Quick Logistics (Departure ${depId})`, 200, (d) => {
        if (!d.tour || !d.bookings || !d.logistics) throw new Error('Missing tour, bookings or logistics');
      })
    );

    // Test 9: Generate Share Link
    await departureCashflowController.generateDepartureShareLink(
      { params: { id: String(depId) }, body: {}, user: { id: 1, role: 'admin' } },
      mockRes(`Generate Share Link (Departure ${depId})`, 200, (d) => {
        if (!d.token || !d.url) throw new Error('Missing token or url');
      })
    );

    // Test 10: Query Public Guide Link using created token
    const tokenRes = await pool.query('SELECT token FROM departure_share_links WHERE tour_departure_id = $1 LIMIT 1', [depId]);
    if (tokenRes.rows.length > 0) {
      const token = tokenRes.rows[0].token;
      await departureCashflowController.getPublicDepartureShare(
        { params: { token } },
        mockRes(`Public Guide View (Token ${token.slice(0, 8)}...)`, 200, (d) => {
          if (!d.tour || !d.passengers) throw new Error('Missing public departure view');
        })
      );
    }
  }

  console.log(`\n========================================`);
  console.log(`QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runQA().catch((err) => {
  console.error('CRITICAL QA ERROR:', err);
  process.exit(1);
});
