const axios = require('axios');
const assert = require('node:assert/strict');
const db = require('../db');
const { generateAccessToken } = require('../utils/jwt');

async function comprehensiveS04LiveQA() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║       🔬 QA TOÀN DIỆN LỖI S04 TRÊN CSDL VÀ MÁY CHỦ THẬT (PORT 5001)║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    const BASE_URL = 'http://localhost:5001';

    // 1. Lấy dữ liệu người dùng thật từ CSDL PostgreSQL
    const adminUser = (await db.query("SELECT * FROM users WHERE id = 1")).rows[0];
    const staffHuy = (await db.query("SELECT * FROM users WHERE id = 15")).rows[0];
    const staffTrang = (await db.query("SELECT * FROM users WHERE id = 13")).rows[0];

    assert.ok(adminUser, 'Phải có user Admin (ID 1) trong DB');
    assert.ok(staffHuy, 'Phải có user Staff Huy (ID 15) trong DB');
    assert.ok(staffTrang, 'Phải có user Staff Trang (ID 13) trong DB');

    console.log('1. [THỰC TẾ] Đã nạp 3 người dùng thật từ PostgreSQL:');
    console.log(`   - Admin: ${adminUser.full_name} (@${adminUser.username}) | Role: ${adminUser.role} | Active: ${adminUser.is_active}`);
    console.log(`   - Staff 1: ${staffHuy.full_name} (@${staffHuy.username}) | Role: ${staffHuy.role} | Active: ${staffHuy.is_active}`);
    console.log(`   - Staff 2: ${staffTrang.full_name} (@${staffTrang.username}) | Role: ${staffTrang.role} | Active: ${staffTrang.is_active}\n`);

    // Tạo token hợp lệ cho từng người
    const adminToken = generateAccessToken(adminUser);
    const staffHuyToken = generateAccessToken(staffHuy);
    const staffTrangToken = generateAccessToken(staffTrang);

    // Lưu lại trạng thái ban đầu của Admin để đối soát
    const initialAdminEmail = adminUser.email;
    const initialAdminActive = adminUser.is_active;
    const initialAdminName = adminUser.full_name;

    // ─── KỊCH BẢN 1: STAFF TẤN CÔNG SỬA TÀI KHOẢN ADMIN ───
    console.log('2. [KIỂM THỬ THỰC TẾ 1] Staff (Huy) gửi API PUT /api/users/1 đòi đổi email & khóa tài khoản Admin Hiếu...');
    try {
        await axios.put(`${BASE_URL}/api/users/1`, {
            full_name: 'Hacked By Staff',
            email: 'hacker@fittour.com.vn',
            is_active: false
        }, {
            headers: { Authorization: `Bearer ${staffHuyToken}` }
        });
        throw new Error('FAIL_SHOULD_BE_REJECTED_1');
    } catch (err) {
        if (err.message === 'FAIL_SHOULD_BE_REJECTED_1') {
            assert.fail('Lỗ hổng S04 vẫn còn tồn tại! Server trả về 200 thay vì 403');
        }
        assert.equal(err.response?.status, 403, 'Phải trả về 403 Forbidden');
        assert.equal(err.response?.data?.message, 'Bạn không có quyền chỉnh sửa tài khoản của người khác.');
        console.log('   ✅ PASS THỰC TẾ 1: Server Live từ chối 403 Forbidden:', err.response?.data?.message);
    }

    // Đối soát ngay trong Database thật
    const verifyAdmin = (await db.query("SELECT * FROM users WHERE id = 1")).rows[0];
    assert.equal(verifyAdmin.email, initialAdminEmail, 'Email của Admin không được phép thay đổi');
    assert.equal(verifyAdmin.is_active, initialAdminActive, 'Trạng thái hoạt động của Admin không được phép thay đổi');
    assert.equal(verifyAdmin.full_name, initialAdminName, 'Họ tên của Admin không được phép thay đổi');
    console.log('   ✅ ĐỐI SOÁT DB: Tài khoản Admin trong PostgreSQL hoàn toàn nguyên vẹn 100%!\n');

    // ─── KỊCH BẢN 2: STAFF SỬA TÀI KHOẢN STAFF KHÁC ───
    console.log('3. [KIỂM THỬ THỰC TẾ 2] Staff (Huy) gửi API PUT /api/users/13 đòi đổi thông tin Staff Trang...');
    const initialTrangPhone = staffTrang.phone;
    try {
        await axios.put(`${BASE_URL}/api/users/13`, {
            phone: '0999888777'
        }, {
            headers: { Authorization: `Bearer ${staffHuyToken}` }
        });
        throw new Error('FAIL_SHOULD_BE_REJECTED_2');
    } catch (err) {
        if (err.message === 'FAIL_SHOULD_BE_REJECTED_2') {
            assert.fail('Nhân viên không được sửa tài khoản nhân viên khác!');
        }
        assert.equal(err.response?.status, 403);
        assert.equal(err.response?.data?.message, 'Bạn không có quyền chỉnh sửa tài khoản của người khác.');
        console.log('   ✅ PASS THỰC TẾ 2: Server Live từ chối 403 Forbidden:', err.response?.data?.message);
    }

    const verifyTrang = (await db.query("SELECT * FROM users WHERE id = 13")).rows[0];
    assert.equal(verifyTrang.phone, initialTrangPhone);
    console.log('   ✅ ĐỐI SOÁT DB: Dữ liệu của đồng nghiệp trong PostgreSQL được bảo vệ an toàn.\n');

    // ─── KỊCH BẢN 3: STAFF TỰ NÂNG QUYỀN LÊN ADMIN ───
    console.log('4. [KIỂM THỬ THỰC TẾ 3] Staff (Huy) gửi API PUT /api/users/15 đòi tự gán role_id = 1 (Admin)...');
    try {
        await axios.put(`${BASE_URL}/api/users/15`, {
            role_id: 1
        }, {
            headers: { Authorization: `Bearer ${staffHuyToken}` }
        });
        throw new Error('FAIL_SHOULD_BE_REJECTED_3');
    } catch (err) {
        if (err.message === 'FAIL_SHOULD_BE_REJECTED_3') {
            assert.fail('Không được phép tự nâng quyền!');
        }
        assert.equal(err.response?.status, 403);
        assert.ok(err.response?.data?.message.includes('không có quyền tự thay đổi vai trò'));
        console.log('   ✅ PASS THỰC TẾ 3: Tự nâng quyền Admin bị chặn 403:', err.response?.data?.message);
    }

    const verifyHuyRole = (await db.query("SELECT role_id, role FROM users WHERE id = 15")).rows[0];
    assert.equal(verifyHuyRole.role_id, staffHuy.role_id);
    assert.notEqual(verifyHuyRole.role_id, 1, 'Huy không thể biến thành Admin');
    console.log('   ✅ ĐỐI SOÁT DB: Quyền hạn của Staff trong PostgreSQL giữ nguyên, không bị leo quyền.\n');

    // ─── KỊCH BẢN 4: STAFF TỰ KHÓA TÀI KHOẢN CHÍNH MÌNH ───
    console.log('5. [KIỂM THỬ THỰC TẾ 4] Staff (Huy) gửi API PUT /api/users/15 đòi gán is_active = false...');
    try {
        await axios.put(`${BASE_URL}/api/users/15`, {
            is_active: false
        }, {
            headers: { Authorization: `Bearer ${staffHuyToken}` }
        });
        throw new Error('FAIL_SHOULD_BE_REJECTED_4');
    } catch (err) {
        if (err.message === 'FAIL_SHOULD_BE_REJECTED_4') {
            assert.fail('Không được phép tự đổi is_active!');
        }
        assert.equal(err.response?.status, 403);
        assert.ok(err.response?.data?.message.includes('không có quyền tự thay đổi'));
        console.log('   ✅ PASS THỰC TẾ 4: Tự đổi trạng thái hoạt động bị chặn 403:', err.response?.data?.message);
    }

    const verifyHuyActive = (await db.query("SELECT is_active FROM users WHERE id = 15")).rows[0];
    assert.equal(verifyHuyActive.is_active, true, 'Huy vẫn phải hoạt động bình thường');
    console.log('   ✅ ĐỐI SOÁT DB: Trạng thái tài khoản trong PostgreSQL không bị thay đổi.\n');

    // ─── KỊCH BẢN 5: STAFF TỰ CẬP NHẬT THÔNG TIN HỢP LỆ (HỒ SƠ CÁ NHÂN) ───
    console.log('6. [KIỂM THỬ THỰC TẾ 5] Staff (Huy) tự cập nhật phone và nickname hợp lệ của chính mình...');
    const updateRes = await axios.put(`${BASE_URL}/api/users/15`, {
        full_name: 'Ngô Ngọc Đăng Huy',
        email: 'huy.nnd@fittour.com.vn',
        phone: '0869105700',
        nickname: 'HUY NGO'
    }, {
        headers: { Authorization: `Bearer ${staffHuyToken}` }
    });
    assert.equal(updateRes.status, 200);
    console.log('   ✅ PASS THỰC TẾ 5: Nhân viên tự cập nhật hồ sơ cá nhân thành công 200 OK:', updateRes.data.message);

    const verifyHuySelf = (await db.query("SELECT phone, nickname FROM users WHERE id = 15")).rows[0];
    assert.equal(verifyHuySelf.phone, '0869105700');
    assert.equal(verifyHuySelf.nickname, 'HUY NGO');
    console.log('   ✅ ĐỐI SOÁT DB: Cập nhật thông tin cá nhân ghi nhận chính xác vào PostgreSQL.\n');

    // ─── KỊCH BẢN 6: ADMIN QUẢN TRỊ TOÀN QUYỀN ───
    console.log('7. [KIỂM THỬ THỰC TẾ 6] Admin Hiếu cập nhật chức danh/thông tin cho nhân sự Huy...');
    const adminActionRes = await axios.put(`${BASE_URL}/api/users/15`, {
        full_name: 'Ngô Ngọc Đăng Huy',
        email: 'huy.nnd@fittour.com.vn',
        phone: '0869105700',
        nickname: 'HUY NGO',
        position: 'NVKD',
        role_id: staffHuy.role_id,
        is_active: true
    }, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(adminActionRes.status, 200);
    console.log('   ✅ PASS THỰC TẾ 6: Admin quản trị thành công 200 OK:', adminActionRes.data.message);

    // ─── KỊCH BẢN 7: ĐỐI SOÁT SỐ LƯỢNG TOÀN BỘ CƠ SỞ DỮ LIỆU ───
    console.log('8. [KIỂM THỬ TOÀN BỘ CSDL] Kiểm tra số lượng bản ghi sau toàn bộ các thao tác...');
    const totalUsers = (await db.query("SELECT count(*) FROM users")).rows[0].count;
    const totalBookings = (await db.query("SELECT count(*) FROM bookings")).rows[0].count;
    const totalLeads = (await db.query("SELECT count(*) FROM leads")).rows[0].count;

    assert.equal(totalUsers, '40', 'Số lượng tài khoản phải giữ nguyên 40');
    assert.equal(totalBookings, '1176', 'Số lượng bookings phải giữ nguyên 1176');
    assert.equal(totalLeads, '15592', 'Số lượng leads phải giữ nguyên 15592');

    console.log(`   - Tổng Users: ${totalUsers} (Khớp 100%)`);
    console.log(`   - Tổng Bookings: ${totalBookings} (Khớp 100%)`);
    console.log(`   - Tổng Leads: ${totalLeads} (Khớp 100%)`);

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 QA TOÀN DIỆN S04 TRÊN MÁY CHỦ VÀ CSDL THẬT THÀNH CÔNG 100%!     ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    process.exit(0);
}

comprehensiveS04LiveQA().catch(err => {
    console.error('❌ LỖI TRONG QUÁ TRÌNH QA S04:', err);
    process.exit(1);
});
