const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    strengths: [String],
    weaknesses: [String],
    missingKeywords: [String],
    suggestedImprovements: [String],
    roleSuitability: [
      {
        role: String,
        matchPercent: Number,
      },
    ],
    skills: {
      technical: [String],
      soft: [String],
    },
    aiRawResponse: {
      type: String,
    },
    experienceLevel: String,
    summary: String,
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
module.exports = ResumeAnalysis;
