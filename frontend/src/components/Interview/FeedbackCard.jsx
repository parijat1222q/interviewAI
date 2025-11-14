import { Paper, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';

/**
 * Displays AI feedback and scores for an answer
 */
const FeedbackCard = ({ evaluation }) => {
  const [displayScores, setDisplayScores] = useState({
    accuracy: 0,
    clarity: 0,
    confidence: 0
  });

  useEffect(() => {
    // Animate scores on load
    const timer = setTimeout(() => {
      setDisplayScores({
        accuracy: evaluation.accuracy,
        clarity: evaluation.clarity,
        confidence: evaluation.confidence_score
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [evaluation]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper elevation={2} className="p-4 mb-4 bg-green-50">
      <Typography variant="h6" className="mb-3 text-green-800">
        📊 AI Feedback
      </Typography>

      {/* Score Bars */}
      {Object.entries(displayScores).map(([key, score]) => (
        <Box key={key} className="mb-3">
          <div className="flex justify-between mb-1">
            <Typography variant="body2" className="capitalize">
              {key.replace('_', ' ')}
            </Typography>
            <Typography variant="body2" className="font-bold">
              {score.toFixed(1)}/10
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={score * 10}
            className="h-2 rounded"
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: score >= 7 ? '#4caf50' : score >= 5 ? '#ff9800' : '#f44336'
              }
            }}
          />
        </Box>
      ))}

      {/* Sentiment Chip */}
      <Box className="mt-3">
        <Chip
          label={`Sentiment: ${evaluation.sentiment}`}
          color={getSentimentColor(evaluation.sentiment)}
          size="small"
        />
      </Box>

      {/* Missing Concepts */}
      {evaluation.missing_concepts?.length > 0 && (
        <Box className="mt-3">
          <Typography variant="body2" className="font-semibold mb-2">
            Areas to Improve:
          </Typography>
          <div className="flex flex-wrap gap-2">
            {evaluation.missing_concepts.map((concept, idx) => (
              <Chip
                key={idx}
                label={concept}
                color="warning"
                size="small"
                variant="outlined"
              />
            ))}
          </div>
        </Box>
      )}
    </Paper>
  );
};

export default FeedbackCard;