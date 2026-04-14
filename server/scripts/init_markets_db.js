const db = require('../db');

(async () => {
    try {
        await db.query("CREATE TABLE IF NOT EXISTS markets (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, parent_id INTEGER REFERENCES markets(id) ON DELETE SET NULL, status VARCHAR(50) DEFAULT 'active')");
        const init = [
            "Việt Nam","Việt Nam (MICE)","TP.HCM","Hà Nội","Nha Trang","Vũng Tàu","Long Hải - Hồ Tràm","Phú Yên","Đà Lạt","Bảo Lộc","Đà Nẵng","Hội An","Phan Thiết","Hàm Thuận Nam","Ninh Chữ","Châu Đốc","Phú Quốc","Hạ Long","Đồng Nai","Miền Tây","Cần Thơ",
            "Trung Quốc Đại Lục","Trung Quốc","Bắc Kinh","Cáp Nhĩ Tân","Cửu Trại Câu","Giang Nam","Giang Tây","Lệ Giang","Tân Cương","Tây An","Tây Tạng","Vân Nam","Á Đinh","Trương Gia Giới","Quý Châu","Trùng Khánh","Thượng Hải",
            "Đông Bắc Á","Hàn Quốc","Nhật Bản","Mông Cổ","Đài Loan",
            "Nam Á & Himalayas","Ấn Độ","Bhutan","Himalayas","Kailash","Kashmir","Ladakh","Nepal","Pakistan",
            "Trung Á & Lân Cận","Trung Á","Caucasus","Silk Road",
            "Đông Nam Á","Bali","Bromo","Campuchia","Thái Lan","Singapore","Malaysia","Lào","Philippines",
            "Châu Âu & Nga","Châu Âu","Tây Âu","Bắc Âu","Đông Âu","Nga - Murmansk",
            "Trung Đông & Châu Phi","Trung Đông","Thổ Nhĩ Kỳ","Dubai","Ai Cập","Morocco","Châu Phi",
            "Châu Úc & Châu Mỹ","Úc","New Zealand","Mỹ","Canada"
        ];
        // Ensure name is UNIQUE constraint for ON CONFLICT DO NOTHING
        await db.query("ALTER TABLE markets ADD CONSTRAINT unique_market_name UNIQUE (name)").catch(()=>null);

        for (const m of init) {
            await db.query("INSERT INTO markets (name) VALUES ($1) ON CONFLICT DO NOTHING", [m]).catch(()=>null);
        }
        console.log("Khoi tao Bang Markets thanh cong");
    } catch(err) {
        console.error(err);
    } finally {
        process.exit();
    }
})();
