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
const tourTypeRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');

app.use('/api/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/departures', departureRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', tourTypeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

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
});
