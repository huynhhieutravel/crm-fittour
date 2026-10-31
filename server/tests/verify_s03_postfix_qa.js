const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const ragController = require('../controllers/ragController');
const authRag = require('../middleware/ragAuth');

async function postFixQA() {
    console.log('--- BẮT ĐẦU QA HẬU KIỂM (POST-FIX QA CHO S03) ---\n');

    const app = express();
    app.use('/api/rag', authRag);
    app.get('/api/rag/docs/content', ragController.getDocContent);

    // Kịch bản 1: Đọc tài liệu hợp lệ trong thư mục So_Tay_Van_Hanh (Local dev)
    process.env.NODE_ENV = 'development';
    delete process.env.RAG_API_KEY;
    const devToken = 'Bearer fittour-rag-secret-token-2026';

    console.log('1. Kiểm tra đọc tài liệu thật 01_Facebook_System_User.md...');
    const resValid = await request(app)
        .get('/api/rag/docs/content?id=sotay_01_Facebook_System_User.md')
        .set('Authorization', devToken);
    assert.equal(resValid.status, 200);
    assert.ok(resValid.body.content.includes('Facebook'), 'Phải đọc được nội dung tài liệu hợp lệ');
    console.log('   ✅ PASS: Đọc tài liệu thật thành công 100%, độ dài:', resValid.body.content.length, 'ký tự.\n');

    // Kịch bản 2: Tấn công Path Traversal lùi thư mục đọc .env
    console.log('2. Kiểm tra chặn tấn công Path Traversal: sotay_../server/.env...');
    const resTraversal1 = await request(app)
        .get('/api/rag/docs/content?id=sotay_../server/.env')
        .set('Authorization', devToken);
    assert.equal(resTraversal1.status, 400);
    assert.equal(resTraversal1.body.error, 'Định dạng tên tài liệu không hợp lệ');
    console.log('   ✅ PASS: Bị chặn đứng với mã lỗi 400 Bad Request.\n');

    // Kịch bản 3: Tấn công Path Traversal với backslash ..\
    console.log('3. Kiểm tra chặn tấn công Path Traversal với backslash ..\\...');
    const resTraversal2 = await request(app)
        .get('/api/rag/docs/content?id=sotay_..\\server\\.env')
        .set('Authorization', devToken);
    assert.equal(resTraversal2.status, 400);
    console.log('   ✅ PASS: Bị chặn đứng với mã lỗi 400 Bad Request.\n');

    // Kịch bản 4: Cố tình yêu cầu file không phải đuôi .md (VD: package.json)
    console.log('4. Kiểm tra chặn đọc file không phải đuôi .md: sotay_package.json...');
    const resNonMd = await request(app)
        .get('/api/rag/docs/content?id=sotay_package.json')
        .set('Authorization', devToken);
    assert.equal(resNonMd.status, 400);
    console.log('   ✅ PASS: Bị chặn đứng với mã lỗi 400 Bad Request.\n');

    // Kịch bản 5: Tài liệu .md không tồn tại trong thư mục
    console.log('5. Kiểm tra tài liệu .md không tồn tại: sotay_khong_ton_tai.md...');
    const resNotFound = await request(app)
        .get('/api/rag/docs/content?id=sotay_khong_ton_tai.md')
        .set('Authorization', devToken);
    assert.equal(resNotFound.status, 404);
    console.log('   ✅ PASS: Trả về đúng mã 404 Not Found.\n');

    // Kịch bản 6: Chặn dùng secret mặc định trên Production khi chưa cấu hình RAG_API_KEY
    console.log('6. Kiểm tra chặn dùng secret mặc định trên Production...');
    process.env.NODE_ENV = 'production';
    delete process.env.RAG_API_KEY;
    const resProdDefault = await request(app)
        .get('/api/rag/docs/content?id=sotay_01_Facebook_System_User.md')
        .set('Authorization', devToken);
    assert.equal(resProdDefault.status, 500);
    assert.ok(resProdDefault.body.message.includes('chưa được cấu hình an toàn'));
    console.log('   ✅ PASS: Không cho phép dùng secret mặc định trên Production.\n');

    // Kịch bản 7: Production có RAG_API_KEY cấu hình riêng biệt
    console.log('7. Kiểm tra Production khi đã cấu hình RAG_API_KEY mạnh...');
    process.env.RAG_API_KEY = 'super-strong-custom-production-key-2026';
    const resProdValid = await request(app)
        .get('/api/rag/docs/content?id=sotay_01_Facebook_System_User.md')
        .set('Authorization', 'Bearer super-strong-custom-production-key-2026');
    assert.equal(resProdValid.status, 200);
    assert.ok(resProdValid.body.content.length > 0);
    console.log('   ✅ PASS: Khi có key chuẩn trên Production, đọc tài liệu hoàn hảo 100%.\n');

    console.log('🎉 TẤT CẢ 7/7 KỊCH BẢN KIỂM THỬ S03 ĐỀU ĐẠT CHUẨN AN TOÀN TUYỆT ĐỐI!');
}

postFixQA().catch(err => {
    console.error('Lỗi kiểm thử S03:', err);
    process.exit(1);
});

