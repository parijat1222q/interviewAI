import { useRef, useState, useCallback } from "react";
import { uploadAudio } from "@/api/voice.api";
import { toast } from "sonner";

export interface VoiceConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
}

export interface UseWebRTCReturn {
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  transcription: string | null;
  audioURL: string | null;
  playAudio: (url: string) => Promise<void>;
  getMediaStream: () => Promise<MediaStream>;
  cleanup: () => void;
  error: string | null;
}

export function useWebRTC(config: VoiceConfig = {}): UseWebRTCReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get media stream from user's microphone
  const getMediaStream = useCallback(async (): Promise<MediaStream> => {
    try {
      if (mediaStreamRef.current) {
        return mediaStreamRef.current;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      mediaStreamRef.current = stream;
      setError(null);
      return stream;
    } catch (err) {
      const message =
        err instanceof DOMException
          ? `Microphone permission denied: ${err.message}`
          : "Failed to access microphone";
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await getMediaStream();

      // Determine MIME type
      const mimeType =
        config.mimeType ||
        (MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "audio/wav");

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: config.audioBitsPerSecond || 128000,
      });

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        const errorMsg = `Recording error: ${event.error}`;
        setError(errorMsg);
        toast.error(errorMsg);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setTranscription(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start recording";
      setError(message);
      toast.error(message);
    }
  }, [getMediaStream, config]);

  // Stop recording and return audio blob
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      const recorder = mediaRecorderRef.current;

      recorder.onstop = () => {
        const mimeType =
          config.mimeType ||
          (MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/mp4");
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        // Create preview URL
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        setIsRecording(false);
        chunksRef.current = [];
        resolve(audioBlob);
      };

      recorder.stop();
    });
  }, [isRecording, config]);

  // Upload audio to backend and get transcription
  const uploadAndTranscribe = useCallback(
    async (audioBlob: Blob): Promise<string | null> => {
      try {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const response = await uploadAudio(formData);

        if (response.transcription) {
          setTranscription(response.transcription);
          return response.transcription;
        }

        throw new Error("No transcription returned");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to transcribe audio";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Play audio from URL or buffer
  const playAudio = useCallback(async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
        }

        const audio = audioElementRef.current;
        audio.src = url;
        audio.onended = () => resolve();
        audio.onerror = () =>
          reject(new Error("Failed to play audio"));

        audio.play().catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  // Cleanup resources
  const cleanup = useCallback(() => {
    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop audio playback
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
    }

    // Clear URLs
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }

    chunksRef.current = [];
  }, [isRecording, audioURL]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    transcription,
    audioURL,
    playAudio,
    getMediaStream,
    cleanup,
    error,
    uploadAndTranscribe: uploadAndTranscribe as any,
  };
}

