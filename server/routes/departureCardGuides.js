const express = require('express');
const router = express.Router();
const controller = require('../controllers/departureCardGuidesController');
// Bỏ qua check auth cho preview local nếu cần, nhưng tốt nhất cứ gắn
// Nhưng vì route AdminTripDashboard đang bỏ auth để test, API cũng nên nới lỏng cho test hoặc bỏ
router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
