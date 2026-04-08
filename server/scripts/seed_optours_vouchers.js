const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
});

const generateRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const TOURS = [
  { name: 'CUNG ĐƯỜNG VÀNG NHẬT BẢN: TOKYO - KYOTO - OSAKA', code: 'JP-2605-001', duration: '6N5Đ' },
  { name: 'CHÂU ÂU 3 NƯỚC: PHÁP - THỤY SĨ - Ý', code: 'EU-2606-012', duration: '11N10Đ' },
  { name: 'KHÁM PHÁ TIỂU TÂY TẠNG LADAKH', code: 'LADAKH 26-04-26', duration: '8N7Đ' },
  { name: 'TOUR CAO CẤP BALI - NUSA PENIDA', code: 'BALI_00435', duration: '5N4Đ' },
  { name: 'MÔNG CỔ TRONG TÔI', code: 'MGL-2607-005', duration: '7N6Đ' },
  { name: 'HÀN QUỐC MÙA THU LÁ ĐỎ: SEOUL - NAMI', code: 'KR-2609-088', duration: '5N4Đ' },
  { name: 'THƯỢNG HẢI - HÀNG CHÂU - TÔ CHÂU - BẮC KINH', code: 'CN-2605-192', duration: '7N6Đ' },
  { name: 'DU LỊCH ĐÀI LOAN: ĐÀI BẮC - ĐÀI TRUNG', code: 'TW-2606-056', duration: '5N4Đ' },
  { name: 'KHÁM PHÁ AI CẬP HUYỀN BÍ', code: 'EG-2610-001', duration: '9N8Đ' },
  { name: 'ÚC DỊP TẾT DƯƠNG LỊCH: SYDNEY - MELBOURNE', code: 'AU-2612-002', duration: '7N6Đ' }
];

const CUSTOMERS = [
  { name: 'Trần Vũ Hoàng', phone: '0983950553' },
  { name: 'Lê Minh Thành', phone: '0934347670' },
  { name: 'Phạm Thị Hương', phone: '0898477599' },
  { name: 'Nguyễn Quang Dũng', phone: '0858385509' },
  { name: 'Đoàn Thuý An', phone: '0902585066' },
  { name: 'Vương Bảo Nam', phone: '0945889392' },
  { name: 'Bùi Thị Hà', phone: '0967332111' },
  { name: 'Ngô Ngọc Đăng', phone: '0913998822' }
];

const ADMIN_ID = 1; // Giả sử user admin ID là 1
const USERS = ['Admin', 'Ngô Ngọc Đăng Huy', 'Nguyễn Quỳnh Phương', 'Đoàn Thuý An'];

async function seedData() {
    console.log('🌱 Bắt đầu tạo dữ liệu bộ Demo Tour - Booking - Voucher...');
    try {
        // Lấy admin_id chính xác nếu có
        const userRes = await db.query("SELECT id, full_name FROM users ORDER BY id ASC LIMIT 5");
        const adminId = userRes.rows.length > 0 ? userRes.rows[0].id : 1;
        const bUsers = userRes.rows.length > 0 ? userRes.rows.map(u => u.full_name) : USERS;
        
        let voucherCount = 0;

        for (let i = 0; i < TOURS.length; i++) {
            const tourConf = TOURS[i];
            
            // Generate Random Tour Data
            const depDate = generateRandomDate(new Date(2026, 4, 1), new Date(2026, 11, 31));
            const retDate = new Date(depDate);
            retDate.setDate(retDate.getDate() + 5);
            
            const sellingPrice = Math.floor(Math.random() * 30000000) + 15000000;
            const singleSupp = 5000000;

            const tourInfo = {
                departure_date: depDate.toISOString().split('T')[0],
                return_date: retDate.toISOString().split('T')[0],
                selling_price: sellingPrice,
                single_supplement: singleSupp,
                transport_info: "Hàng không Bamboo",
                hotel_info: "Khách sạn 4 sao tiêu chuẩn quốc tế"
            };

            const tourRes = await db.query(
                `INSERT INTO op_tours (tour_code, tour_name, tour_info, status) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [tourConf.code, tourConf.name, tourInfo, 'Mở bán']
            );
            const tourId = tourRes.rows[0].id;
            
            // Add 1-3 Bookings per Tour
            const numBookings = Math.floor(Math.random() * 3) + 1;
            for (let b = 0; b < numBookings; b++) {
                const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
                
                const adultQty = Math.floor(Math.random() * 4) + 1;
                const totalAmount = adultQty * sellingPrice;
                
                // Randomly decide if paid fully, partially or not at all
                const paymentStatusRand = Math.random();
                let actualPaid = 0;
                let bStatus = 'Giữ chỗ';
                
                if (paymentStatusRand > 0.6) {
                    actualPaid = totalAmount; // Full
                    bStatus = 'Hoàn thành';
                } else if (paymentStatusRand > 0.2) {
                    actualPaid = Math.floor(totalAmount * 0.5); // Deposit
                    bStatus = 'Đã đặt cọc';
                }
                
                const rawDetails = {
                    qty_adult: adultQty,
                    qty_child: 0,
                    price_adult: sellingPrice,
                    passenger_list: Array.from({length: adultQty}, (_, i) => ({ full_name: i===0 ? customer.name : `Khách kèm ${i}`, phone: customer.phone })),
                    total_amount: totalAmount
                };

                const bookingRes = await db.query(
                    `INSERT INTO op_tour_bookings (id, tour_id, name, phone, raw_details, total, paid, status, created_by)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                    [`B-${Math.floor(Math.random() * 1000000)}`, tourId, customer.name, customer.phone, rawDetails, totalAmount, actualPaid, bStatus, adminId]
                );
                
                const bookingId = bookingRes.rows[0].id;

                // If paid > 0, generate vouchers
                if (actualPaid > 0) {
                    const method = ['Chuyển khoản', 'Tiền mặt', 'Cà thẻ'][Math.floor(Math.random() * 3)];
                    const creatorName = bUsers[Math.floor(Math.random() * bUsers.length)];
                    
                    if (actualPaid === totalAmount && totalAmount > 20000000 && Math.random() > 0.5) {
                        // Split into 2 vouchers
                        const deposit = Math.floor(totalAmount * 0.4);
                        const rest = totalAmount - deposit;
                        
                        // Voucher 1: Deposit
                        await generateVoucher(db, tourId, bookingId, tourConf.code, `Thanh toán lần 1 - ${tourConf.name}`, deposit, method, customer, creatorName, -10);
                        // Voucher 2: Rest
                        await generateVoucher(db, tourId, bookingId, tourConf.code, `Thanh toán lần 2 (Tất toán)`, rest, method, customer, creatorName, -2);
                        voucherCount += 2;
                    } else {
                        // 1 Voucher
                        const title = actualPaid === totalAmount ? 'Thanh toán tất toán' : 'Thanh toán đặt cọc';
                        await generateVoucher(db, tourId, bookingId, tourConf.code, title, actualPaid, method, customer, creatorName, -5);
                        voucherCount += 1;
                    }
                }
            }
        }
        
        console.log(`✅ Đã tạo thành công 10 Tours Nhanh!`);
        console.log(`✅ Đã tạo thành công hàng chục Bookings!`);
        console.log(`✅ Đã tạo thành công ${voucherCount} Phiếu thu Demo!`);

    } catch (err) {
        console.error('❌ Lỗi tạo dữ liệu:', err);
    } finally {
        db.end();
    }
}

async function generateVoucher(db, tourId, bookingId, code, title, amount, method, customer, creator, daysAgo) {
    const randomVoucherCode = `PT-${new Date().getTime().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() + daysAgo);
    
    await db.query(
        `INSERT INTO payment_vouchers 
         (voucher_code, tour_id, booking_id, title, amount, payment_method, payer_name, payer_phone, status, created_by_name, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [randomVoucherCode, tourId, bookingId, title, amount, method, customer.name, customer.phone, 'Đã duyệt', creator, createdDate]
    );
}

seedData();
