const express = require('express');
const router = express.Router();
const { getFinancialStats, getComplaintInsights, getEvents, getProviders, getFeedback, submitFeedback } = require('../controllers/analyticsController');

router.get('/finance', getFinancialStats);
router.get('/insights', getComplaintInsights);
router.get('/events', getEvents);
router.get('/providers', getProviders);
router.get('/feedback', getFeedback);
router.post('/feedback', submitFeedback);

module.exports = router;
