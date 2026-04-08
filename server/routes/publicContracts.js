const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// API: Lấy thông tin chi tiết Hợp đồng
router.get('/:tourId/:bookingId', async (req, res) => {
    try {
        const { tourId, bookingId } = req.params;

        // Fetch Tour Info
        const tourRes = await db.query(`
            SELECT td.*, tt.name as tour_name, tt.code as template_code
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE td.id = $1
        `, [tourId]);
        if (tourRes.rows.length === 0) return res.status(404).json({ error: 'Tour not found' });
        const tour = tourRes.rows[0];
        tour.tour_code = tour.code;

        // Fetch Booking Info
        const bookingRes = await db.query('SELECT * FROM bookings WHERE id = $1 AND tour_departure_id = $2', [bookingId, tourId]);
        if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        const booking = bookingRes.rows[0];
        // Map field names for compatibility
        booking.name = booking.customer_name || '';
        booking.phone = booking.customer_phone || '';
        booking.total = booking.total_price;
        booking.status = booking.booking_status;

        // Parse JSON
        booking.raw_details = typeof booking.raw_details === 'string' ? JSON.parse(booking.raw_details) : (booking.raw_details || {});
        tour.tour_info = typeof tour.tour_info === 'string' ? JSON.parse(tour.tour_info) : (tour.tour_info || {});

        // Fetch Vouchers
        const vouchersRes = await db.query('SELECT * FROM payment_vouchers WHERE booking_id = $1 ORDER BY created_at ASC', [bookingId]);
        const vouchers = vouchersRes.rows;

        res.json({ tour, booking, vouchers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// API: Xuất DOCX
router.get('/:tourId/:bookingId/export-docx', async (req, res) => {
    try {
        const { tourId, bookingId } = req.params;

        // Lấy lại data (để security, không trust data gửi từ body vì GET / URL public)
        const tourRes = await db.query(`
            SELECT td.*, tt.name as tour_name, tt.code as template_code
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE td.id = $1
        `, [tourId]);
        if (tourRes.rows.length === 0) return res.status(404).send('Tour not found');
        const tour = tourRes.rows[0];
        tour.tour_code = tour.code;

        const bookingRes = await db.query('SELECT b.*, c.name as customer_name, c.phone as customer_phone FROM bookings b LEFT JOIN customers c ON b.customer_id = c.id WHERE b.id = $1 AND b.tour_departure_id = $2', [bookingId, tourId]);
        if (bookingRes.rows.length === 0) return res.status(404).send('Booking not found');
        const booking = bookingRes.rows[0];
        booking.name = booking.customer_name || '';
        booking.phone = booking.customer_phone || '';
        booking.total = booking.total_price;

        booking.raw_details = typeof booking.raw_details === 'string' ? JSON.parse(booking.raw_details) : (booking.raw_details || {});
        tour.tour_info = typeof tour.tour_info === 'string' ? JSON.parse(tour.tour_info) : (tour.tour_info || {});

        const vouchersRes = await db.query('SELECT * FROM payment_vouchers WHERE booking_id = $1 ORDER BY created_at ASC', [bookingId]);
        const vouchers = vouchersRes.rows;

        // Đọc template docx
        const templatePath = path.resolve(__dirname, '../templates/contract-template.docx');
        if (!fs.existsSync(templatePath)) return res.status(404).send('Template file not found!');
        
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        // Tạo data map cho docx (Tất cả biến trong Word phải mapping ở đây)
        // Lưu ý user phải đặt các biến này trong file Word: ví dụ {ten_khach}, {ma_booking}...
        const data = {
            ma_booking: booking.reservation_code || `TOURFIT-${tour.id}-${booking.id}`,
            ten_tour: tour.tour_name || '',
            ngay_di: tour.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : '',
            ngay_ve: tour.end_date ? new Date(tour.end_date).toLocaleDateString('vi-VN') : '',
            ten_khach: booking.name || '',
            sdt_khach: booking.phone || '',
            tong_tien: Number(booking.total || 0).toLocaleString('vi-VN'),
            da_thanh_toan: Number(booking.paid || 0).toLocaleString('vi-VN'),
            con_lai: (Number(booking.total || 0) - Number(booking.paid || 0)).toLocaleString('vi-VN'),
            // Thêm mảng thành viên: trong word xài {#thanh_vien} {ho_ten} {/thanh_vien}
            thanh_vien: (booking.raw_details.members || []).map((m, i) => ({
                stt: i + 1,
                ho_ten: m.name || '',
                sdt: m.phone || '',
                cccd: m.identity || '',
                gioi_tinh: m.gender || '',
                ngay_sinh: m.dob || ''
            })),
            phieu_thu: vouchers.map((v, i) => ({
                stt: i + 1,
                ma_pt: v.voucher_code || '',
                ngay_thanh_toan: new Date(v.created_at).toLocaleDateString('vi-VN'),
                hinh_thuc: v.payment_method || '',
                so_tien: Number(v.amount).toLocaleString('vi-VN')
            }))
        };

        doc.render(data);

        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        
        res.setHeader('Content-Disposition', `attachment; filename=HopDongDichVu_${booking.name || 'FIT'}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(buf);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating document');
    }
});

module.exports = router;
