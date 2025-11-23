const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalScore: {
    type: Number,
    default: 0,
    index: true
  },
  averageAccuracy: {
    type: Number,
    default: 0
  },
  averageClarity: {
    type: Number,
    default: 0
  },
  averageConfidence: {
    type: Number,
    default: 0
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0,
    index: true
  },
  badges: [{
    name: String,
    earnedAt: Date,
    criteria: String
  }],
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivityDate: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Compound index for leaderboard queries
leaderboardSchema.index({ totalScore: -1, updatedAt: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);