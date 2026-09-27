const express = require('express');
const router = express.Router();
const controller = require('../controllers/marketingBudgetPlanController');
const authenticateToken = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// 1. Get plans with filters
router.get('/', controller.getPlans);

// 2. Aggregated summary & KPI
router.get('/summary', controller.getSummary);

// 3. Export to Excel (.xlsx)
router.get('/export-excel', controller.exportExcel);

// 4. Sync from ERP departures
router.post('/sync-erp', controller.syncFromERP);

// 5. Batch update plans
router.post('/batch-save', controller.batchSavePlans);

// 6. Update single plan
router.put('/:id', controller.upsertPlan);

module.exports = router;
