const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

// ═══ SAFETY CHECK: Cảnh báo nếu có seed/migrate scripts trong thư mục server ═══
const fs = require('fs');
const dangerousFiles = fs.readdirSync(__dirname).filter(f => 
  /^(seed_|migrate_|backfill_).*\.js$/.test(f) && f !== 'index.js'
);
if (dangerousFiles.length > 0) {
  console.warn('⚠️⚠️⚠️ CẢNH BÁO BẢO MẬT ⚠️⚠️⚠️');
  console.warn('Phát hiện seed/migrate scripts trong thư mục server:');
  dangerousFiles.forEach(f => console.warn(`  ❌ ${f}`));
  console.warn('Các file này KHÔNG ĐƯỢC phép tồn tại trên production!');
  console.warn('Hãy xóa ngay: rm ' + dangerousFiles.map(f => f).join(' '));
  console.warn('═══════════════════════════════════════════');
}

// Initialize cron jobs
// require('./cron/emailRetry'); // Bị thay thế bởi pg-boss queueService

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.set('io', io);
global.io = io; // Expose globally for background services

// ═══ SECURITY ENHANCEMENTS ═══
// 1. Trust Proxy: Cần thiết để Rate Limiter nhận diện đúng IP thật từ Cloudflare/Nginx
app.set('trust proxy', 1);

// 2. Helmet: Bảo vệ HTTP Headers (chống XSS, Clickjacking, MIME sniffing...)
app.use(helmet({
  crossOriginResourcePolicy: false, // Để /uploads ảnh hoạt động cross-origin nếu cần
}));

// 3. API Rate Limiter Chung (Ngăn chặn càn quét/DDoS nhẹ)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 2000, // Tối đa 2000 requests mỗi IP (nới lỏng vì dùng chung mạng cty)
  standardHeaders: true, // Trả về `RateLimit-*` headers
  legacyHeaders: false,
  message: { error: 'Quá nhiều request từ mạng của bạn. Vui lòng thử lại sau 15 phút.' }
});

// 4. API Rate Limiter cho Đăng nhập (Chống Brute Force mật khẩu)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 50, // Chỉ cho phép 50 lần thử sai mật khẩu từ 1 IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Vượt quá số lần thử đăng nhập. Hệ thống tạm khóa IP này trong 15 phút để bảo vệ tài khoản.' }
});

// Áp dụng Rate Limiter chung cho tất cả /api
app.use('/api/', apiLimiter);

app.use(cors());
app.use(express.json());

// Serve static files for media uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// AUTO-HEALING: Symlink for Nginx
// Recreate the symlink if it was accidentally deleted by frontend rsync deployments
const { execSync } = require('child_process');
try {
    const symlinkTarget = path.join(__dirname, 'public/uploads');
    const symlinkPath = path.join(__dirname, '../client/dist/uploads');
    
    // Only attempt to create if the parent dist directory exists (i.e., on production/VPS)
    if (fs.existsSync(path.join(__dirname, '../client/dist'))) {
        if (!fs.existsSync(symlinkPath)) {
            console.log('🔄 [AUTO-HEALING] Recreating missing uploads symlink for Nginx...');
            execSync(`ln -sfn "${symlinkTarget}" "${symlinkPath}"`);
        }
    }
} catch (symlinkErr) {
    console.error('⚠️ [AUTO-HEALING] Failed to check or recreate uploads symlink:', symlinkErr.message);
}

// Request Logging Middleware & Fallback Data Recovery
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Đăng ký lưu log body vào cuối chu trình để bắt được req.user
    res.on('finish', () => {
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.url.includes('/auth/')) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                user_id: req.user ? req.user.id : null,
                body: req.body
            };
            
            // Log file tự động tạo theo ngày
            const dateStr = new Date().toISOString().split('T')[0];
            const currentLogPath = path.join(logsDir, `recovery_${dateStr}.jsonl`);
            fs.appendFile(currentLogPath, JSON.stringify(logEntry) + '\n', (err) => {
                if (err) console.error('[RecoveryLog] Failed to write recovery log', err);
            });
        }
    });
    
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
const visaTemplates = require('./routes/visaTemplates');
const systemAlertsRoutes = require('./routes/systemAlerts');
const tourTypeRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');
const activityRoutes = require('./routes/activity');
const buRoutes = require('./routes/buRoutes');
const catalogRoutes = require('./routes/catalog');
const costingRoutes = require('./routes/costings');
const publicContractsRoutes = require('./routes/publicContracts');
const publicDeparturesRoutes = require('./routes/publicDepartures');
const reminderRoutes = require('./routes/reminderRoutes');
const hotelRoutes = require('./routes/hotels');
const restaurantRoutes = require('./routes/restaurants');
const transportRoutes = require('./routes/transports');
const ticketRoutes = require('./routes/tickets');
const airlineRoutes = require('./routes/airlines');
const landtourRoutes = require('./routes/landtours');
const insuranceRoutes = require('./routes/insurances');
const mediaRoutes = require('./routes/media');
const ragDocsAdminRoutes = require('./routes/ragDocs');

// ═══ Tour Đoàn (Group) Routes ═══
const b2bCompaniesRoutes = require('./routes/b2bCompanies');
const groupLeadersRoutes = require('./routes/groupLeaders');
const groupProjectsRoutes = require('./routes/groupProjects');
const miceLeadsRoutes = require('./routes/mice_leads');
const authController = require('./controllers/authController');

app.use('/.well-known', require('./routes/well-known'));
app.use('/api/webhook', webhookRoutes);
app.use('/api/telegram', require('./routes/telegramRoutes'));
// Áp dụng Login Limiter cụ thể cho endpoint đăng nhập
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.get('/api/google/callback', authController.googleCallback);
app.use('/api/tours', tourRoutes);
app.use('/api/public/contracts', publicContractsRoutes);
app.use('/api/public/departures', publicDeparturesRoutes);
app.use('/api/public/reviews', require('./routes/publicReviews'));
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/departures', departureRoutes);
app.use('/api/departure-card-guides', require('./routes/departureCardGuides'));
app.use('/api/guides', guideRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/dispatch', require('./routes/dispatch'));
app.use('/api/dispatch-schedules', require('./routes/dispatchSchedules'));
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', tourTypeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system-alerts', systemAlertsRoutes);
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
app.use('/api/rag-docs', ragDocsAdminRoutes);
app.use('/api/visas', visaRoutes);
app.use('/api/visa-templates', visaTemplates);
app.use('/api/visa-providers', require('./routes/visaProviders'));

// ═══ Tour Đoàn (Group) NCC API ═══
const opToursRoutes = require('./routes/opTours');

app.use('/api/group-leaders', groupLeadersRoutes);
app.use('/api/group-projects', groupProjectsRoutes);
app.use('/api/mice-leads', miceLeadsRoutes);
app.use('/api/b2b-companies', b2bCompaniesRoutes);
app.use('/api/costings', costingRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/op-tours', opToursRoutes);
app.use('/api/travel-support', require('./routes/travelSupport'));

// ═══ CSKH (Chăm Sóc Khách Hàng) ═══
const cskhRoutes = require('./routes/cskh');
app.use('/api/cskh', cskhRoutes);

// ═══ Email Module & Notification ═══
const notificationRoutes = require('./routes/notification');
app.use('/api/notifications', notificationRoutes);
app.use('/api/email-groups', require('./routes/emailGroupRoutes'));
app.use('/api/email-rules', require('./routes/emailRuleRoutes'));

const dashboardRoutes = require('./routes/dashboard');

app.use('/api/dashboard', dashboardRoutes);

const licenseRoutes = require('./routes/licenses');
app.use('/api/licenses', licenseRoutes);
app.use('/api/rag', require('./routes/rag'));

const permissionRoutes = require('./routes/permissions');
const globalActivityRoutes = require('./routes/globalActivities');
app.use('/api/permissions', permissionRoutes);
app.use('/api/activities/global', globalActivityRoutes);

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

const ceoDashboardRoutes = require('./routes/ceoDashboard');
app.use('/api/ceo-dashboard', ceoDashboardRoutes);
app.use('/api/customer-reviews', require('./routes/customerReviews'));
app.use('/api/meeting-rooms', require('./routes/meetingRooms'));
app.use('/api/search', require('./routes/search'));

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

        // Start Lead Auto-Fail Cron Engine (Sweep unassigned leads every 1 AM)
        const { startLeadAutoFailCron } = require('./cron/leadAutoFailEngine');
        startLeadAutoFailCron();

        // Start Auto-delete Media Cron Engine (60 days)
        // const { startMediaCleanupCron } = require('./cron/mediaCleanup');
        // startMediaCleanupCron();

        // Start Auto-delete Audit Logs Cron Engine (30 days)
        const { startAuditLogCleanupCron } = require('./cron/auditLogCleanup');
        startAuditLogCleanupCron();

        // Start CSKH Auto-Sync Cron Engine (every 15 min)
        const { startCskhCron } = require('./cron/cskhEngine');
        startCskhCron();

        // Start Dispatcher SLA Cron Engine (every min)
        const { startDispatcherSLAEngine } = require('./cron/dispatcherSLAEngine');
        startDispatcherSLAEngine();

        require('./cron/monthlyReviewsEmail');
        require('./cron/monthlyDashboardEmail');
        console.log('Cron jobs started (Reminder, Audit Log Cleanup, CSKH, SLA, Monthly Reviews, Monthly Dashboard).');

        // Start Email Listeners for Event-Driven Architecture
        const { registerEmailListeners } = require('./listeners/emailListener');
        registerEmailListeners();

        // Start Background Job Queue Engine (pg-boss)
        const queueService = require('./services/queueService');
        queueService.startQueue().catch(err => {
            console.error('Failed to start Queue Service:', err);
        });
    }
});
 
 
