const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ResumeService = require('../services/resumeService');
const auth = require('../middleware/auth');

// Configure multer for PDF uploads
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
      const uniqueName = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.pdf`;
      cb(null, uniqueName);
    }
  }),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * Analyze resume from text
 * POST /api/resume/check
 */
router.post('/check', auth, async (req, res) => {
  try {
    const { resumeText, jobDesc } = req.body;

    if (!resumeText || !jobDesc) {
      return res.status(400).json({ error: 'Resume text and job description required' });
    }

    const analysis = await ResumeService.analyzeResumeATS(resumeText, jobDesc);
    
    res.json({
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Upload and analyze PDF resume
 * POST /api/resume/analyze-pdf
 */
router.post('/analyze-pdf', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    if (!req.body.jobDescription) {
      return res.status(400).json({ error: 'Job description required' });
    }

    const filePath = req.file.path;
    const jobDescription = req.body.jobDescription;

    // Parse PDF to text
    const pdfBuffer = await fs.readFile(filePath);
    const resumeText = await ResumeService.parsePdfToText(pdfBuffer);

    // Analyze with AI
    const analysis = await ResumeService.analyzeResumeATS(resumeText, jobDescription);

    // Cleanup uploaded file
    await ResumeService.cleanupFile(filePath);

    res.json({
      success: true,
      message: 'PDF analyzed successfully',
      analysis,
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        parsedLength: resumeText.length
      }
    });

  } catch (error) {
    console.error('PDF Analysis Error:', error);
    
    // Cleanup on error
    if (req.file?.path) {
      await ResumeService.cleanupFile(req.file.path).catch(() => {});
    }

    res.status(500).json({ 
      error: error.message || 'Failed to analyze PDF resume',
      details: error.stack
    });
  }
});

/**
 * Get supported file types and limits
 * GET /api/resume/config
 */
router.get('/config', (req, res) => {
  res.json({
    supportedTypes: ['application/pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1
  });
});

module.exports = router;