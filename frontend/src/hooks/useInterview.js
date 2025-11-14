import { useState, useCallback } from 'react';
import { getNextQuestion, submitAnswer, endSession } from '../api/interview';

/**
 * Hook for managing interview session state
 * @returns {Object} - Full interview session management
 */
export const useInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  /**
   * Start new interview or get next question
   */
  const fetchQuestion = useCallback(async (previousAnswer = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNextQuestion(previousAnswer);
      setCurrentQuestion(data.question);
      if (data.evaluation) {
        setFeedback(data.evaluation);
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to get question';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit answer and get feedback + next question
   */
  const submit = useCallback(async (answer) => {
    setLoading(true);
    setError(null);
    try {
      const data = await submitAnswer(answer);
      
      // Save completed question
      setQuestions(prev => [...prev, {
        question: currentQuestion,
        answer,
        feedback: data.feedback
      }]);
      
      setFeedback(data.feedback);
      setCurrentQuestion(data.nextQuestion);
      
      return data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to submit answer';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentQuestion]);

  /**
   * End interview session
   */
  const end = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await endSession();
      setSessionEnded(true);
      return summary;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to end session';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset interview state
   */
  const reset = useCallback(() => {
    setQuestions([]);
    setCurrentQuestion('');
    setFeedback(null);
    setError(null);
    setSessionEnded(false);
  }, []);

  return {
    questions,
    currentQuestion,
    feedback,
    loading,
    error,
    sessionEnded,
    fetchQuestion,
    submit,
    end,
    reset
  };
};