require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import configuration
const connectDB = require('./config/db');
const validateEnv = require('./config/env.config');

// Import routes
const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const resumeRoutes = require('./routes/resume');
const voiceRoutes = require('./routes/voice');
const leaderboardRoutes = require('./routes/leaderboard');
const learningHubRoutes = require('./routes/learningHub');
const jobTrackerRoutes = require('./routes/jobTracker');
const sentimentRoutes = require('./routes/sentiment');
const metaRoutes = require('./routes/meta'); // <-- added
const userRoutes = require('./routes/user'); // <-- added
const errorHandler = require('./middleware/errorHandler');

// Import Voice Service
const VoiceService = require('./services/voiceService');

// Validate environment
validateEnv();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
connectDB();

// Serve uploaded audio files (for TTS and recordings)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const fs = require('fs').promises;
  const uploadsDir = path.join(__dirname, '../uploads');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('📁 Uploads directory ready');
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }
};

// Call on startup
ensureUploadsDir();

// Add new routes for analytics
const analyticsRoutes = require('./routes/analytics');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/learning-hub', learningHubRoutes);
app.use('/api/job-tracker', jobTrackerRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Prevent direct access to uploads directory
app.use('/uploads', (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server and attach WebSocket
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🔊 Voice WebSocket: ws://localhost:${PORT}/voice-signal`);
});

// Initialize WebSocket server for voice signaling
VoiceService.initializeWebSocket(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});