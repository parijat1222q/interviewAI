import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Paper, 
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useInterview } from '../hooks/useInterview';
import { useVoiceInterview } from '../hooks/useVoiceInterview';
import QuestionBubble from '../components/Interview/QuestionBubble';
import AnswerInput from '../components/Interview/AnswerInput';
import FeedbackCard from '../components/Interview/FeedbackCard';
import VoiceRecorder from '../components/Interview/VoiceRecorder';
import { useNavigate } from 'react-router-dom';

const Interview = () => {
  const {
    currentQuestion,
    feedback,
    loading: interviewLoading,
    error: interviewError,
    sessionEnded,
    fetchQuestion,
    submit,
    end,
    reset
  } = useInterview();
  
  const { resetVoice } = useVoiceInterview();
  const [mode, setMode] = useState('text'); // 'text' or 'voice'
  const [voiceAnswer, setVoiceAnswer] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load first question on mount
    if (!sessionStarted) {
      fetchQuestion();
      setSessionStarted(true);
    }
  }, [sessionStarted, fetchQuestion]);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      if (newMode === 'voice') {
        resetVoice(); // Reset voice state when switching to voice mode
      }
    }
  };

  const handleVoiceTranscription = (transcript) => {
    setVoiceAnswer(transcript);
  };

  const handleAnswerSubmit = async (answer) => {
    if (!answer.trim()) return;
    await submit(answer);
    setVoiceAnswer(''); // Clear voice answer after submission
  };

  const handleSubmitVoiceAnswer = async () => {
    if (voiceAnswer.trim()) {
      await handleAnswerSubmit(voiceAnswer);
    }
  };

  const handleEndSession = async () => {
    const summary = await end();
    if (summary) {
      alert(`Session completed!\n\nOverall Score: ${summary.overallScore.accuracy.toFixed(1)}/10\nTotal Questions: ${summary.totalQuestions}`);
      reset();
      resetVoice();
      navigate('/dashboard');
    }
  };

  if (sessionEnded) {
    return (
      <Box className="max-w-4xl mx-auto mt-8 p-4">
        <Paper className="p-8 text-center">
          <Typography variant="h5" className="mb-4">
            ✅ Interview Session Completed!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto mt-8 p-4">
      <Typography variant="h4" className="mb-6 font-bold">
        AI Interview Simulation
      </Typography>

      {/* Mode Toggle */}
      <Paper className="p-4 mb-6">
        <Typography variant="subtitle2" className="mb-2 font-semibold">
          Answer Mode:
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="answer mode"
          fullWidth
        >
          <ToggleButton value="text" aria-label="text mode">
            ✍️ Text
          </ToggleButton>
          <ToggleButton value="voice" aria-label="voice mode">
            🎤 Voice
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Progress Indicator */}
      <Box className="mb-6">
        <Typography variant="body2" className="mb-2">
          Interview in Progress
        </Typography>
        <LinearProgress />
      </Box>

      {interviewError && (
        <Alert severity="error" className="mb-4">
          {interviewError}
        </Alert>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <QuestionBubble text={currentQuestion} />
      )}

      {/* Previous Feedback */}
      {feedback && (
        <FeedbackCard evaluation={feedback} />
      )}

      {/* Answer Input based on mode */}
      <Box className="mt-6">
        {mode === 'text' ? (
          <AnswerInput
            onSubmit={handleAnswerSubmit}
            disabled={interviewLoading}
            loading={interviewLoading}
          />
        ) : (
          <Box>
            <VoiceRecorder onTranscriptionComplete={handleVoiceTranscription} />
            {voiceAnswer && (
              <Paper className="p-4 mt-4 bg-blue-50">
                <Typography variant="subtitle2" className="mb-2 font-semibold">
                  Voice Answer Ready:
                </Typography>
                <Typography variant="body2" className="text-gray-700 mb-3">
                  {voiceAnswer}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmitVoiceAnswer}
                  disabled={interviewLoading}
                >
                  Submit Voice Answer
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {/* Session Controls */}
      <Box className="mt-6 flex justify-between">
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            reset();
            resetVoice();
          }}
        >
          Restart Session
        </Button>
        
        <Button
          variant="contained"
          color="success"
          onClick={handleEndSession}
          disabled={interviewLoading}
        >
          End Session & View Results
        </Button>
      </Box>
    </Box>
  );
};

export default Interview;