const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Serve static files for media uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
const tourRoutes = require('./routes/tours');
const departureRoutes = require('./routes/departures');
const guideRoutes = require('./routes/guides');
const bookingRoutes = require('./routes/bookings');
const customerRoutes = require('./routes/customers');
const leadRoutes = require('./routes/leads');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const visaRoutes = require('./routes/visaRoutes');
const tourTypeRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');
const activityRoutes = require('./routes/activity');
const buRoutes = require('./routes/buRoutes');
const catalogRoutes = require('./routes/catalog');
const costingRoutes = require('./routes/costings');
const publicContractsRoutes = require('./routes/publicContracts');
const reminderRoutes = require('./routes/reminderRoutes');
const hotelRoutes = require('./routes/hotels');
const restaurantRoutes = require('./routes/restaurants');
const transportRoutes = require('./routes/transports');
const ticketRoutes = require('./routes/tickets');
const airlineRoutes = require('./routes/airlines');
const landtourRoutes = require('./routes/landtours');
const insuranceRoutes = require('./routes/insurances');
const mediaRoutes = require('./routes/media');

// ═══ Tour Đoàn (Group) Routes ═══
const b2bCompaniesRoutes = require('./routes/b2bCompanies');
const groupLeadersRoutes = require('./routes/groupLeaders');
const groupProjectsRoutes = require('./routes/groupProjects');

app.use('/api/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/public/contracts', publicContractsRoutes);
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/departures', departureRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', tourTypeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visas', visaRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/business-units', buRoutes);
app.use('/api/meta/catalog', catalogRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/transports', transportRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/airlines', airlineRoutes);
app.use('/api/landtours', landtourRoutes);
app.use('/api/insurances', insuranceRoutes);
app.use('/api/media', mediaRoutes);

// ═══ Tour Đoàn (Group) NCC API ═══
const opToursRoutes = require('./routes/opTours');

app.use('/api/group-leaders', groupLeadersRoutes);
app.use('/api/group-projects', groupProjectsRoutes);
app.use('/api/b2b-companies', b2bCompaniesRoutes);
app.use('/api/costings', costingRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/op-tours', opToursRoutes);
app.use('/api/travel-support', require('./routes/travelSupport'));

// ═══ CSKH (Chăm Sóc Khách Hàng) ═══
const cskhRoutes = require('./routes/cskh');
app.use('/api/cskh', cskhRoutes);

const dashboardRoutes = require('./routes/dashboard');

app.use('/api/dashboard', dashboardRoutes);

const licenseRoutes = require('./routes/licenses');
app.use('/api/licenses', licenseRoutes);

const permissionRoutes = require('./routes/permissions');
app.use('/api/permissions', permissionRoutes);

const orgChartRoutes = require('./routes/orgChart');
app.use('/api/org-chart', orgChartRoutes);

const marketRoutes = require('./routes/markets');
app.use('/api/markets', marketRoutes);

const auditLogRoutes = require('./routes/auditLogs');
app.use('/api/audit-logs', auditLogRoutes);

const marketingAdsRoutes = require('./routes/marketingAds');
app.use('/api/marketing-ads', marketingAdsRoutes);

const managementDashboardRoutes = require('./routes/managementDashboard');
app.use('/api/management-dashboard', managementDashboardRoutes);

app.get('/', (req, res) => {
    res.send('FIT Tour CRM API is running...');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const fs = require('fs');
    const logContent = `[${new Date().toISOString()}] GLOBAL ERROR: ${err.message}\n` +
                      `STACK: ${err.stack}\n` +
                      `URL: ${req.method} ${req.url}\n` +
                      `BODY: ${JSON.stringify(req.body, null, 2)}\n\n`;
    fs.appendFileSync('./global_errors.log', logContent);
    console.error('SERVER ERROR:', err);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: err.message });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    if (process.env.DISABLE_BACKGROUND_JOBS === 'true') {
        console.log('🛑 [SAFETY] Đang chạy Localhost: Đã TẮT tính năng nhận Lead Facebook và tự động gửi tin nhắn Zalo/CSKH để không ảnh hưởng Live Web.');
    } else {
        // Start FB Poller for Messenger Sync bypass
        const facebookService = require('./services/facebookService');
        facebookService.startPolling();

        // Start Tour Care Reminder Cron Engine
        const { startCronJobs } = require('./cron/reminderEngine');
        startCronJobs();

        // Start Auto-delete Media Cron Engine (60 days)
        const { startMediaCleanupCron } = require('./cron/mediaCleanup');
        startMediaCleanupCron();

        // Start Auto-delete Audit Logs Cron Engine (30 days)
        const { startAuditLogCleanupCron } = require('./cron/auditLogCleanup');
        startAuditLogCleanupCron();

        // Start CSKH Auto-Sync Cron Engine (every 15 min)
        const { startCskhCron } = require('./cron/cskhEngine');
        startCskhCron();
    }
});
