const xlsx = require('xlsx');
const path = require('path');

// Extract all valid markets
const MARKET_OPTIONS = [
    {
        label: 'Việt Nam',
        options: [
            { value: 'Việt Nam (MICE)', label: 'Việt Nam (MICE)' },
            { value: 'TP.HCM', label: 'TP.HCM' },
            { value: 'Hà Nội', label: 'Hà Nội' },
            { value: 'Nha Trang', label: 'Nha Trang' },
            { value: 'Vũng Tàu', label: 'Vũng Tàu' },
            { value: 'Đà Lạt', label: 'Đà Lạt' },
            { value: 'Bảo Lộc', label: 'Bảo Lộc' },
            { value: 'Đà Nẵng', label: 'Đà Nẵng' },
            { value: 'Phan Thiết', label: 'Phan Thiết' },
            { value: 'Phú Quốc', label: 'Phú Quốc' },
            { value: 'Hạ Long', label: 'Hạ Long' },
            { value: 'Đồng Nai', label: 'Đồng Nai' },
            { value: 'Miền Tây', label: 'Miền Tây' },
            { value: 'Cần Thơ', label: 'Cần Thơ' }
        ]
    },
    {
        label: 'Trung Quốc Đại Lục',
        options: [
            { value: 'Trung Quốc', label: 'Trung Quốc (Chung)' },
            { value: 'Bắc Kinh', label: 'Bắc Kinh' },
            { value: 'Cáp Nhĩ Tân', label: 'Cáp Nhĩ Tân' },
            { value: 'Cửu Trại Câu', label: 'Cửu Trại Câu' },
            { value: 'Giang Nam', label: 'Giang Nam' },
            { value: 'Giang Tây', label: 'Giang Tây' },
            { value: 'Lệ Giang', label: 'Lệ Giang' },
            { value: 'Tân Cương', label: 'Tân Cương' },
            { value: 'Tây An', label: 'Tây An' },
            { value: 'Tây Tạng', label: 'Tây Tạng' },
            { value: 'Vân Nam', label: 'Vân Nam' },
            { value: 'Á Đinh', label: 'Á Đinh' }
        ]
    },
    {
        label: 'Đông Bắc Á',
        options: [
            { value: 'Hàn Quốc', label: 'Hàn Quốc' },
            { value: 'Nhật Bản', label: 'Nhật Bản' },
            { value: 'Mông Cổ', label: 'Mông Cổ' },
            { value: 'Đài Loan', label: 'Đài Loan' }
        ]
    },
    {
        label: 'Nam Á & Himalayas',
        options: [
            { value: 'Bhutan', label: 'Bhutan' },
            { value: 'Himalayas', label: 'Himalayas' },
            { value: 'Kailash', label: 'Kailash' },
            { value: 'Kashmir', label: 'Kashmir' },
            { value: 'Ladakh', label: 'Ladakh' },
            { value: 'Nepal', label: 'Nepal' },
            { value: 'Pakistan', label: 'Pakistan' }
        ]
    },
    {
        label: 'Trung Á & Lân Cận',
        options: [
            { value: 'Trung Á', label: 'Trung Á' },
            { value: 'Caucasus', label: 'Caucasus' },
            { value: 'Silk Road', label: 'Silk Road' }
        ]
    },
    {
        label: 'Đông Nam Á',
        options: [
            { value: 'Đông Nam Á', label: 'Đông Nam Á' },
            { value: 'Bromo', label: 'Bromo' },
            { value: 'Thái Lan', label: 'Thái Lan' },
            { value: 'Singapore', label: 'Singapore' },
            { value: 'Malaysia', label: 'Malaysia' }
        ]
    },
    {
        label: 'Châu Âu & Nga',
        options: [
            { value: 'Châu Âu', label: 'Châu Âu' },
            { value: 'Nga - Murmansk', label: 'Nga - Murmansk' }
        ]
    },
    {
        label: 'Trung Đông & Châu Phi',
        options: [
            { value: 'Trung Đông', label: 'Trung Đông' },
            { value: 'Thổ Nhĩ Kỳ', label: 'Thổ Nhĩ Kỳ' },
            { value: 'Dubai', label: 'Dubai' },
            { value: 'Ai Cập', label: 'Ai Cập' },
            { value: 'Morocco', label: 'Morocco' },
            { value: 'Châu Phi', label: 'Châu Phi' }
        ]
    }
];

const validDests = new Set();
MARKET_OPTIONS.forEach(g => g.options.forEach(o => validDests.add(o.value)));

const inputFile = path.join(__dirname, '../data_import/BU3-tour-doan-cleaned.xlsx');

function verify() {
    const workbook = xlsx.readFile(inputFile, { raw: false });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    // Column I is index 8
    const invalid = new Set();
    const headers = data[3]; // Row 4
    
    for (let i = 4; i < data.length; i++) {
        let name = data[i][4]; // Col E
        if (!name || name === '') continue;
        let dest = data[i][8]; // Col I
        if (dest && !validDests.has(dest.trim())) {
            invalid.add(dest.trim());
        }
    }
    
    console.log("DESTINATIONS IN EXCEL THAT ARE NOT IN MARKETS.JS:");
    [...invalid].forEach(d => console.log("- " + d));
}

verify();
