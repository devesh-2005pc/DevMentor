const mongoose = require('mongoose');

const projectSuggestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userPrompt: {
      type: String,
      required: true,
    },
    projects: [
      {
        title: String,
        description: String,
        difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
        techStack: [String],
        features: [String],
        architecture: String,
        folderStructure: String,
        timeline: String,
        estimatedHours: Number,
        learningOutcomes: [String],
        githubTopics: [String],
        apiIntegrations: [String],
        deploymentSuggestion: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ProjectSuggestion = mongoose.model('ProjectSuggestion', projectSuggestionSchema);
module.exports = ProjectSuggestion;
