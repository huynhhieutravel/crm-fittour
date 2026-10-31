const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const userController = require('../controllers/userController');
const db = require('../db');

async function testPostfixS04() {
    console.log('--- BẮT ĐẦU QA HẬU KIỂM (POST-FIX QA CHO S04) ---\n');

    const app = express();
    app.use(express.json());

    let currentUser = { id: 101, username: 'sales_user', role: 'sales' };

    // Middleware gắn current user linh hoạt
    app.put('/api/users/:id', (req, res, next) => {
        req.user = currentUser;
        next();
    }, userController.updateUser);

    // Mock DB client
    let executedUpdate = false;
    const mockClient = {
        query: async (sql, args) => {
            if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return {};
            if (sql.includes('SELECT r.name as role_name')) {
                const targetId = args[0];
                return { rows: [{ role_name: targetId === '1' ? 'admin' : 'sales' }] };
            }
            if (sql.includes('SELECT role_id FROM users')) {
                return { rows: [{ role_id: 3 }] };
            }
            if (sql.includes('SELECT avatar_url FROM users')) {
                return { rows: [{ avatar_url: null }] };
            }
            if (sql.includes('UPDATE users SET')) {
                executedUpdate = true;
                return { rowCount: 1 };
            }
            if (sql.includes('SELECT * FROM users WHERE id = $1')) {
                return { rows: [{ id: args[0], username: 'test_user', role: 'sales' }] };
            }
            return { rows: [] };
        },
        release: () => {}
    };

    const originalConnect = db.pool.connect;
    db.pool.connect = async () => mockClient;

    // 1. Sales cố sửa tài khoản Admin
    console.log('1. Kiểm tra: Sales (ID: 101) cố tình sửa tài khoản Admin (ID: 1)...');
    currentUser = { id: 101, username: 'sales01', role: 'sales' };
    executedUpdate = false;
    const resSalesToAdmin = await request(app)
        .put('/api/users/1')
        .send({ full_name: 'Hacked Admin', email: 'hacker@domain.com' });
    assert.equal(resSalesToAdmin.status, 403);
    assert.equal(resSalesToAdmin.body.message, 'Bạn không có quyền chỉnh sửa tài khoản của người khác.');
    assert.equal(executedUpdate, false, 'Không được phép chạy SQL UPDATE');
    console.log('   ✅ PASS: Bị từ chối 403 Forbidden đúng như mong đợi.\n');

    // 2. Sales cố sửa tài khoản một Sales khác
    console.log('2. Kiểm tra: Sales (ID: 101) cố tình sửa tài khoản Sales khác (ID: 102)...');
    executedUpdate = false;
    const resSalesToOther = await request(app)
        .put('/api/users/102')
        .send({ phone: '0999999999' });
    assert.equal(resSalesToOther.status, 403);
    assert.equal(resSalesToOther.body.message, 'Bạn không có quyền chỉnh sửa tài khoản của người khác.');
    assert.equal(executedUpdate, false);
    console.log('   ✅ PASS: Bị từ chối 403 Forbidden.\n');

    // 3. Sales tự nâng quyền chính mình (self-promotion lên admin role_id: 1)
    console.log('3. Kiểm tra: Sales (ID: 101) cố tình tự gán role_id = 1 (Admin)...');
    executedUpdate = false;
    const resSelfPromote = await request(app)
        .put('/api/users/101')
        .send({ role_id: 1 });
    assert.equal(resSelfPromote.status, 403);
    assert.ok(resSelfPromote.body.message.includes('không có quyền tự thay đổi vai trò'));
    assert.equal(executedUpdate, false);
    console.log('   ✅ PASS: Tự nâng quyền bị chặn đứng 403 Forbidden.\n');

    // 4. Sales tự khóa tài khoản chính mình (is_active: false)
    console.log('4. Kiểm tra: Sales (ID: 101) cố tình tự gán is_active = false...');
    executedUpdate = false;
    const resSelfLock = await request(app)
        .put('/api/users/101')
        .send({ is_active: false });
    assert.equal(resSelfLock.status, 403);
    assert.ok(resSelfLock.body.message.includes('không có quyền tự thay đổi'));
    assert.equal(executedUpdate, false);
    console.log('   ✅ PASS: Tự đổi trạng thái hoạt động bị chặn 403 Forbidden.\n');

    // 5. Sales tự cập nhật thông tin cá nhân hợp lệ (phone, nickname, avatar_url)
    console.log('5. Kiểm tra: Sales (ID: 101) tự cập nhật phone, nickname của chính mình...');
    executedUpdate = false;
    const resSelfValid = await request(app)
        .put('/api/users/101')
        .send({ full_name: 'Sales Nguyễn Văn A', phone: '0901234567', nickname: 'Anh Ba' });
    assert.equal(resSelfValid.status, 200);
    assert.equal(executedUpdate, true, 'SQL UPDATE phải được thực thi');
    console.log('   ✅ PASS: Tự cập nhật thông tin cá nhân thành công 200 OK.\n');

    // 6. Manager cố sửa tài khoản Admin
    console.log('6. Kiểm tra: Quản lý (Manager ID: 50) cố sửa tài khoản Admin (ID: 1)...');
    currentUser = { id: 50, username: 'manager01', role: 'manager' };
    executedUpdate = false;
    const resMgrToAdmin = await request(app)
        .put('/api/users/1')
        .send({ full_name: 'New Name' });
    assert.equal(resMgrToAdmin.status, 403);
    assert.ok(resMgrToAdmin.body.message.includes('Quản lý không có quyền'));
    assert.equal(executedUpdate, false);
    console.log('   ✅ PASS: Quản lý sửa Admin bị chặn 403 Forbidden.\n');

    // 7. Admin có toàn quyền chỉnh sửa bất kỳ tài khoản nào
    console.log('7. Kiểm tra: Admin (ID: 1) chỉnh sửa tài khoản nhân viên (ID: 101)...');
    currentUser = { id: 1, username: 'admin', role: 'admin' };
    executedUpdate = false;
    const resAdmin = await request(app)
        .put('/api/users/101')
        .send({ full_name: 'Nhân viên mới cập nhật', role_id: 3, is_active: true });
    assert.equal(resAdmin.status, 200);
    assert.equal(executedUpdate, true);
    console.log('   ✅ PASS: Admin quản trị thành công 200 OK.\n');

    db.pool.connect = originalConnect;
    console.log('🎉 TẤT CẢ 7/7 KỊCH BẢN KIỂM THỬ S04 ĐỀU ĐẠT CHUẨN AN TOÀN TUYỆT ĐỐI!');
}

testPostfixS04().catch(err => {
    console.error('LỖI KIỂM THỬ S04:', err);
    process.exit(1);
});

