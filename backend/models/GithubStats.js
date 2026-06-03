const mongoose = require('mongoose');

const githubStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    githubUsername: {
      type: String,
      required: true,
    },
    profileData: {
      avatarUrl: String,
      bio: String,
      publicRepos: Number,
      followers: Number,
      following: Number,
      company: String,
      location: String,
      blog: String,
      createdAt: Date,
    },
    repositories: [
      {
        name: String,
        description: String,
        language: String,
        stars: Number,
        forks: Number,
        updatedAt: Date,
        url: String,
        topics: [String],
      },
    ],
    languageStats: {
      type: Map,
      of: Number,
    },
    commitActivity: [
      {
        week: Date,
        total: Number,
        days: [Number],
      },
    ],
    contributionStreak: {
      type: Number,
      default: 0,
    },
    totalStars: {
      type: Number,
      default: 0,
    },
    totalForks: {
      type: Number,
      default: 0,
    },
    totalCommits: {
      type: Number,
      default: 0,
    },
    aiInsights: [String],
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const GithubStats = mongoose.model('GithubStats', githubStatsSchema);
module.exports = GithubStats;
