const crypto = require('crypto');
const { asyncLocalStorage } = require('../utils/logger');

// Simple regex to validate UUID v4
const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const correlationIdMiddleware = (req, res, next) => {
    // 1. Skip preflight OPTIONS and static assets to prevent log spam
    const urlPath = req.originalUrl || req.url || '';
    if (req.method === 'OPTIONS' || urlPath.startsWith('/uploads')) {
        return next();
    }

    let correlationId = req.headers['x-correlation-id'];

    // Validate UUID v4. If missing or invalid, generate new one.
    if (!correlationId || !uuidV4Regex.test(correlationId)) {
        correlationId = crypto.randomUUID();
    }

    // Attach to response header so frontend can see it
    res.setHeader('x-correlation-id', correlationId);

    // Record start time for duration logging
    const startTime = process.hrtime.bigint();

    // Hook into response finish event for completion logging
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1000000;
        
        // Wrap in asyncLocalStorage.run explicitly to ensure context is retained
        // even if the event emitter loses it (which can happen in some Node versions).
        asyncLocalStorage.run(correlationId, () => {
            console.log(`HTTP ${req.method} ${req.originalUrl || req.url} status=${res.statusCode} duration=${durationMs.toFixed(2)}ms`);
        });
    });

    // Run the rest of the request within this async context
    asyncLocalStorage.run(correlationId, () => {
        next();
    });
};

module.exports = correlationIdMiddleware;
