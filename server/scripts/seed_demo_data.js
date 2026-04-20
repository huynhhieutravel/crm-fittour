require('dotenv').config();
const db = require('../db');

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const names = [
    "Nguyễn Thị Hương", "Trần Văn Nam", "Lê Thanh Tùng", "Hoàng Bích Liên", 
    "Phạm Quang Hiếu", "Đỗ Minh Hà", "Đoàn Thúy An", "Ngô Bá Khá", "Vũ Ngọc Ánh"
];
const phones = ["0988123456", "0909567890", "0912111222", "0977301159", "0836999909"];

async function run() {
    try {
        console.log("Tìm 2 tour đầu tiên...");
        const tourRes = await db.query(`
            SELECT id, code 
            FROM tour_departures 
            WHERE code IN ('TOUR-NAM-MY-14N-DEP-20260421', 'TOUR-THANH-TANG-DEP-20260423')
        `);

        if (tourRes.rows.length === 0) {
            console.log("Không tìm thấy tour nào có mã như ảnh, sẽ lấy 2 tour gần đây nhất.");
            const t2 = await db.query(`SELECT id, code FROM tour_departures ORDER BY start_date DESC LIMIT 2`);
            tourRes.rows.push(...t2.rows);
        }

        console.log(`Đã tìm thấy ${tourRes.rows.length} tour. Tiến hành tạo Booking, Khách và Phiếu Thu...`);

        // Get an admin account
        const accRes = await db.query(`SELECT id, username FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1) LIMIT 1`);
        const admin = accRes.rows[0] || { id: 1, username: 'admin' };

        // Create a dummy customer if none exists
        let custRes = await db.query(`SELECT id, name, phone FROM customers LIMIT 10`);
        if (custRes.rows.length === 0) {
            const tempCust = await db.query(`INSERT INTO customers (name, phone) VALUES ('Nguyen Van A', '0999999999') RETURNING id, name, phone`);
            custRes = { rows: [tempCust.rows[0]] };
        }

        for (const tour of tourRes.rows) {
            const numBookings = randomInt(3, 5);
            for (let i = 0; i < numBookings; i++) {
                const customer = custRes.rows[randomInt(0, custRes.rows.length - 1)];
                const quantity = randomInt(1, 4);
                
                const pricePerPax = tour.code.includes('NAM-MY') ? 145000000 : 55000000;
                const total_price = pricePerPax * quantity;
                
                const pType = randomInt(1, 3);
                let paid = 0;
                let status = 'Giữ chỗ';
                if (pType === 2) {
                    paid = total_price / 2;
                    status = 'Đã đặt cọc';
                } else if (pType === 3) {
                    paid = total_price;
                    status = 'Đã thanh toán';
                }

                // Insert Booking
                const bCode = 'BK_RND_' + Math.floor(Math.random() * 100000);
                const rmDetails = {
                    bookingInfo: { reservationCode: bCode },
                    customerInfo: { name: names[randomInt(0, names.length-1)], phone: phones[randomInt(0, phones.length-1)] }
                };

                const bookingRes = await db.query(`
                    INSERT INTO bookings (
                        booking_code, tour_departure_id, customer_id, pax_count, 
                        total_price, paid, booking_status, payment_status, raw_details,
                        created_by, created_by_name
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id
                `, [bCode, tour.id, customer.id, quantity, total_price, paid, status, 'Chưa gửi', JSON.stringify(rmDetails), admin.id, admin.username]);
                
                const bookingId = bookingRes.rows[0].id;

                // Create Voucher if paid > 0
                if (paid > 0) {
                    const rnd = Math.floor(Math.random() * 100);
                    const voucherCode = `PT-${bCode}-260426-${rnd}`;
                    const method = paid === total_price ? 'Chuyển khoản ngân hàng' : 'Tiền mặt';
                    const title = paid === total_price ? `Thanh toán 100% tour ${tour.code}` : `Đặt cọc 50% tour ${tour.code}`;

                    await db.query(`
                        INSERT INTO payment_vouchers (
                            voucher_code, tour_id, booking_id, title, amount, 
                            payment_method, payer_name, payer_phone, notes,
                            created_by, created_by_name, status
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Đã duyệt')
                    `, [
                        voucherCode, tour.id, bookingId, title, paid,
                        method, customer.name, customer.phone, 
                        '(Phiếu có giá trị khi có đầy đủ sự xác nhận và đóng dấu của công ty)',
                        admin.id, admin.username
                    ]);
                }
            }
            console.log(`- Xong tour ${tour.code}`);
        }
        console.log("Đã seed xong dữ liệu mẫu thành công!");
    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        process.exit(0);
    }
}

run();
