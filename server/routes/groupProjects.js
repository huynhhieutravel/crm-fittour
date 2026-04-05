const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupProjectController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', controller.getAllProjects);
router.post('/', controller.createProject);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);

module.exports = router;
