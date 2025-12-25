import { useEffect, useRef, useState } from "react";

export interface WaveformConfig {
  canvas: HTMLCanvasElement | null;
  audioContext: AudioContext | null;
}

export function useWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  /**
   * Initialize waveform visualization
   */
  const initializeWaveform = (audioStream: MediaStream) => {
    try {
      if (!canvasRef.current) return;

      // Create audio context
      const audioContext =
        audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);
      analyserRef.current = analyser;

      setIsDrawing(true);
    } catch (error) {
      console.error("Waveform initialization error:", error);
    }
  };

  /**
   * Draw waveform on canvas
   */
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.fillStyle = "rgb(15, 15, 30)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(100, 200, 255)";
    ctx.beginPath();

    const sliceWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (isDrawing) {
      animationRef.current = requestAnimationFrame(drawWaveform);
    }
  };

  /**
   * Start waveform animation
   */
  useEffect(() => {
    if (isDrawing) {
      drawWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDrawing]);

  /**
   * Stop waveform visualization
   */
  const stopWaveform = () => {
    setIsDrawing(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  /**
   * Cleanup
   */
  const cleanup = () => {
    stopWaveform();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  return {
    canvasRef,
    initializeWaveform,
    stopWaveform,
    cleanup,
    isDrawing,
  };
}