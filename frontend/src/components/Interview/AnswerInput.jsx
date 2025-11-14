import { TextField, Button, Box, Paper } from '@mui/material';
import { useState, useRef, useEffect } from 'react';

/**
 * Input component for user answers with submit functionality
 */
const AnswerInput = ({ onSubmit, disabled, loading }) => {
  const [answer, setAnswer] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    // Auto-focus on input when enabled
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to submit
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <Paper elevation={1} className="p-4">
      <Box className="flex gap-3">
        <TextField
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder="Type your answer here... (Ctrl+Enter to submit)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          inputRef={textareaRef}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={disabled || !answer.trim() || loading}
          className="self-start"
          size="large"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AnswerInput;