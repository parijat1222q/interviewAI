const InterviewSession = require('../models/InterviewSession');
const { generateInterviewRound, evaluateAnswer } = require('../services/openaiService');

/**
 * Start or continue interview session
 * POST /api/interview/question
 */
exports.getQuestion = async (req, res, next) => {
  try {
    const { previousAnswer } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Find or create active session
    let session = await InterviewSession.findOne({ 
      userId, 
      completed: false 
    });

    if (!session) {
      session = await InterviewSession.create({
        userId,
        role: userRole,
        questions: [],
        currentQuestion: null
      });
    }

    // If previous answer exists, evaluate and save it
    if (previousAnswer && session.currentQuestion) {
      const evaluation = await evaluateAnswer(userRole, session.currentQuestion, previousAnswer);
      session.questions.push({
        question: session.currentQuestion,
        answer: previousAnswer,
        evaluation: evaluation,
        answeredAt: new Date()
      });
    }

    // Generate next question with AI
    const aiResult = await generateInterviewRound(userRole, previousAnswer || null);

    // Update session with new question
    session.currentQuestion = aiResult.question;
    await session.save();

    res.json({
      question: aiResult.question,
      evaluation: aiResult.evaluation // For immediate feedback on first question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit answer and get evaluation
 * POST /api/interview/answer
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

    // Evaluate the answer
    const evaluation = await evaluateAnswer(session.role, session.currentQuestion, answer);

    // Save completed question with evaluation
    session.questions.push({
      question: session.currentQuestion,
      answer: answer,
      evaluation: evaluation,
      answeredAt: new Date()
    });

    // Generate next question
    const nextQuestionResult = await generateInterviewRound(session.role, answer);
    session.currentQuestion = nextQuestionResult.question;
    await session.save();

    res.json({
      feedback: evaluation,
      nextQuestion: nextQuestionResult.question
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
      accuracy: scores.reduce((acc, q) => acc + q.accuracy, 0) / scores.length,
      clarity: scores.reduce((acc, q) => acc + q.clarity, 0) / scores.length,
      confidence: scores.reduce((acc, q) => acc + q.confidence_score, 0) / scores.length,
    };

    res.json({
      message: 'Session ended',
      sessionId: session._id,
      overallScore: avgScore,
      totalQuestions: session.questions.length
    });
  } catch (error) {
    next(error);
  }
};