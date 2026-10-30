const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiGatewayController = require('../controllers/aiGatewayController');
const executiveAiAuth = require('../middleware/executiveAiAuth');

// 1. Rate Limiting: 60 requests / phút cho mỗi client
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Bạn đã vượt quá giới hạn 60 yêu cầu/phút của Executive AI Gateway. Vui lòng thử lại sau.'
    }
});

// 2. Public Route: Schema OpenAPI 3.0 (phục vụ ChatGPT import Actions)
router.get('/openapi.json', aiGatewayController.getOpenApiSchema);

// Áp dụng Rate Limiter và Authentication Middleware cho toàn bộ các endpoint nghiệp vụ bên dưới
router.use(aiLimiter);
router.use(executiveAiAuth);

// 3. REST API Endpoints: 5 Curated Semantic Tools
router.get('/v1/kpi', aiGatewayController.getKPI);
router.get('/v1/departures', aiGatewayController.getDepartures);
router.get('/v1/cashflow', aiGatewayController.getCashflow);
router.get('/v1/debt-alerts', aiGatewayController.getDebtAlerts);
router.get('/v1/marketing', aiGatewayController.getMarketing);

// 4. Remote MCP Streamable HTTP Endpoint (Hỗ trợ Claude Desktop & Agents)
router.post('/mcp', aiGatewayController.handleMcpRequest);

module.exports = router;
