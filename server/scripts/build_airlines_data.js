require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Bản đồ Mapping bằng AI
const AIRLINES_MAP = {
    'air-asia.png': { code: 'AK', name: 'Air Asia', market: 'Đông Nam Á', type: 'international' },
    'air-china.png': { code: 'CA', name: 'Air China', market: 'Trung Quốc Đại Lục', type: 'international' },
    'air-india-2023.png': { code: 'AI', name: 'Air India', market: 'Nam Á & Himalayas', type: 'international' },
    'asiana.png': { code: 'OZ', name: 'Asiana Airlines', market: 'Đông Bắc Á', type: 'international' },
    'bamboo-airways.png': { code: 'QH', name: 'Bamboo Airways', market: 'Việt Nam', type: 'domestic' },
    'bangkok-airway.png': { code: 'PG', name: 'Bangkok Airways', market: 'Đông Nam Á', type: 'international' },
    'british-airway.png': { code: 'BA', name: 'British Airways', market: 'Châu Âu & Nga', type: 'international' },
    'cathay-pacific.jpg': { code: 'CX', name: 'Cathay Pacific', market: 'Đông Bắc Á', type: 'international' },
    'china-eastean.png': { code: 'MU', name: 'China Eastern Airlines', market: 'Trung Quốc Đại Lục', type: 'international' },
    'china-soundthern.png': { code: 'CZ', name: 'China Southern Airlines', market: 'Trung Quốc Đại Lục', type: 'international' },
    'drukair-royal-bhutan-airlines.png': { code: 'KB', name: 'Drukair Royal Bhutan', market: 'Nam Á & Himalayas', type: 'international' },
    'eva-air.png': { code: 'BR', name: 'EVA Air', market: 'Đông Bắc Á', type: 'international' },
    'fly-emirate.png': { code: 'EK', name: 'Emirates', market: 'Trung Đông & Châu Phi', type: 'international' },
    'japan-airlines.png': { code: 'JL', name: 'Japan Airlines', market: 'Đông Bắc Á', type: 'international' },
    'jetstar.png': { code: 'BL', name: 'Jetstar Pacific', market: 'Việt Nam', type: 'domestic' },
    'korean-air.png': { code: 'KE', name: 'Korean Air', market: 'Đông Bắc Á', type: 'international' },
    'malaysia-airlines.png': { code: 'MH', name: 'Malaysia Airlines', market: 'Đông Nam Á', type: 'international' },
    'qatar-airways.png': { code: 'QR', name: 'Qatar Airways', market: 'Trung Đông & Châu Phi', type: 'international' },
    'ruili-airlines.png': { code: 'DR', name: 'Ruili Airlines', market: 'Trung Quốc Đại Lục', type: 'international' },
    'shenzhen-airlines.png': { code: 'ZH', name: 'Shenzhen Airlines', market: 'Trung Quốc Đại Lục', type: 'international' },
    'sichuan-airlines.jpg': { code: '3U', name: 'Sichuan Airlines', market: 'Trung Quốc Đại Lục', type: 'international' },
    'singapore-airline.png': { code: 'SQ', name: 'Singapore Airlines', market: 'Đông Nam Á', type: 'international' },
    'starflyer.png': { code: '7G', name: 'StarFlyer', market: 'Đông Bắc Á', type: 'international' },
    'thai.png': { code: 'TG', name: 'Thai Airways', market: 'Đông Nam Á', type: 'international' },
    'tiger-air.png': { code: 'TR', name: 'Tigerair', market: 'Đông Nam Á', type: 'international' },
    'turkish-airlines.png': { code: 'TK', name: 'Turkish Airlines', market: 'Trung Đông & Châu Phi', type: 'international' },
    'united-airlines.jpg': { code: 'UA', name: 'United Airlines', market: 'Khác', type: 'international' },
    'vietjet.jpg': { code: 'VJ', name: 'VietJet Air', market: 'Việt Nam', type: 'domestic' },
    'vietstar-airlines.png': { code: 'VS', name: 'Vietstar Airlines', market: 'Việt Nam', type: 'domestic' },
    'viettravel-airlines.jpg': { code: 'VU', name: 'Vietravel Airlines', market: 'Việt Nam', type: 'domestic' },
    'vn-air.jpg': { code: 'VN', name: 'Vietnam Airlines', market: 'Việt Nam', type: 'domestic' }
};

async function buildAndImportData() {
    const dir = path.join(__dirname, '../../client/public/airlines');
    const files = Object.keys(AIRLINES_MAP);
    const compiledData = [];

    files.forEach(file => {
        if (file.startsWith('.')) return;
        const mapInfo = AIRLINES_MAP[file];
        if (mapInfo) {
            compiledData.push({
                code: mapInfo.code,
                name: mapInfo.name,
                market: mapInfo.market,
                airline_class: mapInfo.type,
                logo_url: file
            });
        }
    });

    console.log(`Bắt đầu xử lý ${compiledData.length} hãng bay chuẩn hoá.`);

    // 1. Ghi Excel
    const ws = xlsx.utils.json_to_sheet(compiledData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Airlines");
    const outPath = path.join(__dirname, 'airlines_seed_data.xlsx');
    xlsx.writeFile(wb, outPath);
    console.log('✅ Đã tạo file Excel mẫu: ' + outPath);

    // 2. Insert vào Database localhost
    let insertedCount = 0;
    for (const data of compiledData) {
        try {
            // Kiểm tra xem đã tồn tại chưa
            const check = await db.query('SELECT id FROM airlines WHERE code = $1', [data.code]);
            if (check.rows.length > 0) {
                // Update
                await db.query(
                    'UPDATE airlines SET name=$1, market=$2, airline_class=$3, logo_url=$4 WHERE code=$5',
                    [data.name, data.market, data.airline_class, data.logo_url, data.code]
                );
            } else {
                // Insert
                await db.query(
                    'INSERT INTO airlines (code, name, market, airline_class, logo_url) VALUES ($1, $2, $3, $4, $5)',
                    [data.code, data.name, data.market, data.airline_class, data.logo_url]
                );
                insertedCount++;
            }
        } catch (err) {
            console.error(`Lỗi khi insert ${data.name}:`, err.message);
        }
    }

    console.log(`✅ Đã đồng bộ xong dữ liệu cho ${compiledData.length} hãng (Thêm mới: ${insertedCount}).`);
    process.exit(0);
}

buildAndImportData();
