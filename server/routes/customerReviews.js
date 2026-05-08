const express = require('express');
const router = express.Router();
const customerReviewController = require('../controllers/customerReviewController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'reviews');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'review-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên hình ảnh!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Routes
router.get('/', auth, customerReviewController.getReviews);
router.get('/stats', auth, customerReviewController.getStats);
router.post('/', auth, upload.single('proof_image'), customerReviewController.createReview);
router.put('/:id', auth, upload.single('proof_image'), customerReviewController.updateReview);
router.put('/:id/bu', auth, customerReviewController.updateReviewBU);
router.put('/:id/approve', auth, customerReviewController.approveReview);
router.delete('/:id', auth, customerReviewController.deleteReview);

module.exports = router;
