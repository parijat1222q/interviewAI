const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// GET /api/user/profile - Current user profile
router.get('/profile', userController.getProfile);

// GET /api/user/badges - User badges (stub)
router.get('/badges', userController.getBadges);

// GET /api/user/:userId - Get specific user
router.get('/:userId', userController.getUserById);

module.exports = router;
