const express = require('express');
const router = express.Router();
const publicVisaController = require('../controllers/publicVisaController');

router.get('/:token', publicVisaController.getDetails);
router.post('/:token/assessment', publicVisaController.submitAssessment);

module.exports = router;
