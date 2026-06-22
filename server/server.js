const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Pass socket.io handler
require('./socket/socketHandler')(io);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploaded audio files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const guardianRoutes = require('./routes/guardianRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const locationRoutes = require('./routes/locationRoutes');
const audioRoutes = require('./routes/audioRoutes');

// Import controllers for direct root routing
const { getCurrentRisk } = require('./controllers/emergencyController');
const { protect } = require('./middleware/authMiddleware');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/guardian', guardianRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/audio', audioRoutes);
app.get('/api/risk/current', protect, getCurrentRisk);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Naari Shield AI Backend API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error occurred' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Force restart trigger
