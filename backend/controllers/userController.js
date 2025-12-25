// FILE: backend/controllers/userController.js
const User = require('../models/User');

/**
 * Get current user profile
 * GET /api/user/profile
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            profile: {
                id: user._id,
                email: user.email,
                name: user.name || '',
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get user by ID (for public profile view)
 * GET /api/user/:userId
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            profile: {
                id: user._id,
                name: user.name || 'User',
                role: user.role,
                // Don't expose email for public profiles
                joinedAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get user badges (Stub for compatibility if needed, though feature is removed)
 * GET /api/user/badges
 */
exports.getBadges = async (req, res) => {
    res.json({ badges: [] });
};
