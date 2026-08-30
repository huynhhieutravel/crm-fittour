const express = require('express');
const router = express.Router();
const visaFormTemplateController = require('../controllers/visaFormTemplateController');
const checkAuth = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');

router.use(checkAuth);

router.get('/', visaFormTemplateController.getAllTemplates);
router.get('/:id', visaFormTemplateController.getTemplateById);
router.post('/', permCheck('settings'), visaFormTemplateController.createTemplate);
router.put('/:id', permCheck('settings'), visaFormTemplateController.updateTemplate);
router.delete('/:id', permCheck('settings'), visaFormTemplateController.deleteTemplate);

module.exports = router;
