import { useState, useRef, useCallback } from 'react';
import { analyzeResume } from '../api/interview';

/**
 * Hook for managing voice interview functionality
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
   * Transcribe recorded audio using OpenAI Whisper
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

      // Send to backend for transcription
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
    resetVoice
  };
};