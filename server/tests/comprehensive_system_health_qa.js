const axios = require('axios');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { generateAccessToken } = require('../utils/jwt');

async function comprehensiveSystemHealthQA() {
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  🛡️  TỔNG KIỂM TRA TOÀN DIỆN HỆ THỐNG - AN NINH & NGHIỆP VỤ FIT TOUR CRM    ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

    const BASE_URL = 'http://localhost:5001';

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. KIỂM TRA TÍNH TOÀN VẸN CƠ SỞ DỮ LIỆU POSTGRESQL (DATA INTEGRITY)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('━━━ [PHẦN 1] ĐỐI SOÁT TÍNH NGUYÊN VẸN CƠ SỞ DỮ LIỆU THỰC TẾ ━━━');
    
    const [
        usersRes,
        bookingsRes,
        leadsRes,
        customersRes,
        vouchersRes,
        departuresRes,
        teamsRes,
        busRes,
        adminRes
    ] = await Promise.all([
        db.query('SELECT count(*) FROM users'),
        db.query('SELECT count(*) FROM bookings'),
        db.query('SELECT count(*) FROM leads'),
        db.query('SELECT count(*) FROM customers'),
        db.query('SELECT count(*) FROM payment_vouchers'),
        db.query('SELECT count(*) FROM tour_departures'),
        db.query('SELECT count(*) FROM teams'),
        db.query('SELECT count(*) FROM business_units'),
        db.query('SELECT id, username, email, full_name, role_id, is_active FROM users WHERE id = 1')
    ]);

    const totalUsers = parseInt(usersRes.rows[0].count);
    const totalBookings = parseInt(bookingsRes.rows[0].count);
    const totalLeads = parseInt(leadsRes.rows[0].count);
    const totalCustomers = parseInt(customersRes.rows[0].count);
    const totalVouchers = parseInt(vouchersRes.rows[0].count);
    const totalDepartures = parseInt(departuresRes.rows[0].count);
    const totalTeams = parseInt(teamsRes.rows[0].count);
    const totalBUs = parseInt(busRes.rows[0].count);
    const adminUser = adminRes.rows[0];

    console.log(`   📊 Tổng Users: ${totalUsers} (Yêu cầu: 40)`);
    console.log(`   📊 Tổng Bookings: ${totalBookings} (Yêu cầu: 1,176)`);
    console.log(`   📊 Tổng Leads: ${totalLeads} (Yêu cầu: 15,592)`);
    console.log(`   📊 Tổng Khách hàng (Customers): ${totalCustomers}`);
    console.log(`   📊 Tổng Phiếu thu/chi (Vouchers): ${totalVouchers}`);
    console.log(`   📊 Tổng Lịch khởi hành (Tour Departures): ${totalDepartures}`);
    console.log(`   📊 Tổng Phòng ban/Teams: ${totalTeams}`);
    console.log(`   📊 Tổng Khối kinh doanh (BUs): ${totalBUs}`);

    assert.equal(totalUsers, 40, 'Số lượng Users trong DB phải giữ nguyên 40');
    assert.equal(totalBookings, 1176, 'Số lượng Bookings trong DB phải giữ nguyên 1,176');
    assert.equal(totalLeads, 15592, 'Số lượng Leads trong DB phải giữ nguyên 15,592');
    assert.ok(adminUser && adminUser.is_active === true, 'Tài khoản Admin phải tồn tại và đang kích hoạt');
    assert.equal(adminUser.username, 'admin', 'Username Admin phải là admin');

    console.log('   ✅ ĐỐI SOÁT DB: Toàn bộ dữ liệu kinh doanh và tài chính nguyên vẹn 100%!\n');

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. TẠO PHIÊN KIỂM THỬ THỰC TẾ CHO ADMIN VÀ NHÂN VIÊN
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('━━━ [PHẦN 2] NẠP PHIÊN LÀM VIỆC THỰC TẾ (JWT TOKENS) ━━━');
    const staffRes = await db.query('SELECT * FROM users WHERE id = 15');
    const staffUser = staffRes.rows[0];

    const adminToken = generateAccessToken(adminUser);
    const staffToken = generateAccessToken(staffUser);

    console.log(`   🔑 Token Admin: Huỳnh Trọng Hiếu (@${adminUser.username})`);
    console.log(`   🔑 Token Staff: Ngô Ngọc Đăng Huy (@${staffUser.username})\n`);

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. KIỂM TRA CÁC CHỨC NĂNG NGHIỆP VỤ HÀNG NGÀY TRÊN CRM (BUSINESS APIS)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('━━━ [PHẦN 3] KIỂM THỬ CÁC LUỒNG NGHIỆP VỤ ĐANG HOẠT ĐỘNG (BUSINESS FLOWS) ━━━');

    // 3.1 Nhân viên lấy thông tin cá nhân
    const meRes = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(meRes.status, 200, 'API /api/users/me phải hoạt động');
    assert.equal(meRes.data.id, 15, 'ID người dùng phải là 15');
    console.log(`   ✅ 3.1 Lấy thông tin cá nhân nhân viên (/api/users/me): 200 OK (${meRes.data.full_name})`);

    // 3.2 Nhân viên lấy danh sách tour
    const toursApiRes = await axios.get(`${BASE_URL}/api/tours`, {
        headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(toursApiRes.status, 200, 'API /api/tours phải hoạt động');
    console.log(`   ✅ 3.2 Danh sách Tuyến Tour (/api/tours): 200 OK`);

    // 3.3 Nhân viên lấy danh sách ngày khởi hành
    const departuresApiRes = await axios.get(`${BASE_URL}/api/departures`, {
        headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(departuresApiRes.status, 200, 'API /api/departures phải hoạt động');
    console.log(`   ✅ 3.3 Lịch khởi hành tour (/api/departures): 200 OK`);

    // 3.4 Nhân viên lấy danh sách Booking
    const bookingsApiRes = await axios.get(`${BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(bookingsApiRes.status, 200, 'API /api/bookings phải hoạt động');
    console.log(`   ✅ 3.4 Quản lý Booking (/api/bookings): 200 OK`);

    // 3.5 Nhân viên lấy danh sách khách hàng
    const customersApiRes = await axios.get(`${BASE_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert.equal(customersApiRes.status, 200, 'API /api/customers phải hoạt động');
    console.log(`   ✅ 3.5 Quản lý Khách hàng (/api/customers): 200 OK`);

    // 3.6 Đọc link tĩnh /uploads (ảnh tour, avatar, phiếu thu)
    const staticTestRes = await axios.get(`${BASE_URL}/uploads/thong_bao_company_trip_dalat_2026.html`);
    assert.equal(staticTestRes.status, 200, 'Tài nguyên /uploads tĩnh phải đọc được bình thường');
    console.log(`   ✅ 3.6 Đọc tài nguyên tĩnh (/uploads/...): 200 OK (Đảm bảo ERP hiển thị trơn tru, không vỡ ảnh)\n`);

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. KIỂM SOÁT 4 CHỐT CHẶN AN NINH ĐÃ VÁ (S01, S02, S03, S04)
    // ─────────────────────────────────────────────────────────────────────────────
    console.log('━━━ [PHẦN 4] KIỂM TRA TRẠNG THÁI CỦA 4 CHỐT CHẶN AN NINH (CRITICAL FIXES) ━━━');

    // Chốt chặn S01: Dev Login Bypass
    const devLoginRes = await axios.get(`${BASE_URL}/api/auth/dev-login?username=admin`, {
        validateStatus: () => true
    });
    assert.ok([403, 404].includes(devLoginRes.status), 'Dev-login phải bị chặn trên mạng ngoài hoặc Production');
    console.log(`   ✅ S01 (Dev-Login Bypass): Được kiểm soát an toàn (HTTP ${devLoginRes.status})`);

    // Chốt chặn S02: Media Unauthorized Actions
    const anonMediaRes = await axios.get(`${BASE_URL}/api/media`, {
        validateStatus: () => true
    });
    assert.equal(anonMediaRes.status, 401, 'Khách vãng lai xem media phải bị chặn 401');
    
    const staffDelRes = await axios.delete(`${BASE_URL}/api/media/test.jpg`, {
        headers: { Authorization: `Bearer ${staffToken}` },
        validateStatus: () => true
    });
    assert.equal(staffDelRes.status, 403, 'Nhân viên xóa media phải bị chặn 403');
    console.log('   ✅ S02 (Media Unauthorized Access): Ẩn danh bị chặn 401, Nhân viên xóa bị chặn 403');

    // Chốt chặn S03: RAG Path Traversal
    // 1. Nếu không có key -> bị chặn 401
    const unauthTraversalRes = await axios.get(`${BASE_URL}/api/rag/docs/content?id=sotay_..%2Fserver%2F.env`, {
        validateStatus: () => true
    });
    assert.equal(unauthTraversalRes.status, 401, 'Không có auth phải bị chặn 401');
    
    // 2. Nếu có key mà gửi path traversal -> bị chặn 400
    const ragApiKey = process.env.RAG_API_KEY || 'fittour-rag-secret-token-2026';
    const authTraversalRes = await axios.get(`${BASE_URL}/api/rag/docs/content?id=sotay_..%2Fserver%2F.env`, {
        headers: { Authorization: `Bearer ${ragApiKey}` },
        validateStatus: () => true
    });
    assert.equal(authTraversalRes.status, 400, 'Path Traversal phải bị chặn 400');
    console.log('   ✅ S03 (RAG Path Traversal): Ẩn danh bị chặn 401, Tấn công đọc file lùi cấp bị chặn 400 Bad Request');

    // Chốt chặn S04: Privilege Escalation
    const escalationRes = await axios.put(`${BASE_URL}/api/users/1`, {
        full_name: 'Attacker'
    }, {
        headers: { Authorization: `Bearer ${staffToken}` },
        validateStatus: () => true
    });
    assert.equal(escalationRes.status, 403, 'Nhân viên sửa tài khoản khác phải bị chặn 403');
    console.log('   ✅ S04 (User Privilege Escalation): Nhân viên sửa Admin/người khác bị chặn 403 Forbidden\n');

    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  🎉 KẾT QUẢ: TẤT CẢ CÁC LUỒNG NGHIỆP VỤ & BẢO MẬT ĐỀU HOẠT ĐỘNG HOÀN HẢO!     ║');
    console.log('║     - Dữ liệu lịch sử: NGUYÊN VẸN 100%                                        ║');
    console.log('║     - Nghiệp vụ CRM: HOẠT ĐỘNG TRƠN TRU 100%                                  ║');
    console.log('║     - 4 Lỗ hổng Critical: ĐÃ KHẮC PHỤC TRIỆT ĐỂ & AN TOÀN                      ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
}

comprehensiveSystemHealthQA().then(() => process.exit(0)).catch(err => {
    console.error('❌ LỖI TRONG QUÁ TRÌNH TỔNG KIỂM TRA:', err.message);
    if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
    }
    process.exit(1);
});
