const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

/**
 * Get user analytics dashboard data
 * GET /api/analytics/dashboard
 */
router.get('/dashboard', auth, analyticsController.getDashboardAnalytics);

/**
 * Get performance trends (last 30 days)
 * GET /api/analytics/trends
 */
router.get('/trends', auth, analyticsController.getPerformanceTrends);

/**
 * Get skill gap analysis
 * GET /api/analytics/skill-gaps
 */
router.get('/skill-gaps', auth, analyticsController.getSkillGaps);

/**
 * Get interview insights and recommendations
 * GET /api/analytics/insights
 */
router.get('/insights', auth, analyticsController.getInterviewInsights);

/**
 * Get detailed session analytics
 * GET /api/analytics/sessions/:sessionId
 */
router.get('/sessions/:sessionId', auth, analyticsController.getSessionAnalytics);

/**
 * Get voice quality metrics
 * GET /api/analytics/voice-quality/:sessionId
 */
router.get('/voice-quality/:sessionId', auth, analyticsController.getVoiceQualityMetrics);

/**
 * Get performance comparison (personal bests, averages)
 * GET /api/analytics/comparison
 */
router.get('/comparison', auth, analyticsController.getPerformanceComparison);

module.exports = router;