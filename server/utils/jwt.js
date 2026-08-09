const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generates an Access Token (RS256) for a given user.
 * Includes all required security claims (iss, aud, typ, jti, nbf).
 * Falls back to HS256 if RSA keys are not yet configured in the environment.
 * 
 * @param {Object} user User object containing id, username, full_name, role_name
 * @returns {string} The signed JWT
 */
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role_name,
        iss: 'https://erp.fittour.vn',
        aud: 'fittour-api',
        typ: 'access+jwt', // Enforce type in payload as well
        jti: crypto.randomUUID(), // Unique token identifier
        nbf: Math.floor(Date.now() / 1000) // Not before (now)
    };
    
    // Check if RSA keys are configured
    if (process.env.JWT_PRIVATE_KEY && process.env.JWT_ACTIVE_KID) {
        try {
            // Decode the Base64 PEM back to string
            const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf-8');
            
            return jwt.sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '14d',
                keyid: process.env.JWT_ACTIVE_KID,
                header: { typ: 'access+jwt' }
            });
        } catch (err) {
            console.error('Error signing with RS256, falling back to HS256:', err);
        }
    }
    
    // Fallback for environments that haven't generated keys yet
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '14d' });
}

/**
 * Safely verifies a JWT supporting both HS256 and RS256 (Dual-Verification).
 * Implements strict algorithm and kid checks to prevent Algorithm Confusion.
 * 
 * @param {string} token The JWT string to verify
 * @returns {Object} The decoded payload if valid
 * @throws {Error} If token is invalid, expired, or violates security policy
 */
function verifyTokenSafely(token) {
    const { isKnownKid, getPublicKeyPemForKid } = require('./jwks');

    const decodedUnverified = jwt.decode(token, { complete: true });
    if (!decodedUnverified || !decodedUnverified.header) {
        throw new Error('Token không hợp lệ');
    }

    const { header } = decodedUnverified;
    const { alg, kid, typ } = header;

    if (typ && typ !== 'JWT' && typ !== 'access+jwt') {
        throw new Error('Loại token không được chấp nhận (wrong typ)');
    }

    let secretOrPublicKey;
    let verifyOptions = {};

    if (alg === 'HS256') {
        if (!process.env.JWT_SECRET) {
            throw new Error('Xác thực HS256 không còn được hỗ trợ');
        }
        secretOrPublicKey = process.env.JWT_SECRET;
        verifyOptions.algorithms = ['HS256'];
    } else if (alg === 'RS256') {
        if (!isKnownKid(kid)) {
            throw new Error('Khóa không xác định (Unknown kid)');
        }
        
        secretOrPublicKey = getPublicKeyPemForKid(kid);
        if (!secretOrPublicKey) {
            throw new Error('Không tìm thấy Public Key cho kid này');
        }
        
        verifyOptions.algorithms = ['RS256'];
    } else {
        throw new Error('Thuật toán không được hỗ trợ (Algorithm not allowed)');
    }

    const decodedPayload = jwt.verify(token, secretOrPublicKey, verifyOptions);

    // Additional Claims validation for RS256
    if (alg === 'RS256') {
        if (decodedPayload.iss !== 'https://erp.fittour.vn' || decodedPayload.aud !== 'fittour-api') {
            throw new Error('Token claims (iss/aud) không hợp lệ');
        }
        if (decodedPayload.typ && decodedPayload.typ !== 'access+jwt') {
             throw new Error('Sai loại token (typ)');
        }
    }

    // Metrics / Logging for monitoring phase-out (Phase 3)
    console.log(`[AUTH METRIC] alg=${alg} kid=${kid || 'none'} user_id=${decodedPayload.id} success=true`);

    return decodedPayload;
}

module.exports = {
    generateAccessToken,
    verifyTokenSafely
};
