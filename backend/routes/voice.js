const express = require('express');
const router = express.Router();
const VoiceService = require('../services/voiceService');
const { transcribeAudio } = require('../services/voiceService');
const auth = require('../middleware/auth');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

// Configure multer for audio uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure rate limiter for expensive transcription endpoint
const transcribeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6, // limit to 6 transcriptions per minute per IP/user
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many transcription requests, please try again later.' }
});

/**
 * Start voice interview session
 * POST /api/voice/start
 */
router.post('/start', auth, (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.userId;
    const sessionId = `voice_${userId}_${Date.now()}`;
    
    console.log(`🎙️ Voice session starting for user: ${userId}`);
    
    res.json({
      sessionId,
      message: 'Voice session started',
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        model: 'whisper-1'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start voice session' });
  }
});

/**
 * Transcribe audio to text
 * POST /api/voice/transcribe
 */
router.post('/transcribe', auth, transcribeLimiter, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const userId = req.user.userId;
    console.log(`📤 Transcription request from user: ${userId}, file size: ${req.file.size} bytes`);

    // Pass userId to transcription service for logging
    const transcription = await VoiceService.transcribeAudio(req.file.buffer, userId);
    
    res.json({
      transcription,
      duration: req.file.buffer.length / 1000, // Approximate duration in seconds
      userId // Echo back for client verification
    });
  } catch (error) {
    console.error(`Transcription error for user ${req.user.userId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * End voice session
 * POST /api/voice/end
 */
router.post('/end', auth, (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    console.log(`🛑 Voice session ending: ${sessionId} for user: ${userId}`);
    
    // Cleanup logic here
    res.json({ 
      message: 'Voice session ended',
      sessionId,
      userId
    });
  } catch (error) {
    console.error(`Session end error for user ${req.user.userId}:`, error.message);
    res.status(500).json({ error: 'Failed to end voice session' });
  }
});

/**
 * Get WebSocket connection token (generates disposable token for WebSocket auth)
 * GET /api/voice/token
 */
router.get('/token', auth, (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const userId = req.user.userId;
    
    // Generate a short-lived token specifically for WebSocket connection (5 minutes)
    const wsToken = jwt.sign(
      { userId: req.user.userId, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    
    console.log(`🔑 WebSocket token generated for user: ${userId}`);
    
    res.json({
      token: wsToken,
      expiresIn: 300, // 5 minutes in seconds
      wsUrl: `${process.env.VOICE_WS_URL || 'ws://localhost:5000'}/voice-signal`
    });
  } catch (error) {
    console.error(`Token generation error for user ${req.user.userId}:`, error.message);
    res.status(500).json({ error: 'Failed to generate WebSocket token' });
  }
});

module.exports = router;