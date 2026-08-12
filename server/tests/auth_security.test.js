const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');
const fs = require('fs');

// Generate test keys
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
const privateKeyPem = privateKey;
const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
const JWT_SECRET = 'super-secret-legacy-key';
const JWT_ACTIVE_KID = 'test-kid-01';

// Setup Mock Env
process.env.JWT_SECRET = JWT_SECRET;
process.env.JWT_PUBLIC_KEY = publicKeyBase64;
process.env.JWT_ACTIVE_KID = JWT_ACTIVE_KID;

// Helper to mock request and response
function runMiddleware(token) {
    return new Promise((resolve) => {
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = {
            status: (code) => ({
                json: (data) => resolve({ code, data })
            })
        };
        const next = () => resolve({ code: 200, user: req.user });
        authMiddleware(req, res, next);
    });
}

async function runTests() {
    console.log('--- BẮT ĐẦU TEST BẢO MẬT MIDDLEWARE ---\n');
    let passed = 0;
    let failed = 0;

    const assertReject = async (name, token, expectedStatus = 401) => {
        const result = await runMiddleware(token);
        if (result.code === expectedStatus) {
            console.log(`✅ [PASS] ${name} -> Bị từ chối đúng như mong đợi (${result.data.message})`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} -> Bị lỗi. Trạng thái mong đợi: ${expectedStatus}, Nhận được: ${result.code}`);
            failed++;
        }
    };

    const assertAccept = async (name, token) => {
        const result = await runMiddleware(token);
        if (result.code === 200) {
            console.log(`✅ [PASS] ${name} -> Chấp nhận thành công.`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} -> Bị từ chối. Lỗi: ${result.data?.message}`);
            failed++;
        }
    };

    // 1. HS256 Valid
    const tokenHS256 = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1h' });
    await assertReject('HS256 Valid', tokenHS256);

    // 2. RS256 Valid
    const tokenRS256 = jwt.sign(
        { id: 2, iss: 'https://erp.fittour.vn', aud: 'fittour-api', typ: 'access+jwt' }, 
        privateKeyPem, 
        { algorithm: 'RS256', keyid: JWT_ACTIVE_KID, header: { typ: 'access+jwt' } }
    );
    await assertAccept('RS256 Valid', tokenRS256);

    // 3. HS256 Sai Secret
    const tokenHS256Wrong = jwt.sign({ id: 1 }, 'wrong-secret', { expiresIn: '1h' });
    await assertReject('HS256 Sai Secret', tokenHS256Wrong);

    // 4. RS256 Sai Signature
    const { privateKey: wrongPriv } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
    const tokenRS256Wrong = jwt.sign(
        { id: 2, iss: 'https://erp.fittour.vn', aud: 'fittour-api' }, 
        wrongPriv, 
        { algorithm: 'RS256', keyid: JWT_ACTIVE_KID }
    );
    await assertReject('RS256 Sai Signature', tokenRS256Wrong);

    // 5. Algorithm Confusion (HS256 token xác thực bằng RSA key)
    // Tức là payload lấy public key giả làm secret để ký HS256
    const tokenConfusion1 = jwt.sign({ id: 1 }, publicKey, { algorithm: 'HS256' });
    await assertReject('Algorithm Confusion (HS256+RSA_KEY)', tokenConfusion1);

    // 6. Algorithm Confusion (RS256 token xác thực bằng HMAC secret)
    // Thực tế thư viện jsonwebtoken chặn việc sinh token RS256 bằng secret string, nên bỏ qua test sinh token này.
    // Tuy nhiên logic middleware đã bọc chặt (RS256 bắt buộc verify bằng Public Key).

    // 7. alg=none
    const tokenNone = jwt.sign({ id: 1 }, JWT_SECRET, { algorithm: 'none' });
    await assertReject('alg=none', tokenNone);

    // 8. Unknown kid
    const tokenUnknownKid = jwt.sign(
        { id: 2, iss: 'https://erp.fittour.vn', aud: 'fittour-api' }, 
        privateKeyPem, 
        { algorithm: 'RS256', keyid: 'hacker-kid' }
    );
    await assertReject('Unknown kid', tokenUnknownKid);

    // 9. Expired exp
    const tokenExpired = jwt.sign(
        { id: 2, iss: 'https://erp.fittour.vn', aud: 'fittour-api', typ: 'access+jwt', exp: Math.floor(Date.now() / 1000) - 3600 }, 
        privateKeyPem, 
        { algorithm: 'RS256', keyid: JWT_ACTIVE_KID, header: { typ: 'access+jwt' } }
    );
    await assertReject('Expired Token', tokenExpired);

    // 10. nbf in future
    const tokenFuture = jwt.sign(
        { id: 2, iss: 'https://erp.fittour.vn', aud: 'fittour-api', typ: 'access+jwt', nbf: Math.floor(Date.now() / 1000) + 3600 }, 
        privateKeyPem, 
        { algorithm: 'RS256', keyid: JWT_ACTIVE_KID, header: { typ: 'access+jwt' } }
    );
    await assertReject('nbf in future', tokenFuture);

    // 11. Wrong typ
    const tokenWrongTyp = jwt.sign(
        { id: 2, iss: 'https://erp.fittour.vn', aud: 'fittour-api', typ: 'refresh+jwt' }, 
        privateKeyPem, 
        { algorithm: 'RS256', keyid: JWT_ACTIVE_KID, header: { typ: 'refresh+jwt' } }
    );
    await assertReject('Wrong typ (refresh+jwt)', tokenWrongTyp);

    // 12. Khuyết thiếu iss / aud
    const tokenNoClaims = jwt.sign(
        { id: 2, typ: 'access+jwt' }, 
        privateKeyPem, 
        { algorithm: 'RS256', keyid: JWT_ACTIVE_KID, header: { typ: 'access+jwt' } }
    );
    await assertReject('Thiếu iss/aud', tokenNoClaims);

    console.log(`\nTổng kết: ${passed} PASS, ${failed} FAIL.`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
