const { WebSocketServer } = require('ws');
const { OpenAI } = require('openai');
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
   * Initialize WebSocket server for WebRTC signaling
   */
  initializeWebSocket(server) {
    this.wss = new WebSocketServer({ server, path: '/voice-signal' });
    
    this.wss.on('connection', (ws) => {
      console.log('🔊 Voice client connected');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleSignalingMessage(ws, message);
        } catch (err) {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log('🔊 Voice client disconnected');
        this.cleanupSession(ws);
      });
    });
  }

  /**
   * Handle WebRTC signaling messages
   */
  handleSignalingMessage(ws, message) {
    const { type, sessionId, offer, answer, candidate } = message;

    switch (type) {
      case 'join':
        this.sessions.set(sessionId, { 
          id: sessionId, 
          client: ws, 
          peer: null,
          audioBuffer: [] 
        });
        ws.send(JSON.stringify({ type: 'joined', sessionId }));
        break;

      case 'offer':
        // Forward offer to AI peer (simulated)
        const session = this.sessions.get(sessionId);
        if (session) {
          // In real implementation, this would connect to AI voice peer
          ws.send(JSON.stringify({ type: 'answer', answer: this.createMockAnswer() }));
        }
        break;

      case 'candidate':
        // Handle ICE candidates
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
   * @returns {Promise<string>} Transcribed text
   */
  async transcribeAudio(audioBuffer) {
    try {
      // Save buffer to temp file
      const tempFile = path.join(__dirname, `../../uploads/audio_${Date.now()}.webm`);
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
   * Cleanup disconnected session
   */
  cleanupSession(ws) {
    for (const [id, session] of this.sessions.entries()) {
      if (session.client === ws) {
        this.sessions.delete(id);
        break;
      }
    }
  }
}

// Export singleton instance
module.exports = new VoiceService();