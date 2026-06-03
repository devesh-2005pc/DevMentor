const express = require('express');
const router = express.Router();
const { predict, getHistory } = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/predict', protect, aiLimiter, predict);
router.get('/history', protect, getHistory);

module.exports = router;
