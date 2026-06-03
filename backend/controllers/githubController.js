const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const { buildGithubStats } = require('../services/githubService');
const { generateGithubInsights } = require('../services/aiService');
const GithubStats = require('../models/GithubStats');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

// @desc    Connect GitHub username and fetch stats
// @route   POST /api/github/connect
// @access  Private
const connectGithub = asyncHandler(async (req, res, next) => {
  const { username } = req.body;

  if (!username) return next(new ApiError(400, 'GitHub username is required'));

  // Fetch GitHub data
  const stats = await buildGithubStats(username).catch(() => {
    throw new ApiError(404, `GitHub user "${username}" not found or API rate limit reached`);
  });

  // Generate AI insights
  const aiInsights = await generateGithubInsights({
    username,
    publicRepos: stats.profileData.publicRepos,
    totalStars: stats.totalStars,
    languageStats: stats.languageStats,
    totalCommits: stats.totalCommits,
    followers: stats.profileData.followers,
  });

  // Save or update stats
  const githubDoc = await GithubStats.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      githubUsername: username,
      profileData: stats.profileData,
      repositories: stats.repositories,
      languageStats: stats.languageStats,
      totalStars: stats.totalStars,
      totalForks: stats.totalForks,
      totalCommits: stats.totalCommits,
      aiInsights,
      fetchedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Update user's github username
  await User.findByIdAndUpdate(req.user._id, { githubUsername: username });

  res.status(200).json({
    success: true,
    message: 'GitHub connected and analyzed successfully',
    data: githubDoc,
  });
});

// @desc    Get cached GitHub stats
// @route   GET /api/github/stats
// @access  Private
const getStats = asyncHandler(async (req, res, next) => {
  const stats = await GithubStats.findOne({ user: req.user._id });

  if (!stats) {
    return next(new ApiError(404, 'No GitHub data found. Please connect your GitHub first.'));
  }

  res.status(200).json({ success: true, data: stats });
});

// @desc    Refresh GitHub stats
// @route   POST /api/github/refresh
// @access  Private
const refreshStats = asyncHandler(async (req, res, next) => {
  const existing = await GithubStats.findOne({ user: req.user._id });
  if (!existing) return next(new ApiError(404, 'No GitHub connected. Please connect first.'));

  req.body.username = existing.githubUsername;
  return connectGithub(req, res, next);
});

module.exports = { connectGithub, getStats, refreshStats };
