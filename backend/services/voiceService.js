const { WebSocketServer } = require('ws');
const { OpenAI } = require('openai');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { RTCPeerConnection, RTCSessionDescription } = require('werift');

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
  async handleSignalingMessage(ws, message) {
    const { type, sessionId, sdp, candidate } = message;

    switch (type) {
      case 'join':
        // Create new PeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Store session
        this.sessions.set(sessionId, {
          id: sessionId,
          userId: ws.userId,
          role: ws.role,
          client: ws,
          peer: pc,
          audioBuffer: [],
          createdAt: new Date()
        });

        // Handle ICE candidates from local peer (server)
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            ws.send(JSON.stringify({
              type: 'candidate',
              candidate: event.candidate
            }));
          }
        };

        // Handle audio track
        pc.ontrack = (event) => {
          console.log('🎤 Audio track received');
          // In a real implementation, we would pipe this to a media recorder
          // For now, we'll assume the client sends audio blobs via a separate channel or data channel
          // as werift might need more setup for media recording.
          // However, the current frontend implementation seems to send audio blobs via HTTP or WebSocket?
          // Let's check the frontend VoiceRecorder.jsx later.
          // If the frontend sends WebRTC audio, we need to record it.
          // werift supports saving to file.
        };

        console.log(`📍 Session created: ${sessionId} for user ${ws.userId}`);
        ws.send(JSON.stringify({
          type: 'joined',
          sessionId,
          userId: ws.userId,
          role: ws.role
        }));
        break;

      case 'offer':
        const session = this.sessions.get(sessionId);
        if (!session) return;

        if (session.userId !== ws.userId) {
          ws.send(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }

        await session.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await session.peer.createAnswer();
        await session.peer.setLocalDescription(answer);

        ws.send(JSON.stringify({
          type: 'answer',
          sdp: answer
        }));
        break;

      case 'candidate':
        const candidateSession = this.sessions.get(sessionId);
        if (candidateSession && candidateSession.userId === ws.userId) {
          await candidateSession.peer.addIceCandidate(candidate);
        }
        break;
    }
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

      // Save buffer to temp file (WebM is supported by Whisper)
      const tempFile = path.join(__dirname, `../../uploads/audio_${Date.now()}_${userId}.webm`);
      await fs.writeFile(tempFile, audioBuffer);

      // Transcribe with Whisper directly from WebM
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFile),
        model: "whisper-1",
        response_format: "text"
      });

      // Cleanup temp file
      await fs.unlink(tempFile);

      console.log(`✅ Transcription complete for user: ${userId}`);
      return transcription;
    } catch (error) {
      console.error('Whisper transcription error:', error.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Cleanup disconnected session with user verification
   */
  cleanupSession(ws) {
    for (const [id, session] of this.sessions.entries()) {
      if (session.client === ws) {
        console.log(`🗑️ Cleaning up session ${id} for user ${session.userId}`);
        if (session.peer) {
          session.peer.close();
        }
        this.sessions.delete(id);
        break;
      }
    }
  }
}

module.exports = new VoiceService();