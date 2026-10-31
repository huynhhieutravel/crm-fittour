const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const userController = require('../controllers/userController');
const db = require('../db');

async function testPrefixS04() {
    console.log('--- BẮT ĐẦU QA TRƯỚC KHI SỬA (PRE-FIX QA CHO S04) ---\n');

    const app = express();
    app.use(express.json());

    let executedUpdateSql = null;
    let executedArgs = null;

    // Giả lập DB client để bắt câu lệnh SQL
    const mockClient = {
        query: async (sql, args) => {
            if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return {};
            if (sql.includes('SELECT role_id FROM users') || sql.includes('SELECT r.name as role_name')) {
                return { rows: [{ role_id: 1, role_name: 'admin' }] };
            }
            if (sql.includes('SELECT avatar_url FROM users')) {
                return { rows: [{ avatar_url: null }] };
            }
            if (sql.includes('UPDATE users SET')) {
                executedUpdateSql = sql;
                executedArgs = args;
                return { rowCount: 1 };
            }
            if (sql.includes('SELECT * FROM users WHERE id = $1')) {
                return { rows: [{ id: 1, username: 'admin', role: 'admin' }] };
            }
            return { rows: [] };
        },
        release: () => {}
    };

    const originalConnect = db.pool.connect;
    db.pool.connect = async () => mockClient;

    // Giả lập middleware auth: Người dùng đăng nhập là Sales (ID: 101, Role: 'sales')
    app.put('/api/users/:id', (req, res, next) => {
        req.user = { id: 101, username: 'sales_user', role: 'sales' };
        next();
    }, userController.updateUser);

    console.log('1. Kịch bản: Nhân viên Sales (ID: 101) cố tình gửi API sửa tài khoản Admin (ID: 1)...');
    console.log('   Payload tấn công: { is_active: false, email: "hacker@domain.com" }');

    const res = await request(app)
        .put('/api/users/1')
        .send({
            full_name: 'Hacked Admin',
            email: 'hacker@domain.com',
            role_id: 1, // Giữ nguyên role_id của admin để lách qua check
            is_active: false
        });

    console.log('   -> Trạng thái HTTP trả về hiện tại:', res.status);
    if (res.status === 200 && executedUpdateSql) {
        console.log('   🚨 XÁC NHẬN LỖ HỔNG S04: Sales đã sửa thành công tài khoản của Admin!');
        console.log('   -> Câu lệnh SQL đã thực thi:', executedUpdateSql.split('\n')[0]);
        console.log('   -> Giá trị email bị đổi:', executedArgs[1]);
        console.log('   -> Giá trị is_active bị đổi thành:', executedArgs[4]);
    } else {
        console.log('   Phản hồi:', res.body);
    }

    db.pool.connect = originalConnect;
    console.log('\n--- KẾT THÚC PRE-FIX QA CHO S04 ---');
}

testPrefixS04().catch(err => {
    console.error('Lỗi khi chạy QA S04:', err);
    process.exit(1);
});

