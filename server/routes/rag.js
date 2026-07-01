const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController');
const authRag = require('../middleware/ragAuth');

// Apply the RAG authentication middleware to all routes in this file
router.use(authRag);

// GET /api/rag/docs - Returns a list of all documents
router.get('/docs', ragController.getDocs);

// GET /api/rag/docs/content?id=... - Returns the raw markdown content of a specific document
router.get('/docs/content', ragController.getDocContent);

module.exports = router;
