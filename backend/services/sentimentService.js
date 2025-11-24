const SentimentAnalysis = require('../models/SentimentAnalysis');
const huggingfaceService = require('./huggingfaceService');

/**
 * Analyze answer sentiment and save to database
 * @param {string} interviewSessionId - Session ID
 * @param {string} userId - User ID
 * @param {number} questionIndex - Question number
 * @param {string} answer - Answer text
 * @returns {Promise<Object>} Sentiment analysis result
 */
exports.analyzeAndSaveAnswer = async (interviewSessionId, userId, questionIndex, answer) => {
  try {
    // Get sentiment scores from Hugging Face
    const sentimentScore = await huggingfaceService.analyzeSentiment(answer);

    // Get tone analysis
    const tonalAnalysis = huggingfaceService.analyzeTone(answer);

    // Extract technical terms
    const technicalTerms = huggingfaceService.extractTechnicalTerms(answer);

    // Communication metrics
    const words = answer.trim().split(/\s+/);
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const analysis = new SentimentAnalysis({
      interviewSessionId,
      userId,
      questionIndex,
      answer,
      sentimentScore,
      tonalAnalysis: {
        ...tonalAnalysis,
        confidence: tonalAnalysis.confidence
      },
      communicationMetrics: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        averageWordLength: (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(2),
        uniqueWords: new Set(words.map(w => w.toLowerCase())).size,
        technicalTerms
      }
    });

    await analysis.save();
    return analysis;
  } catch (error) {
    console.error('Sentiment analysis error:', error.message);
    throw error;
  }
};

/**
 * Get sentiment history for user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records
 * @returns {Promise<Array>} Sentiment records
 */
exports.getUserSentimentHistory = async (userId, limit = 50) => {
  try {
    const history = await SentimentAnalysis.find({ userId })
      .sort({ analyzedAt: -1 })
      .limit(limit)
      .lean();

    return history;
  } catch (error) {
    console.error('Get sentiment history error:', error.message);
    throw error;
  }
};

/**
 * Calculate sentiment trends
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Trend analysis
 */
exports.getSentimentTrends = async (userId) => {
  try {
    const history = await SentimentAnalysis.find({ userId })
      .sort({ analyzedAt: -1 })
      .limit(20)
      .lean();

    if (history.length === 0) return null;

    const avgSentiment = {
      positive: (history.reduce((sum, h) => sum + h.sentimentScore.positive, 0) / history.length).toFixed(2),
      neutral: (history.reduce((sum, h) => sum + h.sentimentScore.neutral, 0) / history.length).toFixed(2),
      negative: (history.reduce((sum, h) => sum + h.sentimentScore.negative, 0) / history.length).toFixed(2)
    };

    const avgTone = {
      professionalism: Math.round(history.reduce((sum, h) => sum + h.tonalAnalysis.professionalism, 0) / history.length),
      enthusiasm: Math.round(history.reduce((sum, h) => sum + h.tonalAnalysis.enthusiasm, 0) / history.length),
      clarity: Math.round(history.reduce((sum, h) => sum + h.tonalAnalysis.clarity, 0) / history.length)
    };

    return {
      averageSentiment: avgSentiment,
      averageTone: avgTone,
      mostUsedTerms: this.getMostUsedTerms(history, 10),
      trend: 'improving' // Can add logic to determine trend
    };
  } catch (error) {
    console.error('Get trends error:', error.message);
    throw error;
  }
};

/**
 * Get most used technical terms
 */
getMostUsedTerms = (history, limit = 10) => {
  const termFreq = {};

  history.forEach(record => {
    if (record.communicationMetrics?.technicalTerms) {
      record.communicationMetrics.technicalTerms.forEach(term => {
        termFreq[term] = (termFreq[term] || 0) + 1;
      });
    }
  });

  return Object.entries(termFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, freq]) => ({ term, frequency: freq }));
};