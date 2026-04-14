const express = require('express');
const app = express();
const travelSupport = require('./routes/travelSupport');

// Mock req.user for middlewares
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

app.use('/api/travel-support', travelSupport);

console.log('--- Routes for /api/travel-support ---');
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Route: ${Object.keys(r.route.methods)} ${r.route.path}`);
    } else if (r.name === 'router') {
        r.handle.stack.forEach((handler) => {
            if (handler.route) {
                console.log(`Travel Support Subroute: ${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
            }
        });
    }
});
