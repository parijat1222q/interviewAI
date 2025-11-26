const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  role: { 
    type: String, 
    required: true 
  },
  mode: {
    type: String,
    enum: ['technical', 'hr', 'behavioral'],
    default: 'technical',
    index: true
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
    sentimentAnalysis: {
      sentiment: String,
      professionalism: Number,
      confidence: Number,
      technicalTerms: [String]
    },
    answeredAt: Date
  }],
  currentQuestion: String,
  completed: { 
    type: Boolean, 
    default: false,
    index: true
  },
  completedAt: Date
}, { 
  timestamps: true
});

// Compound indexes for performance
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ userId: 1, completed: 1 });
interviewSessionSchema.index({ userId: 1, mode: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);