const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeResumeATS } = require('../services/openaiService');

// POST /api/resume/check - Analyze resume
router.post('/check', auth, async (req, res, next) => {
  try {
    const { resumeText, jobDesc } = req.body;

    if (!resumeText || !jobDesc) {
      return res.status(400).json({ error: 'Resume and job description required' });
    }

    const analysis = await analyzeResumeATS(resumeText, jobDesc);

    res.json({
      score: analysis.score,
      missingKeywords: analysis.missing_keywords || [],
      suggestions: analysis.suggestions || []
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;