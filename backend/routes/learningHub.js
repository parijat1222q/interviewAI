const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const learningHubController = require('../controllers/learningHubController');

// All routes are protected
router.use(auth);

// GET /api/learning-hub - Get learning hub
router.get('/', learningHubController.getLearningHub);

// POST /api/learning-hub/complete-topic - Mark topic complete
router.post('/complete-topic', learningHubController.completeTopicLearning);

// GET /api/learning-hub/daily-challenge - Get daily challenge
router.get('/daily-challenge', learningHubController.getDailyChallenge);

// POST /api/learning-hub/update-recommendations - Update recommendations
router.post('/update-recommendations', learningHubController.updateRecommendations);

module.exports = router;