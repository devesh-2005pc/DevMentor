const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const { generateRoadmap } = require('../services/aiService');
const Roadmap = require('../models/Roadmap');
const Analytics = require('../models/Analytics');

// @desc    Generate a new roadmap
// @route   POST /api/roadmap/generate
// @access  Private
const generate = asyncHandler(async (req, res, next) => {
  const { role, level = 'Beginner', duration = '12' } = req.body;

  if (!role) return next(new ApiError(400, 'Role is required'));

  const validRoles = ['Frontend', 'Backend', 'Full Stack', 'AI Engineer', 'DevOps', 'Cybersecurity', 'Mobile', 'Data Science'];
  if (!validRoles.includes(role)) {
    return next(new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`));
  }

  const aiResult = await generateRoadmap(role, level, `${duration} weeks`);

  const roadmap = await Roadmap.create({
    user: req.user._id,
    role,
    level,
    duration: `${duration} weeks`,
    title: aiResult.title,
    overview: aiResult.overview,
    weeks: aiResult.weeks,
    careerMilestones: aiResult.careerMilestones,
    recommendedProjects: aiResult.recommendedProjects,
  });

  await Analytics.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { totalRoadmaps: 1 } }
  );

  res.status(201).json({
    success: true,
    message: 'Roadmap generated successfully',
    data: roadmap,
  });
});

// @desc    Get roadmap history
// @route   GET /api/roadmap/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const roadmaps = await Roadmap.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-weeks');

  res.status(200).json({ success: true, count: roadmaps.length, data: roadmaps });
});

// @desc    Get single roadmap
// @route   GET /api/roadmap/:id
// @access  Private
const getRoadmap = asyncHandler(async (req, res, next) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
  if (!roadmap) return next(new ApiError(404, 'Roadmap not found'));

  res.status(200).json({ success: true, data: roadmap });
});

// @desc    Mark week as completed
// @route   PUT /api/roadmap/:id/week/:weekNum
// @access  Private
const markWeekComplete = asyncHandler(async (req, res, next) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
  if (!roadmap) return next(new ApiError(404, 'Roadmap not found'));

  const weekNum = parseInt(req.params.weekNum);
  const week = roadmap.weeks.find((w) => w.weekNumber === weekNum);
  if (!week) return next(new ApiError(404, 'Week not found'));

  week.completed = true;

  const completedCount = roadmap.weeks.filter((w) => w.completed).length;
  roadmap.progress = Math.round((completedCount / roadmap.weeks.length) * 100);

  await roadmap.save();

  res.status(200).json({ success: true, data: roadmap });
});

module.exports = { generate, getHistory, getRoadmap, markWeekComplete };
