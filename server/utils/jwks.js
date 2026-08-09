const crypto = require('crypto');

/**
 * Parses the base64 encoded public key from the environment and returns a JWKS object.
 * Follows RFC 7517 standards. Exposes only public parameters (n, e).
 */
function getJwks() {
    const keys = [];
    
    // Support the active key
    if (process.env.JWT_PUBLIC_KEY && process.env.JWT_ACTIVE_KID) {
        try {
            // Decode the base64 PEM
            const publicKeyPem = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf-8');
            const key = crypto.createPublicKey(publicKeyPem);
            
            // Export to JWK format (requires Node 15+)
            const jwk = key.export({ format: 'jwk' });
            
            // Only include safe public parameters for RSA
            keys.push({
                kty: jwk.kty, // "RSA"
                use: 'sig',
                alg: 'RS256',
                kid: process.env.JWT_ACTIVE_KID,
                n: jwk.n,
                e: jwk.e
            });
        } catch (err) {
            console.error('Error parsing JWT_PUBLIC_KEY for JWKS:', err);
        }
    }
    
    // In the future, if you implement key rotation with previous keys,
    // you can parse process.env.JWT_PREVIOUS_PUBLIC_KEY and push it here.
    
    return { keys };
}

/**
 * Verifies if a given kid exists in the current Known JWKS.
 * @param {string} kid 
 * @returns {boolean}
 */
function isKnownKid(kid) {
    if (!kid) return false;
    const jwks = getJwks();
    return jwks.keys.some(k => k.kid === kid);
}

/**
 * Gets the public key PEM for a specific kid (for verification).
 * Currently supports the active key.
 * @param {string} kid 
 * @returns {string|null} PEM string of the public key
 */
function getPublicKeyPemForKid(kid) {
    if (process.env.JWT_ACTIVE_KID === kid && process.env.JWT_PUBLIC_KEY) {
        return Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf-8');
    }
    // Add logic here if fetching previous keys in the future
    return null;
}

module.exports = { 
    getJwks,
    isKnownKid,
    getPublicKeyPemForKid
};
