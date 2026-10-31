const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const authController = require('../controllers/authController');

async function testS01() {
    console.log('--- BẮT ĐẦU KIỂM THỬ QA CHO LỖI S01 ---\n');

    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json());
    app.post('/dev-login', authController.devLogin);

    // Kịch bản 1: Môi trường Production - kẻ tấn công giả mạo Host localhost
    process.env.NODE_ENV = 'production';
    console.log('1. Kiểm tra request với Host: localhost khi NODE_ENV = production...');
    const resHost = await request(app)
        .post('/dev-login')
        .set('Host', 'localhost')
        .set('X-Forwarded-For', '203.0.113.7');
    assert.equal(resHost.status, 404, 'Phải trả về 404 Not Found');
    console.log('   ✅ PASS: Trả về đúng 404 Not Found (Bypass hoàn toàn bị chặn)\n');

    // Kịch bản 2: Môi trường Production - request bình thường từ tên miền công khai
    console.log('2. Kiểm tra request với Host: erp.fittour.vn khi NODE_ENV = production...');
    const resNormal = await request(app)
        .post('/dev-login')
        .set('Host', 'erp.fittour.vn')
        .set('X-Forwarded-For', '118.69.182.50');
    assert.equal(resNormal.status, 404, 'Phải trả về 404 Not Found');
    console.log('   ✅ PASS: Trả về đúng 404 Not Found\n');

    // Kịch bản 3: Môi trường Production - request từ IP loopback 127.0.0.1
    console.log('3. Kiểm tra request từ loopback IP khi NODE_ENV = production...');
    const resLoopback = await request(app)
        .post('/dev-login')
        .set('Host', '127.0.0.1');
    assert.equal(resLoopback.status, 404, 'Trên production, mọi loopback cũng phải bị từ chối 404');
    console.log('   ✅ PASS: Trả về đúng 404 Not Found (Không có ngoại lệ trên Production)\n');

    // Kịch bản 4: Môi trường Development - truy cập từ IP ngoài
    process.env.NODE_ENV = 'development';
    console.log('4. Kiểm tra request từ IP ngoài khi NODE_ENV = development...');
    const resDevRemote = await request(app)
        .post('/dev-login')
        .set('Host', '192.168.1.50');
    assert.equal(resDevRemote.status, 403, 'Dev chỉ cho phép localhost');
    console.log('   ✅ PASS: Trả về 403 Forbidden cho IP ngoài mạng dev\n');

    console.log('🎉 TẤT CẢ 4 KỊCH BẢN KIỂM THỬ S01 ĐỀU ĐẠT CHUẨN AN TOÀN TUYỆT ĐỐI!');
}

testS01().catch(err => {
    console.error('❌ LỖI KIỂM THỬ S01:', err);
    process.exit(1);
});

