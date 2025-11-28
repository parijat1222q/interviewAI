const Leaderboard = require('../models/Leaderboard');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');

/**
 * Update leaderboard entry after interview completion
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated leaderboard entry
 */
exports.updateLeaderboard = async (userId) => {
  try {
    // Get all completed interviews for this user
    const sessions = await InterviewSession.find({
      userId,
      completed: true
    });

    if (sessions.length === 0) {
      return null;
    }

    // Calculate aggregate scores
    let totalAccuracy = 0;
    let totalClarity = 0;
    let totalConfidence = 0;
    let totalQuestions = 0;

    sessions.forEach(session => {
      session.questions.forEach(q => {
        if (q.evaluation) {
          totalAccuracy += q.evaluation.accuracy;
          totalClarity += q.evaluation.clarity;
          totalConfidence += q.evaluation.confidence_score;
          totalQuestions += 1;
        }
      });
    });

    const avgAccuracy = totalQuestions > 0 ? totalAccuracy / totalQuestions : 0;
    const avgClarity = totalQuestions > 0 ? totalClarity / totalQuestions : 0;
    const avgConfidence = totalQuestions > 0 ? totalConfidence / totalQuestions : 0;
    const totalScore = Math.round((avgAccuracy + avgClarity + avgConfidence) / 3 * 100);

    // Check for badges
    const badges = calculateBadges(sessions, avgAccuracy, avgClarity, avgConfidence);

    // Update or create leaderboard entry
    let leaderboard = await Leaderboard.findOne({ userId });

    if (!leaderboard) {
      leaderboard = new Leaderboard({
        userId,
        totalScore,
        averageAccuracy: avgAccuracy,
        averageClarity: avgClarity,
        averageConfidence: avgConfidence,
        totalInterviews: sessions.length,
        totalQuestions,
        badges
      });
    } else {
      leaderboard.totalScore = totalScore;
      leaderboard.averageAccuracy = avgAccuracy;
      leaderboard.averageClarity = avgClarity;
      leaderboard.averageConfidence = avgConfidence;
      leaderboard.totalInterviews = sessions.length;
      leaderboard.totalQuestions = totalQuestions;
      leaderboard.badges = [...(leaderboard.badges || []), ...badges];
      leaderboard.updatedAt = new Date();
    }

    await leaderboard.save();

    // Update global rank
    await this.updateRanks();

    return leaderboard;
  } catch (error) {
    console.error('Leaderboard update error:', error.message);
    throw error;
  }
};

/**
 * Calculate earned badges
 * @returns {Array} Earned badge objects
 */
const calculateBadges = (sessions, avgAccuracy, avgClarity, avgConfidence) => {
  const badges = [];

  // Perfect Accuracy badge
  if (avgAccuracy >= 9) {
    badges.push({
      name: 'Perfect Accuracy',
      criteria: 'Achieved 9+ accuracy score',
      earnedAt: new Date()
    });
  }

  // Clarity Champion
  if (avgClarity >= 8.5) {
    badges.push({
      name: 'Clarity Champion',
      criteria: 'Achieved 8.5+ clarity score',
      earnedAt: new Date()
    });
  }

  // Consistency badge (5+ interviews)
  if (sessions.length >= 5) {
    badges.push({
      name: 'Consistent Learner',
      criteria: 'Completed 5+ interviews',
      earnedAt: new Date()
    });
  }

  // Master badge (20+ questions answered)
  const totalQuestions = sessions.reduce((sum, s) => sum + s.questions.length, 0);
  if (totalQuestions >= 20) {
    badges.push({
      name: 'Interview Master',
      criteria: 'Answered 20+ questions',
      earnedAt: new Date()
    });
  }

  return badges;
};

/**
 * Recalculate ranks for all users
 */
exports.updateRanks = async () => {
  try {
    const leaderboards = await Leaderboard.find()
      .sort({ totalScore: -1 });

    for (let i = 0; i < leaderboards.length; i++) {
      leaderboards[i].rank = i + 1;
      await leaderboards[i].save();
    }
  } catch (error) {
    console.error('Rank update error:', error.message);
  }
};

/**
 * Get top leaderboard entries
 * @param {number} limit - Number of entries to return
 * @returns {Promise<Array>} Top leaderboard entries
 */
exports.getTopLeaderboard = async (limit = 50) => {
  try {
    const entries = await Leaderboard.find()
      .populate('userId', 'email role')
      .sort({ totalScore: -1 })
      .limit(limit)
      .lean();

    return entries;
  } catch (error) {
    console.error('Get leaderboard error:', error.message);
    throw error;
  }
};

/**
 * Get user's leaderboard position
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User's leaderboard entry with rank
 */
exports.getUserLeaderboardPosition = async (userId) => {
  try {
    const entry = await Leaderboard.findOne({ userId })
      .populate('userId', 'email role')
      .lean();

    if (!entry) {
      return null;
    }

    return {
      rank: entry.rank,
      totalScore: entry.totalScore,
      averageAccuracy: entry.averageAccuracy,
      averageClarity: entry.averageClarity,
      averageConfidence: entry.averageConfidence,
      totalInterviews: entry.totalInterviews,
      totalQuestions: entry.totalQuestions,
      badges: entry.badges
    };
  } catch (error) {
    console.error('Get user position error:', error.message);
    throw error;
  }
};

/**
 * Get leaderboard by role (filter)
 * @param {string} role - Job role
 * @param {number} limit - Number of entries
 * @returns {Promise<Array>} Leaderboard entries for role
 */
exports.getLeaderboardByRole = async (role, limit = 50) => {
  try {
    const entries = await Leaderboard.find()
      .populate({
        path: 'userId',
        match: { role },
        select: 'email role'
      })
      .sort({ totalScore: -1 })
      .limit(limit)
      .lean();

    return entries.filter(e => e.userId !== null);
  } catch (error) {
    console.error('Get role leaderboard error:', error.message);
    throw error;
  }
};