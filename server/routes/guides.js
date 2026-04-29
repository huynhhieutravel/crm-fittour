const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const authenticateToken = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure Multer for guides uploads
const guidesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/uploads/guides/');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `guide_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`);
    }
});
const upload = multer({ 
    storage: guidesStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/', authenticateToken, permCheck('guides', 'view'), guideController.getAllGuides);
router.post('/', authenticateToken, permCheck('guides', 'create'), guideController.createGuide);
router.get('/timeline/data', authenticateToken, permCheck('guides', 'view'), guideController.getGuideTimeline);
router.get('/:id', authenticateToken, permCheck('guides', 'view'), guideController.getGuideById);
router.put('/:id', authenticateToken, permCheck('guides', 'edit'), guideController.updateGuide);
router.delete('/:id', authenticateToken, permCheck('guides', 'delete'), guideController.deleteGuide);

router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Không tìm thấy file tải lên' });
    }
    const fileUrl = `/uploads/guides/${req.file.filename}`;
    res.json({ url: fileUrl });
});

module.exports = router;
