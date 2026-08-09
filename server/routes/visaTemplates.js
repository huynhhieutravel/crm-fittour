const express = require('express');
const router = express.Router();
const visaTemplateController = require('../controllers/visaTemplateController');
const auth = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/', roleCheck(['admin', 'manager', 'group_manager', 'sales_lead', 'sale_lead', 'operations_lead', 'group_operations_lead']), visaTemplateController.getAll);
router.get('/:id', roleCheck(['admin', 'manager', 'group_manager', 'sales_lead', 'sale_lead', 'operations_lead', 'group_operations_lead']), visaTemplateController.getById);
router.post('/', permCheck('visas', 'create'), visaTemplateController.create);
router.put('/:id', permCheck('visas', 'edit'), visaTemplateController.update);
router.delete('/:id', permCheck('visas', 'delete'), visaTemplateController.delete);

module.exports = router;
