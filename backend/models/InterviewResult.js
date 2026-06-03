const mongoose = require('mongoose');

const interviewResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'HR', 'System Design', 'Behavioral', 'Mixed'],
      default: 'Technical',
    },
    questions: [
      {
        question: String,
        userAnswer: String,
        aiFeedback: String,
        score: { type: Number, min: 0, max: 10 },
        category: String,
      },
    ],
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    duration: Number, // in minutes
    aiSummary: String,
    strengthPoints: [String],
    improvementPoints: [String],
    technicalScore: { type: Number, min: 0, max: 100 },
    communicationScore: { type: Number, min: 0, max: 100 },
    confidenceScore: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

const InterviewResult = mongoose.model('InterviewResult', interviewResultSchema);
module.exports = InterviewResult;
