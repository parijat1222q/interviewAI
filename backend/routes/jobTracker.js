const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jobTrackerController = require('../controllers/jobTrackerController');

// All routes are protected
router.use(auth);

// GET /api/job-tracker - Get tracker
router.get('/', jobTrackerController.getJobTracker);

// POST /api/job-tracker/add-application - Add application
router.post('/add-application', jobTrackerController.addJobApplication);

// PATCH /api/job-tracker/update-status/:applicationId - Update status
router.patch('/update-status/:applicationId', jobTrackerController.updateApplicationStatus);

// POST /api/job-tracker/add-interview/:applicationId - Add interview
router.post('/add-interview/:applicationId', jobTrackerController.addInterviewRound);

// GET /api/job-tracker/stats - Get statistics
router.get('/stats', jobTrackerController.getStats);

// GET /api/job-tracker/by-status/:status - Get by status
router.get('/by-status/:status', jobTrackerController.getByStatus);

module.exports = router;