const InterviewSession = require('../models/InterviewSession');
const SentimentAnalysis = require('../models/SentimentAnalysis');
const Leaderboard = require('../models/Leaderboard');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

class AnalyticsService {
  /**
   * Generate complete dashboard analytics
   */
  async generateDashboardAnalytics(userId) {
    try {
      const sessions = await InterviewSession.find({
        userId,
        completed: true,
      }).sort({ completedAt: -1 });

      if (sessions.length === 0) {
        return {
          totalInterviews: 0,
          averageScore: 0,
          bestScore: 0,
          currentStreak: 0,
          skillBreakdown: [],
          recentSessions: [],
        };
      }

      // Calculate scores
      const scores = sessions.flatMap((s) =>
        s.questions.map((q) => ({
          accuracy: q.evaluation?.accuracy || 0,
          clarity: q.evaluation?.clarity || 0,
          confidence: q.evaluation?.confidence_score || 0,
        }))
      );

      const avgScore = Math.round(
        scores.reduce((sum, s) => sum + (s.accuracy + s.clarity + s.confidence) / 3, 0) /
          scores.length
      );

      const bestScore = Math.max(
        ...scores.map((s) => (s.accuracy + s.clarity + s.confidence) / 3)
      );

      // Skill breakdown
      const skillBreakdown = this.calculateSkillBreakdown(sessions);

      // Recent sessions (last 5)
      const recentSessions = sessions.slice(0, 5).map((s) => ({
        id: s._id,
        mode: s.mode,
        completedAt: s.completedAt,
        questionsCount: s.questions.length,
        avgScore: Math.round(
          s.questions.reduce((sum, q) => sum + (q.evaluation?.accuracy || 0), 0) /
            s.questions.length
        ),
      }));

      // Current streak
      const currentStreak = this.calculateStreak(sessions);

      return {
        totalInterviews: sessions.length,
        averageScore,
        bestScore,
        currentStreak,
        skillBreakdown,
        recentSessions,
      };
    } catch (error) {
      console.error('Dashboard analytics error:', error.message);
      throw error;
    }
  }

  /**
   * Get performance trends over specified days
   */
  async getPerformanceTrends(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const sessions = await InterviewSession.find({
        userId,
        completed: true,
        completedAt: { $gte: startDate },
      }).sort({ completedAt: 1 });

      // Group by day
      const trendMap = {};
      sessions.forEach((session) => {
        const date = new Date(session.completedAt).toISOString().split('T')[0];
        if (!trendMap[date]) {
          trendMap[date] = { scores: [], count: 0 };
        }

        const sessionScore = Math.round(
          session.questions.reduce((sum, q) => sum + (q.evaluation?.accuracy || 0), 0) /
            session.questions.length
        );

        trendMap[date].scores.push(sessionScore);
        trendMap[date].count += 1;
      });

      // Convert to array with daily averages
      const trends = Object.entries(trendMap).map(([date, data]) => ({
        date,
        avgScore: Math.round(
          data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        ),
        interviewsCount: data.count,
      }));

      return trends;
    } catch (error) {
      console.error('Performance trends error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze skill gaps from recent interviews
   */
  async analyzeSkillGaps(userId) {
    try {
      const sessions = await InterviewSession.find({
        userId,
        completed: true,
      })
        .sort({ completedAt: -1 })
        .limit(10);

      // Collect all missing concepts
      const gapMap = {};
      sessions.forEach((session) => {
        session.questions.forEach((q) => {
          if (q.evaluation?.missing_concepts) {
            q.evaluation.missing_concepts.forEach((concept) => {
              gapMap[concept] = (gapMap[concept] || 0) + 1;
            });
          }
        });
      });

      // Sort by frequency and format
      const skillGaps = Object.entries(gapMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([skill, frequency]) => ({
          skill,
          frequency,
          priority: frequency >= 3 ? 'high' : frequency >= 2 ? 'medium' : 'low',
        }));

      return skillGaps;
    } catch (error) {
      console.error('Skill gap analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Generate AI insights and recommendations
   */
  async generateInsights(userId) {
    try {
      const sessions = await InterviewSession.find({
        userId,
        completed: true,
      })
        .sort({ completedAt: -1 })
        .limit(5);

      if (sessions.length === 0) {
        return {
          summary: 'Take your first interview to get personalized insights.',
          recommendations: [],
          strengthAreas: [],
          improvementAreas: [],
        };
      }

      // Extract performance data
      const allScores = sessions.flatMap((s) =>
        s.questions.map((q) => q.evaluation?.accuracy || 0)
      );

      const avgAccuracy = Math.round(
        allScores.reduce((a, b) => a + b, 0) / allScores.length
      );

      // Get skill gaps
      const skillGaps = await this.analyzeSkillGaps(userId);

      // Generate AI recommendations
      const prompt = `
Based on these interview performance metrics:
- Average Accuracy: ${avgAccuracy}/10
- Top Skill Gaps: ${skillGaps.map((s) => s.skill).join(', ')}
- Total Interviews Completed: ${sessions.length}

Provide 3-4 specific, actionable recommendations to improve interview performance.
Format as JSON:
{
  "summary": "Brief assessment",
  "recommendations": ["rec1", "rec2", "rec3"],
  "strengthAreas": ["strength1", "strength2"],
  "improvementAreas": ["area1", "area2"]
}
      `.trim();

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const insights = JSON.parse(completion.choices[0].message.content);
      return insights;
    } catch (error) {
      console.error('Insights generation error:', error.message);
      return {
        summary: 'Keep practicing to improve your scores.',
        recommendations: [
          'Focus on clarity in technical explanations',
          'Practice STAR method for behavioral questions',
          'Work on confidence and pacing',
        ],
        strengthAreas: ['Communication', 'Problem-solving'],
        improvementAreas: ['Depth of technical knowledge'],
      };
    }
  }

  /**
   * Analyze a single session in detail
   */
  async analyzeSession(session) {
    try {
      const questionMetrics = session.questions.map((q, idx) => ({
        questionNumber: idx + 1,
        category: q.category || 'Unknown',
        accuracy: q.evaluation?.accuracy || 0,
        clarity: q.evaluation?.clarity || 0,
        confidence: q.evaluation?.confidence_score || 0,
        sentiment: q.evaluation?.sentiment || 'neutral',
        missingConcepts: q.evaluation?.missing_concepts || [],
      }));

      const avgAccuracy = Math.round(
        questionMetrics.reduce((sum, q) => sum + q.accuracy, 0) / questionMetrics.length
      );

      const avgClarity = Math.round(
        questionMetrics.reduce((sum, q) => sum + q.clarity, 0) / questionMetrics.length
      );

      const avgConfidence = Math.round(
        questionMetrics.reduce((sum, q) => sum + q.confidence, 0) / questionMetrics.length
      );

      const overallScore = Math.round((avgAccuracy + avgClarity + avgConfidence) / 3);

      return {
        sessionId: session._id,
        mode: session.mode,
        duration: session.completedAt
          ? Math.round((session.completedAt - session.createdAt) / 60000)
          : 0, // minutes
        totalQuestions: questionMetrics.length,
        overallScore,
        metrics: {
          accuracy: avgAccuracy,
          clarity: avgClarity,
          confidence: avgConfidence,
        },
        questionBreakdown: questionMetrics,
      };
    } catch (error) {
      console.error('Session analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Analyze voice quality metrics
   */
  async analyzeVoiceQuality(session) {
    try {
      const sentimentRecords = await SentimentAnalysis.find({
        interviewSessionId: session._id,
      });

      if (sentimentRecords.length === 0) {
        return {
          clarityScore: 0,
          professionalism: 0,
          enthusiasm: 0,
          pace: 'normal',
          wordCount: 0,
          sentenceCount: 0,
        };
      }

      const avgClarity = Math.round(
        sentimentRecords.reduce((sum, r) => sum + (r.tonalAnalysis?.clarity || 0), 0) /
          sentimentRecords.length
      );

      const avgProfessionalism = Math.round(
        sentimentRecords.reduce(
          (sum, r) => sum + (r.tonalAnalysis?.professionalism || 0),
          0
        ) / sentimentRecords.length
      );

      const avgEnthusiasm = Math.round(
        sentimentRecords.reduce((sum, r) => sum + (r.tonalAnalysis?.enthusiasm || 0), 0) /
          sentimentRecords.length
      );

      const totalWords = sentimentRecords.reduce(
        (sum, r) => sum + (r.communicationMetrics?.wordCount || 0),
        0
      );

      const totalSentences = sentimentRecords.reduce(
        (sum, r) => sum + (r.communicationMetrics?.sentenceCount || 0),
        0
      );

      const pace =
        totalWords / totalSentences > 20 ? 'fast' : totalWords / totalSentences > 12 ? 'normal' : 'slow';

      return {
        clarityScore: avgClarity,
        professionalism: avgProfessionalism,
        enthusiasm: avgEnthusiasm,
        pace,
        wordCount: totalWords,
        sentenceCount: totalSentences,
        averageWordsPerSentence: Math.round(totalWords / (totalSentences || 1)),
      };
    } catch (error) {
      console.error('Voice quality analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Get performance comparisons
   */
  async getPerformanceComparison(userId) {
    try {
      const sessions = await InterviewSession.find({
        userId,
        completed: true,
      }).sort({ completedAt: -1 });

      if (sessions.length === 0) {
        return {
          personalBest: 0,
          averageScore: 0,
          recentAverage: 0,
          trend: 'neutral',
        };
      }

      // Calculate various metrics
      const allScores = sessions.flatMap((s) =>
        s.questions.map((q) => q.evaluation?.accuracy || 0)
      );

      const personalBest = Math.max(...allScores);
      const averageScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

      const recentScores = sessions
        .slice(0, 3)
        .flatMap((s) => s.questions.map((q) => q.evaluation?.accuracy || 0));

      const recentAverage = Math.round(
        recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      );

      // Determine trend
      const trend = recentAverage > averageScore ? 'improving' : recentAverage < averageScore ? 'declining' : 'stable';

      return {
        personalBest,
        averageScore,
        recentAverage,
        trend,
        sessionsCompleted: sessions.length,
      };
    } catch (error) {
      console.error('Performance comparison error:', error.message);
      throw error;
    }
  }

  /**
   * Helper: Calculate skill breakdown
   */
  calculateSkillBreakdown(sessions) {
    const skills = {
      communication: [],
      technical: [],
      problemSolving: [],
      confidence: [],
    };

    sessions.forEach((session) => {
      session.questions.forEach((q) => {
        skills.communication.push(q.evaluation?.clarity || 0);
        skills.technical.push(q.evaluation?.accuracy || 0);
        skills.confidence.push(q.evaluation?.confidence_score || 0);
      });
    });

    return [
      {
        skill: 'Communication',
        score: Math.round(
          skills.communication.reduce((a, b) => a + b, 0) / skills.communication.length
        ),
      },
      {
        skill: 'Technical',
        score: Math.round(
          skills.technical.reduce((a, b) => a + b, 0) / skills.technical.length
        ),
      },
      {
        skill: 'Confidence',
        score: Math.round(
          skills.confidence.reduce((a, b) => a + b, 0) / skills.confidence.length
        ),
      },
    ];
  }

  /**
   * Helper: Calculate current streak
   */
  calculateStreak(sessions) {
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].completedAt);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        sessionDate.toISOString().split('T')[0] ===
        expectedDate.toISOString().split('T')[0]
      ) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }
}

module.exports = new AnalyticsService();