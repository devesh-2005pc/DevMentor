const express = require('express');
const router = express.Router();
const { uploadAndAnalyze, getHistory, getAnalysis } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, aiLimiter, upload.single('resume'), uploadAndAnalyze);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getAnalysis);

module.exports = router;
