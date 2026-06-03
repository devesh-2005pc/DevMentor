const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Frontend', 'Backend', 'Full Stack', 'AI Engineer', 'DevOps', 'Cybersecurity', 'Mobile', 'Data Science'],
    },
    duration: {
      type: String,
      default: '12 weeks',
    },
    currentLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    title: String,
    overview: String,
    weeks: [
      {
        weekNumber: Number,
        title: String,
        topics: [String],
        resources: [
          {
            title: String,
            url: String,
            type: { type: String, enum: ['video', 'article', 'course', 'book', 'practice'] },
          },
        ],
        projects: [String],
        milestones: [String],
        estimatedHours: Number,
        completed: { type: Boolean, default: false },
      },
    ],
    careerMilestones: [String],
    recommendedProjects: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;
