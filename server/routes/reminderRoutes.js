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

// Lead Reminders
router.get('/leads/all', authMiddleware, reminderController.getLeadReminders);
router.get('/leads/by-lead/:lead_id', authMiddleware, reminderController.getRemindersByLead);
router.post('/leads', authMiddleware, reminderController.createLeadReminder);
router.put('/leads/:id/done', authMiddleware, reminderController.markLeadReminderDone);
router.delete('/leads/:id', authMiddleware, reminderController.deleteLeadReminder);

module.exports = router;
