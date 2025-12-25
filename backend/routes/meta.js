const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');

// Public metadata endpoints consumed by the frontend
router.get('/interview-types', metaController.getInterviewTypes);
router.get('/industries', metaController.getIndustries);

module.exports = router;