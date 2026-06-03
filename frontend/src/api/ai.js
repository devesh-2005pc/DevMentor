import API from './axiosInstance';

/**
 * Send resume text for ATS and skills analysis.
 * Supports passing a string directly or an object { resumeText }.
 */
export const analyzeResume = (data) => {
  const resumeText = typeof data === 'object' ? data.resumeText : data;
  return API.post('/ai/resume-analysis', { resumeText });
};

/**
 * Generate a personalized roadmap based on role, level, and duration.
 * Supports passing ({ role, level, duration }) or (role, level, duration).
 */
export const generateRoadmap = (data, optLevel, optDuration) => {
  let role, level, duration;
  if (typeof data === 'object' && data !== null) {
    role = data.role;
    level = data.level;
    duration = data.duration;
  } else {
    role = data;
    level = optLevel;
    duration = optDuration;
  }
  return API.post('/ai/generate-roadmap', { role, level, duration });
};

/**
 * Generate a mock interview question / Start interview.
 * Supports passing ({ role, difficulty, interviewType, previousQuestions }) or separate arguments.
 */
export const generateInterviewQuestion = (data, optDiff, optType, optPrev) => {
  let role, difficulty, interviewType, previousQuestions;
  if (typeof data === 'object' && data !== null) {
    role = data.role;
    difficulty = data.difficulty;
    interviewType = data.interviewType;
    previousQuestions = data.previousQuestions;
  } else {
    role = data;
    difficulty = optDiff;
    interviewType = optType;
    previousQuestions = optPrev;
  }
  return API.post('/ai/mock-interview', { role, difficulty, interviewType, previousQuestions });
};

/**
 * Evaluate a mock interview answer / Submit answer.
 * Supports passing ({ question, answer, role, interviewId, category }) or separate arguments.
 */
export const evaluateInterviewAnswer = (data, optAnswer, optRole) => {
  let question, answer, role, interviewId, category;
  if (typeof data === 'object' && data !== null) {
    question = data.question;
    answer = data.answer;
    role = data.role;
    interviewId = data.interviewId;
    category = data.category;
  } else {
    question = data;
    answer = optAnswer;
    role = optRole;
  }
  return API.post('/ai/mock-interview', { evaluate: true, question, answer, role, interviewId, category });
};

/**
 * Generate project ideas based on prompt and user skills.
 * Supports passing ({ userPrompt, skills }) or separate arguments.
 */
export const generateProjects = (data, optSkills) => {
  let userPrompt, skills;
  if (typeof data === 'object' && data !== null) {
    // Handle both prompt (original format) and userPrompt
    userPrompt = data.userPrompt || data.prompt;
    skills = data.skills;
  } else {
    userPrompt = data;
    skills = optSkills;
  }
  return API.post('/ai/project-generator', { userPrompt, skills });
};

/**
 * Generate insights based on GitHub statistics.
 * Supports passing ({ githubData }) or githubData.
 */
export const generateGithubInsights = (data) => {
  const githubData = typeof data === 'object' && data.githubData ? data.githubData : data;
  return API.post('/ai/github-insights', { githubData });
};

/**
 * Generate recommendations/feedback on placement score.
 * Supports passing ({ inputFeatures, prediction }) or separate arguments.
 */
export const generatePlacementFeedback = (data, optPrediction) => {
  let inputFeatures, prediction;
  if (typeof data === 'object' && data !== null && (data.inputFeatures || data.prediction)) {
    inputFeatures = data.inputFeatures;
    prediction = data.prediction;
  } else if (typeof data === 'object' && data !== null) {
    // If scores/features passed directly (original format)
    inputFeatures = data;
    prediction = optPrediction;
  } else {
    inputFeatures = data;
    prediction = optPrediction;
  }
  return API.post('/ai/placement-feedback', { inputFeatures, prediction });
};
