const learningHubService = require('../services/learningHubService');

/**
 * GET /api/learning-hub
 * Get learning hub for user
 */
exports.getLearningHub = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const hub = await learningHubService.getOrCreateLearningHub(userId, role);

    res.json({
      success: true,
      hub
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/learning-hub/complete-topic
 * Mark topic as completed
 */
exports.completeTopicLearning = async (req, res, next) => {
  try {
    const { topicId } = req.body;
    const userId = req.user.userId;

    if (!topicId) {
      return res.status(400).json({ error: 'Topic ID required' });
    }

    const hub = await learningHubService.completeTopicLearning(userId, topicId);

    res.json({
      success: true,
      message: 'Topic marked as completed',
      hub
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/learning-hub/daily-challenge
 * Get daily challenge
 */
exports.getDailyChallenge = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const challenge = await learningHubService.getDailyChallenge(userId);

    res.json({
      success: true,
      challenge
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/learning-hub/update-recommendations
 * Update learning recommendations based on skill gaps
 */
exports.updateRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const hub = await learningHubService.updateRecommendationsBasedOnSkillGaps(userId);

    res.json({
      success: true,
      recommendations: hub.recommendedTopics
    });
  } catch (error) {
    next(error);
  }
};