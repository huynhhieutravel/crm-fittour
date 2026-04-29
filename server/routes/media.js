const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

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
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
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

// Route: Bulk delete files
router.post('/bulk-delete', (req, res) => {
    console.log('[MEDIA] Called bulk-delete:', req.body);
    try {
        const filenames = req.body.filenames;
        if (!Array.isArray(filenames) || filenames.length === 0) {
            return res.status(400).json({ error: 'Danh sách file không hợp lệ.' });
        }
        
        let deletedCount = 0;
        let notFoundCount = 0;
        
        for (const filename of filenames) {
            const filePath = path.join(uploadDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                deletedCount++;
            } else {
                notFoundCount++;
            }
        }
        
        res.status(200).json({ message: `Đã xóa thành công ${deletedCount} file (Không tìm thấy: ${notFoundCount}).`, deletedCount });
    } catch (err) {
        console.error('Bulk delete error:', err);
        res.status(500).json({ error: 'Lỗi xóa hàng loạt trên máy chủ.' });
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
router.get('/', async (req, res) => {
    try {
        if (!fs.existsSync(uploadDir)) {
            return res.json([]);
        }
        
        // Setup mapping for Voucher code attached
        let vouchersData = [];
        try {
            const result = await db.query('SELECT voucher_code, attachment_url FROM payment_vouchers WHERE attachment_url IS NOT NULL');
            vouchersData = result.rows;
        } catch(dbErr) {
            console.error('Error fetching vouchers mapping for media:', dbErr);
        }

        // Setup mapping for Passports attached (Customers + Bookings)
        let passportsData = [];
        try {
            const [custRes, bookRes] = await Promise.all([
                db.query('SELECT id, name, phone, passport_url FROM customers WHERE passport_url IS NOT NULL'),
                db.query(`SELECT DISTINCT jsonb_array_elements(raw_details->'members')->>'passportUrl' as url, id as booking_id FROM bookings WHERE jsonb_typeof(raw_details->'members') = 'array'`)
            ]);
            
            // Map customers
            custRes.rows.forEach(r => {
                passportsData.push({ url: r.passport_url, label: `${r.name || 'Khách hàng'} ${r.phone ? '('+r.phone+')' : ''}` });
            });

            // Map booking members (if they don't already exist from primary customer)
            bookRes.rows.forEach(r => {
                if (r.url && !passportsData.find(p => p.url === r.url)) {
                    passportsData.push({ url: r.url, label: `Khách phụ (Booking #${r.booking_id})` });
                }
            });
        } catch(dbErr) {
            console.error('Error fetching passports mapping for media:', dbErr);
        }

        const files = fs.readdirSync(uploadDir).filter(f => !f.startsWith('._') && !f.startsWith('.DS_Store'));
        const mediaList = files.map(file => {
            const stats = fs.statSync(path.join(uploadDir, file));
            const publicUrl = `/uploads/receipts/${file}`;
            
            // Check if attached to any voucher
            const linkedVoucher = vouchersData.find(v => v.attachment_url === publicUrl);
            const linkedPassport = passportsData.find(p => p.url === publicUrl);

            let type = 'trash';
            let ref = null;

            if (linkedVoucher) {
                type = 'voucher';
                ref = linkedVoucher.voucher_code;
            } else if (linkedPassport) {
                type = 'passport';
                ref = linkedPassport.label;
            }

            return {
                filename: file,
                url: publicUrl,
                size: stats.size,
                createdAt: stats.birthtime,
                type: type,
                ref: ref,
                // keep backward compat if any component uses voucherCode
                voucherCode: linkedVoucher ? linkedVoucher.voucher_code : null
            };
        });

        // Sort by newest
        mediaList.sort((a, b) => b.createdAt - a.createdAt);
        res.json(mediaList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi lấy danh sách file.' });
    }
});

module.exports = router;
