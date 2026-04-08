const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/receipts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép tải lên file hình ảnh (JPG, PNG, ...)'));
        }
    }
});

// Route: Upload 1 file
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file nào được tải lên.' });
        }
        // Return public URL path
        const fileUrl = `/uploads/receipts/${req.file.filename}`;
        res.status(200).json({ url: fileUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Lỗi tải file lên máy chủ.' });
    }
});

// Route: Delete a file
router.delete('/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadDir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: 'Đã xóa file thành công.' });
        } else {
            res.status(404).json({ error: 'File không tồn tại.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Lỗi xóa file trên máy chủ.' });
    }
});

// Route: Get all media for Admin config
router.get('/', (req, res) => {
    try {
        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }
        
        const files = fs.readdirSync(uploadDir);
        const mediaList = files.map(file => {
            const stats = fs.statSync(path.join(uploadDir, file));
            return {
                filename: file,
                url: `/uploads/receipts/${file}`,
                size: stats.size,
                createdAt: stats.birthtime
            };
        });

        // Sort by newest
        mediaList.sort((a, b) => b.createdAt - a.createdAt);
        res.json(mediaList);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi lấy danh sách file.' });
    }
});

module.exports = router;
