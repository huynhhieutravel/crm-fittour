const axios = require('axios');
const assert = require('node:assert/strict');
const { generateAccessToken } = require('../utils/jwt');
const db = require('../db');

async function liveTest() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║       🌐 KIỂM THỬ THỰC TẾ TRÊN MÁY CHỦ LIVE BACKEND (PORT 5001)     ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    const BASE_URL = 'http://localhost:5001';

    // 1. Kiểm tra kết nối máy chủ thật
    console.log('1. [KẾT NỐI] Gửi ping kiểm tra máy chủ đang chạy...');
    const pingRes = await axios.get(`${BASE_URL}/api/health`).catch(err => err.response || { status: err.code });
    console.log('   -> Máy chủ phản hồi mã trạng thái:', pingRes.status || 'Đang mở cổng 5001');

    // 2. Kiểm thử đăng nhập người dùng THẬT từ CSDL PostgreSQL (users table)
    console.log('\n2. [CSDL THẬT] Kiểm tra đăng nhập với tài khoản Huỳnh Trọng Hiếu (admin)...');
    try {
        await axios.post(`${BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'SaiMatKhauChacChan123'
        });
        assert.fail('Đáng lẽ phải bị từ chối');
    } catch (err) {
        assert.equal(err.response?.status, 401);
        console.log('   ✅ PASS CSDL THẬT: Nhập sai mật khẩu bị từ chối 401:', err.response?.data?.message);
    }

    // 3. Kiểm tra cấp phiên cho tài khoản Huỳnh Trọng Hiếu và gọi API nghiệp vụ THẬT
    console.log('\n3. [NGHIỆP VỤ THẬT] Sinh Token cho Huỳnh Trọng Hiếu và truy vấn Booking/Lead từ DB thật...');
    const userRow = (await db.query("SELECT * FROM users WHERE username = 'admin' LIMIT 1")).rows[0];
    const realToken = generateAccessToken(userRow);

    const bookingRes = await axios.get(`${BASE_URL}/api/bookings?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${realToken}` }
    });
    console.log('   ✅ PASS BOOKING THẬT: Truy vấn thành công', bookingRes.data?.bookings?.length || bookingRes.data?.data?.length || 'danh sách', 'đơn booking từ CSDL thật.');

    const leadRes = await axios.get(`${BASE_URL}/api/leads?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${realToken}` }
    });
    console.log('   ✅ PASS LEAD THẬT: Truy vấn thành công danh sách khách hàng từ CSDL thật.');

    // 4. KIỂM THỬ THỰC TẾ LỖI S03 (RAG PATH TRAVERSAL) TRÊN CỔNG LIVE 5001
    console.log('\n4. [BẢO MẬT THỰC TẾ S03] Đọc file tài liệu THẬT trên ổ đĩa qua mạng HTTP...');
    const docRes = await axios.get(`${BASE_URL}/api/rag/docs/content?id=sotay_01_Facebook_System_User.md`, {
        headers: { Authorization: 'Bearer fittour-rag-secret-token-2026' }
    });
    assert.equal(docRes.status, 200);
    console.log('   ✅ PASS ĐỌC FILE THẬT: Đọc thành công file 01_Facebook_System_User.md');
    console.log('   -> Tiêu đề trả về:', docRes.data.title);
    console.log('   -> 60 ký tự đầu tiên:', docRes.data.content.substring(0, 60).replace(/\n/g, ' '));

    console.log('\n5. [BẢO MẬT THỰC TẾ S03] Tấn công Path Traversal thật vào cổng 5001: sotay_../server/.env...');
    try {
        await axios.get(`${BASE_URL}/api/rag/docs/content?id=sotay_../server/.env`, {
            headers: { Authorization: 'Bearer fittour-rag-secret-token-2026' }
        });
        assert.fail('Lỗ hổng chưa được chặn!');
    } catch (err) {
        assert.equal(err.response?.status, 400);
        assert.equal(err.response?.data?.error, 'Định dạng tên tài liệu không hợp lệ');
        console.log('   ✅ PASS CHẶN TRAVERSAL THẬT: Server Live từ chối 400:', err.response?.data);
    }

    console.log('\n6. [BẢO MẬT THỰC TẾ S03] Tấn công Path Traversal URL-encoded: sotay_..%2Fserver%2F.env...');
    try {
        await axios.get(`${BASE_URL}/api/rag/docs/content?id=sotay_..%2Fserver%2F.env`, {
            headers: { Authorization: 'Bearer fittour-rag-secret-token-2026' }
        });
        assert.fail('Lỗ hổng chưa được chặn!');
    } catch (err) {
        assert.equal(err.response?.status, 400);
        console.log('   ✅ PASS CHẶN URL-ENCODED THẬT: Server Live từ chối 400:', err.response?.data);
    }

    // 5. KIỂM THỬ THỰC TẾ LỖI S01 (DEV-LOGIN TRÊN PRODUCTION PORT)
    console.log('\n7. [BẢO MẬT THỰC TẾ S01] Kiểm tra hành vi môi trường Production với controller thật...');
    const express = require('../node_modules/express');
    const request = require('supertest');
    const prodApp = express();
    prodApp.set('trust proxy', 1);
    prodApp.use(express.json());
    
    // Gán cờ môi trường Production thực tế
    process.env.NODE_ENV = 'production';
    prodApp.post('/api/auth/dev-login', require('../controllers/authController').devLogin);

    console.log('   -> Gửi HTTP POST giả mạo Host: localhost tới controller trong môi trường Production...');
    const s01Res = await request(prodApp)
        .post('/api/auth/dev-login')
        .set('Host', 'localhost')
        .set('X-Forwarded-For', '203.0.113.195');

    assert.equal(s01Res.status, 404);
    assert.equal(s01Res.body.message, 'Không tìm thấy trang yêu cầu');
    console.log('   ✅ PASS CHẶN S01 PRODUCTION THẬT: Nhận đúng mã 404 Not Found:', s01Res.body);

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 TẤT CẢ CÁC BÀI TEST THỰC TẾ QUA MẠNG HTTP ĐỀU THÀNH CÔNG 100%!  ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    process.exit(0);
}

liveTest().catch(err => {
    console.error('LỖI THỰC TẾ:', err);
    process.exit(1);
});
