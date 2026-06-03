const aiService = require('../services/aiService');
const ResumeAnalysis = require('../../backend/models/ResumeAnalysis');
const Roadmap = require('../../backend/models/Roadmap');
const InterviewResult = require('../../backend/models/InterviewResult');
const ProjectSuggestion = require('../../backend/models/ProjectSuggestion');
const GithubStats = require('../../backend/models/GithubStats');
const PlacementScore = require('../../backend/models/PlacementScore');
const User = require('../../backend/models/User');
const Analytics = require('../../backend/models/Analytics');
const { predictPlacement } = require('../../backend/services/mlService');

/**
 * Check if the Groq or Gemini API key exists.
 */
const verifyApiKey = (res) => {
  const hasGroq = process.env.GROQ_API_KEY || process.env.GROQ_API_KEYY;
  const hasGemini = process.env.GEMINI_API_KEY;
  if ((!hasGroq || hasGroq.trim() === '') && (!hasGemini || hasGemini.trim() === '')) {
    res.status(400).json({
      success: false,
      message: 'Groq or Gemini API key missing',
    });
    return false;
  }
  return true;
};

/**
 * Handle service errors and return appropriate responses.
 */
const handleAIError = (res, error) => {
  console.error('AI Controller Error:', error);
  
  if (error.isApiKeyMissing) {
    return res.status(400).json({
      success: false,
      message: 'Groq/Gemini API key missing',
    });
  }

  if (error.isApiKeyInvalid) {
    return res.status(401).json({
      success: false,
      message: 'Groq/Gemini API key invalid or unauthorized',
    });
  }

  if (error.isQuotaExceeded) {
    return res.status(429).json({
      success: false,
      message: 'AI service quota exceeded. Please try again later.',
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || 'AI service temporarily unavailable',
    details: error.details || null,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

/**
 * POST /api/ai/resume-analysis
 * Analyze resume text and save to database.
 */
const analyzeResumeHandler = async (req, res) => {
  if (!verifyApiKey(res)) return;
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Resume text is required' });
    }

    const aiResult = await aiService.analyzeResume(resumeText);

    // Save to database
    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      fileName: 'Pasted Resume Text',
      extractedText: resumeText.substring(0, 5000),
      atsScore: aiResult.atsScore,
      summary: aiResult.summary,
      experienceLevel: aiResult.experienceLevel,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      missingKeywords: aiResult.missingKeywords,
      suggestedImprovements: aiResult.suggestedImprovements,
      skills: aiResult.skills,
      roleSuitability: aiResult.roleSuitability,
    });

    // Update user skills
    await User.findByIdAndUpdate(req.user._id, {
      skills: aiResult.skills?.technical || [],
    });

    // Update analytics
    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalResumeAnalyses: 1 } }
    );

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    handleAIError(res, error);
  }
};

/**
 * POST /api/ai/generate-roadmap
 * Generate a new learning roadmap and save to database.
 */
const generateRoadmapHandler = async (req, res) => {
  if (!verifyApiKey(res)) return;
  try {
    const { role, level = 'Beginner', duration = '12' } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const aiResult = await aiService.generateRoadmap(role, level, `${duration} weeks`);

    const roadmap = await Roadmap.create({
      user: req.user._id,
      role,
      level,
      duration: `${duration} weeks`,
      title: aiResult.title,
      overview: aiResult.overview,
      weeks: aiResult.weeks,
      careerMilestones: aiResult.careerMilestones,
      recommendedProjects: aiResult.recommendedProjects,
    });

    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalRoadmaps: 1 } }
    );

    res.status(200).json({ success: true, data: roadmap });
  } catch (error) {
    handleAIError(res, error);
  }
};

/**
 * POST /api/ai/mock-interview
 * Statefully handle mock interviews (starting session and submitting/evaluating answers).
 */
const mockInterviewHandler = async (req, res) => {
  if (!verifyApiKey(res)) return;
  try {
    const { interviewId, evaluate, role, difficulty = 'Medium', interviewType = 'Technical', question, answer, category } = req.body;

    if (interviewId || evaluate) {
      // 1. Evaluate answer and get next question or final summary
      const actualInterviewId = interviewId;
      if (!actualInterviewId || !question || answer === undefined) {
        return res.status(400).json({ success: false, message: 'interviewId, question, and answer are required' });
      }

      const interview = await InterviewResult.findOne({
        _id: actualInterviewId,
        user: req.user._id,
        status: 'in_progress',
      });

      if (!interview) {
        return res.status(404).json({ success: false, message: 'Interview session not found or already completed' });
      }

      // Evaluate answer via Gemini service
      const evaluation = await aiService.evaluateInterviewAnswer(question, answer, interview.role);

      interview.questions.push({
        question,
        userAnswer: answer,
        aiFeedback: evaluation.feedback,
        score: evaluation.score,
        category: category || 'General',
      });

      const questionNumber = interview.questions.length;
      const MAX_QUESTIONS = 5;

      if (questionNumber >= MAX_QUESTIONS) {
        // Compute final score
        const totalScore = interview.questions.reduce((sum, q) => sum + q.score, 0);
        interview.overallScore = Math.round((totalScore / (MAX_QUESTIONS * 10)) * 100);
        interview.technicalScore = interview.overallScore;
        interview.communicationScore = Math.min(interview.overallScore + 5, 100);
        interview.confidenceScore = Math.max(interview.overallScore - 5, 0);
        interview.aiSummary = `Interview completed with ${interview.overallScore}% overall score. ${evaluation.feedback}`;
        interview.strengthPoints = evaluation.strengths;
        interview.improvementPoints = evaluation.improvements;
        interview.status = 'completed';

        await Analytics.findOneAndUpdate(
          { user: req.user._id },
          { $inc: { totalInterviews: 1 } }
        );

        await interview.save();

        return res.status(200).json({
          success: true,
          completed: true,
          data: interview,
        });
      }

      await interview.save();

      // Generate next question
      const prevQuestions = interview.questions.map((q) => q.question);
      const nextQuestion = await aiService.generateInterviewQuestion(
        interview.role,
        interview.difficulty,
        interview.interviewType,
        prevQuestions
      );

      return res.status(200).json({
        success: true,
        completed: false,
        data: {
          lastEvaluation: evaluation,
          question: nextQuestion,
          questionNumber: questionNumber + 1,
          questionsRemaining: MAX_QUESTIONS - questionNumber,
          interviewId: interview._id,
        },
      });
    } else {
      // 2. Start new interview session and get first question
      if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required' });
      }

      const interview = await InterviewResult.create({
        user: req.user._id,
        role,
        difficulty,
        interviewType,
        questions: [],
        status: 'in_progress',
      });

      const questionData = await aiService.generateInterviewQuestion(role, difficulty, interviewType);

      return res.status(200).json({
        success: true,
        completed: false,
        data: {
          interviewId: interview._id,
          question: questionData,
          questionNumber: 1,
        },
      });
    }
  } catch (error) {
    handleAIError(res, error);
  }
};

/**
 * POST /api/ai/project-generator
 * Generate project ideas based on prompt and skills.
 */
const generateProjectsHandler = async (req, res) => {
  if (!verifyApiKey(res)) return;
  try {
    const { userPrompt, skills } = req.body;
    if (!userPrompt) {
      return res.status(400).json({ success: false, message: 'User prompt/request is required' });
    }

    const skillsList = skills || req.user.skills || ['JavaScript', 'React', 'Node.js'];
    const projects = await aiService.generateProjectIdeas(userPrompt, skillsList);

    const suggestion = await ProjectSuggestion.create({
      user: req.user._id,
      userPrompt,
      projects,
    });

    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalProjectsGenerated: 1 } }
    );

    res.status(200).json({ success: true, data: { projects, suggestionId: suggestion._id } });
  } catch (error) {
    handleAIError(res, error);
  }
};

/**
 * POST /api/ai/github-insights
 * Generate and cache GitHub insights.
 */
const githubInsightsHandler = async (req, res) => {
  if (!verifyApiKey(res)) return;
  try {
    const { githubData } = req.body;
    if (!githubData) {
      return res.status(400).json({ success: false, message: 'GitHub data is required' });
    }

    const insights = await aiService.generateGithubInsights(githubData);

    // Update existing GithubStats document with new insights
    const githubStats = await GithubStats.findOneAndUpdate(
      { user: req.user._id },
      { aiInsights: insights },
      { new: true }
    );

    res.status(200).json({ success: true, data: insights, githubStats });
  } catch (error) {
    handleAIError(res, error);
  }
};

const placementFeedbackHandler = async (req, res) => {
  if (!verifyApiKey(res)) return;
  try {
    let { inputFeatures, prediction } = req.body;
    
    // Support flat body structure if frontend calls generatePlacementFeedback(scores) directly
    if (!inputFeatures) {
      inputFeatures = req.body;
    }

    if (!inputFeatures.dsaScore && !inputFeatures.dsa_score) {
      return res.status(400).json({ success: false, message: 'Input features are required' });
    }

    const features = {
      dsaScore: Number(inputFeatures.dsaScore !== undefined ? inputFeatures.dsaScore : inputFeatures.dsa_score || 0),
      resumeScore: Number(inputFeatures.resumeScore !== undefined ? inputFeatures.resumeScore : inputFeatures.resume_score || 0),
      githubActivity: Number(inputFeatures.githubActivity !== undefined ? inputFeatures.githubActivity : inputFeatures.github_activity || 0),
      projectCount: Number(inputFeatures.projectCount !== undefined ? inputFeatures.projectCount : inputFeatures.project_count || 0),
      mockInterviewScore: Number(inputFeatures.mockInterviewScore !== undefined ? inputFeatures.mockInterviewScore : inputFeatures.mock_interview_score || 0),
      communicationRating: Number(inputFeatures.communicationRating !== undefined ? inputFeatures.communicationRating : inputFeatures.communication_rating || 0),
      codingConsistency: Number(inputFeatures.codingConsistency !== undefined ? inputFeatures.codingConsistency : inputFeatures.coding_consistency || 0),
    };

    if (!prediction) {
      try {
        prediction = await predictPlacement(features);
      } catch (err) {
        // Fallback weighted score
        const score =
          features.dsaScore * 0.25 +
          features.resumeScore * 0.20 +
          features.githubActivity * 0.15 +
          Math.min(features.projectCount * 5, 100) * 0.10 +
          features.mockInterviewScore * 0.15 +
          (features.communicationRating * 10) * 0.10 +
          features.codingConsistency * 0.05;

        prediction = {
          readinessScore: Math.round(score),
          predictedRole: score > 75 ? 'Full Stack Developer' : score > 60 ? 'Frontend Developer' : 'Junior Developer',
          confidence: 0.75,
        };
      }
    }

    const aiResult = await aiService.generatePlacementRecommendations(features, prediction);

    // Save placement score history
    const scoreDoc = await PlacementScore.create({
      user: req.user._id,
      inputFeatures: features,
      prediction,
      aiRecommendations: aiResult.recommendations,
      strengthAreas: aiResult.strengthAreas,
      improvementAreas: aiResult.improvementAreas,
    });

    // Update user readiness score
    await User.findByIdAndUpdate(req.user._id, {
      placementReadiness: prediction.readinessScore,
    });

    res.status(200).json({
      success: true,
      data: {
        ...scoreDoc.toObject(),
        prediction,
        strengthAreas: aiResult.strengthAreas,
        improvementAreas: aiResult.improvementAreas,
        aiRecommendations: aiResult.recommendations,
      }
    });
  } catch (error) {
    handleAIError(res, error);
  }
};

module.exports = {
  analyzeResumeHandler,
  generateRoadmapHandler,
  mockInterviewHandler,
  generateProjectsHandler,
  githubInsightsHandler,
  placementFeedbackHandler,
};
