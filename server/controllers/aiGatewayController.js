const aiGatewayService = require('../services/aiGatewayService');
const db = require('../db');

/**
 * Controller cho Executive AI Gateway
 * Hỗ trợ đồng thời 5 Curated Semantic Tools qua REST OpenAPI và MCP Streamable HTTP JSON-RPC 2.0
 */

// Helper ghi audit log an toàn (không ghi token/PII)
async function recordAiAudit(userId, toolName, params, executionTimeMs) {
    try {
        await db.query(`
            INSERT INTO audit_logs (user_id, action, target_type, details)
            VALUES ($1, 'AI_QUERY', 'ai_gateway', $2)
        `, [userId, JSON.stringify({
            tool: toolName,
            params: params || {},
            execution_time_ms: executionTimeMs,
            timestamp: new Date().toISOString()
        })]);
    } catch (_) {}
}

// 1. REST Endpoint: GET /api/ai-gateway/v1/kpi
exports.getKPI = async (req, res) => {
    const startTime = Date.now();
    try {
        const result = await aiGatewayService.getExecutiveKPI(req.aiUser, req.query);
        recordAiAudit(req.aiUser.id, 'get_executive_kpi_summary', req.query, Date.now() - startTime);
        return res.json(result);
    } catch (err) {
        console.error('[AI-GATEWAY] Lỗi getKPI:', err.message);
        return res.status(500).json({ success: false, error: 'EXECUTION_ERROR', message: 'Lỗi máy chủ khi tổng hợp chỉ số KPI.' });
    }
};

// 2. REST Endpoint: GET /api/ai-gateway/v1/departures
exports.getDepartures = async (req, res) => {
    const startTime = Date.now();
    try {
        const result = await aiGatewayService.getDeparturesOccupancy(req.aiUser, req.query);
        recordAiAudit(req.aiUser.id, 'get_departures_occupancy', req.query, Date.now() - startTime);
        return res.json(result);
    } catch (err) {
        console.error('[AI-GATEWAY] Lỗi getDepartures:', err.message);
        return res.status(500).json({ success: false, error: 'EXECUTION_ERROR', message: 'Lỗi máy chủ khi lấy tình trạng đoàn tour.' });
    }
};

// 3. REST Endpoint: GET /api/ai-gateway/v1/cashflow
exports.getCashflow = async (req, res) => {
    const startTime = Date.now();
    try {
        const result = await aiGatewayService.getDepartureCashflow(req.aiUser, req.query);
        recordAiAudit(req.aiUser.id, 'get_departure_cashflow', req.query, Date.now() - startTime);
        return res.json(result);
    } catch (err) {
        console.error('[AI-GATEWAY] Lỗi getCashflow:', err.message);
        return res.status(500).json({ success: false, error: 'EXECUTION_ERROR', message: 'Lỗi máy chủ khi lấy tiến độ dòng tiền.' });
    }
};

// 4. REST Endpoint: GET /api/ai-gateway/v1/debt-alerts
exports.getDebtAlerts = async (req, res) => {
    const startTime = Date.now();
    try {
        const result = await aiGatewayService.getDebtD7Alerts(req.aiUser, req.query);
        recordAiAudit(req.aiUser.id, 'get_debt_d7_alerts', req.query, Date.now() - startTime);
        return res.json(result);
    } catch (err) {
        console.error('[AI-GATEWAY] Lỗi getDebtAlerts:', err.message);
        return res.status(500).json({ success: false, error: 'EXECUTION_ERROR', message: 'Lỗi máy chủ khi lấy cảnh báo công nợ D-7.' });
    }
};

// 5. REST Endpoint: GET /api/ai-gateway/v1/marketing
exports.getMarketing = async (req, res) => {
    const startTime = Date.now();
    try {
        const result = await aiGatewayService.getMarketingEfficiency(req.aiUser, req.query);
        recordAiAudit(req.aiUser.id, 'get_marketing_efficiency', req.query, Date.now() - startTime);
        return res.json(result);
    } catch (err) {
        console.error('[AI-GATEWAY] Lỗi getMarketing:', err.message);
        return res.status(500).json({ success: false, error: 'EXECUTION_ERROR', message: 'Lỗi máy chủ khi lấy hiệu quả marketing.' });
    }
};

// 6. REST Endpoint: GET /api/ai-gateway/openapi.json
exports.getOpenApiSchema = (req, res) => {
    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const schema = {
        openapi: '3.0.3',
        info: {
            title: 'FIT TOUR Executive ERP AI Gateway',
            version: '1.0.0',
            description: 'Cổng thông tin dữ liệu điều hành thời gian thực dành riêng cho Lãnh đạo FIT TOUR kết nối với Claude, ChatGPT và AI Agents.'
        },
        servers: [
            {
                url: baseUrl,
                description: 'Máy chủ FIT TOUR ERP Live'
            }
        ],
        paths: {
            '/api/ai-gateway/v1/kpi': {
                get: {
                    operationId: 'get_executive_kpi_summary',
                    summary: 'KPI Doanh thu, Cọc thực thu, Khách và Booking',
                    parameters: [
                        { name: 'timeframe', in: 'query', schema: { type: 'string', enum: ['this_month', 'last_month', 'this_year', 'custom'] } },
                        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'bu_group', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { '200': { description: 'Dữ liệu KPI đã đối soát.' } }
                }
            },
            '/api/ai-gateway/v1/departures': {
                get: {
                    operationId: 'get_departures_occupancy',
                    summary: 'Tình trạng lấp đầy đoàn tour sắp khởi hành (D-30 đến D-1)',
                    parameters: [
                        { name: 'days_ahead', in: 'query', schema: { type: 'integer', default: 30 } },
                        { name: 'bu_group', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { '200': { description: 'Danh sách đoàn và tỷ lệ lấp đầy.' } }
                }
            },
            '/api/ai-gateway/v1/cashflow': {
                get: {
                    operationId: 'get_departure_cashflow',
                    summary: 'Tiến độ dòng tiền và công nợ theo tháng',
                    parameters: [
                        { name: 'year', in: 'query', schema: { type: 'integer' } },
                        { name: 'month', in: 'query', schema: { type: 'string' } },
                        { name: 'bu_group', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { '200': { description: 'Dòng tiền thu về và công nợ tồn.' } }
                }
            },
            '/api/ai-gateway/v1/debt-alerts': {
                get: {
                    operationId: 'get_debt_d7_alerts',
                    summary: 'Danh sách booking nợ đến hạn khởi hành D-7 (<= 7 ngày)',
                    parameters: [
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                        { name: 'bu_group', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { '200': { description: 'Cảnh báo nợ D-7 (SĐT đã mask PII).' } }
                }
            },
            '/api/ai-gateway/v1/marketing': {
                get: {
                    operationId: 'get_marketing_efficiency',
                    summary: 'Chi tiêu Ads, CPL và số lead theo BU',
                    parameters: [
                        { name: 'year', in: 'query', schema: { type: 'integer' } },
                        { name: 'month', in: 'query', schema: { type: 'string' } },
                        { name: 'bu_group', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { '200': { description: 'Hiệu quả chi tiêu marketing.' } }
                }
            }
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'Personal Executive Token (fit_ai_sec_...)'
                }
            }
        },
        security: [{ BearerAuth: [] }]
    };

    return res.json(schema);
};

// 7. MCP Streamable HTTP JSON-RPC 2.0 Handler (POST /mcp)
exports.handleMcpRequest = async (req, res) => {
    const { jsonrpc, id, method, params } = req.body || {};

    if (jsonrpc !== '2.0') {
        return res.status(400).json({
            jsonrpc: '2.0',
            id: id || null,
            error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' }
        });
    }

    try {
        switch (method) {
            case 'initialize':
                return res.json({
                    jsonrpc: '2.0',
                    id,
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: { tools: {} },
                        serverInfo: { name: 'fittour-executive-erp', version: '1.0.0' }
                    }
                });

            case 'tools/list':
                return res.json({
                    jsonrpc: '2.0',
                    id,
                    result: {
                        tools: [
                            {
                                name: 'get_executive_kpi_summary',
                                description: 'Lấy báo cáo KPI điều hành live từ FIT TOUR ERP: Tổng doanh thu, Cọc thực thu, Công nợ tồn, Số lượng khách (Pax), Số booking hợp lệ và bảng phân bổ theo từng BU.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        timeframe: { type: 'string', enum: ['this_month', 'last_month', 'this_year', 'custom'] },
                                        startDate: { type: 'string' },
                                        endDate: { type: 'string' },
                                        bu_group: { type: 'string' }
                                    }
                                }
                            },
                            {
                                name: 'get_departures_occupancy',
                                description: 'Kiểm tra tỷ lệ lấp đầy ghế (occupancy rate), số chỗ mở bán và số khách đã cọc của các đoàn tour sắp khởi hành (D-30 đến D-1).',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        days_ahead: { type: 'integer', description: 'Số ngày tới cần kiểm tra (mặc định: 30)' },
                                        bu_group: { type: 'string' }
                                    }
                                }
                            },
                            {
                                name: 'get_departure_cashflow',
                                description: 'Theo dõi tiến độ thu tiền, doanh số và công nợ tồn đọng theo từng tháng trong năm từ Departure Cashflow Hub.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        year: { type: 'integer' },
                                        month: { type: 'string', description: 'Tháng (1-12 hoặc all)' },
                                        bu_group: { type: 'string' }
                                    }
                                }
                            },
                            {
                                name: 'get_debt_d7_alerts',
                                description: 'Truy xuất danh sách booking nợ tiền sắp tới ngày bay (<= 7 ngày mốc D-7) cần thu tiền khẩn cấp. SĐT khách đã được mask bảo mật.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        limit: { type: 'integer', description: 'Số bản ghi tối đa (mặc định: 20)' },
                                        bu_group: { type: 'string' }
                                    }
                                }
                            },
                            {
                                name: 'get_marketing_efficiency',
                                description: 'Đối soát chi tiêu quảng cáo Meta/Google thực tế, số lead thu về và giá mỗi lead (CPL) theo từng BU.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        year: { type: 'integer' },
                                        month: { type: 'string' },
                                        bu_group: { type: 'string' }
                                    }
                                }
                            }
                        ]
                    }
                });

            case 'tools/call':
                const toolName = params?.name;
                const toolArgs = params?.arguments || {};
                const startTime = Date.now();
                let toolResult = null;

                if (toolName === 'get_executive_kpi_summary') {
                    toolResult = await aiGatewayService.getExecutiveKPI(req.aiUser, toolArgs);
                } else if (toolName === 'get_departures_occupancy') {
                    toolResult = await aiGatewayService.getDeparturesOccupancy(req.aiUser, toolArgs);
                } else if (toolName === 'get_departure_cashflow') {
                    toolResult = await aiGatewayService.getDepartureCashflow(req.aiUser, toolArgs);
                } else if (toolName === 'get_debt_d7_alerts') {
                    toolResult = await aiGatewayService.getDebtD7Alerts(req.aiUser, toolArgs);
                } else if (toolName === 'get_marketing_efficiency') {
                    toolResult = await aiGatewayService.getMarketingEfficiency(req.aiUser, toolArgs);
                } else {
                    return res.status(404).json({
                        jsonrpc: '2.0',
                        id,
                        error: { code: -32601, message: `Tool not found: ${toolName}` }
                    });
                }

                recordAiAudit(req.aiUser.id, toolName, toolArgs, Date.now() - startTime);

                return res.json({
                    jsonrpc: '2.0',
                    id,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(toolResult, null, 2)
                            }
                        ]
                    }
                });

            default:
                return res.status(400).json({
                    jsonrpc: '2.0',
                    id,
                    error: { code: -32601, message: `Method not implemented: ${method}` }
                });
        }
    } catch (err) {
        console.error('[MCP-HANDLER] Lỗi xử lý JSON-RPC:', err.message);
        return res.status(500).json({
            jsonrpc: '2.0',
            id,
            error: { code: -32603, message: `Internal server error: ${err.message}` }
        });
    }
};
