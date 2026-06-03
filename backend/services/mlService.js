const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Call ML service to predict placement readiness
 */
const predictPlacement = async (features) => {
  const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, {
    dsa_score: features.dsaScore,
    resume_score: features.resumeScore,
    github_activity: features.githubActivity,
    project_count: features.projectCount,
    mock_interview_score: features.mockInterviewScore,
    communication_rating: features.communicationRating,
    coding_consistency: features.codingConsistency,
  });

  return {
    readinessScore: Math.round(data.readiness_score),
    predictedRole: data.predicted_role,
    confidence: data.confidence,
  };
};

/**
 * Check ML service health
 */
const checkMLHealth = async () => {
  const { data } = await axios.get(`${ML_SERVICE_URL}/health`);
  return data;
};

module.exports = { predictPlacement, checkMLHealth };
