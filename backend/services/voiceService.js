const { WebSocketServer } = require('ws');
const { OpenAI } = require('openai');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

class VoiceService {
  constructor() {
    this.sessions = new Map();
    this.wss = null;
  }

  /**
   * Transcribe audio buffer to text using OpenAI Whisper
   * @param {Buffer} audioBuffer - Audio data buffer
   * @param {string} userId - User ID for logging
   * @returns {Promise<string>} Transcribed text
   */
  async transcribeAudio(audioBuffer, userId) {
    try {
      console.log(`🎧 Starting transcription for user: ${userId}`);

      // Create temporary file for Whisper API
      const tempDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(tempDir, { recursive: true });

      const tempFile = path.join(tempDir, `audio_${Date.now()}_${userId}.webm`);
      await fs.writeFile(tempFile, audioBuffer);

      console.log(`   📁 Temp file: ${tempFile}`);

      // Transcribe with OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: await fs.readFile(tempFile),
        model: 'whisper-1',
        language: 'en',
        prompt: 'This is an interview response. Transcribe clearly.',
      });

      // Cleanup temp file
      try {
        await fs.unlink(tempFile);
      } catch (err) {
        console.warn(`Failed to cleanup temp file: ${err.message}`);
      }

      const text = transcription.text.trim();
      console.log(`✅ Transcription complete for user: ${userId}`);
      console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

      return text;
    } catch (error) {
      console.error(`❌ Transcription error for user ${userId}:`, error.message);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Generate TTS (Text to Speech) using OpenAI
   * @param {string} text - Text to convert to speech
   * @param {string} userId - User ID for logging
   * @returns {Promise<string>} URL to audio file
   */
  async generateTTS(text, userId) {
    try {
      console.log(`🎤 Generating TTS for user: ${userId}`);
      console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

      // Create temporary directory
      const tempDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(tempDir, { recursive: true });

      const audioFile = path.join(
        tempDir,
        `tts_${Date.now()}_${userId}.mp3`
      );

      // Generate TTS using OpenAI
      const speechFile = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy', // Professional recruiter voice
        input: text,
        response_format: 'mp3',
        speed: 1.0,
      });

      // Write audio file
      const buffer = await speechFile.arrayBuffer();
      await fs.writeFile(audioFile, Buffer.from(buffer));

      console.log(`✅ TTS generated for user: ${userId}`);
      console.log(`   File: ${audioFile}`);

      // Return URL to audio file (assumes /uploads route is served)
      const audioUrl = `/uploads/tts_${Date.now()}_${userId}.mp3`;
      
      return audioUrl;
    } catch (error) {
      console.error(`❌ TTS generation error for user ${userId}:`, error.message);
      throw new Error(`Failed to generate TTS: ${error.message}`);
    }
  }

  /**
   * Initialize WebSocket server for WebRTC signaling
   */
  initializeWebSocket(server) {
    this.wss = new WebSocketServer({ server, path: '/voice-signal' });

    this.wss.on('connection', (ws, req) => {
      console.log('🔊 Voice client attempting connection...');

      // Extract JWT token from query
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        console.warn('🔒 Connection rejected: No token provided');
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.userId;
        ws.role = decoded.role;

        console.log(`✅ Voice client authenticated: ${decoded.email}`);

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            this.handleSignalingMessage(ws, message);
          } catch (err) {
            console.error('WebSocket message error:', err.message);
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
          }
        });

        ws.on('close', () => {
          console.log(`🔊 Voice client disconnected: ${ws.userId}`);
          this.cleanupSession(ws);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${ws.userId}:`, error.message);
        });
      } catch (error) {
        console.error('🔒 WebSocket auth failed:', error.message);
        ws.close(1008, 'Authentication failed');
      }
    });

    console.log('🎙️ WebSocket server initialized for voice signaling');
  }

  /**
   * Handle WebRTC signaling messages
   */
  async handleSignalingMessage(ws, message) {
    const { type, sessionId, sdp, candidate } = message;

    switch (type) {
      case 'join':
        console.log(`📍 Session created: ${sessionId} for user ${ws.userId}`);
        this.sessions.set(sessionId, {
          id: sessionId,
          userId: ws.userId,
          client: ws,
          createdAt: new Date(),
        });
        ws.send(JSON.stringify({
          type: 'joined',
          sessionId,
          userId: ws.userId,
        }));
        break;

      case 'offer':
      case 'answer':
        const session = this.sessions.get(sessionId);
        if (session && session.userId === ws.userId) {
          console.log(`📨 ${type.toUpperCase()} received for session ${sessionId}`);
        }
        break;

      case 'candidate':
        console.log(`🔗 ICE candidate for session ${sessionId}`);
        break;
    }
  }

  /**
   * Cleanup disconnected session
   */
  cleanupSession(ws) {
    for (const [id, session] of this.sessions.entries()) {
      if (session.client === ws) {
        console.log(`🗑️ Cleaning up session ${id} for user ${session.userId}`);
        this.sessions.delete(id);
        break;
      }
    }
  }
}

module.exports = new VoiceService();