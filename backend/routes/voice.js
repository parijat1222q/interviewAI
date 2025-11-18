const express = require('express');
const router = express.Router();
const VoiceService = require('../services/voiceService');
const { transcribeAudio } = require('../services/voiceService');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for audio uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Start voice interview session
 * POST /api/voice/start
 */
router.post('/start', auth, (req, res) => {
  try {
    const { role } = req.user;
    const sessionId = `voice_${req.user.userId}_${Date.now()}`;
    
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
router.post('/transcribe', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const transcription = await transcribeAudio(req.file.buffer);
    
    res.json({
      transcription,
      duration: req.file.buffer.length / 1000 // Approximate duration in seconds
    });
  } catch (error) {
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
    // Cleanup logic here
    
    res.json({ message: 'Voice session ended' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end voice session' });
  }
});

module.exports = router;