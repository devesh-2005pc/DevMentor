const mongoose = require('mongoose');

const placementScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inputFeatures: {
      dsaScore: { type: Number, min: 0, max: 100, required: true },
      resumeScore: { type: Number, min: 0, max: 100, required: true },
      githubActivity: { type: Number, min: 0, max: 100, required: true },
      projectCount: { type: Number, min: 0, max: 50, required: true },
      mockInterviewScore: { type: Number, min: 0, max: 100, required: true },
      communicationRating: { type: Number, min: 0, max: 10, required: true },
      codingConsistency: { type: Number, min: 0, max: 100, required: true },
    },
    prediction: {
      readinessScore: { type: Number, min: 0, max: 100 },
      predictedRole: String,
      confidence: Number,
    },
    aiRecommendations: [String],
    strengthAreas: [String],
    improvementAreas: [String],
    mlModelVersion: {
      type: String,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
  }
);

const PlacementScore = mongoose.model('PlacementScore', placementScoreSchema);
module.exports = PlacementScore;
