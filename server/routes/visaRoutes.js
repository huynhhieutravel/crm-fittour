const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth');
const visaController = require('../controllers/visaController');
const { permCheck, permCheckAny } = require('../middleware/permCheck');

// All visa routes require standard authentication
router.use(checkAuth);

router.get('/', permCheckAny([['visas', 'view_all'], ['visas', 'view_own']]), visaController.getAll);
router.get('/:id', permCheckAny([['visas', 'view_all'], ['visas', 'view_own']]), visaController.getDetails);
router.post('/', permCheck('visas', 'create'), visaController.create);
router.put('/:id', permCheck('visas', 'edit'), visaController.update);
router.patch('/:id/status', permCheck('visas', 'edit'), visaController.patchStatus);
router.delete('/:id', permCheck('visas', 'delete'), visaController.delete);

module.exports = router;
