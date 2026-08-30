require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../db');
const leadController = require('../controllers/leadController');

async function runLeadStatsQATests() {
  console.log('========================================');
  console.log('🚀 RUNNING PRE-DEPLOY QA TESTS: LEADS DASHBOARD');
  console.log('========================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(testName, condition, details = '') {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
    }
  }

  // Helper to execute controller
  const testGetLeadStats = (query) => {
    return new Promise((resolve) => {
      const req = { query, user: { id: 1, role: 'admin' } };
      const res = {
        json: (data) => resolve({ status: 200, data }),
        status: (code) => ({
          json: (err) => resolve({ status: code, data: err })
        })
      };
      leadController.getLeadStats(req, res);
    });
  };

  try {
    // TEST 1: Monthly date filter
    console.log('--- TEST GROUP 1: Month Filter (Weekly periods) ---');
    const monthRes = await testGetLeadStats({
      dateFilter: 'month',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      groupBy: 'day'
    });
    assert('Month Filter HTTP 200', monthRes.status === 200);
    assert('CorrelationStats exists', !!monthRes.data.correlationStats);
    assert('Mode is weeks', monthRes.data.correlationStats?.mode === 'weeks');
    assert('Periods array has 5 weeks', monthRes.data.correlationStats?.periods?.length === 5);
    
    const w1 = monthRes.data.correlationStats?.periods?.[0];
    assert('Week 1 data has all required fields', 
      w1 && 
      typeof w1.crmLeads === 'number' &&
      typeof w1.adsSpend === 'number' &&
      typeof w1.cplCrm === 'number' &&
      typeof w1.conversionRate === 'number' &&
      typeof w1.diagnosis === 'string'
    );

    // TEST 2: Yearly date filter
    console.log('\n--- TEST GROUP 2: Year Filter (Monthly periods) ---');
    const yearRes = await testGetLeadStats({
      dateFilter: 'year',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      groupBy: 'month'
    });
    assert('Year Filter HTTP 200', yearRes.status === 200);
    assert('Mode is months', yearRes.data.correlationStats?.mode === 'months');
    assert('Periods array has 12 months', yearRes.data.correlationStats?.periods?.length === 12);
    
    const m7 = yearRes.data.correlationStats?.periods?.[6]; // July
    assert('Month 7 (July) has aggregated spend & leads', 
      m7 && m7.periodLabel === 'Tháng 7' && m7.adsSpend > 0
    );

    // TEST 3: BU Filtering
    console.log('\n--- TEST GROUP 3: BU Filtering ---');
    const bu1Res = await testGetLeadStats({
      dateFilter: 'month',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      comparisonBu: 'BU1',
      groupBy: 'day'
    });
    assert('BU1 Filter HTTP 200', bu1Res.status === 200);
    assert('Selected BU is BU1', bu1Res.data.correlationStats?.selectedBu === 'BU1');
    assert('Available BUs contains BU1', bu1Res.data.correlationStats?.availableBus?.includes('BU1'));

    // TEST 4: Edge cases (empty data, no NaN)
    console.log('\n--- TEST GROUP 4: Edge Cases & Number Sanity ---');
    const emptyRes = await testGetLeadStats({
      dateFilter: 'custom',
      startDate: '2030-01-01',
      endDate: '2030-01-31',
      comparisonBu: 'NON_EXISTENT_BU',
      groupBy: 'day'
    });
    assert('Empty range HTTP 200', emptyRes.status === 200);
    const emptyPeriods = emptyRes.data.correlationStats?.periods || [];
    const hasNaN = emptyPeriods.some(p => isNaN(p.crmLeads) || isNaN(p.adsSpend) || isNaN(p.cplCrm) || isNaN(p.conversionRate));
    assert('No NaN values in calculated metrics', !hasNaN);

    console.log('\n========================================');
    console.log(`🏁 QA RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('========================================');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('QA Test execution failed with error:', err);
    process.exit(1);
  }
}

runLeadStatsQATests();
