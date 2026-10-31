const axios = require('axios');
const assert = require('node:assert/strict');

async function deepS03QA() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║       🔬 ĐÁNH GIÁ & QA TOÀN DIỆN CHUYÊN SÂU LỖI S03 (RAG / DOCS)   ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    const BASE_URL = 'http://localhost:5001';
    const AUTH_HEADER = { headers: { Authorization: 'Bearer fittour-rag-secret-token-2026' } };

    // ─── PHẦN 1: KIỂM THỬ TẤT CẢ 4 FILE SỔ TAY VẬN HÀNH THỰC TẾ ───
    console.log('--- PHẦN 1: ĐỌC TẤT CẢ 4 TÀI LIỆU SỔ TAY NỘI BỘ TRÊN Ổ ĐĨA ---');
    const soTayFiles = [
        'sotay_01_Facebook_System_User.md',
        'sotay_02_Xu_Ly_Ngay_Gio.md',
        'sotay_03_Dong_Bo_Tin_Nhan_Tu_Trang.md',
        'sotay_04_Quy_Trinh_Nang_Cap_Giao_Dien.md'
    ];

    for (const fileId of soTayFiles) {
        const res = await axios.get(`${BASE_URL}/api/rag/docs/content?id=${fileId}`, AUTH_HEADER);
        assert.equal(res.status, 200);
        assert.ok(res.data.content && res.data.content.length > 100);
        console.log(`   ✅ PASS: Đọc thành công ${fileId} (${res.data.content.length} bytes, tiêu đề: "${res.data.title}")`);
    }

    // ─── PHẦN 2: KIỂM THỬ CÁC TÀI LIỆU MARKDOWN TĨNH KHÁC (MDMAP) ───
    console.log('\n--- PHẦN 2: ĐỌC CÁC TÀI LIỆU QUY CHUẨN TRONG client/public/docs ---');
    const staticDocs = [
        '/tai-lieu/bo-nguyen-tac-hanh-xu-nhan-vien',
        '/tai-lieu/dat-ten-tour',
        '/tai-lieu/zoho-email',
        '/tai-lieu/chinh-sach-danh-gia'
    ];

    for (const docId of staticDocs) {
        const res = await axios.get(`${BASE_URL}/api/rag/docs/content?id=${encodeURIComponent(docId)}`, AUTH_HEADER);
        assert.equal(res.status, 200);
        assert.ok(res.data.content && res.data.content.length > 50);
        console.log(`   ✅ PASS: Đọc thành công ${docId} (tiêu đề: "${res.data.title}")`);
    }

    // ─── PHẦN 3: KIỂM THỬ BÓC TÁCH TEXT TỪ TRANG REACT JSX (JSXMAP) ───
    console.log('\n--- PHẦN 3: ĐỌC VÀ BÓC TÁCH VĂN BẢN TỪ FILE GIAO DIỆN REACT JSX ---');
    const jsxPages = [
        '/tai-lieu/brand-guideline',
        '/hdv',
        '/tai-lieu/marketing',
        '/tai-lieu/quy-trinh-sale-dieu-hanh'
    ];

    for (const jsxId of jsxPages) {
        const res = await axios.get(`${BASE_URL}/api/rag/docs/content?id=${encodeURIComponent(jsxId)}`, AUTH_HEADER);
        assert.equal(res.status, 200);
        console.log(`   ✅ PASS: Trả về 200 OK từ trang ${jsxId} (độ dài: ${res.data.content?.length || 0} ký tự)`);
    }

    // ─── PHẦN 4: MA TRẬN 8 KỊCH BẢN TẤN CÔNG PATH TRAVERSAL ĐỘC HẠI ───
    console.log('\n--- PHẦN 4: TẤN CÔNG ĐỘC HẠI KIỂM THỬ HÀNG RÀO PHÒNG THỦ S03 ---');

    const attackProbes = [
        { name: '1. Traversal cơ bản ../server/.env', id: 'sotay_../server/.env' },
        { name: '2. Traversal lùi 2 cấp ../../fittour.db', id: 'sotay_../../fittour.db' },
        { name: '3. Đường dẫn tuyệt đối /etc/passwd', id: 'sotay_/etc/passwd' },
        { name: '4. URL-Encoded traversal ..%2Fserver%2F.env', id: 'sotay_..%2Fserver%2F.env' },
        { name: '5. Windows backslash ..\\server\\.env', id: 'sotay_..\\server\\.env' },
        { name: '6. File không phải đuôi .md (package.json)', id: 'sotay_package.json' },
        { name: '7. Null byte injection %00.md', id: 'sotay_../server/.env%00.md' },
        { name: '8. File không tồn tại nhưng có đuôi .md hợp lệ', id: 'sotay_file_ma_khong_co.md', expect404: true }
    ];

    for (const probe of attackProbes) {
        try {
            await axios.get(`${BASE_URL}/api/rag/docs/content?id=${encodeURIComponent(probe.id)}`, AUTH_HEADER);
            assert.fail(`Tấn công thành công! Lỗ hổng chưa được chặn: ${probe.name}`);
        } catch (err) {
            const expectedStatus = probe.expect404 ? 404 : 400;
            assert.equal(err.response?.status, expectedStatus, `Phải trả về mã ${expectedStatus}`);
            console.log(`   ✅ PASS CHẶN: [${probe.name}] -> Server từ chối đúng mã ${err.response?.status} (${err.response?.data?.error || 'Not found'})`);
        }
    }

    // ─── PHẦN 5: KIỂM THỬ XÁC THỰC TOKEN RAG TRÊN PRODUCTION ───
    console.log('\n--- PHẦN 5: KIỂM THỬ BẢO VỆ CHÌA KHÓA TRÊN PRODUCTION ---');
    const authRagMiddleware = require('../middleware/ragAuth');
    const express = require('../node_modules/express');
    const request = require('supertest');
    const mockApp = express();
    mockApp.use(authRagMiddleware);
    mockApp.get('/test', (req, res) => res.json({ ok: true }));

    // Khi ở Production mà chưa cấu hình RAG_API_KEY
    process.env.NODE_ENV = 'production';
    delete process.env.RAG_API_KEY;
    const resNoKey = await request(mockApp)
        .get('/test')
        .set('Authorization', 'Bearer fittour-rag-secret-token-2026');
    assert.equal(resNoKey.status, 500);
    assert.ok(resNoKey.body.message.includes('chưa được cấu hình an toàn'));
    console.log('   ✅ PASS: Môi trường Production từ chối khóa mặc định khi thiếu RAG_API_KEY.');

    // Khi ở Production đã có RAG_API_KEY mạnh
    process.env.RAG_API_KEY = 'fit-secure-rag-key-custom-2026';
    const resGoodKey = await request(mockApp)
        .get('/test')
        .set('Authorization', 'Bearer fit-secure-rag-key-custom-2026');
    assert.equal(resGoodKey.status, 200);
    console.log('   ✅ PASS: Môi trường Production chấp thuận khóa tùy chỉnh mạnh.');

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 TOÀN BỘ 18/18 PHÉP THỬ CHUYÊN SÂU S03 ĐỀU THÀNH CÔNG 100%!     ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
}

deepS03QA().catch(err => {
    console.error('❌ LỖI TRONG QUÁ TRÌNH QA S03:', err);
    process.exit(1);
});
