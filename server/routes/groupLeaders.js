const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupLeaderController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', controller.getAllGroupLeaders);
router.get('/:id', controller.getGroupLeaderById);
router.post('/', controller.createGroupLeader);
router.put('/:id', controller.updateGroupLeader);
router.delete('/:id', controller.deleteGroupLeader);

// Notes
router.get('/:id/notes', controller.getLeaderNotes);
router.post('/:id/notes', controller.createLeaderNote);

module.exports = router;
