const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const { predictPlacement } = require('../services/mlService');
const { generatePlacementRecommendations } = require('../services/aiService');
const PlacementScore = require('../models/PlacementScore');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

// @desc    Run placement prediction
// @route   POST /api/placement/predict
// @access  Private
const predict = asyncHandler(async (req, res, next) => {
  const {
    dsaScore, resumeScore, githubActivity,
    projectCount, mockInterviewScore, communicationRating, codingConsistency,
  } = req.body;

  // Validate all features present
  const required = { dsaScore, resumeScore, githubActivity, projectCount, mockInterviewScore, communicationRating, codingConsistency };
  for (const [key, val] of Object.entries(required)) {
    if (val === undefined || val === null) {
      return next(new ApiError(400, `${key} is required`));
    }
  }

  const inputFeatures = {
    dsaScore: Number(dsaScore),
    resumeScore: Number(resumeScore),
    githubActivity: Number(githubActivity),
    projectCount: Number(projectCount),
    mockInterviewScore: Number(mockInterviewScore),
    communicationRating: Number(communicationRating),
    codingConsistency: Number(codingConsistency),
  };

  // Call ML microservice
  let prediction;
  try {
    prediction = await predictPlacement(inputFeatures);
  } catch (err) {
    // Fallback: simple weighted formula if ML service is down
    const score =
      inputFeatures.dsaScore * 0.25 +
      inputFeatures.resumeScore * 0.20 +
      inputFeatures.githubActivity * 0.15 +
      Math.min(inputFeatures.projectCount * 5, 100) * 0.10 +
      inputFeatures.mockInterviewScore * 0.15 +
      (inputFeatures.communicationRating * 10) * 0.10 +
      inputFeatures.codingConsistency * 0.05;

    prediction = {
      readinessScore: Math.round(score),
      predictedRole: score > 75 ? 'Full Stack Developer' : score > 60 ? 'Frontend Developer' : 'Junior Developer',
      confidence: 0.75,
    };
  }

  // Generate AI recommendations
  const aiResult = await generatePlacementRecommendations(inputFeatures, prediction);

  // Save to DB
  const scoreDoc = await PlacementScore.create({
    user: req.user._id,
    inputFeatures,
    prediction,
    aiRecommendations: aiResult.recommendations,
    strengthAreas: aiResult.strengthAreas,
    improvementAreas: aiResult.improvementAreas,
  });

  // Update user's placement readiness
  await User.findByIdAndUpdate(req.user._id, {
    placementReadiness: prediction.readinessScore,
  });

  res.status(200).json({
    success: true,
    message: 'Placement prediction complete',
    data: scoreDoc,
  });
});

// @desc    Get placement history
// @route   GET /api/placement/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const scores = await PlacementScore.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: scores.length, data: scores });
});

module.exports = { predict, getHistory };
