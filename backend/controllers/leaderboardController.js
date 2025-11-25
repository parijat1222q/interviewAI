const leaderboardService = require('../services/leaderboardService');

/**
 * GET /api/leaderboard/top
 * Get top leaderboard entries
 */
exports.getTopLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const entries = await leaderboardService.getTopLeaderboard(limit);

    res.json({
      success: true,
      entries,
      count: entries.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leaderboard/my-position
 * Get user's leaderboard position
 */
exports.getMyPosition = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const position = await leaderboardService.getUserLeaderboardPosition(userId);

    if (!position) {
      return res.json({
        success: true,
        position: null,
        message: 'No interview data yet'
      });
    }

    res.json({
      success: true,
      position
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/leaderboard/by-role/:role
 * Get leaderboard filtered by role
 */
exports.getByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const entries = await leaderboardService.getLeaderboardByRole(role, limit);

    res.json({
      success: true,
      role,
      entries,
      count: entries.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leaderboard/update
 * Update leaderboard (called after interview completion)
 */
exports.updateLeaderboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updated = await leaderboardService.updateLeaderboard(userId);

    res.json({
      success: true,
      leaderboard: updated
    });
  } catch (error) {
    next(error);
  }
};