const express = require('express');
const router = express.Router();
const { startInterview, submitAnswer, getResults, getResult } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/start', protect, aiLimiter, startInterview);
router.post('/answer', protect, aiLimiter, submitAnswer);
router.get('/results', protect, getResults);
router.get('/:id', protect, getResult);

module.exports = router;
