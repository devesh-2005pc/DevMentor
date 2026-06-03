const express = require('express');
const router = express.Router();
const { generate, getHistory } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/generate', protect, aiLimiter, generate);
router.get('/history', protect, getHistory);

module.exports = router;
