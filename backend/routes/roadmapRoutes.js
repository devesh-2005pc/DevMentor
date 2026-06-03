const express = require('express');
const router = express.Router();
const { generate, getHistory, getRoadmap, markWeekComplete } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/generate', protect, aiLimiter, generate);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getRoadmap);
router.put('/:id/week/:weekNum', protect, markWeekComplete);

module.exports = router;
