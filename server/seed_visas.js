const axios = require('axios');

// First login to get token
async function seed() {
    try {
        // Login
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Logged in successfully');

        const sampleVisas = [
            {
                code: 'VISA-UC-001',
                name: 'VISA ÚC 1PAX - VŨ MAI PHÚC SƯƠNG',
                customer_name: 'Vũ Mai Phúc Sương',
                customer_phone: '0639874552',
                customer_type: 'Cá nhân',
                status: 'Tạo mới',
                market: 'Úc',
                visa_type: 'Du lịch',
                receipt_date: '2025-10-28',
                quantity: 1,
                service_package: 'Bao đậu',
                finance_data: {
                    suppliers: [{
                        name: 'NCC Visa Úc',
                        code: 'NCC-001',
                        services: [{
                            name: 'Phí xin Visa',
                            sale_price: 6500000, net_price: 2490000, fx: 1, quantity: 1, surcharge: 0, vat: 0
                        }]
                    }],
                    commissions: []
                }
            },
            {
                code: 'VISA-UC-002',
                name: 'VISA ÚC - 5 PAX GĐ NGUYỄN THỊ KIM PHƯỢNG',
                customer_name: 'Nguyễn Thị Kim Phượng',
                customer_phone: '0932831668',
                customer_type: 'Cá nhân',
                status: 'Đã duyệt',
                market: 'Úc',
                visa_type: 'Thăm thân',
                receipt_date: '2025-06-17',
                quantity: 5,
                service_package: 'Dịch vụ thường',
                finance_data: {
                    suppliers: [{
                        name: 'NCC Visa Úc Premium',
                        code: 'NCC-002',
                        services: [{
                            name: 'Phí xin Visa x5',
                            sale_price: 6000000, net_price: 2180000, fx: 1, quantity: 5, surcharge: 0, vat: 0
                        }]
                    }],
                    commissions: [{ sales_name: 'Nguyễn Ngọc Tường Vy', percent: 30 }]
                }
            },
            {
                code: 'VISA-EU-003',
                name: 'VISA CHÂU ÂU 2PAX - QUANG MINH TÂN',
                customer_name: 'Quang Minh Tân',
                customer_phone: '0901111222',
                customer_type: 'Cộng tác viên',
                status: 'Chờ xin',
                market: 'Châu Âu',
                visa_type: 'Du lịch',
                receipt_date: '2025-04-08',
                quantity: 2,
                service_package: 'Hàn Multi Khan',
                finance_data: {
                    suppliers: [{
                        name: 'Đại sứ quán Pháp',
                        code: 'NCC-EU',
                        services: [{
                            name: 'Phí Visa Schengen',
                            sale_price: 4600000, net_price: 960000, fx: 1, quantity: 2, surcharge: 0, vat: 0
                        }]
                    }],
                    commissions: []
                }
            },
            {
                code: 'VISA-US-004',
                name: 'VISA MỸ - LÊ VĂN TÂM XAO ĐỊNH',
                customer_name: 'Tú Bảo Nhi',
                customer_phone: '0365746768',
                customer_type: 'Cá nhân',
                status: 'Thành công',
                market: 'Mỹ',
                visa_type: 'Du lịch',
                receipt_date: '2025-03-31',
                quantity: 1, 
                service_package: 'Bao đậu',
                finance_data: {
                    suppliers: [{
                        name: 'NCC Visa Mỹ',
                        code: 'NCC-US',
                        services: [{
                            name: 'Phí xin Visa B1/B2',
                            sale_price: 4400000, net_price: 1840000, fx: 1, quantity: 1, surcharge: 0, vat: 0
                        }]
                    }],
                    commissions: [{ sales_name: 'Lê Văn Tâm', percent: 25 }]
                }
            },
            {
                code: 'VISA-FR-005',
                name: 'VISA PHÁP 2 PAX - BT TOUR',
                customer_name: 'Phạm Thị Kim Anh',
                customer_phone: '0862526888',
                customer_type: 'Cộng tác viên',
                status: 'Đã duyệt',
                market: 'Châu Âu',
                visa_type: 'Du lịch',
                receipt_date: '2025-03-21',
                quantity: 2,
                service_package: 'Dịch vụ thường',
                finance_data: {
                    suppliers: [{
                        name: 'NCC Pháp',
                        code: 'NCC-FR',
                        services: [{
                            name: 'Phí Visa Schengen',
                            sale_price: 4584000, net_price: 600500, fx: 1, quantity: 2, surcharge: 0, vat: 0
                        }]
                    }],
                    commissions: [{ sales_name: 'Nguyễn Ngọc Tường Vy', percent: 40 }]
                }
            },
            {
                code: 'VISA-JP-006',
                name: 'VISA NHẬT BẢN 3PAX - GĐ TRẦN MINH',
                customer_name: 'Trần Văn Minh',
                customer_phone: '0908765432',
                customer_type: 'Cá nhân',
                status: 'Tạo mới',
                market: 'Nhật Bản',
                visa_type: 'Du lịch',
                receipt_date: '2025-04-15',
                quantity: 3,
                service_package: 'Dịch vụ thường',
                finance_data: {
                    suppliers: [{
                        name: 'VFS Nhật Bản',
                        code: 'NCC-JP',
                        services: [{
                            name: 'Phí Visa Nhật',
                            sale_price: 3200000, net_price: 1200000, fx: 1, quantity: 3, surcharge: 500000, vat: 0
                        }]
                    }],
                    commissions: []
                }
            },
            {
                code: 'VISA-KR-007',
                name: 'VISA HÀN QUỐC - NGUYỄN THỊ HỒNG',
                customer_name: 'Nguyễn Thị Hồng',
                customer_phone: '0912345678',
                customer_type: 'Cá nhân',
                status: 'Không duyệt',
                market: 'Hàn Quốc',
                visa_type: 'Du lịch',
                receipt_date: '2025-04-01',
                quantity: 1,
                service_package: 'Dịch vụ thường',
                finance_data: {
                    suppliers: [{
                        name: 'Đại sứ quán Hàn',
                        code: 'NCC-KR',
                        services: [{
                            name: 'Phí Visa Hàn',
                            sale_price: 2800000, net_price: 800000, fx: 1, quantity: 1, surcharge: 0, vat: 0
                        }]
                    }],
                    commissions: []
                }
            },
            {
                code: 'VISA-UK-008',
                name: 'VISA ANH QUỐC 2PAX - FAMILY LÊ',
                customer_name: 'Lê Thị Mai Anh',
                customer_phone: '0987654321',
                customer_type: 'Cá nhân',
                status: 'Quá hạn xin',
                market: 'Anh',
                visa_type: 'Thăm thân',
                receipt_date: '2025-02-15',
                quantity: 2,
                service_package: 'Bao đậu',
                finance_data: {
                    suppliers: [{
                        name: 'VFS Anh Quốc',
                        code: 'NCC-UK',
                        services: [{
                            name: 'Phí Visa UK',
                            sale_price: 7500000, net_price: 3200000, fx: 1, quantity: 2, surcharge: 1000000, vat: 0
                        }]
                    }],
                    commissions: [{ sales_name: 'Lê Văn Tâm', percent: 35 }]
                }
            }
        ];

        let created = 0;
        for (const visa of sampleVisas) {
            try {
                await axios.post('http://localhost:5001/api/visas', visa, { headers });
                created++;
                console.log(`  ✅ Created: ${visa.code} - ${visa.name}`);
            } catch (err) {
                console.log(`  ⚠️ Skipped ${visa.code}: ${err.response?.data?.message || err.message}`);
            }
        }

        console.log(`\n🎉 Done! Created ${created}/${sampleVisas.length} sample visa records.`);
        console.log('👉 Refresh http://localhost:3000/visas to see them!');
    } catch (err) {
        console.error('❌ Error:', err.response?.data?.message || err.message);
    }
}

seed();
