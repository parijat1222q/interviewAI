const sentimentService = require('../services/sentimentService');

/**
 * POST /api/sentiment/analyze
 * Analyze answer sentiment
 */
exports.analyzeAnswer = async (req, res, next) => {
  try {
    const { interviewSessionId, questionIndex, answer } = req.body;
    const userId = req.user.userId;

    if (!interviewSessionId || !answer || questionIndex === undefined) {
      return res.status(400).json({
        error: 'Session ID, question index, and answer required'
      });
    }

    const analysis = await sentimentService.analyzeAndSaveAnswer(
      interviewSessionId,
      userId,
      questionIndex,
      answer
    );

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sentiment/history
 * Get sentiment history
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;

    const history = await sentimentService.getUserSentimentHistory(userId, limit);

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sentiment/trends
 * Get sentiment trends
 */
exports.getTrends = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const trends = await sentimentService.getSentimentTrends(userId);

    if (!trends) {
      return res.json({
        success: true,
        trends: null,
        message: 'Not enough data for trends'
      });
    }

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    next(error);
  }
};