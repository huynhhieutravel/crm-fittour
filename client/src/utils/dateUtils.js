export const toLocalYYYYMMDD = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Hàm cốt lõi: Ép mọi Date object về múi giờ Việt Nam
const getVNTimeParts = (d) => {
    if (!d || isNaN(new Date(d).getTime())) return null;
    const date = new Date(d);
    const options = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = {};
    formatter.formatToParts(date).forEach(p => parts[p.type] = p.value);
    return parts; // { year: '2026', month: '07', day: '22', hour: '09', minute: '28', second: '00' }
};

// 1. Trả về định dạng Database PostgreSQL: 'YYYY-MM-DD HH:mm:ss'
export const getLocalIsoString = (date = new Date()) => {
    // Nếu truyền vào một chuỗi từ <input type="datetime-local"> hoặc <input type="date">
    // (VD: "2026-07-22T17:00" hoặc "2026-07-22"), giữ nguyên giá trị người dùng nhập,
    // chỉ định dạng lại để gửi lên server, không đi qua Date object để tránh bị ép múi giờ local của trình duyệt.
    if (typeof date === 'string') {
        if (date.length === 10) return `${date} 00:00:00`; // YYYY-MM-DD
        if (date.includes('T') && date.length === 16) return `${date.replace('T', ' ')}:00`; // YYYY-MM-DDTHH:mm
    }
    
    // Nếu là chuỗi ISO UTC từ server (có chữ Z) hoặc Date object
    const p = getVNTimeParts(date);
    return p ? `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}` : '';
};

// 2. Trả về định dạng cho <input type="datetime-local">: 'YYYY-MM-DDTHH:mm'
export const getLocalDateTimeLocal = (date = new Date()) => {
    const p = getVNTimeParts(date);
    return p ? `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}` : '';
};

// 3. Trả về định dạng cho <input type="date">: 'YYYY-MM-DD'
export const getLocalDateString = (date = new Date()) => {
    const p = getVNTimeParts(date);
    return p ? `${p.year}-${p.month}-${p.day}` : '';
};
