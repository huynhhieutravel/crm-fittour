const { verifyTokenSafely } = require('../utils/jwt');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Truy cập bị từ chối' });

    try {
        const decodedPayload = verifyTokenSafely(token);
        // Token is valid and trusted!
        req.user = decodedPayload;
        
        next();
    } catch (err) {
        // Distinguish between structural errors and expiration if needed
        if (err.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        return res.status(401).json({ message: err.message || 'Token không hợp lệ' });
    }
};
