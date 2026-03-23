const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authenticateToken = require('../middleware/auth');

router.get('/:leadId', authenticateToken, noteController.getNotesByLeadId);
router.post('/', authenticateToken, noteController.addNote);

module.exports = router;
