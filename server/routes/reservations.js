const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifyToken } = require('../middleware/auth');
const idempotencyCheck = require('../middlewares/idempotency');

router.post('/', idempotencyCheck, reservationController.createReservation);

module.exports = router;
