import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  Copy,
  Speaker,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useWaveform } from "@/hooks/useWaveform";
import { toast } from "sonner";

interface AnswerBoxProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  className?: string;
  voiceMode?: boolean;
  onTranscriptionComplete?: (text: string) => void;
  aiResponseAudio?: string;
}

export function AnswerBox({
  onSubmit,
  disabled = false,
  className,
  voiceMode = false,
  onTranscriptionComplete,
  aiResponseAudio,
}: AnswerBoxProps) {
  const [answer, setAnswer] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(voiceMode);
  const [isPlayingAI, setIsPlayingAI] = useState(false);

  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    transcription,
    audioURL,
    playAudio,
    cleanup,
    error: voiceError,
    uploadAndTranscribe,
  } = useWebRTC();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { drawWaveform } = useWaveform();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (isRecording && canvasRef.current) {
      const interval = setInterval(() => {
        drawWaveform(canvasRef.current);
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isRecording, drawWaveform]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      toast.error("Failed to start recording");
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        // Upload and transcribe
        const text = await uploadAndTranscribe(audioBlob);
        if (text) {
          setAnswer(text);
          onTranscriptionComplete?.(text);
        }
      }
    } catch (err) {
      toast.error("Failed to stop recording");
    }
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer("");
    }
  };

  const handlePlayAIResponse = async () => {
    if (aiResponseAudio) {
      try {
        setIsPlayingAI(true);
        await playAudio(aiResponseAudio);
      } catch (err) {
        toast.error("Failed to play AI response");
      } finally {
        setIsPlayingAI(false);
      }
    }
  };

  const toggleVoiceMode = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <Card className={cn("border-2 border-border", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 border-b pb-3">
          <Button
            variant={!isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsVoiceMode(false)}
            disabled={disabled || isProcessing}
          >
            Text Mode
          </Button>
          <Button
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceMode}
            disabled={disabled || isProcessing}
          >
            <Mic className="h-4 w-4 mr-1" />
            Voice Mode
          </Button>
        </div>

        {/* Error Display */}
        {voiceError && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
            {voiceError}
          </div>
        )}

        {/* Text Mode */}
        {!isVoiceMode && (
          <Textarea
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[150px] resize-none border-0 focus-visible:ring-0 text-base"
            disabled={disabled || isProcessing}
          />
        )}

        {/* Voice Mode */}
        {isVoiceMode && (
          <div className="space-y-4">
            {/* Recording Status */}
            <div className="flex items-center justify-center gap-4 py-6 bg-secondary/30 rounded-lg">
              {isRecording && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording...</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}
              {!isRecording && !isProcessing && (
                <span className="text-sm text-muted-foreground">
                  Click record to start speaking
                </span>
              )}
            </div>

            {/* Transcribed Text */}
            {transcription && (
              <Textarea
                placeholder="Transcribed text will appear here..."
                value={answer || transcription}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-base bg-green-50 dark:bg-green-950/20"
                disabled={disabled}
              />
            )}

            {/* Audio Preview */}
            {audioURL && (
              <div className="space-y-2">
                <label className="text-xs font-medium">Your Recording:</label>
                <audio
                  src={audioURL}
                  controls
                  className="w-full h-8 bg-secondary rounded"
                />
              </div>
            )}
          </div>
        )}

        {/* Waveform Canvas */}
        {isVoiceMode && isRecording && (
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-lg p-4">
              <label className="text-xs font-medium mb-2 block">
                Real-time Audio Waveform
              </label>
              <canvas
                ref={canvasRef}
                width={500}
                height={100}
                className="w-full border border-primary/20 rounded-md bg-black"
              />
            </div>
          </div>
        )}

        {/* AI Response Audio */}
        {aiResponseAudio && (
          <div className="bg-primary/10 p-3 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayAIResponse}
              disabled={isPlayingAI || disabled}
              className="w-full justify-center gap-2"
            >
              {isPlayingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Playing AI Response...
                </>
              ) : (
                <>
                  <Speaker className="h-4 w-4" />
                  Play AI Recruiter Response
                </>
              )}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            {isVoiceMode && (
              <>
                {!isRecording ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartRecording}
                    disabled={disabled || isProcessing}
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    Record
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopRecording}
                    disabled={isProcessing}
                  >
                    <MicOff className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                )}
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAnswer("")}
              disabled={!answer || disabled || isProcessing}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>

            {answer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(answer);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || disabled || isProcessing}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
