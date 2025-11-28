const JobTracker = require('../models/JobTracker');

/**
 * Get or create job tracker for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Job tracker entry
 */
exports.getOrCreateJobTracker = async (userId) => {
  try {
    let tracker = await JobTracker.findOne({ userId });

    if (!tracker) {
      tracker = await JobTracker.create({
        userId,
        applications: []
      });
    }

    return tracker;
  } catch (error) {
    console.error('Job tracker creation error:', error.message);
    throw error;
  }
};

/**
 * Add new job application
 * @param {string} userId - User ID
 * @param {Object} applicationData - Application details
 * @returns {Promise<Object>} Updated tracker
 */
exports.addJobApplication = async (userId, applicationData) => {
  try {
    const tracker = await this.getOrCreateJobTracker(userId);

    const newApplication = {
      applicationId: `app_${Date.now()}`,
      companyName: applicationData.companyName,
      jobTitle: applicationData.jobTitle,
      jobUrl: applicationData.jobUrl,
      appliedDate: new Date(),
      status: 'applied',
      statusHistory: [{
        status: 'applied',
        changedAt: new Date(),
        notes: applicationData.notes || 'Application submitted'
      }],
      location: applicationData.location,
      salary: applicationData.salary,
      rating: 0,
      notes: applicationData.notes || ''
    };

    tracker.applications.push(newApplication);
    tracker.totalApplications = tracker.applications.length;
    await tracker.save();

    return tracker;
  } catch (error) {
    console.error('Add application error:', error.message);
    throw error;
  }
};

/**
 * Update application status
 * @param {string} userId - User ID
 * @param {string} applicationId - Application ID
 * @param {Object} statusUpdate - { status, notes }
 * @returns {Promise<Object>} Updated tracker
 */
exports.updateApplicationStatus = async (userId, applicationId, statusUpdate) => {
  try {
    const tracker = await JobTracker.findOne({ userId });
    if (!tracker) throw new Error('Job tracker not found');

    const application = tracker.applications.find(a => a.applicationId === applicationId);
    if (!application) throw new Error('Application not found');

    application.status = statusUpdate.status;
    application.statusHistory.push({
      status: statusUpdate.status,
      changedAt: new Date(),
      notes: statusUpdate.notes || ''
    });
    application.lastUpdated = new Date();

    // Update counters
    if (statusUpdate.status === 'offer') {
      tracker.totalOffers += 1;
    }

    // Calculate conversion rate
    const appliedCount = tracker.applications.length;
    const offerCount = tracker.applications.filter(a => a.status === 'offer').length;
    tracker.conversionRate = appliedCount > 0 ? (offerCount / appliedCount * 100).toFixed(2) : 0;

    await tracker.save();
    return tracker;
  } catch (error) {
    console.error('Update status error:', error.message);
    throw error;
  }
};

/**
 * Add interview round to application
 * @param {string} userId - User ID
 * @param {string} applicationId - Application ID
 * @param {Object} interviewData - Interview details
 * @returns {Promise<Object>} Updated tracker
 */
exports.addInterviewRound = async (userId, applicationId, interviewData) => {
  try {
    const tracker = await JobTracker.findOne({ userId });
    if (!tracker) throw new Error('Job tracker not found');

    const application = tracker.applications.find(a => a.applicationId === applicationId);
    if (!application) throw new Error('Application not found');

    const interviewRound = {
      roundNumber: (application.interviewRounds?.length || 0) + 1,
      type: interviewData.type || 'technical',
      scheduledDate: interviewData.scheduledDate,
      feedback: interviewData.feedback || '',
      result: interviewData.result || 'pending'
    };

    if (!application.interviewRounds) {
      application.interviewRounds = [];
    }

    application.interviewRounds.push(interviewRound);

    // Auto-update status if interview completed
    if (interviewData.result === 'pass') {
      application.status = 'interviewing';
    }

    await tracker.save();
    return tracker;
  } catch (error) {
    console.error('Add interview error:', error.message);
    throw error;
  }
};

/**
 * Get applications by status
 * @param {string} userId - User ID
 * @param {string} status - Application status
 * @returns {Promise<Array>} Filtered applications
 */
exports.getApplicationsByStatus = async (userId, status) => {
  try {
    const tracker = await JobTracker.findOne({ userId });
    if (!tracker) throw new Error('Job tracker not found');

    return tracker.applications.filter(a => a.status === status);
  } catch (error) {
    console.error('Get applications error:', error.message);
    throw error;
  }
};

/**
 * Get application statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics
 */
exports.getApplicationStats = async (userId) => {
  try {
    const tracker = await JobTracker.findOne({ userId });
    if (!tracker) throw new Error('Job tracker not found');

    const stats = {
      total: tracker.applications.length,
      applied: tracker.applications.filter(a => a.status === 'applied').length,
      screening: tracker.applications.filter(a => a.status === 'screening').length,
      interviewing: tracker.applications.filter(a => a.status === 'interviewing').length,
      offers: tracker.applications.filter(a => a.status === 'offer').length,
      rejected: tracker.applications.filter(a => a.status === 'rejected').length,
      conversionRate: tracker.conversionRate || 0,
      averageRating: tracker.applications.length > 0
        ? (tracker.applications.reduce((sum, a) => sum + (a.rating || 0), 0) / tracker.applications.length).toFixed(2)
        : 0
    };

    return stats;
  } catch (error) {
    console.error('Get stats error:', error.message);
    throw error;
  }
};