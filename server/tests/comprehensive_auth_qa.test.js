const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Setup mock RSA keys for JWT
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
process.env.JWT_PRIVATE_KEY = Buffer.from(privateKey).toString('base64');
process.env.JWT_PUBLIC_KEY = Buffer.from(publicKey).toString('base64');
process.env.JWT_ACTIVE_KID = 'qa-audit-2026';

const db = require('../db');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { generateAccessToken, verifyTokenSafely } = require('../utils/jwt');

async function runComprehensiveQA() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║       🔬 BẮT ĐẦU QA TOÀN DIỆN HỆ THỐNG XÁC THỰC (AUTHENTICATION)   ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    let passedCount = 0;
    let totalTests = 0;

    const testCase = async (name, fn) => {
        totalTests++;
        try {
            await fn();
            console.log(`✅ [PASS] Test ${totalTests}: ${name}`);
            passedCount++;
        } catch (err) {
            console.error(`❌ [FAIL] Test ${totalTests}: ${name}`);
            console.error(err);
            process.exit(1);
        }
    };

    // Setup Express app
    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json());
    app.post('/api/auth/login', authController.login);
    app.post('/api/auth/dev-login', authController.devLogin);
    app.get('/api/protected/profile', authMiddleware, (req, res) => {
        res.json({ message: 'OK', user: req.user });
    });

    // Mock DB query method
    const originalQuery = db.query;
    const mockHashedPassword = await bcrypt.hash('CorrectPassword123!', 10);

    const mockAdminUser = {
        id: 1,
        username: 'admin',
        full_name: 'Quản trị viên FIT TOUR',
        password: mockHashedPassword,
        role_id: 1,
        role: 'admin',
        role_name: 'admin',
        is_active: true,
        bus: ['BU1', 'BU2', 'BU3', 'BU4', 'BU5']
    };

    const mockSalesUser = {
        id: 25,
        username: 'sales01',
        full_name: 'Nhân viên Sales FIT TOUR',
        password: mockHashedPassword,
        role_id: 3,
        role: 'sales',
        role_name: 'sales',
        is_active: true,
        bus: ['BU5']
    };

    const mockInactiveUser = {
        id: 99,
        username: 'locked_user',
        full_name: 'Nhân viên đã nghỉ việc',
        password: mockHashedPassword,
        role_id: 3,
        role: 'sales',
        role_name: 'sales',
        is_active: false,
        bus: []
    };

    // --- NHÓM 1: ĐĂNG NHẬP CHÍNH THỨC (/api/auth/login) ---
    console.log('--- PHẦN 1: KIỂM THỬ LUỒNG ĐĂNG NHẬP CHÍNH THỨC CỦA NHÂN VIÊN ---');

    await testCase('Đăng nhập thành công với tài khoản và mật khẩu chính xác', async () => {
        db.query = async () => ({ rows: [mockSalesUser] });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'sales01', password: 'CorrectPassword123!' });
        assert.equal(res.status, 200);
        assert.ok(res.body.token, 'Phải có access token');
        assert.equal(res.body.user.username, 'sales01');
        assert.equal(res.body.user.role, 'sales');
    });

    await testCase('Từ chối khi nhập sai mật khẩu', async () => {
        db.query = async () => ({ rows: [mockSalesUser] });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'sales01', password: 'WrongPassword' });
        assert.equal(res.status, 401);
        assert.equal(res.body.message, 'Mật khẩu không chính xác');
    });

    await testCase('Từ chối khi tài khoản không tồn tại', async () => {
        db.query = async () => ({ rows: [] });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'nonexistent', password: 'AnyPassword' });
        assert.equal(res.status, 401);
        assert.equal(res.body.message, 'Người dùng không tồn tại');
    });

    await testCase('Chặn đăng nhập nếu tài khoản đã bị khóa (is_active = false)', async () => {
        db.query = async () => ({ rows: [mockInactiveUser] });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'locked_user', password: 'CorrectPassword123!' });
        assert.equal(res.status, 403);
        assert.ok(res.body.message.includes('vô hiệu hóa'));
    });

    // --- NHÓM 2: PHIÊN LÀM VIỆC CỦA NHÂN VIÊN ĐANG ĐĂNG NHẬP (MIDDLEWARE AUTH) ---
    console.log('\n--- PHẦN 2: KIỂM THỬ BẢO VỆ PHIÊN NHÂN VIÊN ĐANG LÀM VIỆC ---');

    let validSalesToken;
    await testCase('Nhân viên đang làm việc gửi token Bearer hợp lệ -> Truy cập thông suốt', async () => {
        validSalesToken = generateAccessToken(mockSalesUser);
        const res = await request(app)
            .get('/api/protected/profile')
            .set('Authorization', `Bearer ${validSalesToken}`);
        assert.equal(res.status, 200);
        assert.equal(res.body.user.username, 'sales01');
        assert.equal(res.body.user.role, 'sales');
    });

    await testCase('Từ chối truy cập nếu không có token Authorization', async () => {
        const res = await request(app).get('/api/protected/profile');
        assert.equal(res.status, 401);
        assert.equal(res.body.message, 'Truy cập bị từ chối');
    });

    await testCase('Từ chối truy cập nếu token bị sửa đổi hoặc giả mạo', async () => {
        const tamperedToken = validSalesToken + 'tampered';
        const res = await request(app)
            .get('/api/protected/profile')
            .set('Authorization', `Bearer ${tamperedToken}`);
        assert.equal(res.status, 401);
    });

    // --- NHÓM 3: CHỐT CHẶN AN TOÀN S01 TRÊN PRODUCTION (/api/auth/dev-login) ---
    console.log('\n--- PHẦN 3: KIỂM THỬ TOÀN DIỆN CHỐT CHẶN S01 TRÊN PRODUCTION ---');

    await testCase('Production: Chặn tuyệt đối 404 khi kẻ tấn công giả mạo Host localhost', async () => {
        process.env.NODE_ENV = 'production';
        const res = await request(app)
            .post('/api/auth/dev-login')
            .set('Host', 'localhost')
            .set('X-Forwarded-For', '198.51.100.22');
        assert.equal(res.status, 404);
        assert.equal(res.body.message, 'Không tìm thấy trang yêu cầu');
    });

    await testCase('Production: Chặn tuyệt đối 404 khi kẻ tấn công giả mạo 127.0.0.1', async () => {
        process.env.NODE_ENV = 'production';
        const res = await request(app)
            .post('/api/auth/dev-login')
            .set('Host', '127.0.0.1')
            .set('X-Forwarded-Host', 'localhost');
        assert.equal(res.status, 404);
    });

    await testCase('Production: Chặn tuyệt đối 404 khi request từ domain thật erp.fittour.vn', async () => {
        process.env.NODE_ENV = 'production';
        const res = await request(app)
            .post('/api/auth/dev-login')
            .set('Host', 'erp.fittour.vn');
        assert.equal(res.status, 404);
    });

    await testCase('Development: Vẫn cho phép dev login trên localhost khi NODE_ENV = development', async () => {
        process.env.NODE_ENV = 'development';
        db.query = async () => ({ rows: [mockAdminUser] });
        const res = await request(app)
            .post('/api/auth/dev-login')
            .set('Host', 'localhost');
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
        assert.equal(res.body.user.role, 'admin');
    });

    // Restore DB query
    db.query = originalQuery;

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log(`║   🎉 KẾT QUẢ QA: ${passedCount}/${totalTests} TESTS PASS HOÀN TOÀN (100% THÀNH CÔNG)!          ║`);
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
}

runComprehensiveQA().catch(err => {
    console.error('LỖI KHÔNG MONG ĐỢI TRONG QA:', err);
    process.exit(1);
});

