const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const { generateInterviewQuestion, evaluateInterviewAnswer } = require('../services/aiService');
const InterviewResult = require('../models/InterviewResult');
const Analytics = require('../models/Analytics');

// @desc    Start interview session
// @route   POST /api/interview/start
// @access  Private
const startInterview = asyncHandler(async (req, res, next) => {
  const { role, difficulty = 'Medium', interviewType = 'Technical' } = req.body;

  if (!role) return next(new ApiError(400, 'Role is required'));

  // Create interview session
  const interview = await InterviewResult.create({
    user: req.user._id,
    role,
    difficulty,
    interviewType,
    questions: [],
    status: 'in_progress',
  });

  // Generate first question
  const questionData = await generateInterviewQuestion(role, difficulty, interviewType);

  res.status(201).json({
    success: true,
    data: {
      interviewId: interview._id,
      question: questionData,
      questionNumber: 1,
    },
  });
});

// @desc    Submit answer and get next question
// @route   POST /api/interview/answer
// @access  Private
const submitAnswer = asyncHandler(async (req, res, next) => {
  const { interviewId, question, answer, category } = req.body;

  if (!interviewId || !question || answer === undefined) {
    return next(new ApiError(400, 'interviewId, question, and answer are required'));
  }

  const interview = await InterviewResult.findOne({
    _id: interviewId,
    user: req.user._id,
    status: 'in_progress',
  });

  if (!interview) return next(new ApiError(404, 'Interview session not found or already completed'));

  // Evaluate the answer
  const evaluation = await evaluateInterviewAnswer(question, answer, interview.role);

  // Add question to session
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
    // Complete the interview
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
  const nextQuestion = await generateInterviewQuestion(
    interview.role,
    interview.difficulty,
    interview.interviewType,
    prevQuestions
  );

  res.status(200).json({
    success: true,
    completed: false,
    data: {
      lastEvaluation: evaluation,
      question: nextQuestion,
      questionNumber: questionNumber + 1,
      questionsRemaining: MAX_QUESTIONS - questionNumber,
    },
  });
});

// @desc    Get interview results
// @route   GET /api/interview/results
// @access  Private
const getResults = asyncHandler(async (req, res) => {
  const results = await InterviewResult.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-questions');

  res.status(200).json({ success: true, count: results.length, data: results });
});

// @desc    Get single interview result
// @route   GET /api/interview/:id
// @access  Private
const getResult = asyncHandler(async (req, res, next) => {
  const result = await InterviewResult.findOne({ _id: req.params.id, user: req.user._id });
  if (!result) return next(new ApiError(404, 'Interview result not found'));

  res.status(200).json({ success: true, data: result });
});

module.exports = { startInterview, submitAnswer, getResults, getResult };
