const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const { analyzeResume } = require('../services/aiService');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

// @desc    Upload and analyze resume
// @route   POST /api/resume/upload
// @access  Private
const uploadAndAnalyze = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please upload a PDF resume'));
  }

  const filePath = req.file.path;

  try {
    // Extract text from PDF
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length < 100) {
      return next(new ApiError(400, 'Could not extract sufficient text from the PDF. Please ensure it is a text-based PDF.'));
    }

    // Send to Gemini AI for analysis
    const aiResult = await analyzeResume(extractedText);

    // Save to database
    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      extractedText: extractedText.substring(0, 5000), // Store first 5000 chars
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

    // Update user's resume score and analytics
    await User.findByIdAndUpdate(req.user._id, {
      'skills': aiResult.skills?.technical || [],
    });

    await Analytics.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalResumeAnalyses: 1 } }
    );

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: analysis,
    });
  } catch (error) {
    // Clean up file on error
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(500, `Analysis failed: ${error.message}`));
  }
});

// @desc    Get resume analysis history
// @route   GET /api/resume/history
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const analyses = await ResumeAnalysis.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-extractedText -aiRawResponse');

  res.status(200).json({
    success: true,
    count: analyses.length,
    data: analyses,
  });
});

// @desc    Get single resume analysis
// @route   GET /api/resume/:id
// @access  Private
const getAnalysis = asyncHandler(async (req, res, next) => {
  const analysis = await ResumeAnalysis.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).select('-extractedText');

  if (!analysis) return next(new ApiError(404, 'Analysis not found'));

  res.status(200).json({ success: true, data: analysis });
});

module.exports = { uploadAndAnalyze, getHistory, getAnalysis };
