const express = require('express');
const router = express.Router();
const controller = require('../controllers/orgChartController');
const auth = require('../middleware/auth');

router.get('/', auth, controller.getOrgChart);
// To simplify, we rely on the frontend restricting the button, and backend auth
router.post('/', auth, controller.saveOrgChart);

module.exports = router;
