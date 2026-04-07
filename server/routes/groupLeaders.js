const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupLeaderController');
const eventController = require('../controllers/groupLeaderEventController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// group_leaders: admin, manager, group_manager, group_staff + operations, marketing (view only)
const VIEW_ROLES = ['admin', 'manager', 'group_manager', 'group_staff', 'operations', 'marketing'];
const EDIT_ROLES = ['admin', 'manager', 'group_manager', 'group_staff'];
const DELETE_ROLES = ['admin', 'manager', 'group_manager'];

// Events — MUST be before /:id to avoid route conflicts
router.get('/events/all', authenticateToken, roleCheck(VIEW_ROLES), eventController.getEvents);
router.post('/events', authenticateToken, roleCheck(EDIT_ROLES), eventController.createEvent);
router.put('/events/:id/status', authenticateToken, roleCheck(EDIT_ROLES), eventController.updateEventStatus);
router.put('/events/:id', authenticateToken, roleCheck(EDIT_ROLES), eventController.updateEvent);
router.delete('/events/:id', authenticateToken, roleCheck(DELETE_ROLES), eventController.deleteEvent);

router.get('/', authenticateToken, roleCheck(VIEW_ROLES), controller.getAllGroupLeaders);
router.get('/:id', authenticateToken, roleCheck(VIEW_ROLES), controller.getGroupLeaderById);
router.post('/', authenticateToken, roleCheck(EDIT_ROLES), controller.createGroupLeader);
router.put('/:id', authenticateToken, roleCheck(EDIT_ROLES), controller.updateGroupLeader);
router.delete('/:id', authenticateToken, roleCheck(DELETE_ROLES), controller.deleteGroupLeader);

// Notes
router.get('/:id/notes', authenticateToken, roleCheck(VIEW_ROLES), controller.getLeaderNotes);
router.post('/:id/notes', authenticateToken, roleCheck(EDIT_ROLES), controller.createLeaderNote);

module.exports = router;
