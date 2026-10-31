const axios = require('axios');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const db = require('../db');
const { generateAccessToken } = require('../utils/jwt');

async function comprehensiveS02LiveQA() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║       🔬 QA TOÀN DIỆN LỖI S02 TRÊN CSDL VÀ MÁY CHỦ THẬT (PORT 5001)║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    const BASE_URL = 'http://localhost:5001';

    // 1. Lấy dữ liệu người dùng thật từ CSDL PostgreSQL
    const adminUser = (await db.query("SELECT * FROM users WHERE id = 1")).rows[0];
    const staffUser = (await db.query("SELECT * FROM users WHERE id = 15")).rows[0];

    assert.ok(adminUser, 'Phải có user Admin trong DB');
    assert.ok(staffUser, 'Phải có user Staff trong DB');

    console.log('1. [THỰC TẾ] Đã nạp tài khoản kiểm thử từ PostgreSQL:');
    console.log(`   - Admin: ${adminUser.full_name} (@${adminUser.username}) | Role: ${adminUser.role}`);
    console.log(`   - Staff: ${staffUser.full_name} (@${staffUser.username}) | Role: ${staffUser.role}\n`);

    const adminToken = generateAccessToken(adminUser);
    const staffToken = generateAccessToken(staffUser);

    // Chuẩn bị các file mẫu tạm thời
    const tempDir = path.join(__dirname, 'temp_test_media');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const validJpgPath = path.join(tempDir, 'test_sample.jpg');
    fs.writeFileSync(validJpgPath, Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])); // JPEG header

    const dangerousSvgPath = path.join(tempDir, 'malicious.svg');
    fs.writeFileSync(dangerousSvgPath, '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script></svg>');

    const dangerousPhpPath = path.join(tempDir, 'backdoor.php');
    fs.writeFileSync(dangerousPhpPath, '<?php phpinfo(); ?>');

    let uploadedAdminFileUrl = null;
    let uploadedStaffFileUrl = null;

    try {
        // ─── PHẦN 1: KIỂM THỬ GET /api/media (LIST & SENSITIVE DATA) ───
        console.log('2. [KIỂM THỬ 1 - LIST MEDIA]:');

        // 1.1 Khách vãng lai gọi GET /api/media
        try {
            await axios.get(`${BASE_URL}/api/media`);
            assert.fail('Lỗi: Khách vãng lai gọi được GET /api/media không cần auth!');
        } catch (err) {
            assert.equal(err.response?.status, 401, 'Khách vãng lai phải bị từ chối 401');
            console.log('   ✅ 1.1 Khách vãng lai bị chặn 401 Unauthorized.');
        }

        // 1.2 Nhân viên thường (Staff Huy) gọi GET /api/media
        try {
            await axios.get(`${BASE_URL}/api/media`, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            assert.fail('Lỗi: Nhân viên thường đọc được toàn bộ danh sách Hộ chiếu/CCCD/Media!');
        } catch (err) {
            assert.equal(err.response?.status, 403, 'Nhân viên thường phải bị từ chối 403');
            console.log('   ✅ 1.2 Nhân viên thường bị chặn 403 Forbidden (Bảo vệ thông tin CCCD/Hộ chiếu khách).');
        }

        // 1.3 Quản trị viên (Admin) gọi GET /api/media
        const adminListRes = await axios.get(`${BASE_URL}/api/media`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(adminListRes.status, 200, 'Admin phải đọc được danh sách media');
        assert.ok(Array.isArray(adminListRes.data), 'Kết quả phải là mảng');
        console.log(`   ✅ 1.3 Admin gọi thành công 200 OK (Tổng số media quản trị: ${adminListRes.data.length}).\n`);

        // ─── PHẦN 2: KIỂM THỬ POST /api/media/upload ───
        console.log('3. [KIỂM THỬ 2 - UPLOAD MEDIA]:');

        // 2.1 Khách vãng lai upload file
        try {
            const formAnon = new FormData();
            formAnon.append('file', fs.createReadStream(validJpgPath));
            await axios.post(`${BASE_URL}/api/media/upload`, formAnon, {
                headers: formAnon.getHeaders()
            });
            assert.fail('Lỗi: Khách vãng lai upload được file không cần đăng nhập!');
        } catch (err) {
            assert.equal(err.response?.status, 401, 'Khách vãng lai upload phải bị từ chối 401');
            console.log('   ✅ 2.1 Khách vãng lai upload bị chặn 401 Unauthorized.');
        }

        // 2.2 Upload file SVG nguy hiểm có chứa script
        try {
            const formSvg = new FormData();
            formSvg.append('file', fs.createReadStream(dangerousSvgPath));
            await axios.post(`${BASE_URL}/api/media/upload`, formSvg, {
                headers: { ...formSvg.getHeaders(), Authorization: `Bearer ${staffToken}` }
            });
            assert.fail('Lỗi: Upload file .svg chứa mã độc vẫn thành công!');
        } catch (err) {
            assert.equal(err.response?.status, 400, 'Upload .svg độc hại phải trả về 400 Bad Request');
            console.log('   ✅ 2.2 File SVG độc hại bị chặn 400 Bad Request:', err.response?.data?.error);
        }

        // 2.3 Upload file PHP độc hại
        try {
            const formPhp = new FormData();
            formPhp.append('file', fs.createReadStream(dangerousPhpPath));
            await axios.post(`${BASE_URL}/api/media/upload`, formPhp, {
                headers: { ...formPhp.getHeaders(), Authorization: `Bearer ${staffToken}` }
            });
            assert.fail('Lỗi: Upload file .php vẫn thành công!');
        } catch (err) {
            assert.equal(err.response?.status, 400, 'Upload .php phải trả về 400 Bad Request');
            console.log('   ✅ 2.3 File PHP bị chặn 400 Bad Request:', err.response?.data?.error);
        }

        // 2.4 Nhân viên thường upload file JPG hợp lệ (Chứng từ tour / Avatar)
        const formStaff = new FormData();
        formStaff.append('file', fs.createReadStream(validJpgPath));
        const staffUploadRes = await axios.post(`${BASE_URL}/api/media/upload`, formStaff, {
            headers: { ...formStaff.getHeaders(), Authorization: `Bearer ${staffToken}` }
        });
        assert.equal(staffUploadRes.status, 200, 'Staff upload ảnh hợp lệ phải thành công');
        assert.ok(staffUploadRes.data.url?.startsWith('/uploads/receipts/'), 'URL trả về phải đúng đường dẫn receipts');
        uploadedStaffFileUrl = staffUploadRes.data.url;
        console.log('   ✅ 2.4 Nhân viên thường upload ảnh JPG hợp lệ thành công 200 OK:', uploadedStaffFileUrl);

        // 2.5 Admin upload ảnh hợp lệ
        const formAdmin = new FormData();
        formAdmin.append('file', fs.createReadStream(validJpgPath));
        const adminUploadRes = await axios.post(`${BASE_URL}/api/media/upload`, formAdmin, {
            headers: { ...formAdmin.getHeaders(), Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(adminUploadRes.status, 200, 'Admin upload ảnh hợp lệ phải thành công');
        uploadedAdminFileUrl = adminUploadRes.data.url;
        console.log('   ✅ 2.5 Admin upload ảnh hợp lệ thành công 200 OK:', uploadedAdminFileUrl, '\n');

        // ─── PHẦN 3: KIỂM THỬ ĐỌC LINK ẢNH TĨNH (GET /uploads/...) KHÔNG BỊ VỠ ───
        console.log('4. [KIỂM THỬ 3 - BẢO TOÀN LINK TĨNH GET /uploads/...]:');
        const staticRes = await axios.get(`${BASE_URL}${uploadedStaffFileUrl}`, {
            responseType: 'arraybuffer'
        });
        assert.equal(staticRes.status, 200, 'Link tĩnh phải đọc được bình thường mà không cần đăng nhập');
        assert.ok(staticRes.data.length > 0, 'Nội dung file tĩnh phải còn nguyên vẹn');
        console.log(`   ✅ 3.1 Truy cập tĩnh công khai ${uploadedStaffFileUrl} thành công 200 OK (${staticRes.data.length} bytes - Đảm bảo ERP không vỡ ảnh).\n`);

        // ─── PHẦN 4: KIỂM THỬ XÓA FILE (DELETE /:filename) ───
        console.log('5. [KIỂM THỬ 4 - XÓA FILE ĐƠN LẺ DELETE /:filename]:');
        const staffFilename = path.basename(uploadedStaffFileUrl);
        const adminFilename = path.basename(uploadedAdminFileUrl);

        // 4.1 Khách vãng lai đòi xóa
        try {
            await axios.delete(`${BASE_URL}/api/media/${staffFilename}`);
            assert.fail('Lỗi: Khách vãng lai gọi xóa file được!');
        } catch (err) {
            assert.equal(err.response?.status, 401, 'Khách vãng lai xóa phải bị từ chối 401');
            console.log('   ✅ 4.1 Khách vãng lai xóa file bị chặn 401 Unauthorized.');
        }

        // 4.2 Nhân viên thường đòi xóa
        try {
            await axios.delete(`${BASE_URL}/api/media/${staffFilename}`, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            assert.fail('Lỗi: Nhân viên thường gọi xóa file được!');
        } catch (err) {
            assert.equal(err.response?.status, 403, 'Nhân viên thường xóa phải bị từ chối 403');
            console.log('   ✅ 4.2 Nhân viên thường xóa file bị chặn 403 Forbidden.');
        }

        // 4.3 Tấn công Path Traversal qua filename (/api/media/../../server/.env)
        try {
            await axios.delete(`${BASE_URL}/api/media/${encodeURIComponent('../../server/.env')}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            assert.fail('Lỗi: Path traversal trong delete không bị chặn!');
        } catch (err) {
            assert.ok([400, 404].includes(err.response?.status), 'Path traversal phải bị chặn 400 hoặc 404');
            console.log('   ✅ 4.3 Tấn công Path Traversal qua delete bị chặn an toàn.');
        }

        // 4.4 Admin xóa file hợp lệ
        const adminDelRes = await axios.delete(`${BASE_URL}/api/media/${staffFilename}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(adminDelRes.status, 200, 'Admin xóa file phải thành công');
        console.log('   ✅ 4.4 Admin xóa file thành công 200 OK:', adminDelRes.data.message, '\n');

        // ─── PHẦN 5: KIỂM THỬ XÓA HÀNG LOẠT (POST /api/media/bulk-delete) ───
        console.log('6. [KIỂM THỬ 5 - XÓA HÀNG LOẠT POST /api/media/bulk-delete]:');

        // 5.1 Khách vãng lai gọi bulk-delete
        try {
            await axios.post(`${BASE_URL}/api/media/bulk-delete`, { filenames: [adminFilename] });
            assert.fail('Lỗi: Khách vãng lai gọi bulk-delete được!');
        } catch (err) {
            assert.equal(err.response?.status, 401, 'Khách vãng lai bulk-delete phải bị từ chối 401');
            console.log('   ✅ 5.1 Khách vãng lai bulk-delete bị chặn 401 Unauthorized.');
        }

        // 5.2 Nhân viên thường gọi bulk-delete
        try {
            await axios.post(`${BASE_URL}/api/media/bulk-delete`, { filenames: [adminFilename] }, {
                headers: { Authorization: `Bearer ${staffToken}` }
            });
            assert.fail('Lỗi: Nhân viên thường bulk-delete được!');
        } catch (err) {
            assert.equal(err.response?.status, 403, 'Nhân viên thường bulk-delete phải bị từ chối 403');
            console.log('   ✅ 5.2 Nhân viên thường bulk-delete bị chặn 403 Forbidden.');
        }

        // 5.3 Admin thực hiện bulk-delete file adminFilename
        const adminBulkRes = await axios.post(`${BASE_URL}/api/media/bulk-delete`, {
            filenames: [adminFilename, '../../outside.txt']
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(adminBulkRes.status, 200, 'Admin bulk-delete phải thành công');
        assert.equal(adminBulkRes.data.deletedCount, 1, 'Chỉ 1 file hợp lệ bị xóa, file traversal bị bỏ qua');
        console.log(`   ✅ 5.3 Admin bulk-delete thành công 200 OK (Đã xóa an toàn: ${adminBulkRes.data.deletedCount} file).`);

        console.log('\n🎉 TẤT CẢ 13 KỊCH BẢN KIỂM THỬ S02 ĐỀU PASS 100%! HỆ THỐNG AN TOÀN TUYỆT ĐỐI!');

    } finally {
        // Dọn dẹp thư mục tạm
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch(e) {}
    }
}

comprehensiveS02LiveQA().catch(err => {
    console.error('\n❌ QA THẤT BẠI:', err.message);
    if (err.response) {
        console.error('Response Status:', err.response.status);
        console.error('Response Data:', err.response.data);
    }
    process.exit(1);
});

