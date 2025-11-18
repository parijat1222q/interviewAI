import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Mic, 
  MicOff, 
  PlayArrow, 
  Stop,
  Refresh
} from '@mui/icons-material';
import { useVoiceInterview } from '../../hooks/useVoiceInterview';

/**
 * Voice recording UI component
 */
const VoiceRecorder = ({ onTranscriptionComplete }) => {
  const {
    isRecording,
    transcript,
    loading,
    error,
    startRecording,
    stopRecording,
    transcribeAudio,
    resetVoice
  } = useVoiceInterview();

  const [showTranscript, setShowTranscript] = useState(false);

  const handleStart = () => {
    startRecording();
    setShowTranscript(false);
  };

  const handleStop = async () => {
    stopRecording();
    setShowTranscript(true);
  };

  const handleTranscribe = async () => {
    const text = await transcribeAudio();
    if (text && onTranscriptionComplete) {
      onTranscriptionComplete(text);
    }
  };

  return (
    <Paper elevation={3} className="p-6">
      <Typography variant="h6" className="mb-4 font-bold">
        🎤 Voice Answer Mode
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Recording Controls */}
      <Box className="flex justify-center gap-4 mb-6">
        {!isRecording ? (
          <Tooltip title="Start Recording">
            <IconButton
              onClick={handleStart}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="large"
            >
              <Mic fontSize="large" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Stop Recording">
            <IconButton
              onClick={handleStop}
              className="bg-red-500 hover:bg-red-600 text-white animate-pulse"
              size="large"
            >
              <MicOff fontSize="large" />
            </IconButton>
          </Tooltip>
        )}

        {transcript && (
          <>
            <Tooltip title="Use Transcription">
              <IconButton
                onClick={handleTranscribe}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="large"
              >
                <PlayArrow fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reset">
              <IconButton
                onClick={resetVoice}
                className="bg-gray-500 hover:bg-gray-600 text-white"
                size="large"
              >
                <Refresh fontSize="large" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Recording Status */}
      {isRecording && (
        <Box className="text-center mb-4">
          <CircularProgress size={20} className="mr-2" />
          <Typography variant="body2" color="error">
            Recording... Speak now
          </Typography>
        </Box>
      )}

      {/* Transcript Preview */}
      {showTranscript && transcript && (
        <Box className="mt-4 p-4 bg-gray-50 rounded">
          <Typography variant="subtitle2" className="mb-2 font-bold">
            📝 Transcript Preview:
          </Typography>
          <Typography variant="body2" className="text-gray-700">
            {transcript}
          </Typography>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box className="text-center mt-4">
          <CircularProgress />
          <Typography variant="body2" className="mt-2">
            Transcribing with AI...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VoiceRecorder;