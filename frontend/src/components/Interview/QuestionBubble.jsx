import { Paper, Typography, Box } from '@mui/material';
import { useEffect, useRef } from 'react';

/**
 * Displays a question bubble in the interview chat
 */
const QuestionBubble = ({ text }) => {
  const bubbleRef = useRef(null);

  useEffect(() => {
    // Auto-scroll into view when new question appears
    bubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [text]);

  return (
    <Box className="flex justify-start mb-4" ref={bubbleRef}>
      <Paper 
        elevation={2} 
        className="p-4 max-w-3xl bg-gray-100 rounded-lg"
      >
        <Typography variant="body1" className="text-gray-800">
          <strong>AI Interviewer:</strong> {text}
        </Typography>
      </Paper>
    </Box>
  );
};

export default QuestionBubble;