import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  CircularProgress 
} from '@mui/material';
import { getInterviewHistory } from '../api/interview';
import ScoreChart from '../components/Dashboard/ScoreChart';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getInterviewHistory();
      setSessions(data);
    } catch (err) {
      setError('Failed to load interview history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box className="max-w-6xl mx-auto mt-8 p-4">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold">
          My Interview Progress
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/interview')}
        >
          New Interview
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats Summary */}
      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Paper className="p-4 text-center">
          <Typography variant="h3" className="text-blue-600">
            {sessions.length}
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Total Sessions
          </Typography>
        </Paper>

        <Paper className="p-4 text-center">
          <Typography variant="h3" className="text-green-600">
            {sessions.reduce((acc, s) => acc + s.questions.length, 0)}
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Questions Answered
          </Typography>
        </Paper>

        <Paper className="p-4 text-center">
          <Typography variant="h3" className="text-purple-600">
            {sessions.length > 0 ? 
              Math.round(
                sessions.flatMap(s => s.questions)
                  .reduce((acc, q) => acc + q.evaluation.accuracy, 0) / 
                sessions.flatMap(s => s.questions).length
              ) : 0
            }/10
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Avg Score
          </Typography>
        </Paper>
      </Box>

      {/* Performance Chart */}
      <ScoreChart sessions={sessions} />
    </Box>
  );
};

export default Dashboard;