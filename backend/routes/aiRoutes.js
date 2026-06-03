const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

router.post('/resume-analysis', aiController.analyzeResumeHandler);
router.post('/generate-roadmap', aiController.generateRoadmapHandler);
router.post('/mock-interview', aiController.mockInterviewHandler);
router.post('/project-generator', aiController.generateProjectsHandler);
router.post('/github-insights', aiController.githubInsightsHandler);
router.post('/placement-feedback', aiController.placementFeedbackHandler);

module.exports = router;
