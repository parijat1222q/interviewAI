import { useState, useRef, useCallback } from 'react';

/**
 * Hook for managing voice interview functionality with authenticated WebSocket
 * @returns {Object} - Voice recording state and controls
 */
export const useVoiceInterview = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const remoteAudioRef = useRef(null);

  /**
   * Start recording audio from microphone
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      // Initialize MediaRecorder
      const options = { mimeType: 'audio/webm;codecs=opus' };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');

    } catch (err) {
      setError(err.message === 'Permission denied' 
        ? 'Microphone access denied. Please allow microphone permissions.'
        : 'Failed to start recording: ' + err.message
      );
      console.error('Recording error:', err);
    }
  }, []);

  /**
   * Stop recording and process audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  /**
   * Transcribe recorded audio using authenticated OpenAI Whisper endpoint
   */
  const transcribeAudio = useCallback(async () => {
    if (!audioBlob) {
      setError('No audio recorded');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Send to backend for transcription (already authenticated via HTTP)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/voice/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTranscript(data.transcription);
      return data.transcription;

    } catch (err) {
      setError('Transcription failed: ' + err.message);
      console.error('Transcription error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [audioBlob]);

  /**
   * Get authenticated WebSocket token and establish connection
   */
  const getWebSocketToken = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/voice/token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get WebSocket token: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (err) {
      setError('Failed to get WebSocket credentials: ' + err.message);
      console.error('WebSocket token error:', err);
      return null;
    }
  }, []);

  /**
   * Establish authenticated WebSocket connection
   */
  const connectWebSocket = useCallback(async () => {
    try {
      const token = await getWebSocketToken();
      if (!token) {
        setError('Authentication failed for voice connection');
        return null;
      }

      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}/voice-signal?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ Authenticated WebSocket connected');
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection failed');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return ws;
    } catch (err) {
      setError('Failed to establish WebSocket connection: ' + err.message);
      return null;
    }
  }, [getWebSocketToken]);

  /**
   * Start WebRTC call: create PeerConnection, send join, create offer when server responds
   * @param {string} sessionId
   * @returns {Object} { ws, pc, stop }
   */
  const startWebRTC = useCallback(async (sessionId) => {
    try {
      const token = await getWebSocketToken();
      if (!token) throw new Error('No WS token');

      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}/voice-signal?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // Play remote audio
      const remoteAudio = document.createElement('audio');
      remoteAudio.autoplay = true;
      remoteAudioRef.current = remoteAudio;

      pc.ontrack = (event) => {
        // event.streams[0] should contain remote audio
        if (remoteAudio.srcObject !== event.streams[0]) {
          remoteAudio.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (ev) => {
        if (ev.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'candidate',
            sessionId,
            candidate: ev.candidate
          }));
        }
      };

      // Open WS and perform signaling
      ws.onopen = async () => {
        console.log('WebSocket open, sending join');
        ws.send(JSON.stringify({ type: 'join', sessionId }));

        // Get local audio and add tracks to PC
        try {
          const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        } catch (err) {
          console.error('Failed to get local audio for WebRTC', err);
        }
      };

      ws.onmessage = async (msgEvent) => {
        try {
          const msg = JSON.parse(msgEvent.data);
          if (msg.type === 'joined') {
            // Create offer after server acknowledges join
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({
              type: 'offer',
              sessionId,
              sdp: offer
            }));
          } else if (msg.type === 'answer' && msg.sdp) {
            await pc.setRemoteDescription(msg.sdp);
          } else if (msg.type === 'candidate' && msg.candidate) {
            try {
              await pc.addIceCandidate(msg.candidate);
            } catch (e) {
              console.warn('Failed to add remote ICE candidate', e);
            }
          }
        } catch (err) {
          console.error('WS message handling error', err);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error', e);
      };

      ws.onclose = () => {
        console.log('Signaling websocket closed');
      };

      const stop = () => {
        try {
          if (pcRef.current) {
            pcRef.current.getSenders().forEach(s => s.track?.stop());
            pcRef.current.close();
          }
          if (wsRef.current) wsRef.current.close();
          if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
          }
          pcRef.current = null;
          wsRef.current = null;
        } catch (e) {
          console.warn('Error stopping WebRTC', e);
        }
      };

      return { ws, pc, stop };
    } catch (err) {
      setError('Failed to start WebRTC: ' + err.message);
      console.error(err);
      return null;
    }
  }, [getWebSocketToken]);

  /**
   * Reset voice state
   */
  const resetVoice = useCallback(() => {
    setIsRecording(false);
    setTranscript('');
    setAudioBlob(null);
    setError(null);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    // stop any ongoing WebRTC session
    if (pcRef.current || wsRef.current) {
      try {
        pcRef.current?.close();
        wsRef.current?.close();
      } catch (e) {}
      pcRef.current = null;
      wsRef.current = null;
    }
  }, []);

  return {
    isRecording,
    transcript,
    audioBlob,
    loading,
    error,
    startRecording,
    stopRecording,
    transcribeAudio,
    connectWebSocket,
    getWebSocketToken,
    startWebRTC,
    stopWebRTC: () => {
      try { pcRef.current?.close(); wsRef.current?.close(); } catch(e) {}
      pcRef.current = null; wsRef.current = null;
    },
    resetVoice
  };
};