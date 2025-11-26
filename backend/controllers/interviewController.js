const InterviewSession = require('../models/InterviewSession');
const { generateInterviewRound, evaluateAnswer } = require('../services/openaiService');
const sentimentService = require('../services/sentimentService');
const leaderboardService = require('../services/leaderboardService');

/**
 * Start or continue interview session
 * POST /api/interview/question
 * Body: { mode: 'technical' | 'hr' | 'behavioral' (optional, defaults to 'technical') }
 */
exports.getQuestion = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const mode = req.body.mode || 'technical'; // Add mode selection

    // Find or create active session
    let session = await InterviewSession.findOne({
      userId,
      completed: false
    });

    if (!session) {
      session = await InterviewSession.create({
        userId,
        role: userRole,
        mode: mode, // Store mode in session
        questions: [],
        currentQuestion: null
      });
    }

    // Update mode if provided
    if (req.body.mode) {
      session.mode = req.body.mode;
    }

    // If no current question, generate one
    if (!session.currentQuestion) {
      const aiResult = await generateInterviewRound(userRole, session.mode, null);
      session.currentQuestion = aiResult.question;
      await session.save();
    }

    res.json({
      question: session.currentQuestion,
      mode: session.mode,
      sessionId: session._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit answer and get evaluation + sentiment analysis
 * POST /api/interview/answer
 * Body: { answer: string }
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { answer } = req.body;
    const userId = req.user.userId;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ error: 'Answer cannot be empty' });
    }

    // Find active session
    const session = await InterviewSession.findOne({
      userId,
      completed: false
    });

    if (!session || !session.currentQuestion) {
      return res.status(400).json({ error: 'No active interview session' });
    }

    // Evaluate the answer with mode context
    const evaluation = await evaluateAnswer(
      session.role,
      session.currentQuestion,
      answer,
      session.mode || 'technical'
    );

    // Perform sentiment analysis
    let sentimentAnalysis = null;
    try {
      sentimentAnalysis = await sentimentService.analyzeAndSaveAnswer(
        session._id,
        userId,
        session.questions.length,
        answer
      );
    } catch (sentimentError) {
      console.warn('Sentiment analysis failed, continuing without it:', sentimentError.message);
    }

    // Save completed question with evaluation
    session.questions.push({
      question: session.currentQuestion,
      answer: answer,
      evaluation: evaluation,
      sentimentAnalysis: sentimentAnalysis ? {
        sentiment: sentimentAnalysis.sentimentScore.label,
        professionalism: sentimentAnalysis.tonalAnalysis.professionalism,
        confidence: sentimentAnalysis.tonalAnalysis.confidence,
        technicalTerms: sentimentAnalysis.communicationMetrics.technicalTerms
      } : null,
      answeredAt: new Date()
    });

    // Generate next question
    const nextQuestionResult = await generateInterviewRound(
      session.role,
      session.mode || 'technical',
      answer
    );
    session.currentQuestion = nextQuestionResult.question;
    await session.save();

    res.json({
      feedback: {
        ...evaluation,
        sentiment: evaluation.sentiment,
        technicalTerms: sentimentAnalysis?.communicationMetrics?.technicalTerms || []
      },
      nextQuestion: nextQuestionResult.question,
      questionNumber: session.questions.length,
      sentimentData: sentimentAnalysis ? {
        sentiment: sentimentAnalysis.sentimentScore.label,
        professionalism: sentimentAnalysis.tonalAnalysis.professionalism,
        clarity: sentimentAnalysis.tonalAnalysis.clarity
      } : null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's interview history
 * GET /api/interview/history
 */
exports.getHistory = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({
      userId: req.user.userId,
      completed: true
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * End current interview session
 * POST /api/interview/end
 */
exports.endSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      userId: req.user.userId,
      completed: false
    });

    if (!session) {
      return res.status(400).json({ error: 'No active session' });
    }

    // Mark as completed
    session.completed = true;
    session.completedAt = new Date();
    await session.save();

    // Calculate overall stats
    const scores = session.questions.map(q => q.evaluation);
    const avgScore = {
      accuracy: scores.length > 0 ? scores.reduce((acc, q) => acc + q.accuracy, 0) / scores.length : 0,
      clarity: scores.length > 0 ? scores.reduce((acc, q) => acc + q.clarity, 0) / scores.length : 0,
      confidence: scores.length > 0 ? scores.reduce((acc, q) => acc + q.confidence_score, 0) / scores.length : 0,
    };

    // Update leaderboard
    try {
      await leaderboardService.updateLeaderboard(req.user.userId);
    } catch (leaderboardError) {
      console.warn('Leaderboard update failed:', leaderboardError.message);
    }

    res.json({
      message: 'Session ended',
      sessionId: session._id,
      mode: session.mode,
      overallScore: avgScore,
      totalQuestions: session.questions.length,
      completedAt: session.completedAt
    });
  } catch (error) {
    next(error);
  }
};