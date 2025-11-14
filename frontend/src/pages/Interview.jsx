import { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert, Paper, LinearProgress } from '@mui/material';
import { useInterview } from '../hooks/useInterview';
import QuestionBubble from '../components/Interview/QuestionBubble';
import AnswerInput from '../components/Interview/AnswerInput';
import FeedbackCard from '../components/Interview/FeedbackCard';
import { useNavigate } from 'react-router-dom';

const Interview = () => {
  const {
    currentQuestion,
    feedback,
    loading,
    error,
    sessionEnded,
    fetchQuestion,
    submit,
    end,
    reset
  } = useInterview();
  
  const [sessionStarted, setSessionStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load first question on mount
    if (!sessionStarted) {
      fetchQuestion();
      setSessionStarted(true);
    }
  }, [sessionStarted, fetchQuestion]);

  const handleAnswerSubmit = async (answer) => {
    await submit(answer);
  };

  const handleEndSession = async () => {
    const summary = await end();
    if (summary) {
      alert(`Session completed!\n\nOverall Score: ${summary.overallScore.accuracy.toFixed(1)}/10\nTotal Questions: ${summary.totalQuestions}`);
      reset();
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

      {/* Progress Indicator */}
      <Box className="mb-6">
        <Typography variant="body2" className="mb-2">
          Interview in Progress
        </Typography>
        <LinearProgress />
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
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

      {/* Answer Input */}
      <Box className="mt-6">
        <AnswerInput
          onSubmit={handleAnswerSubmit}
          disabled={loading}
          loading={loading}
        />
      </Box>

      {/* Session Controls */}
      <Box className="mt-6 flex justify-between">
        <Button
          variant="outlined"
          color="secondary"
          onClick={reset}
        >
          Restart Session
        </Button>
        
        <Button
          variant="contained"
          color="success"
          onClick={handleEndSession}
          disabled={loading}
        >
          End Session & View Results
        </Button>
      </Box>
    </Box>
  );
};

export default Interview;