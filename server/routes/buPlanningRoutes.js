const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const buPlanningController = require('../controllers/buPlanningController');

// All endpoints require valid JWT authentication
router.use(auth);

// Plan listing & detail
router.get('/plans', buPlanningController.getPlans);
router.get('/plans/:id', buPlanningController.getPlanDetail);

// Plan creation & setup
router.post('/plans', buPlanningController.createPlan);
router.put('/plans/:id/setup', buPlanningController.updatePlanSetup);

// Products catalog CRUD
router.post('/plans/:id/products', buPlanningController.saveProduct);
router.post('/plans/:id/batch-products', buPlanningController.batchSaveProducts);
router.delete('/plans/:id/products/:productId', buPlanningController.deleteProduct);

// Departures schedule CRUD & Matrix
router.post('/plans/:id/departures', buPlanningController.saveDeparture);
router.post('/plans/:id/matrix-cell', buPlanningController.updateMatrixCell);
router.delete('/plans/:id/departures/:departureId', buPlanningController.deleteDeparture);

// Delivery Tasks CRUD
router.post('/plans/:id/tasks', buPlanningController.saveTask);
router.delete('/plans/:id/tasks/:taskId', buPlanningController.deleteTask);

// Approval State Machine (SUBMIT, REQUEST_CHANGES, APPROVE, REVERT_DRAFT)
router.post('/plans/:id/status', buPlanningController.updateStatus);

// Localhost / Dev tools
router.post('/dev-seed-demo', buPlanningController.devSeedDemo);
router.post('/dev-reset-sandbox', buPlanningController.devResetSandbox);

module.exports = router;
