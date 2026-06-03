const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const { generateProjectIdeas } = require('../services/aiService');
const ProjectSuggestion = require('../models/ProjectSuggestion');
const Analytics = require('../models/Analytics');

// @desc    Generate project ideas
// @route   POST /api/projects/generate
// @access  Private
const generate = asyncHandler(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) return next(new ApiError(400, 'Prompt is required'));

  const userSkills = req.user.skills || ['JavaScript', 'React', 'Node.js'];

  const projects = await generateProjectIdeas(prompt, userSkills);

  const suggestion = await ProjectSuggestion.create({
    user: req.user._id,
    userPrompt: prompt,
    projects,
  });

  await Analytics.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { totalProjectsGenerated: 1 } }
  );

  res.status(201).json({
    success: true,
    message: 'Project ideas generated successfully',
    data: suggestion,
  });
});

// @desc    Get project suggestion history
// @route   GET /api/projects/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const suggestions = await ProjectSuggestion.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
});

module.exports = { generate, getHistory };
