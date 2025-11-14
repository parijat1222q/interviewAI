import api from './client';

/**
 * Get next interview question
 * @param {string|null} previousAnswer - Answer to previous question (optional)
 * @returns {Promise<Object>} - { question, evaluation }
 */
export const getNextQuestion = async (previousAnswer = null) => {
  const response = await api.post('/interview/question', { previousAnswer });
  return response.data;
};

/**
 * Submit answer for current question
 * @param {string} answer - User's answer
 * @returns {Promise<Object>} - { feedback, nextQuestion }
 */
export const submitAnswer = async (answer) => {
  const response = await api.post('/interview/answer', { answer });
  return response.data;
};

/**
 * Get user's interview history
 * @returns {Promise<Array>} - Array of session objects
 */
export const getInterviewHistory = async () => {
  const response = await api.get('/interview/history');
  return response.data.sessions;
};

/**
 * End current interview session
 * @returns {Promise<Object>} - Session summary
 */
export const endSession = async () => {
  const response = await api.post('/interview/end');
  return response.data;
};

/**
 * Analyze resume ATS compatibility
 * @param {string} resumeText - Resume text content
 * @param {string} jobDesc - Job description
 * @returns {Promise<Object>} - { score, missingKeywords, suggestions }
 */
export const analyzeResume = async (resumeText, jobDesc) => {
  const response = await api.post('/resume/check', { resumeText, jobDesc });
  return response.data;
};