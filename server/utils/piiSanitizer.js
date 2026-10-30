/**
 * PII Sanitizer & Redaction Fence
 * Che mờ các thông tin nhận diện cá nhân của khách hàng trước khi chuyển cho LLM / Third-party Cloud.
 */

function maskPhone(phone) {
    if (!phone || typeof phone !== 'string') return phone;
    const clean = phone.trim();
    if (clean.length < 7) return '***';
    // Giữ 3 số đầu và 3 số cuối: ví dụ 090****123
    return clean.slice(0, 3) + '****' + clean.slice(-3);
}

function maskIdCard(idCard) {
    if (!idCard || typeof idCard !== 'string') return idCard;
    const clean = idCard.trim();
    if (clean.length < 6) return '******';
    return clean.slice(0, 3) + '****' + clean.slice(-3);
}

function maskEmail(email) {
    if (!email || typeof email !== 'string') return email;
    const parts = email.split('@');
    if (parts.length !== 2) return '***@***';
    const name = parts[0];
    const domain = parts[1];
    const maskedName = name.length > 2 ? name[0] + '****' + name.slice(-1) : '****';
    return `${maskedName}@${domain}`;
}

const PII_KEYS = {
    phone: maskPhone,
    customer_phone: maskPhone,
    phone_number: maskPhone,
    id_card: maskIdCard,
    passport_number: maskIdCard,
    passport_url: () => '[PROTECTED_FILE]',
    email: maskEmail,
    customer_email: maskEmail
};

function sanitizeObject(data) {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) {
        return data.map(item => sanitizeObject(item));
    }
    if (typeof data === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();
            if (PII_KEYS[lowerKey] && typeof value === 'string') {
                sanitized[key] = PII_KEYS[lowerKey](value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    return data;
}

module.exports = {
    maskPhone,
    maskIdCard,
    maskEmail,
    sanitizeObject
};

