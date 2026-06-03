const express = require('express');
const router = express.Router();
const { connectGithub, getStats: getGithubStats, refreshStats } = require('../controllers/githubController');
const { protect } = require('../middleware/authMiddleware');

router.post('/connect', protect, connectGithub);
router.get('/stats', protect, getGithubStats);
router.post('/refresh', protect, refreshStats);

module.exports = router;
