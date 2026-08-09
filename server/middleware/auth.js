const jwt = require('jsonwebtoken');
const { isKnownKid, getPublicKeyPemForKid } = require('../utils/jwks');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Truy cập bị từ chối' });

    // Decode header only to inspect metadata. Do NOT trust payload yet.
    const decodedUnverified = jwt.decode(token, { complete: true });
    if (!decodedUnverified || !decodedUnverified.header) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    const { header } = decodedUnverified;
    const { alg, kid, typ } = header;

    // Optional: Enforcement of typ (if present in header)
    if (typ && typ !== 'JWT' && typ !== 'access+jwt') {
        return res.status(401).json({ message: 'Loại token không được chấp nhận (wrong typ)' });
    }

    let secretOrPublicKey;
    let verifyOptions = {
        // Enforce algorithms based on the policy, not just what's in the header
    };

    if (alg === 'HS256') {
        // Legacy HS256 Token
        if (!process.env.JWT_SECRET) {
            return res.status(401).json({ message: 'Xác thực HS256 không còn được hỗ trợ' });
        }
        secretOrPublicKey = process.env.JWT_SECRET;
        verifyOptions.algorithms = ['HS256'];
    } else if (alg === 'RS256') {
        // New RS256 Token
        // 1. Validate kid
        if (!isKnownKid(kid)) {
            return res.status(401).json({ message: 'Khóa không xác định (Unknown kid)' });
        }
        
        // 2. Fetch the corresponding public key
        secretOrPublicKey = getPublicKeyPemForKid(kid);
        if (!secretOrPublicKey) {
            return res.status(401).json({ message: 'Không tìm thấy Public Key cho kid này' });
        }
        
        verifyOptions.algorithms = ['RS256'];
        
        // 3. (Optional but recommended) Validate claims for new tokens
        // verifyOptions.issuer = 'https://erp.fittour.vn';
        // verifyOptions.audience = 'fittour-api';
    } else {
        // Reject none, or any other algorithm
        return res.status(401).json({ message: 'Thuật toán không được hỗ trợ (Algorithm not allowed)' });
    }

    // Verify token safely with the explicitly chosen algorithm and key
    jwt.verify(token, secretOrPublicKey, verifyOptions, (err, decodedPayload) => {
        if (err) {
            // Note: expired tokens will trigger this with TokenExpiredError
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        // Additional Claims validation for RS256 (if we enforce it now)
        if (alg === 'RS256') {
            if (decodedPayload.iss !== 'https://erp.fittour.vn' || decodedPayload.aud !== 'fittour-api') {
                return res.status(401).json({ message: 'Token claims (iss/aud) không hợp lệ' });
            }
            // typ checking in payload or header (RFC 8725)
            if (decodedPayload.typ && decodedPayload.typ !== 'access+jwt') {
                 return res.status(401).json({ message: 'Sai loại token (typ)' });
            }
        }

        // Token is valid and trusted!
        req.user = decodedPayload;
        
        // Metrics / Logging for monitoring phase-out
        // console.log(`[AUTH METRIC] alg=${alg} kid=${kid || 'none'} success=true`);
        
        next();
    });
};
