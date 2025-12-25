const express = require('express');
const router = express.Router();
const VoiceService = require('../services/voiceService');
const auth = require('../middleware/auth');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid audio format: ${file.mimetype}`));
    }
  },
});

// Rate limiter for transcription
const transcribeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 transcriptions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many transcription requests' },
});

/**
 * Start voice interview session
 * POST /api/voice/start
 */
router.post('/start', auth, (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = `voice_${userId}_${Date.now()}`;

    console.log(`🎙️ Voice session starting for user: ${userId}`);

    res.json({
      sessionId,
      message: 'Voice session started',
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        model: 'whisper-1',
        sampleRate: 16000,
      },
    });
  } catch (error) {
    console.error('Voice session start error:', error);
    res.status(500).json({ error: 'Failed to start voice session' });
  }
});

/**
 * Upload audio and transcribe (STT)
 * POST /api/voice/upload
 * Multipart form data with "audio" field
 */
router.post('/upload', auth, transcribeLimiter, upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const userId = req.user.userId;
    console.log(`📤 Transcribing audio for user: ${userId}, size: ${file.buffer.length}`);

    // Transcribe audio using VoiceService
    const transcription = await VoiceService.transcribeAudio(file.buffer, userId);

    console.log(`✅ Transcription complete for user: ${userId}`);
    console.log(`   Text: ${transcription.substring(0, 100)}...`);

    res.json({
      transcription,
      duration: file.size ? file.size / 1000 : file.buffer.length / 1000,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Transcription error for user ${req.user?.userId}:`, error.message);
    res.status(500).json({ error: error.message || 'Transcription failed' });
  }
});

/**
 * Generate TTS (Text to Speech) for AI recruiter voice
 * POST /api/voice/tts
 * Body: { text: string }
 */
router.post('/tts', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text required for TTS' });
    }

    const userId = req.user.userId;
    console.log(`🎤 Generating TTS for user: ${userId}`);
    console.log(`   Text: ${text.substring(0, 100)}...`);

    // Generate audio using OpenAI TTS
    const audioUrl = await VoiceService.generateTTS(text, userId);

    console.log(`✅ TTS generated for user: ${userId}`);

    res.json({
      audioUrl,
      text,
      duration: Math.ceil(text.split(' ').length / 2.5), // Rough estimate
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`TTS generation error for user ${req.user?.userId}:`, error.message);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

/**
 * Get WebSocket token for voice signaling
 * GET /api/voice/token
 */
router.get('/token', auth, (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const userId = req.user.userId;

    // Generate short-lived token (5 minutes)
    const wsToken = jwt.sign(
      {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    console.log(`🔑 WebSocket token generated for user: ${userId}`);

    res.json({
      token: wsToken,
      expiresIn: 300, // 5 minutes in seconds
      wsUrl: `${process.env.VOICE_WS_URL || 'ws://localhost:5000'}/voice-signal`,
    });
  } catch (error) {
    console.error(`Token generation error for user ${req.user?.userId}:`, error.message);
    res.status(500).json({ error: 'Failed to generate WebSocket token' });
  }
});

/**
 * End voice session
 * POST /api/voice/end
 * Body: { sessionId: string }
 */
router.post('/end', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.userId;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    console.log(`🛑 Voice session ending: ${sessionId} for user: ${userId}`);

    // Cleanup logic (WebSocket cleanup handled by VoiceService)
    res.json({
      message: 'Voice session ended',
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Session end error for user ${req.user?.userId}:`, error.message);
    res.status(500).json({ error: 'Failed to end voice session' });
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

module.exports = router;