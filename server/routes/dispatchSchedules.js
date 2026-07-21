const express = require('express');
const router = express.Router();
const dispatchScheduleController = require('../controllers/dispatchScheduleController');
const authenticateToken = require('../middleware/auth');
const { permCheckAny } = require('../middleware/permCheck');

router.use(authenticateToken);

router.get('/', dispatchScheduleController.getWeeklySchedule);
router.post('/responsible-bu', permCheckAny([['leads','edit'], ['users','edit']]), dispatchScheduleController.setResponsibleBU);
router.post('/save', permCheckAny([['leads','edit'], ['users','edit']]), dispatchScheduleController.saveSchedule);

module.exports = router;
