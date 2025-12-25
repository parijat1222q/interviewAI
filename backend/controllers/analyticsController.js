const AnalyticsService = require('../services/analyticsService');
const InterviewSession = require('../models/InterviewSession');
const SentimentAnalysis = require('../models/SentimentAnalysis');

/**
 * Get dashboard analytics with all key metrics
 * GET /api/analytics/dashboard
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const analytics = await AnalyticsService.generateDashboardAnalytics(userId);

    res.json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance trends over time
 * GET /api/analytics/trends
 */
exports.getPerformanceTrends = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const days = parseInt(req.query.days) || 30;
    const trends = await AnalyticsService.getPerformanceTrends(userId, days);

    res.json({
      success: true,
      trends,
      period: `${days} days`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get skill gap analysis
 * GET /api/analytics/skill-gaps
 */
exports.getSkillGaps = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const skillGaps = await AnalyticsService.analyzeSkillGaps(userId);

    res.json({
      success: true,
      skillGaps,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI-generated insights and recommendations
 * GET /api/analytics/insights
 */
exports.getInterviewInsights = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const insights = await AnalyticsService.generateInsights(userId);

    res.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed session-level analytics
 * GET /api/analytics/sessions/:sessionId
 */
exports.getSessionAnalytics = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await InterviewSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const analytics = await AnalyticsService.analyzeSession(session);

    res.json({
      success: true,
      sessionAnalytics: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get voice quality metrics for a session
 * GET /api/analytics/voice-quality/:sessionId
 */
exports.getVoiceQualityMetrics = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await InterviewSession.findById(sessionId);
    if (!session || session.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const voiceMetrics = await AnalyticsService.analyzeVoiceQuality(session);

    res.json({
      success: true,
      voiceQuality: voiceMetrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance comparisons (personal best, average, trend)
 * GET /api/analytics/comparison
 */
exports.getPerformanceComparison = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const comparison = await AnalyticsService.getPerformanceComparison(userId);

    res.json({
      success: true,
      comparison,
    });
  } catch (error) {
    next(error);
  }
};