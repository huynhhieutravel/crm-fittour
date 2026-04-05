const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupLeaderController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', controller.getAllGroupLeaders);
router.post('/', controller.createGroupLeader);
router.put('/:id', controller.updateGroupLeader);
router.delete('/:id', controller.deleteGroupLeader);

module.exports = router;
