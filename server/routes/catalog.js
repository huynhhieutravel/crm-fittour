const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const metaCatalogService = require('../services/metaCatalogService');

// Retrieve Meta Configurations for the service
async function getSettings() {
    const result = await db.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach(r => settings[r.key] = r.value);
    return settings;
}

// 1. Kiểm tra tình trạng Catalog (Cho Admin giao diện React)
router.get('/', auth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tour_templates');
        const tours = result.rows.filter(t => t.image_url && t.website_link);
        
        res.json({
            status: 'success',
            total_eligible: tours.length,
            total_tours: result.rows.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Kênh Output Data Feed định dạng CSV cho Facebook (CÔNG KHAI)
// Facebook Facebook sẽ định kỳ tự động request file này.
router.get('/feed.csv', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tour_templates');
        const tours = result.rows;
        
        const csvContent = metaCatalogService.generateCSV(tours);
        
        res.header('Content-Type', 'text/csv');
        // Cho trình duyệt biết đây là file tải về
        res.attachment('facebook_destination_feed.csv');
        
        return res.send(csvContent);
    } catch (err) {
        console.error('[Catalog Data Feed] Lỗi xuất CSV:', err);
        res.status(500).send('Lỗi máy chủ khi tạo Feed CSV');
    }
});

// 3. Thực thi đồng bộ toàn bộ Data đang có sang META API (Chạy ngầm)
router.post('/sync-all', auth, async (req, res) => {
    try {
        const settings = await getSettings();
        const catalogId = settings['meta_catalog_id'];
        const token = settings['meta_system_user_token'];

        if (!catalogId || !token) {
            return res.status(400).json({ error: 'Chưa cấu hình Catalog ID hoặc Token trong cài đặt' });
        }

        const result = await db.query('SELECT * FROM tour_templates');
        const tours = result.rows;

        const success = await metaCatalogService.syncAllTours(tours, catalogId, token);

        if (success) {
            res.json({ success: true, message: 'Đồng bộ API hàng loạt sang Facebook thành công.' });
        } else {
            res.status(500).json({ success: false, error: 'Tiến trình đồng bộ Batch API báo lỗi, check Console.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
