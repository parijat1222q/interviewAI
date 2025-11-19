const { WebSocketServer } = require('ws');
const { OpenAI } = require('openai');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

class VoiceService {
  constructor() {
    this.sessions = new Map(); // Store active voice sessions
    this.wss = null;
  }

  /**
   * Initialize WebSocket server for WebRTC signaling with JWT authentication
   */
  initializeWebSocket(server) {
    this.wss = new WebSocketServer({ server, path: '/voice-signal' });
    
    this.wss.on('connection', (ws, req) => {
      console.log('🔊 Voice client attempting connection...');
      
      // Extract token from query parameter: ws://.../voice-signal?token=YOUR_JWT_HERE
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.warn('🔒 WebSocket connection rejected: No token provided');
        ws.close(1008, 'Authentication required: Missing token');
        return;
      }

      try {
        // Verify JWT using same secret as HTTP middleware
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user data to WebSocket instance for use in message handlers
        ws.userId = decoded.userId;
        ws.role = decoded.role;
        ws.email = decoded.email;
        
        console.log(`✅ Voice client authenticated: ${decoded.email} (${decoded.userId})`);
        
        // Proceed with authenticated connection
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
        ws.close(1008, 'Authentication failed: Invalid or expired token');
      }
    });
  }

  /**
   * Handle WebRTC signaling messages with user authorization
   */
  handleSignalingMessage(ws, message) {
    const { type, sessionId, offer, answer, candidate } = message;

    switch (type) {
      case 'join':
        // Store session with userId for security
        this.sessions.set(sessionId, { 
          id: sessionId,
          userId: ws.userId,
          role: ws.role,
          client: ws, 
          peer: null,
          audioBuffer: [],
          createdAt: new Date()
        });
        console.log(`📍 Session created: ${sessionId} for user ${ws.userId}`);
        ws.send(JSON.stringify({ 
          type: 'joined', 
          sessionId,
          userId: ws.userId,
          role: ws.role
        }));
        break;

      case 'offer':
        // Verify session belongs to this user
        const session = this.sessions.get(sessionId);
        if (!session) {
          ws.send(JSON.stringify({ error: 'Session not found' }));
          break;
        }
        
        if (session.userId !== ws.userId) {
          console.warn(`🔒 Unauthorized session access attempt: ${ws.userId} tried to access ${session.userId}'s session`);
          ws.send(JSON.stringify({ error: 'Unauthorized: Session belongs to another user' }));
          break;
        }
        
        // Forward offer to AI peer (simulated)
        console.log(`📤 Offer received for session: ${sessionId}`);
        ws.send(JSON.stringify({ 
          type: 'answer', 
          answer: this.createMockAnswer() 
        }));
        break;

      case 'candidate':
        // Handle ICE candidates - verify ownership
        const candidateSession = this.sessions.get(sessionId);
        if (candidateSession && candidateSession.userId === ws.userId) {
          console.log(`🔄 ICE candidate received for session: ${sessionId}`);
        }
        break;

      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  /**
   * Create mock answer for demo (replace with real WebRTC logic)
   */
  createMockAnswer() {
    return {
      type: 'answer',
      sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n'
    };
  }

  /**
   * Transcribe audio blob to text using OpenAI Whisper
   * @param {Buffer} audioBuffer - Audio data buffer
   * @param {string} userId - User ID for logging
   * @returns {Promise<string>} Transcribed text
   */
  async transcribeAudio(audioBuffer, userId) {
    try {
      console.log(`🎤 Starting transcription for user: ${userId}`);
      
      // Save buffer to temp file
      const tempFile = path.join(__dirname, `../../uploads/audio_${Date.now()}_${userId}.webm`);
      await fs.writeFile(tempFile, audioBuffer);

      // Convert to MP3 (Whisper works better with MP3)
      const mp3File = tempFile.replace('.webm', '.mp3');
      await this.convertToMp3(tempFile, mp3File);

      // Transcribe with Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(mp3File),
        model: "whisper-1",
        response_format: "text"
      });

      // Cleanup temp files
      await fs.unlink(tempFile);
      await fs.unlink(mp3File);

      console.log(`✅ Transcription complete for user: ${userId}`);
      return transcription;
    } catch (error) {
      console.error('Whisper transcription error:', error.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Convert WebM audio to MP3 using ffmpeg
   */
  convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });
  }

  /**
   * Cleanup disconnected session with user verification
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

// Export singleton instance
module.exports = new VoiceService();