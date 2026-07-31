const express = require('express');
const router = express.Router();
const visaTemplateController = require('../controllers/visaTemplateController');
const auth = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');

router.use(auth);

router.get('/', permCheck('visas', 'view'), visaTemplateController.getAll);
router.get('/:id', permCheck('visas', 'view'), visaTemplateController.getById);
router.post('/', permCheck('visas', 'create'), visaTemplateController.create);
router.put('/:id', permCheck('visas', 'edit'), visaTemplateController.update);
router.delete('/:id', permCheck('visas', 'delete'), visaTemplateController.delete);

module.exports = router;
