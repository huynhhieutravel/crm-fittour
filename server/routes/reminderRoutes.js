const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middleware/auth');

router.get('/today', authMiddleware, reminderController.getTodayReminders);
router.get('/all', authMiddleware, reminderController.getAllReminders);
router.get('/departure/:tour_departure_id', authMiddleware, reminderController.getDeparturesReminders);
router.post('/custom', authMiddleware, reminderController.createCustomReminder);
router.put('/:id', authMiddleware, reminderController.updateReminder);
router.put('/:id/done', authMiddleware, reminderController.markDone);
router.delete('/:id', authMiddleware, reminderController.deleteReminder);

module.exports = router;
