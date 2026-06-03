const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    weeklyActivity: [
      {
        week: Date,
        hoursSpent: Number,
        problemsSolved: Number,
        commitsMade: Number,
        score: Number,
      },
    ],
    skillRadar: {
      dsa: { type: Number, default: 0, min: 0, max: 100 },
      webDev: { type: Number, default: 0, min: 0, max: 100 },
      systemDesign: { type: Number, default: 0, min: 0, max: 100 },
      ai_ml: { type: Number, default: 0, min: 0, max: 100 },
      devops: { type: Number, default: 0, min: 0, max: 100 },
      communication: { type: Number, default: 0, min: 0, max: 100 },
    },
    heatmapData: [
      {
        date: String,
        count: Number,
      },
    ],
    totalInterviews: { type: Number, default: 0 },
    totalRoadmaps: { type: Number, default: 0 },
    totalResumeAnalyses: { type: Number, default: 0 },
    totalProjectsGenerated: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    streakDays: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    recommendedSkills: [String],
    aiInsights: [String],
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model('Analytics', analyticsSchema);
module.exports = Analytics;
