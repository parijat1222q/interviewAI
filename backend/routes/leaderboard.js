const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const leaderboardController = require('../controllers/leaderboardController');

// All routes are protected
router.use(auth);

// GET /api/leaderboard/top - Get top leaderboard entries
router.get('/top', leaderboardController.getTopLeaderboard);

// GET /api/leaderboard/my-position - Get user's position
router.get('/my-position', leaderboardController.getMyPosition);

// GET /api/leaderboard/by-role/:role - Get by role
router.get('/by-role/:role', leaderboardController.getByRole);

// POST /api/leaderboard/update - Update leaderboard
router.post('/update', leaderboardController.updateLeaderboard);

module.exports = router;