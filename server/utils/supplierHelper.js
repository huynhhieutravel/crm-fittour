const db = require('../db');

exports.generateSupplierCode = async (client, tableName, prefix) => {
    // Tìm các mã bắt đầu bằng tiền tố
    const res = await client.query(`SELECT code FROM ${tableName} WHERE code LIKE $1`, [`${prefix}%`]);
    let maxNum = 0;
    
    for (let row of res.rows) {
        if (!row.code) continue;
        // Bóc tách phần đuôi sau tiền tố
        const numStr = row.code.substring(prefix.length);
        // Kiểm tra xem phần đuôi có phải là số không
        if (/^\d+$/.test(numStr)) {
            const num = parseInt(numStr, 10);
            if (num > maxNum) {
                maxNum = num;
            }
        }
    }
    
    // Nếu chưa có dữ liệu chuẩn, fallback dùng COUNT
    if (maxNum === 0) {
        const countRes = await client.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        maxNum = parseInt(countRes.rows[0].total, 10);
    }
    
    // Format dạng PREFIX-001, PREFIX-042
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
};
