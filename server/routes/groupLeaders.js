const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupLeaderController');
const eventController = require('../controllers/groupLeaderEventController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny, permCheckOrOwner } = require('../middleware/permCheck');

// Events — MUST be before /:id to avoid route conflicts
router.get('/events/all', authenticateToken, permCheckAny([['group_leaders','view_all'], ['group_leaders','view_own']]), eventController.getEvents);
router.post('/events', authenticateToken, permCheck('group_leaders', 'edit'), eventController.createEvent);
router.put('/events/:id/status', authenticateToken, permCheck('group_leaders', 'edit'), eventController.updateEventStatus);
router.put('/events/:id', authenticateToken, permCheck('group_leaders', 'edit'), eventController.updateEvent);
router.delete('/events/:id', authenticateToken, permCheck('group_leaders', 'delete'), eventController.deleteEvent);

router.get('/', authenticateToken, permCheckAny([['group_leaders','view_all'], ['group_leaders','view_own']]), controller.getAllGroupLeaders);
router.get('/:id', authenticateToken, permCheckAny([['group_leaders','view_all'], ['group_leaders','view_own']]), controller.getGroupLeaderById);
router.post('/', authenticateToken, permCheck('group_leaders', 'create'), controller.createGroupLeader);
router.put('/:id', authenticateToken, permCheckOrOwner('group_leaders', 'edit', 'group_leaders', 'id', 'assigned_to'), controller.updateGroupLeader);
router.delete('/:id', authenticateToken, permCheckOrOwner('group_leaders', 'delete', 'group_leaders', 'id', 'assigned_to'), controller.deleteGroupLeader);

// Notes
router.get('/:id/notes', authenticateToken, permCheckAny([['group_leaders','view_all'], ['group_leaders','view_own']]), controller.getLeaderNotes);
router.post('/:id/notes', authenticateToken, permCheck('group_leaders', 'edit'), controller.createLeaderNote);

module.exports = router;
