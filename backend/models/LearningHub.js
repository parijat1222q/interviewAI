const mongoose = require('mongoose');

const learningHubSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['frontend', 'backend', 'data', 'devops', 'product'],
    required: true
  },
  topics: [{
    topicId: String,
    name: String,
    category: String,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    resources: [{
      type: String,
      title: String,
      url: String,
      resourceType: { type: String, enum: ['article', 'video', 'course', 'documentation'] }
    }],
    completedAt: Date,
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' }
  }],
  dailyChallenge: {
    date: Date,
    question: String,
    completed: Boolean,
    completedAt: Date,
    score: Number
  },
  quizzes: [{
    quizId: String,
    topic: String,
    score: Number,
    attempts: Number,
    completedAt: Date
  }],
  recommendedTopics: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('LearningHub', learningHubSchema);