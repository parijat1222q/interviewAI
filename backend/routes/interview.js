const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getQuestion,
  submitAnswer,
  getHistory,
  endSession
} = require('../controllers/interviewController');

// All routes are protected
router.use(auth);

// POST /api/interview/question - Get next question
router.post('/question', getQuestion);

// POST /api/interview/answer - Submit answer
router.post('/answer', submitAnswer);

// GET /api/interview/history - Get past sessions
router.get('/history', getHistory);

// POST /api/interview/end - End session
router.post('/end', endSession);

module.exports = router;