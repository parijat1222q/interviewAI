const mongoose = require('mongoose');

const sentimentAnalysisSchema = new mongoose.Schema({
  interviewSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionIndex: Number,
  answer: String,
  sentimentScore: {
    // Hugging Face sentiment scores (0-1)
    positive: { type: Number, min: 0, max: 1 },
    neutral: { type: Number, min: 0, max: 1 },
    negative: { type: Number, min: 0, max: 1 },
    label: { type: String, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] }
  },
  tonalAnalysis: {
    confidence: { type: Number, min: 0, max: 1 },
    professionalism: { type: Number, min: 0, max: 10 },
    enthusiasm: { type: Number, min: 0, max: 10 },
    clarity: { type: Number, min: 0, max: 10 },
    pace: String // 'slow', 'normal', 'fast'
  },
  communicationMetrics: {
    wordCount: Number,
    sentenceCount: Number,
    averageWordLength: Number,
    uniqueWords: Number,
    technicalTerms: [String]
  },
  analyzedAt: { type: Date, default: Date.now }
}, { timestamps: true });

sentimentAnalysisSchema.index({ userId: 1, createdAt: -1 });
sentimentAnalysisSchema.index({ interviewSessionId: 1 });

module.exports = mongoose.model('SentimentAnalysis', sentimentAnalysisSchema);