const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Ensure upload directories exist
const baseUploadDir = path.join(__dirname, '../public/uploads');
const receiptUploadDir = path.join(baseUploadDir, 'receipts');
if (!fs.existsSync(receiptUploadDir)) {
    fs.mkdirSync(receiptUploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, receiptUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalExt = path.extname(file.originalname).toLowerCase();
        cb(null, 'receipt-' + uniqueSuffix + originalExt);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép tải lên file hình ảnh hoặc PDF'));
        }
    }
});

// Route: Upload 1 file
router.post('/upload', upload.single('file'), async (req, res) => {
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
            if (filename.includes('..')) {
                continue; // Prevent directory traversal
            }
            
            // Allow files to be stored in subdirectories (like receipts/file.jpg or transports/file.jpg)
            const filePath = path.join(baseUploadDir, filename);
            
            // For backward compatibility: if filename doesn't contain '/', assume it's in receipts
            const actualFilePath = filename.includes('/') ? filePath : path.join(receiptUploadDir, filename);

            if (fs.existsSync(actualFilePath)) {
                fs.unlinkSync(actualFilePath);
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
        const filePath = path.join(receiptUploadDir, filename);
        
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
        if (!fs.existsSync(baseUploadDir)) {
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

        // Setup mapping for Passports attached (Customers + Bookings + Users + Guides)
        let passportsData = [];
        try {
            const [custRes, bookRes, userRes, guideRes] = await Promise.all([
                db.query('SELECT id, name, phone, passport_url FROM customers WHERE passport_url IS NOT NULL'),
                db.query(`SELECT DISTINCT jsonb_array_elements(raw_details->'members')->>'passportUrl' as url, id as booking_id FROM bookings WHERE jsonb_typeof(raw_details->'members') = 'array'`),
                db.query('SELECT id, full_name as name, passport_url FROM users WHERE passport_url IS NOT NULL'),
                db.query('SELECT id, name, passport_url FROM guides WHERE passport_url IS NOT NULL')
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

            // Map users (staff)
            userRes.rows.forEach(r => {
                if (r.passport_url && !passportsData.find(p => p.url === r.passport_url)) {
                    passportsData.push({ url: r.passport_url, label: `Nhân sự: ${r.name || ''}` });
                }
            });

            // Map guides
            guideRes.rows.forEach(r => {
                if (r.passport_url && !passportsData.find(p => p.url === r.passport_url)) {
                    passportsData.push({ url: r.passport_url, label: `HDV: ${r.name || ''}` });
                }
            });
        } catch(dbErr) {
            console.error('Error fetching passports mapping for media:', dbErr);
        }

        let mediaList = [];
        const dirsToScan = ['receipts', 'transports', 'hotels', 'restaurants', 'tickets', 'airlines', 'insurances', 'landtours', 'b2b_companies'];
        
        for (const dir of dirsToScan) {
            const currentDir = path.join(baseUploadDir, dir);
            if (!fs.existsSync(currentDir)) continue;
            
            const files = fs.readdirSync(currentDir).filter(f => !f.startsWith('._') && !f.startsWith('.DS_Store'));
            
            for (const file of files) {
                try {
                    const stats = fs.statSync(path.join(currentDir, file));
                    const publicUrl = `/uploads/${dir}/${file}`;
                    const relativeFilename = `${dir}/${file}`;
                    
                    let type = 'trash';
                    let ref = null;
                    let voucherCode = null;

                    if (dir === 'receipts') {
                        // Check if attached to any voucher
                        const linkedVoucher = vouchersData.find(v => v.attachment_url === publicUrl);
                        const linkedPassport = passportsData.find(p => p.url === publicUrl);

                        if (linkedVoucher) {
                            type = 'voucher';
                            ref = linkedVoucher.voucher_code;
                            voucherCode = linkedVoucher.voucher_code;
                        } else if (linkedPassport) {
                            type = 'passport';
                            ref = linkedPassport.label;
                        }
                    } else {
                        // Supplier dirs
                        type = 'supplier';
                        
                        // Human readable ref based on dir
                        const mapRef = {
                            'transports': 'Nhà Xe',
                            'hotels': 'Khách Sạn',
                            'restaurants': 'Nhà Hàng',
                            'tickets': 'Vé Dịch Vụ',
                            'airlines': 'Hãng Bay',
                            'insurances': 'Bảo Hiểm',
                            'landtours': 'Landtour',
                            'b2b_companies': 'Đối Tác B2B'
                        };
                        ref = mapRef[dir] || dir;
                    }

                    mediaList.push({
                        filename: relativeFilename,
                        url: publicUrl,
                        size: stats.size,
                        createdAt: stats.birthtime,
                        type: type,
                        ref: ref,
                        voucherCode: voucherCode
                    });
                } catch(fileErr) {
                    console.error('Error reading file:', fileErr);
                }
            }
        }

        // Sort by newest
        mediaList.sort((a, b) => b.createdAt - a.createdAt);
        res.json(mediaList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi lấy danh sách file.' });
    }
});

module.exports = router;
