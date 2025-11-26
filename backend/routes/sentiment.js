const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sentimentController = require('../controllers/sentimentController');

// All routes are protected
router.use(auth);

// POST /api/sentiment/analyze - Analyze answer
router.post('/analyze', sentimentController.analyzeAnswer);

// GET /api/sentiment/history - Get history
router.get('/history', sentimentController.getHistory);

// GET /api/sentiment/trends - Get trends
router.get('/trends', sentimentController.getTrends);

module.exports = router;