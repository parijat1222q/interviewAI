const jobTrackerService = require('../services/jobTrackerService');

/**
 * GET /api/job-tracker
 * Get user's job tracker
 */
exports.getJobTracker = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const tracker = await jobTrackerService.getOrCreateJobTracker(userId);

    res.json({
      success: true,
      tracker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/job-tracker/add-application
 * Add new job application
 */
exports.addJobApplication = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { companyName, jobTitle, jobUrl, location, salary, notes } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({ error: 'Company name and job title required' });
    }

    const tracker = await jobTrackerService.addJobApplication(userId, {
      companyName,
      jobTitle,
      jobUrl,
      location,
      salary,
      notes
    });

    res.json({
      success: true,
      message: 'Application added',
      tracker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/job-tracker/update-status/:applicationId
 * Update application status
 */
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const tracker = await jobTrackerService.updateApplicationStatus(userId, applicationId, {
      status,
      notes
    });

    res.json({
      success: true,
      message: 'Status updated',
      tracker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/job-tracker/add-interview/:applicationId
 * Add interview round
 */
exports.addInterviewRound = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { applicationId } = req.params;
    const { type, scheduledDate, feedback, result } = req.body;

    const tracker = await jobTrackerService.addInterviewRound(userId, applicationId, {
      type,
      scheduledDate,
      feedback,
      result
    });

    res.json({
      success: true,
      message: 'Interview round added',
      tracker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/job-tracker/stats
 * Get application statistics
 */
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const stats = await jobTrackerService.getApplicationStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/job-tracker/by-status/:status
 * Get applications by status
 */
exports.getByStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status } = req.params;

    const applications = await jobTrackerService.getApplicationsByStatus(userId, status);

    res.json({
      success: true,
      status,
      applications,
      count: applications.length
    });
  } catch (error) {
    next(error);
  }
};