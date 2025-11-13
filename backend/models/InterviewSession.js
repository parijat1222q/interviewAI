const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // For fast queries by user
  },
  role: { 
    type: String, 
    required: true 
  },
  questions: [{
    question: { type: String, required: true },
    answer: String,
    evaluation: {
      accuracy: { type: Number, min: 0, max: 10 },
      clarity: { type: Number, min: 0, max: 10 },
      missing_concepts: [String],
      sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
      confidence_score: { type: Number, min: 0, max: 10 }
    },
    answeredAt: Date
  }],
  currentQuestion: String,
  completed: { 
    type: Boolean, 
    default: false 
  },
  completedAt: Date
}, { 
  timestamps: true // Adds createdAt, updatedAt
});

// Index for performance
interviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);