/**
 * QA Test Suite: ADR 0011 Deposit Retention, Split Booking, and Credit Drawdown
 */
const assert = require('assert');
const db = require('../db');
const controller = require('../controllers/customerCreditController');

let passedTests = 0;
let failedTests = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('   QA TEST SUITE: ADR 0011 DEPOSIT RETENTION & SPLIT BOOKING    ');
  console.log('================================================================\n');

  let testBookingId = null;
  let testCreditId = null;
  let testCreditCode = null;
  let testTargetBookingId = null;

  try {
    // SETUP: Tạo dữ liệu kiểm thử
    console.log('--- SETUP: TẠO DỮ LIỆU BOOKING KIỂM THỬ ---');
    const mockMembers = [
      { id: 1, name: 'Nguyễn Văn A (Người đi)', phone: '0901112233', docId: 'B1234567', gender: 'Nam' },
      { id: 2, name: 'Trần Thị B (Người hủy)', phone: '0908889999', docId: 'C7654321', gender: 'Nữ' }
    ];
    const mockPricingRows = [
      { id: 1, ageType: 'Người lớn', name: 'Vé người lớn', price: 25000000, qty: 2, total: 50000000 }
    ];

    const bRes = await db.query(`
      INSERT INTO bookings_raw (
        booking_code, customer_id, pax_count, total_price, paid, payment_status, booking_status,
        raw_details, notes, created_at, updated_at
      ) VALUES (
        'BK-QA-SPLIT-01', NULL, 2, 50000000, 20000000, 'partial', 'Đã đặt cọc',
        $1, 'Test booking gốc 2 khách cọc 20tr', NOW(), NOW()
      ) RETURNING id
    `, [JSON.stringify({ members: mockMembers, pricingRows: mockPricingRows, bookingInfo: { name: 'Nguyễn Văn A', phone: '0901112233' } })]);

    testBookingId = bRes.rows[0].id;
    console.log(`Đã tạo test booking ID: ${testBookingId} (2 khách, tổng 50tr, cọc 20tr)\n`);

    // TEST 1: TÁCH BOOKING & BẢO LƯU TIỀN CỌC
    console.log('--- TEST GROUP 1: SPLIT BOOKING & BẢO LƯU TIỀN CỌC ---');

    await itAsync('Tách khách Trần Thị B, phân bổ cọc 10tr, trừ phí vé máy bay 1tr -> Bảo lưu 9tr', async () => {
      let responseData = null;
      const req = {
        user: { id: 1, full_name: 'Tester QA' },
        body: {
          bookingId: testBookingId,
          passengerIndex: 1, // Khách B
          allocatedDeposit: 10000000,
          deductionFee: 1000000, // Phạt vé bay 1tr
          validityMonths: 18, // Truyền 18 tháng để test kẹp trần tối đa 12 tháng
          creditToOption: 'canceling_passenger',
          notes: 'Khách B bận việc đột xuất xin bảo lưu 12 tháng'
        }
      };

      const res = {
        status: (code) => ({
          json: (data) => { responseData = { code, data }; }
        }),
        json: (data) => { responseData = { code: 200, data }; }
      };

      await controller.splitAndRetainDeposit(req, res);

      assert.strictEqual(responseData.code, 200, 'Gọi API thành công');
      assert.strictEqual(responseData.data.success, true);
      
      const credit = responseData.data.credit;
      testCreditId = credit.id;
      testCreditCode = credit.credit_code;

      assert.strictEqual(Number(credit.retention_amount), 9000000, 'Số tiền bảo lưu thực là 9tr (10tr - 1tr)');
      assert.strictEqual(Number(credit.remaining_balance), 9000000, 'Số dư còn lại ban đầu là 9tr');
      assert.strictEqual(credit.passenger_name, 'Trần Thị B (Người hủy)');
      assert.strictEqual(credit.credited_to_name, 'Trần Thị B (Người hủy)');
      assert.strictEqual(credit.validity_months, 12, 'Khóa cứng trần tối đa 12 tháng dù truyền 18 tháng');

      // Kiểm tra Booking gốc đã co lại chính xác chưa
      const updatedBooking = responseData.data.updatedBooking;
      assert.strictEqual(updatedBooking.pax_count, 1, 'Số khách co về 1');
      assert.strictEqual(Number(updatedBooking.total_price), 25000000, 'Tổng giá co về 25tr (1 khách)');
      assert.strictEqual(Number(updatedBooking.paid), 10000000, 'Tiền cọc của booking chỉ còn 10tr của người đi');
      assert.strictEqual(Number(updatedBooking.remaining), 15000000, 'Số tiền cần thu đúng 15tr, không bị sai lệch');
    });

    // TEST 2: KIỂM TRA TRẢ VỀ DANH SÁCH PHIẾU BẢO LƯU CÒN HIỆU LỰC
    console.log('\n--- TEST GROUP 2: TRA CỨU PHIẾU BẢO LƯU CÒN HIỆU LỰC ---');

    await itAsync('Tìm kiếm phiếu bảo lưu theo số điện thoại của Khách B', async () => {
      let responseData = null;
      const req = {
        query: { phone: '0908889999' }
      };
      const res = {
        json: (data) => { responseData = data; }
      };

      await controller.getActiveCredits(req, res);

      assert.strictEqual(responseData.success, true);
      assert.strictEqual(responseData.data.length >= 1, true, 'Tìm thấy ít nhất 1 phiếu bảo lưu');
      const found = responseData.data.find(c => c.id === testCreditId);
      assert.ok(found, 'Tìm thấy đúng phiếu bảo lưu vừa tạo');
      assert.strictEqual(Number(found.remaining_balance), 9000000);
    });

    // TEST 3: CẤN TRỪ CỌC TỪNG PHẦN (PARTIAL DRAWDOWN) VÀO TOUR MỚI
    console.log('\n--- TEST GROUP 3: CẤN TRỪ VÀO TOUR MỚI (PARTIAL DRAWDOWN) ---');

    // Tạo booking đích (Tour mới mà khách B đăng ký sau này)
    const tbRes = await db.query(`
      INSERT INTO bookings_raw (
        booking_code, customer_id, pax_count, total_price, paid, payment_status, booking_status,
        raw_details, notes, created_at, updated_at
      ) VALUES (
        'BK-QA-SPLIT-02', NULL, 1, 30000000, 0, 'unpaid', 'Mới',
        '{}', 'Tour mới của khách B', NOW(), NOW()
      ) RETURNING id
    `);
    testTargetBookingId = tbRes.rows[0].id;

    await itAsync('Đợt 1: Cấn trừ 5.000.000đ vào Tour mới -> Phiếu bảo lưu còn 4.000.000đ (PARTIALLY_USED)', async () => {
      let responseData = null;
      const req = {
        user: { id: 1, full_name: 'Tester QA' },
        body: {
          creditId: testCreditId,
          targetBookingId: testTargetBookingId,
          amount: 5000000,
          notes: 'Cấn trừ cọc tour mới đợt 1'
        }
      };
      const res = {
        status: (code) => ({ json: (data) => { responseData = { code, data }; } }),
        json: (data) => { responseData = { code: 200, data }; }
      };

      await controller.drawdownCredit(req, res);

      assert.strictEqual(responseData.code, 200);
      assert.strictEqual(Number(responseData.data.remainingCreditBalance), 4000000, 'Số dư bảo lưu còn đúng 4tr');
      assert.strictEqual(Number(responseData.data.targetBooking.paid), 5000000, 'Booking mới được ghi nhận cọc 5tr');
    });

    await itAsync('Đợt 2: Cấn trừ nốt 4.000.000đ còn lại -> Phiếu chuyển sang FULLY_USED', async () => {
      let responseData = null;
      const req = {
        user: { id: 1, full_name: 'Tester QA' },
        body: {
          creditId: testCreditId,
          targetBookingId: testTargetBookingId,
          amount: 4000000,
          notes: 'Cấn trừ nốt 4tr còn lại'
        }
      };
      const res = {
        status: (code) => ({ json: (data) => { responseData = { code, data }; } }),
        json: (data) => { responseData = { code: 200, data }; }
      };

      await controller.drawdownCredit(req, res);

      assert.strictEqual(responseData.code, 200);
      assert.strictEqual(Number(responseData.data.remainingCreditBalance), 0, 'Số dư bảo lưu đã hết (0đ)');
      assert.strictEqual(Number(responseData.data.targetBooking.paid), 9000000, 'Booking mới đã được cọc đủ 9tr');

      // Kiểm tra trạng thái phiếu trong DB
      const checkDb = await db.query('SELECT status, remaining_balance FROM customer_credits WHERE id = $1', [testCreditId]);
      assert.strictEqual(checkDb.rows[0].status, 'FULLY_USED');
      assert.strictEqual(Number(checkDb.rows[0].remaining_balance), 0);
    });

    await itAsync('Đợt 3: Cố tình cấn trừ tiếp khi số dư đã hết -> Bị chặn với lỗi số dư không đủ', async () => {
      let responseData = null;
      const req = {
        user: { id: 1, full_name: 'Tester QA' },
        body: {
          creditId: testCreditId,
          targetBookingId: testTargetBookingId,
          amount: 1000000
        }
      };
      const res = {
        status: (code) => ({ json: (data) => { responseData = { code, data }; } }),
        json: (data) => { responseData = { code: 200, data }; }
      };

      await controller.drawdownCredit(req, res);

      assert.strictEqual(responseData.code, 400, 'Bị chặn với HTTP 400');
      assert.ok(responseData.data.error.includes('không đủ'));
    });

    // TEST 4: CHI TIẾT PHIẾU XÁC NHẬN BẢO LƯU (PRINT VOUCHER)
    console.log('\n--- TEST GROUP 4: XUẤT CHỨNG TỪ PHIẾU BẢO LƯU (VOUCHER) ---');

    await itAsync('Lấy chi tiết phiếu bảo lưu kèm đầy đủ lịch sử giao dịch cấn trừ', async () => {
      let responseData = null;
      const req = { params: { id: testCreditId } };
      const res = {
        status: (code) => ({ json: (data) => { responseData = { code, data }; } }),
        json: (data) => { responseData = { code: 200, data }; }
      };

      await controller.getCreditVoucher(req, res);

      assert.strictEqual(responseData.code, 200);
      const voucher = responseData.data.data;
      assert.strictEqual(voucher.credit_code, testCreditCode);
      assert.strictEqual(voucher.passenger_name, 'Trần Thị B (Người hủy)');
      assert.strictEqual(voucher.transactions.length, 3, 'Gồm 1 giao dịch nạp CREDIT_IN và 2 giao dịch rút DRAWDOWN');
      assert.strictEqual(voucher.transactions[0].transaction_type, 'CREDIT_IN');
      assert.strictEqual(voucher.transactions[1].transaction_type, 'DRAWDOWN');
      assert.strictEqual(voucher.transactions[2].transaction_type, 'DRAWDOWN');
    });

  } finally {
    // CLEANUP
    if (testBookingId) {
      await db.query('DELETE FROM bookings_raw WHERE id = $1', [testBookingId]);
    }
    if (testTargetBookingId) {
      await db.query('DELETE FROM bookings_raw WHERE id = $1', [testTargetBookingId]);
    }
    if (testCreditId) {
      await db.query('DELETE FROM customer_credits WHERE id = $1', [testCreditId]);
    }
    console.log('\n--- CLEANUP: ĐÃ DỌN DẸP DỮ LIỆU TEST AN TOÀN ---');
  }

  console.log('\n================================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests}/${passedTests + failedTests} TESTS PASSED`);
  if (failedTests > 0) {
    console.error(`CÓ ${failedTests} BÀI KIỂM THỬ THẤT BẠI!`);
    process.exit(1);
  } else {
    console.log('TẤT CẢ CÁC BÀI TEST NGHIỆP VỤ BẢO LƯU ĐỀU THÀNH CÔNG RỰC RỠ! 🚀');
  }
}

runTestSuite().then(() => process.exit(0)).catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
