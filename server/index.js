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

// Routes
const webhookRoutes = require('./routes/webhook');
const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const leadRoutes = require('./routes/leads');
const bookingRoutes = require('./routes/bookings');
const customerRoutes = require('./routes/customers');
const messageRoutes = require('./routes/messages');

app.use('/api/webhook', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', messageRoutes);

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

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
