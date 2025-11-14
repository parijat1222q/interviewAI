import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

/**
 * Line chart showing interview performance over time
 */
const ScoreChart = ({ sessions }) => {
  // Transform sessions into chart data
  const chartData = sessions.map((session, idx) => {
    const scores = session.questions.map(q => q.evaluation);
    return {
      date: new Date(session.createdAt).toLocaleDateString(),
      accuracy: scores.reduce((acc, q) => acc + q.accuracy, 0) / scores.length,
      clarity: scores.reduce((acc, q) => acc + q.clarity, 0) / scores.length,
      confidence: scores.reduce((acc, q) => acc + q.confidence_score, 0) / scores.length,
    };
  }).reverse(); // Chronological order

  if (chartData.length === 0) {
    return (
      <Paper className="p-8 text-center">
        <Typography variant="body1" color="textSecondary">
          No interview data yet. Complete your first session to see trends.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper className="p-4">
      <Typography variant="h6" className="mb-4">
        Performance Trends
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Accuracy"
          />
          <Line 
            type="monotone" 
            dataKey="clarity" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Clarity"
          />
          <Line 
            type="monotone" 
            dataKey="confidence" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Confidence"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ScoreChart;