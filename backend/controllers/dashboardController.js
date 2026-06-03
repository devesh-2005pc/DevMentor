const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const GithubStats = require('../models/GithubStats');
const PlacementScore = require('../models/PlacementScore');
const InterviewResult = require('../models/InterviewResult');

// @desc    Get dashboard overview data
// @route   GET /api/dashboard/overview
// @access  Private
const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [user, analytics, latestResume, githubStats, latestPlacement, recentInterviews] =
    await Promise.all([
      User.findById(userId),
      Analytics.findOne({ user: userId }),
      ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).select('atsScore skills createdAt'),
      GithubStats.findOne({ user: userId }).select('profileData languageStats totalStars totalCommits aiInsights githubUsername'),
      PlacementScore.findOne({ user: userId }).sort({ createdAt: -1 }).select('prediction inputFeatures'),
      InterviewResult.find({ user: userId, status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('role overallScore createdAt'),
    ]);

  // Build heatmap data (last 52 weeks approximation)
  const heatmapData = generateHeatmap();

  // Build weekly activity chart data
  const weeklyActivity = generateWeeklyActivity();

  // Skill radar from analytics or defaults
  const skillRadar = analytics?.skillRadar || {
    dsa: user.dsaScore || 45,
    webDev: 60,
    systemDesign: 35,
    ai_ml: 20,
    devops: 25,
    communication: 70,
  };

  res.status(200).json({
    success: true,
    data: {
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        codingStreak: user.codingStreak || Math.floor(Math.random() * 30) + 5,
        placementReadiness: latestPlacement?.prediction?.readinessScore || user.placementReadiness || 0,
        totalProblems: user.totalProblems || 0,
        githubUsername: user.githubUsername,
      },
      analytics: {
        totalInterviews: analytics?.totalInterviews || 0,
        totalRoadmaps: analytics?.totalRoadmaps || 0,
        totalResumeAnalyses: analytics?.totalResumeAnalyses || 0,
        streakDays: analytics?.streakDays || 0,
        aiInsights: githubStats?.aiInsights || analytics?.aiInsights || [
          'Start by connecting your GitHub to get personalized insights.',
          'Upload your resume to get an ATS score and improvement tips.',
          'Take a mock interview to gauge your readiness.',
        ],
        recommendedSkills: analytics?.recommendedSkills || ['TypeScript', 'System Design', 'Docker', 'GraphQL'],
      },
      resume: latestResume,
      github: githubStats,
      placement: latestPlacement,
      recentInterviews,
      charts: {
        skillRadar,
        weeklyActivity,
        heatmapData,
        languageStats: githubStats?.languageStats || {},
      },
    },
  });
});

// Generate fake-realistic heatmap for demo
function generateHeatmap() {
  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const rand = Math.random();
    const count = rand > 0.6 ? Math.floor(Math.random() * 8) + 1 : 0;
    data.push({ date: dateStr, count });
  }
  return data;
}

// Generate 12 weeks of activity data
function generateWeeklyActivity() {
  return Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    hoursSpent: Math.floor(Math.random() * 20) + 5,
    problemsSolved: Math.floor(Math.random() * 15) + 2,
    commitsMade: Math.floor(Math.random() * 25) + 3,
    score: Math.floor(Math.random() * 40) + 50,
  }));
}

module.exports = { getOverview };
