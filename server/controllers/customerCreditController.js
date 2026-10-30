/**
 * Controller: Quản lý Bảo lưu tiền cọc (Deposit Retention) & Hạn mức tín dụng khách hàng (Customer Credit)
 * ADR 0011: Hỗ trợ Split Booking, Hủy 1 phần, Bảo lưu tối đa 12 tháng, Cấn trừ linh hoạt.
 */
const db = require('../db');

// Helper: Định dạng mã phiếu bảo lưu BL-YYYYMM-XXXX
const generateCreditCode = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `BL-${yyyy}${mm}-${random4}`;
};

/**
 * 1. Tách Booking & Bảo lưu tiền cọc cho 1 hành khách hủy
 */
exports.splitAndRetainDeposit = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {
      bookingId,
      passengerIndex,
      allocatedDeposit,
      deductionFee = 0,
      validityMonths = 12,
      creditToOption = 'canceling_passenger',
      customCreditedName,
      customCreditedPhone,
      notes = ''
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Thiếu mã Booking cần xử lý.' });
    }

    // Ràng buộc cứng: Thời hạn tối đa chỉ 12 tháng
    const safeMonths = Math.min(12, Math.max(1, parseInt(validityMonths) || 12));
    const depositToSplit = Number(allocatedDeposit) || 0;
    const feeToDeduct = Number(deductionFee) || 0;

    if (depositToSplit < 0 || feeToDeduct < 0) {
      return res.status(400).json({ error: 'Số tiền cọc hoặc phí phát sinh không hợp lệ.' });
    }

    await client.query('BEGIN');

    // 1. Lấy thông tin Booking gốc với khóa dòng FOR UPDATE
    const bCheck = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
    if (bCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Không tìm thấy Booking.' });
    }
    const booking = bCheck.rows[0];

    // Lấy thông tin tour khởi hành nếu có
    let tourInfo = null;
    if (booking.tour_departure_id) {
      const tCheck = await client.query('SELECT * FROM tour_departures WHERE id = $1', [booking.tour_departure_id]);
      if (tCheck.rows.length > 0) tourInfo = tCheck.rows[0];
    }

    let rawDetails = booking.raw_details || {};
    if (typeof rawDetails === 'string') {
      try { rawDetails = JSON.parse(rawDetails); } catch (e) { rawDetails = {}; }
    }
    const members = Array.isArray(rawDetails.members) ? rawDetails.members : [];

    const pIdx = parseInt(passengerIndex);
    if (isNaN(pIdx) || pIdx < 0 || pIdx >= members.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Không tìm thấy thông tin hành khách hủy trong danh sách đoàn.' });
    }

    const cancelingPassenger = members[pIdx];
    const passengerName = (cancelingPassenger.name || 'Hành khách').trim();
    const passengerPhone = (cancelingPassenger.phone || '').trim();
    const passengerIdCard = (cancelingPassenger.docId || cancelingPassenger.cmnd || '').trim();

    // 2. Kiểm tra số tiền cọc
    const currentPaid = Number(booking.paid || 0);
    if (depositToSplit > currentPaid) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Số tiền cọc phân bổ (${depositToSplit.toLocaleString()} đ) lớn hơn tổng tiền cọc hiện có trên booking (${currentPaid.toLocaleString()} đ).` 
      });
    }

    const netRetention = Math.max(0, depositToSplit - feeToDeduct);
    if (netRetention <= 0 && feeToDeduct >= depositToSplit) {
      // Trường hợp phạt 100% cọc
      console.log(`[Deposit Retention] Cọc ${depositToSplit} bị trừ toàn bộ phí phạt ${feeToDeduct}. Số dư bảo lưu: 0đ.`);
    }

    // 3. Xác định người thụ hưởng tiền bảo lưu
    let creditedName = passengerName;
    let creditedPhone = passengerPhone;
    let creditedCustomerId = cancelingPassenger.customerId || null;

    if (creditToOption === 'booker') {
      creditedName = (booking.name || rawDetails.bookingInfo?.name || passengerName).trim();
      creditedPhone = (booking.phone || rawDetails.bookingInfo?.phone || passengerPhone).trim();
      creditedCustomerId = booking.customer_id || null;
    } else if (creditToOption === 'custom') {
      if (customCreditedName) creditedName = customCreditedName.trim();
      if (customCreditedPhone) creditedPhone = customCreditedPhone.trim();
    }

    // 4. Tính toán ngày hiệu lực và ngày hết hạn (Khóa cứng trần <= 365 ngày)
    const retentionDate = new Date();
    const expiryDate = new Date(retentionDate);
    expiryDate.setMonth(expiryDate.getMonth() + safeMonths);

    const creditCode = generateCreditCode();

    // 5. Tạo bản ghi Customer Credit (Ví bảo lưu)
    const creditInsert = await client.query(`
      INSERT INTO customer_credits (
        credit_code, customer_id, customer_name, customer_phone,
        original_booking_id, original_booking_code, original_tour_id, original_tour_code, original_tour_name,
        passenger_name, passenger_phone, passenger_id_card,
        credited_to_customer_id, credited_to_name, credited_to_phone,
        original_deposit, deduction_fee, retention_amount, remaining_balance,
        currency, status, retention_date, expiry_date, validity_months, notes,
        created_by, created_by_name
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18, $19,
        'VND', $20, $21, $22, $23, $24,
        $25, $26
      ) RETURNING *
    `, [
      creditCode,
      booking.customer_id || null,
      booking.name || rawDetails.bookingInfo?.name || null,
      booking.phone || rawDetails.bookingInfo?.phone || null,
      booking.id,
      booking.booking_code || `BK-${booking.id}`,
      booking.tour_departure_id || null,
      tourInfo?.code || tourInfo?.tour_code || null,
      tourInfo?.template_name || tourInfo?.title || 'Tour FIT TOUR',
      passengerName,
      passengerPhone,
      passengerIdCard,
      creditedCustomerId,
      creditedName,
      creditedPhone,
      depositToSplit,
      feeToDeduct,
      netRetention,
      netRetention,
      netRetention > 0 ? 'ACTIVE' : 'FULLY_USED',
      retentionDate.toISOString().slice(0, 10),
      expiryDate.toISOString().slice(0, 10),
      safeMonths,
      notes || `Tách từ Booking ${booking.booking_code || booking.id}. Khách ${passengerName} hủy chuyến và bảo lưu tiền cọc.`,
      req.user?.id || null,
      req.user?.full_name || 'Hệ thống'
    ]);

    const newCredit = creditInsert.rows[0];

    // 6. Ghi log giao dịch vào customer_credit_transactions
    if (netRetention > 0) {
      await client.query(`
        INSERT INTO customer_credit_transactions (
          credit_id, transaction_type, amount, balance_before, balance_after,
          target_booking_id, target_booking_code, target_tour_id, target_tour_name,
          notes, created_by, created_by_name
        ) VALUES ($1, 'CREDIT_IN', $2, 0, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        newCredit.id,
        netRetention,
        booking.id,
        booking.booking_code || `BK-${booking.id}`,
        booking.tour_departure_id,
        tourInfo?.template_name || 'Tour FIT TOUR',
        `Tạo khoản bảo lưu tiền cọc khi hủy 1 khách từ Booking ${booking.booking_code || booking.id}`,
        req.user?.id || null,
        req.user?.full_name || 'Hệ thống'
      ]);
    }

    // 7. CẬP NHẬT BOOKING GỐC (Co về số khách còn lại & điều chỉnh số tiền cọc)
    const updatedMembers = members.filter((_, idx) => idx !== pIdx);

    // Điều chỉnh bảng giá Pricing Rows: giảm 1 vé
    let pricingRows = Array.isArray(rawDetails.pricingRows) ? rawDetails.pricingRows : [];
    let reduced = false;
    let rowUnitPrice = 0;

    for (let r of pricingRows) {
      const q = Number(r.qty || 0);
      if (q > 0 && !reduced) {
        r.qty = q - 1;
        rowUnitPrice = Number(r.price || 0);
        r.total = Math.max(0, (r.qty * rowUnitPrice) + Number(r.surcharge || 0) - Number(r.discount || 0));
        reduced = true;
      }
    }

    // Tính lại Tổng tiền mới của Booking
    const newTotalPrice = pricingRows.length > 0 
      ? pricingRows.reduce((sum, r) => sum + Number(r.total || 0), 0)
      : Math.max(0, Number(booking.total_price || 0) - rowUnitPrice);

    const newPaidAmount = Math.max(0, currentPaid - depositToSplit);
    const newPaxCount = Math.max(1, (parseInt(booking.pax_count) || members.length) - 1);

    // Xác định trạng thái thanh toán mới
    let newPaymentStatus = 'unpaid';
    if (newPaidAmount >= newTotalPrice && newTotalPrice > 0) {
      newPaymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newPaymentStatus = 'partial';
    }

    // Ghi nhận lịch sử bảo lưu vào booking gốc
    rawDetails.members = updatedMembers;
    rawDetails.pricingRows = pricingRows;
    rawDetails.depositRetentionHistory = rawDetails.depositRetentionHistory || [];
    rawDetails.depositRetentionHistory.push({
      credit_id: newCredit.id,
      credit_code: creditCode,
      passenger_name: passengerName,
      deposit_split: depositToSplit,
      deduction_fee: feeToDeduct,
      net_retained: netRetention,
      credited_to: creditedName,
      retention_date: new Date().toISOString(),
      handled_by: req.user?.full_name || 'Sales'
    });

    const updatedNote = (booking.notes ? booking.notes + '\n' : '') + 
      `[BẢO LƯU ${creditCode}] Đã tách 1 khách (${passengerName}) hủy tour. Bảo lưu ${netRetention.toLocaleString()} đ (Hạn: ${expiryDate.toLocaleDateString('vi-VN')}).`;

    await client.query(`
      UPDATE bookings SET
        pax_count = $1,
        total_price = $2,
        paid = $3,
        payment_status = $4,
        raw_details = $5,
        notes = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [
      newPaxCount,
      newTotalPrice,
      newPaidAmount,
      newPaymentStatus,
      JSON.stringify(rawDetails),
      updatedNote,
      booking.id
    ]);

    // 8. Ghi nhận giao dịch giảm cọc trên booking_transactions
    await client.query(`
      INSERT INTO booking_transactions (
        booking_id, amount, payment_method, transaction_date, notes, created_by
      ) VALUES ($1, $2, 'CREDIT_RETENTION', CURRENT_DATE, $3, $4)
    `, [
      booking.id,
      -depositToSplit,
      `Tách tiền cọc ${depositToSplit.toLocaleString()} đ sang Phiếu Bảo Lưu ${creditCode} cho khách ${passengerName}`,
      req.user?.id || null
    ]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Đã tách và bảo lưu thành công ${netRetention.toLocaleString()} đ cho khách ${creditedName} (Mã phiếu: ${creditCode})!`,
      credit: newCredit,
      updatedBooking: {
        id: booking.id,
        pax_count: newPaxCount,
        total_price: newTotalPrice,
        paid: newPaidAmount,
        payment_status: newPaymentStatus,
        remaining: Math.max(0, newTotalPrice - newPaidAmount)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi trong splitAndRetainDeposit:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý tách booking và bảo lưu tiền cọc.' });
  } finally {
    client.release();
  }
};

/**
 * 2. Lấy danh sách phiếu bảo lưu tiền cọc còn hiệu lực (để cấn trừ)
 */
exports.getActiveCredits = async (req, res) => {
  try {
    const { phone, customer_id, search } = req.query;
    let query = `
      SELECT * FROM customer_credits 
      WHERE status IN ('ACTIVE', 'PARTIALLY_USED') 
        AND remaining_balance > 0 
        AND expiry_date >= CURRENT_DATE
    `;
    const params = [];

    if (phone) {
      params.push(`%${phone.trim().replace(/^0/, '')}%`);
      query += ` AND (credited_to_phone ILIKE $${params.length} OR passenger_phone ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`;
    } else if (customer_id) {
      params.push(customer_id);
      query += ` AND (credited_to_customer_id = $${params.length} OR customer_id = $${params.length})`;
    } else if (search) {
      params.push(`%${search.trim()}%`);
      query += ` AND (credit_code ILIKE $${params.length} OR credited_to_name ILIKE $${params.length} OR passenger_name ILIKE $${params.length} OR credited_to_phone ILIKE $${params.length})`;
    }

    query += ` ORDER BY id DESC LIMIT 20`;

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Lỗi trong getActiveCredits:', error);
    res.status(500).json({ error: 'Lỗi tải danh sách phiếu bảo lưu.' });
  }
};

/**
 * 3. Cấn trừ tiền cọc bảo lưu vào một Booking tour mới (Credit Drawdown)
 */
exports.drawdownCredit = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { creditId, targetBookingId, amount, notes = '' } = req.body;

    if (!creditId || !targetBookingId) {
      return res.status(400).json({ error: 'Thiếu creditId hoặc targetBookingId.' });
    }

    const drawdownAmt = Number(amount);
    if (!drawdownAmt || drawdownAmt <= 0) {
      return res.status(400).json({ error: 'Số tiền cấn trừ phải lớn hơn 0.' });
    }

    await client.query('BEGIN');

    // 1. Kiểm tra phiếu bảo lưu với FOR UPDATE
    const cCheck = await client.query('SELECT * FROM customer_credits WHERE id = $1 FOR UPDATE', [creditId]);
    if (cCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Không tìm thấy Phiếu bảo lưu tiền cọc.' });
    }
    const credit = cCheck.rows[0];

    const currentBalance = Number(credit.remaining_balance || 0);
    if (currentBalance < drawdownAmt) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Số dư bảo lưu còn lại (${currentBalance.toLocaleString()} đ) không đủ để cấn trừ ${drawdownAmt.toLocaleString()} đ.` 
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const expiryStr = new Date(credit.expiry_date).toISOString().slice(0, 10);
    if (expiryStr < todayStr) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Phiếu bảo lưu này đã hết hạn vào ngày ${new Date(credit.expiry_date).toLocaleDateString('vi-VN')}.` });
    }

    // 2. Kiểm tra Booking đích với FOR UPDATE
    const bCheck = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [targetBookingId]);
    if (bCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Không tìm thấy Booking đích cần cấn trừ.' });
    }
    const targetBooking = bCheck.rows[0];

    // Lấy thông tin tour đích
    let targetTourName = 'Tour FIT TOUR';
    if (targetBooking.tour_departure_id) {
      const tCheck = await client.query('SELECT template_name, title FROM tour_departures WHERE id = $1', [targetBooking.tour_departure_id]);
      if (tCheck.rows.length > 0) {
        targetTourName = tCheck.rows[0].template_name || tCheck.rows[0].title || targetTourName;
      }
    }

    // 3. Cập nhật số dư phiếu bảo lưu
    const newCreditBalance = currentBalance - drawdownAmt;
    const newCreditStatus = newCreditBalance === 0 ? 'FULLY_USED' : 'PARTIALLY_USED';

    await client.query(`
      UPDATE customer_credits SET
        remaining_balance = $1,
        status = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [newCreditBalance, newCreditStatus, credit.id]);

    // 4. Ghi nhận giao dịch rút tín dụng customer_credit_transactions
    await client.query(`
      INSERT INTO customer_credit_transactions (
        credit_id, transaction_type, amount, balance_before, balance_after,
        target_booking_id, target_booking_code, target_tour_id, target_tour_name,
        notes, created_by, created_by_name
      ) VALUES ($1, 'DRAWDOWN', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      credit.id,
      drawdownAmt,
      currentBalance,
      newCreditBalance,
      targetBooking.id,
      targetBooking.booking_code || `BK-${targetBooking.id}`,
      targetBooking.tour_departure_id,
      targetTourName,
      notes || `Cấn trừ ${drawdownAmt.toLocaleString()} đ vào Booking ${targetBooking.booking_code || targetBooking.id} (${targetTourName})`,
      req.user?.id || null,
      req.user?.full_name || 'Hệ thống'
    ]);

    // 5. Cập nhật tiền cọc đã thu trên Booking đích
    const currentTargetPaid = Number(targetBooking.paid || 0);
    const newTargetPaid = currentTargetPaid + drawdownAmt;
    const targetTotalPrice = Number(targetBooking.total_price || 0);

    let newTargetPaymentStatus = targetBooking.payment_status;
    if (newTargetPaid >= targetTotalPrice && targetTotalPrice > 0) {
      newTargetPaymentStatus = 'paid';
    } else if (newTargetPaid > 0) {
      newTargetPaymentStatus = 'partial';
    }

    const updatedBookingNotes = (targetBooking.notes ? targetBooking.notes + '\n' : '') +
      `[CẤN TRỪ CỌC] Đã cấn trừ ${drawdownAmt.toLocaleString()} đ từ Phiếu Bảo Lưu ${credit.credit_code} (${credit.credited_to_name}).`;

    await client.query(`
      UPDATE bookings SET
        paid = $1,
        payment_status = $2,
        notes = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [newTargetPaid, newTargetPaymentStatus, updatedBookingNotes, targetBooking.id]);

    // 6. Ghi nhận giao dịch thu tiền vào booking_transactions của Booking đích
    await client.query(`
      INSERT INTO booking_transactions (
        booking_id, amount, payment_method, transaction_date, notes, created_by
      ) VALUES ($1, $2, 'CREDIT_DRAWDOWN', CURRENT_DATE, $3, $4)
    `, [
      targetBooking.id,
      drawdownAmt,
      `Cấn trừ từ Phiếu Bảo Lưu Tiền Cọc ${credit.credit_code} (Chủ bảo lưu: ${credit.credited_to_name})`,
      req.user?.id || null
    ]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Đã cấn trừ thành công ${drawdownAmt.toLocaleString()} đ từ phiếu ${credit.credit_code} vào Booking ${targetBooking.booking_code || targetBooking.id}!`,
      remainingCreditBalance: newCreditBalance,
      targetBooking: {
        id: targetBooking.id,
        paid: newTargetPaid,
        payment_status: newTargetPaymentStatus,
        remaining: Math.max(0, targetTotalPrice - newTargetPaid)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi trong drawdownCredit:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi cấn trừ tiền bảo lưu.' });
  } finally {
    client.release();
  }
};

/**
 * 4. Lấy chi tiết phiếu bảo lưu để in chứng từ (Print Voucher)
 */
exports.getCreditVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT c.*, 
             COALESCE(u.full_name, c.created_by_name) as creator_full_name,
             u.phone as creator_phone
      FROM customer_credits c
      LEFT JOIN users u ON u.id = c.created_by
      WHERE c.id::text = $1::text OR c.credit_code = $1::text
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy Phiếu bảo lưu tiền cọc.' });
    }

    const credit = result.rows[0];

    // Lấy lịch sử giao dịch liên quan
    const txRes = await db.query(`
      SELECT * FROM customer_credit_transactions 
      WHERE credit_id = $1 
      ORDER BY id ASC
    `, [credit.id]);

    credit.transactions = txRes.rows;

    res.json({ success: true, data: credit });
  } catch (error) {
    console.error('Lỗi trong getCreditVoucher:', error);
    res.status(500).json({ error: 'Lỗi tải phiếu bảo lưu.' });
  }
};
