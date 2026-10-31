const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const path = require('node:path');

const ragController = require('../controllers/ragController');
const authRag = require('../middleware/ragAuth');

async function preFixQA() {
    console.log('--- BẮT ĐẦU QA TRƯỚC KHI SỬA (PRE-FIX QA CHO S03) ---\n');

    const app = express();
    app.use('/api/rag', authRag);
    app.get('/api/rag/docs/content', ragController.getDocContent);

    const validHeader = 'Bearer fittour-rag-secret-token-2026';

    // 1. Kiểm tra đọc tài liệu hợp lệ trong thư mục So_Tay_Van_Hanh
    console.log('1. Kiểm tra đọc tài liệu hợp lệ: sotay_01_Facebook_System_User.md...');
    const resValid = await request(app)
        .get('/api/rag/docs/content?id=sotay_01_Facebook_System_User.md')
        .set('Authorization', validHeader);
    
    assert.equal(resValid.status, 200);
    assert.ok(resValid.body.content.includes('Facebook'), 'Phải đọc được nội dung tài liệu hợp lệ');
    console.log('   ✅ PASS: Tài liệu thật đọc thành công 100%, độ dài:', resValid.body.content.length, 'ký tự.\n');

    // 2. Tái hiện lỗ hổng: Kiểm tra xem có bị Path Traversal đọc file .env hay không
    console.log('2. Kiểm tra nguy cơ Path Traversal: sotay_../server/.env...');
    const resTraversal = await request(app)
        .get('/api/rag/docs/content?id=sotay_../server/.env')
        .set('Authorization', validHeader);
    
    console.log('   ⚠️ Trạng thái trả về hiện tại của Path Traversal:', resTraversal.status);
    if (resTraversal.status === 200 && resTraversal.body.content) {
        console.log('   🚨 XÁC NHẬN LỖ HỔNG: Server đã đọc được file ngoài thư mục!');
        console.log('   Dòng đầu tiên của nội dung bị đọc:', resTraversal.body.content.split('\n')[0]);
    }

    console.log('\n--- KẾT THÚC PRE-FIX QA CHO S03 ---');
}

preFixQA().catch(err => {
    console.error('Lỗi khi chạy QA:', err);
    process.exit(1);
});

