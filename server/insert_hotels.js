const db = require('./db');

const sampleHotels = [
    {
        code: 'HOTEL-001', name: 'Mường Thanh Luxury Lệ Giang', tax_id: '123456789', build_year: 2020,
        phone: '0901234567', email: 'booking@muongthanh.legiang.com', country: 'Trung Quốc', province: 'Vân Nam',
        address: '123 Phố Cổ Lệ Giang, Vân Nam, Trung Quốc', notes: 'Khách sạn có dịch vụ xe điện',
        star_rate: '5_star', website: 'https://muongthanh.legiang', hotel_class: 'Business',
        project_name: 'Resort Lệ Giang', bank_account_name: 'CTY TNHH MT Lệ Giang',
        bank_account_number: '1903456789', bank_name: 'Techcombank', market: 'Lệ Giang'
    },
    {
        code: 'HOTEL-002', name: 'InterContinental Bắc Kinh', tax_id: '987654321', build_year: 2018,
        phone: '+86 10 1234 5678', email: 'info@icbeijing.com', country: 'Trung Quốc', province: 'Bắc Kinh',
        address: 'Số 1 đường Vương Phủ Tỉnh, Bắc Kinh, Trung Quốc', notes: 'Vị trí rất đẹp, tiện lợi mua sắm',
        star_rate: '5_star', website: 'https://icbeijing.com', hotel_class: 'Luxury',
        project_name: 'Dự án IC', bank_account_name: 'IC Beijing Group',
        bank_account_number: '0011223344', bank_name: 'ICBC', market: 'Bắc Kinh'
    },
    {
        code: 'HOTEL-003', name: 'Himalaya View Hotel', tax_id: '654321987', build_year: 2015,
        phone: '+977 1 441 5566', email: 'contact@himalayaview.np', country: 'Nepal', province: 'Kathmandu',
        address: 'Thamel, Kathmandu, Nepal', notes: 'Cần đặt trước dịch vụ trekking',
        star_rate: '4_star', website: 'https://himalayaview.np', hotel_class: 'Adventure',
        project_name: '', bank_account_name: 'Himalaya Nepal LLC',
        bank_account_number: '9988776655', bank_name: 'Nepal Bank', market: 'Nepal'
    },
    {
        code: 'HOTEL-004', name: 'Tokyo Shinjuku Prince', tax_id: '112233445', build_year: 2010,
        phone: '+81 3 3205 1111', email: 'shinjuku@princehotels.jp', country: 'Nhật Bản', province: 'Tokyo',
        address: '1-30-1 Kabukicho, Shinjuku City, Tokyo', notes: 'Rất gần ga tàu, phù hợp đoàn nhỏ',
        star_rate: '4_star', website: 'https://princehotels.co.jp/shinjuku', hotel_class: 'Business',
        project_name: '', bank_account_name: 'Prince Hotels JP',
        bank_account_number: '123123123', bank_name: 'Mizuho Bank', market: 'Nhật Bản'
    },
    {
        code: 'HOTEL-005', name: 'JW Marriott Han River Đà Nẵng', tax_id: '564738291', build_year: 2022,
        phone: '0236 111 2222', email: 'booking@jwdanang.com', country: 'Việt Nam', province: 'Đà Nẵng',
        address: '123 Bạch Đằng, Đà Nẵng, Việt Nam', notes: 'Phòng view cầu Rồng, cao cấp MICE',
        star_rate: '5_star', website: 'https://jwmarriott.com/danang', hotel_class: 'Luxury',
        project_name: 'JW Danang City', bank_account_name: 'Tập đoàn JW Danang',
        bank_account_number: '987123987', bank_name: 'Vietcombank', market: 'Việt Nam (MICE)'
    },
    {
        code: 'HOTEL-006', name: 'Silk Road Oasis Resort', tax_id: '99884433', build_year: 2019,
        phone: '+998 71 123 4567', email: 'reservation@oasisresort.uz', country: 'Uzbekistan', province: 'Tashkent',
        address: 'Amir Temur Street, Tashkent, Uzbekistan', notes: 'Kiến trúc phong cách cổ đại',
        star_rate: 'resort', website: 'https://silkroadoasis.uz', hotel_class: 'Resort',
        project_name: '', bank_account_name: 'Oasis Resort LLC',
        bank_account_number: '11221122', bank_name: 'UzBank', market: 'Silk Road'
    }
];

const insertData = async () => {
    try {
        console.log('Bắt đầu chèn dữ liệu mẫu KHÁCH SẠN / NHÀ CUNG CẤP...');
        for (const h of sampleHotels) {
            await db.query(
                `INSERT INTO hotels (
                    code, name, tax_id, build_year, phone, email, country, province, 
                    address, notes, star_rate, website, hotel_class, project_name, 
                    bank_account_name, bank_account_number, bank_name, market
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
                [h.code, h.name, h.tax_id, h.build_year, h.phone, h.email, h.country, h.province, h.address, h.notes, h.star_rate, h.website, h.hotel_class, h.project_name, h.bank_account_name, h.bank_account_number, h.bank_name, h.market]
            );
            console.log(`Đã thêm: ${h.name} (${h.market})`);
        }
        console.log('Thành công! Đã chèn 6 nhà cung cấp mẫu.');
        process.exit(0);
    } catch (err) {
        console.error('Lỗi chèn dữ liệu:', err);
        process.exit(1);
    }
};

insertData();
