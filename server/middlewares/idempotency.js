const db = require('../db');
const crypto = require('crypto');

// Helper to canonically stringify JSON for consistent hashing
function canonicalizeJSON(obj) {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map(canonicalizeJSON).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    let res = '{';
    for (let i = 0; i < keys.length; i++) {
        if (i > 0) res += ',';
        res += JSON.stringify(keys[i]) + ':' + canonicalizeJSON(obj[keys[i]]);
    }
    res += '}';
    return res;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const idempotencyCheck = async (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'];
    
    // As per user requirement: For important transactions, Idempotency-Key MUST be mandatory.
    if (!idempotencyKey) {
        return res.status(400).json({ error: 'Idempotency-Key header is required for this operation.' });
    }

    // 1. Build Scope & Request Hash
    const tenantId = req.user?.tenant_id || 'fittour'; // Fallback if no tenant
    const userId = req.user?.id || 'anonymous';
    const method = req.method.toUpperCase();
    const normalizedPath = req.originalUrl || req.url || '';
    
    // Scope isolation
    const scope = `${tenantId}:${userId}:${method}:${normalizedPath}`;

    // Canonical body hashing
    const payloadToHash = {
        method,
        path: normalizedPath,
        query: req.query,
        body: req.body
    };
    const requestHash = crypto.createHash('sha256').update(canonicalizeJSON(payloadToHash)).digest('hex');

    // 2. Atomic Claim Loop
    let claimed = false;
    let maxPollAttempts = 100; // 100 * 100ms = 10s timeout
    let pollInterval = 100;

    while (!claimed) {
        // Try to claim
        try {
            const insertQuery = `
                INSERT INTO idempotency_keys (scope, key, request_path, request_hash, status)
                VALUES ($1, $2, $3, $4, 'processing')
                ON CONFLICT (scope, key) DO NOTHING
                RETURNING *;
            `;
            const insertResult = await db.query(insertQuery, [scope, idempotencyKey, normalizedPath, requestHash]);
            
            if (insertResult.rowCount > 0) {
                claimed = true;
                break; // We are the Leader!
            }
        } catch (e) {
            console.error('[Idempotency] Insert Error:', e);
            return res.status(500).json({ error: 'Internal Server Error during Idempotency Check' });
        }

        // Conflict! Key exists. Check its state.
        try {
            const checkQuery = `SELECT * FROM idempotency_keys WHERE scope = $1 AND key = $2`;
            const checkResult = await db.query(checkQuery, [scope, idempotencyKey]);
            const existingRecord = checkResult.rows[0];

            if (!existingRecord) {
                // Key disappeared (Leader deleted it due to 5xx or recovery). Retry claim!
                continue;
            }

            // Fingerprint Check
            if (existingRecord.request_hash !== requestHash) {
                return res.status(409).json({ error: 'IDEMPOTENCY_HASH_MISMATCH: The provided Idempotency-Key was previously used with a different request payload.' });
            }

            // State Check
            if (existingRecord.status === 'completed') {
                return res.status(existingRecord.status_code).json(existingRecord.response_body);
            }

            if (existingRecord.status === 'processing') {
                // Check for Stale Processing (> 30s)
                const processingTimeMs = Date.now() - new Date(existingRecord.created_at).getTime();
                if (processingTimeMs > 30000) {
                    console.log(`[Idempotency] Found stale processing key: ${idempotencyKey}, deleting and reclaiming...`);
                    // Try to delete it ONLY IF it's still processing (atomic).
                    await db.query(`DELETE FROM idempotency_keys WHERE scope = $1 AND key = $2 AND status = 'processing'`, [scope, idempotencyKey]);
                    // Loop again to reclaim
                    continue;
                }

                // Poll wait
                maxPollAttempts--;
                if (maxPollAttempts <= 0) {
                    return res.status(408).json({ error: 'Request Timeout: A previous request with this key is taking too long to process.' });
                }
                await sleep(pollInterval);
            }
        } catch (e) {
            console.error('[Idempotency] Poll Error:', e);
            return res.status(500).json({ error: 'Internal Server Error during Idempotency Check' });
        }
    }

    // 3. We are the LEADER. Intercept response.
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalEnd = res.end.bind(res);

    let responseCaptured = false;

    const captureAndSend = async (body, statusCode) => {
        if (responseCaptured) return;
        responseCaptured = true;

        // Try to parse body if it's a buffer or string, for JSONB storage
        let parsedBody = body;
        if (typeof body === 'string') {
            try { parsedBody = JSON.parse(body); } catch(e) {}
        } else if (Buffer.isBuffer(body)) {
            try { parsedBody = JSON.parse(body.toString('utf8')); } catch(e) { parsedBody = { raw: 'buffer' }; }
        }

        // Determine if we should cache or delete
        if (statusCode >= 200 && statusCode < 500) {
            // Cache 2xx, 3xx, 4xx
            const updateQuery = `
                UPDATE idempotency_keys 
                SET status = 'completed', response_body = $1, status_code = $2, completed_at = CURRENT_TIMESTAMP
                WHERE scope = $3 AND key = $4
            `;
            await db.query(updateQuery, [JSON.stringify(parsedBody), statusCode, scope, idempotencyKey]).catch(e => {
                console.error('[Idempotency] Failed to save completed state:', e);
            });
        } else {
            // 5xx Error -> DELETE key so it can be retried
            // Note: Controllers MUST use DB transactions to rollback partial changes on 5xx.
            await db.query(`DELETE FROM idempotency_keys WHERE scope = $1 AND key = $2`, [scope, idempotencyKey]).catch(e => {
                console.error('[Idempotency] Failed to delete failed state:', e);
            });
        }
    };

    res.json = function(body) {
        captureAndSend(body, res.statusCode);
        return originalJson(body);
    };

    res.send = function(body) {
        captureAndSend(body, res.statusCode);
        return originalSend(body);
    };

    res.end = function(chunk, encoding) {
        captureAndSend(chunk, res.statusCode);
        return originalEnd(chunk, encoding);
    };

    next();
};

module.exports = idempotencyCheck;
