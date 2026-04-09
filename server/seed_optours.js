const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/fittour_local',
});

async function run() {
    try {
        console.log("Looking for Tour: TOUR-BHUTAN-5N4-DEP-20261111...");
        let tourRes = await pool.query("SELECT id, tour_template_id FROM tour_departures WHERE code = $1", ["TOUR-BHUTAN-5N4-DEP-20261111"]);
        let depId;
        let tempId;
        
        if (tourRes.rows.length === 0) {
            console.log("Tour not found, wait...");
            process.exit(1);
        } else {
            depId = tourRes.rows[0].id;
            tempId = tourRes.rows[0].tour_template_id;
        }
        console.log(`✅ Found Dep ID: ${depId}, Temp ID: ${tempId}`);
        
        // 1. Create 3 sales accounts
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const sales = [
            { username: 'sale1', role: 'sales', full_name: 'Sale Một' },
            { username: 'sale2', role: 'sales', full_name: 'Sale Hai' },
            { username: 'sale3', role: 'sales', full_name: 'Sale Ba' }
        ];
        
        const saleIds = {};
        for (const s of sales) {
            let sRes = await pool.query("SELECT id FROM users WHERE username = $1", [s.username]);
            if (sRes.rows.length === 0) {
                const res = await pool.query(
                    "INSERT INTO users (username, password, role, role_id, full_name, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING id",
                    [s.username, hashedPassword, s.role, 2, s.full_name]
                );
                saleIds[s.username] = { id: res.rows[0].id, name: s.full_name };
            } else {
                saleIds[s.username] = { id: sRes.rows[0].id, name: s.full_name };
            }
        }
        console.log("✅ Created/Found Sales accounts", saleIds);
        
        // 2. Generate random Bookings
        const customers = [
            { name: "Phạm Văn Long", phone: "0901200000", cmnd: "079012300000", email: "longnew@gmail.com", price: 29900000, qty: 2, status: "Giữ chỗ", dob: '1985-10-15', gender: 'Nam' },
            { name: "Nguyễn Thị Thuỷ", phone: "0987600000", cmnd: "079876500000", email: "thuynew@gmail.com", price: 29900000, qty: 1, status: "Đã đặt cọc", paid: 15000000, dob: '1990-05-20', gender: 'Nữ' },
            { name: "Lê Đức Anh", phone: "0933400000", cmnd: "001090100000", email: "anhlenew@gmail.com", price: 29900000, qty: 4, status: "Đã thanh toán", paid: 119600000, dob: '1982-12-05', gender: 'Nam' },
            { name: "Trần Bảo Ngọc", phone: "0911200000", cmnd: "002085300000", email: "ngocnew@gmail.com", price: 29900000, qty: 3, status: "Giữ chỗ", dob: '1995-03-08', gender: 'Nữ' },
            { name: "Vũ Hải Đăng", phone: "0944500000", cmnd: "077092100000", email: "dangnew@gmail.com", price: 29900000, qty: 1, status: "Hoàn", paid: 29900000, dob: '1980-01-25', gender: 'Nam' },
            { name: "Hoa Hậu", phone: "0999800000", cmnd: "075195600000", email: "hoanew@gmail.com", price: 29900000, qty: 2, status: "Đã đặt cọc", paid: 30000000, dob: '1998-11-11', gender: 'Nữ' },
            { name: "Khách VIP 101", phone: "0888900000", cmnd: "079088100000", email: "k101new@gmail.com", price: 29900000, qty: 10, status: "Đã thanh toán", paid: 299000000, dob: '1970-07-07', gender: 'Nam' },
        ];
        
        let i = 0;
        const salesKeys = Object.keys(saleIds);
        
        for (const cust of customers) {
            const saleKey = salesKeys[i % salesKeys.length];
            const saleUser = saleIds[saleKey];
            i++;
            
            // Upsert customer
            let cusRes = await pool.query("SELECT id FROM customers WHERE phone = $1", [cust.phone]);
            let cusId;
            if (cusRes.rows.length === 0) {
                const newCus = await pool.query(
                    "INSERT INTO customers (name, phone, email, id_card, gender, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                    [cust.name, cust.phone, cust.email, cust.cmnd, cust.gender, cust.dob]
                );
                cusId = newCus.rows[0].id;
            } else {
                cusId = cusRes.rows[0].id;
            }

            const total = cust.qty * cust.price;
            const paid = cust.paid || 0;
            
            let membersArray = [];
            for(let j=0; j<cust.qty; j++) {
                if(j === 0) {
                     membersArray.push({
                        name: cust.name,
                        phone: cust.phone,
                        docId: cust.cmnd,
                        gender: cust.gender,
                        dob: cust.dob,
                        ageType: "Người lớn",
                        roomType: "Phòng đôi",
                     });
                } else {
                     if (cust.qty > 5) {
                          membersArray.push({ name: "", phone: "", ageType: "Người lớn" });
                     } else {
                          membersArray.push({ name: `Gia đình ${cust.name.split(' ').pop()} ${j}`, phone: "", ageType: j % 2 === 0 ? "Trẻ em" : "Người lớn" });
                     }
                }
            }
            
            const rawDetails = {
                bookingInfo: {
                    priceNL: cust.price,
                    quantityNL: cust.qty,
                    totalSurcharge: 0,
                    totalDiscount: 0,
                    finalAmount: total,
                    paymentMethod: "Bank Transfer",
                    gender: cust.gender,
                    reservationCode: "RES" + Math.floor(Math.random()*9000+1000)
                },
                pricingRows: [
                    { ageType: 'Người lớn', qty: cust.qty, price: cust.price, total: total }
                ],
                members: membersArray
            };
            
            const bkCode = "BK" + Date.now().toString().substring(5) + i;
            
            const bkRes = await pool.query(
                `INSERT INTO bookings (tour_departure_id, tour_id, customer_id, booking_code, total_price, paid, booking_status, raw_details, created_by, created_by_name) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                 [depId, tempId, cusId, bkCode, total, paid, cust.status, JSON.stringify(rawDetails), saleUser.id, saleUser.name]
            );
            
            const bookingId = bkRes.rows[0].id;
            
            if (paid > 0) {
                await pool.query(
                    `INSERT INTO payment_vouchers (voucher_code, tour_id, booking_id, title, amount, payment_method, payer_name, payer_phone, status, notes, created_by, created_by_name)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                     [`PT-SEED-${bookingId}`, depId, bookingId, `Thu cọc/thanh toán tour`, paid, 'Chuyển khoản', cust.name, cust.phone, 'Hoàn thành', 'Đã thu tiền từ khách', saleUser.id, saleUser.name]
                );
            }
        }
        
        console.log(`✅ Seeded ${customers.length} bookings for tour departure ${depId}!`);
        console.log("✅ Seeded Phiếu Thu for bookings with payments!");
        
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
