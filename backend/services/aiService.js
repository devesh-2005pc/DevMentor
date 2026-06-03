const { groq } = require('../config/groq');
const { model: geminiModel } = require('../config/gemini');
const axios = require('axios');

/**
 * Call Groq completions API
 */
const callGroq = async (prompt, modelName = 'llama-3.3-70b-versatile') => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEYY;
  if (!apiKey || apiKey.includes('placeholder')) {
    const err = new Error('Groq API key missing');
    err.isApiKeyMissing = true;
    throw err;
  }

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: modelName,
    temperature: 0.1,
  });

  return chatCompletion.choices[0]?.message?.content;
};

/**
 * Call Gemini AI generateContent API
 */
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    const err = new Error('Gemini API key missing');
    err.isApiKeyMissing = true;
    throw err;
  }
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Call Ollama Local AI API
 */
const callOllama = async (prompt, modelName = 'llama3') => {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  const response = await axios.post(ollamaUrl, {
    model: modelName,
    prompt: prompt,
    stream: false,
  }, { timeout: 4000 }); // 4s timeout for local service
  return response.data.response;
};

const callWithRetry = async (fn, retries = 2, delay = 1000) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`⚠️ API call failed. Attempt ${i + 1}/${retries + 1}. Retrying in ${delay}ms... Error: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Reusable helper to call hybrid providers with automatic fallback chain
 */
const generateJSONContent = async (prompt) => {
  let rawText;
  let providerUsed = 'groq';
  const errors = {};

  // 1. Try Groq (Primary Model)
  try {
    rawText = await callWithRetry(() => callGroq(prompt, 'llama-3.3-70b-versatile'), 2, 1000);
  } catch (groqError1) {
    errors.groqPrimary = groqError1.message;
    console.error('❌ Groq primary model failed:', groqError1.message);

    // Try Groq (Fallback Model)
    try {
      rawText = await callWithRetry(() => callGroq(prompt, 'llama3-8b-8192'), 2, 1000);
    } catch (groqError2) {
      errors.groqFallback = groqError2.message;
      console.error('❌ Groq fallback model failed:', groqError2.message);

      // 2. Fall back to Gemini
      try {
        providerUsed = 'gemini';
        rawText = await callWithRetry(() => callGemini(prompt), 2, 1000);
      } catch (geminiError) {
        errors.gemini = geminiError.message;
        console.error('❌ Gemini fallback failed:', geminiError.message);

        // 3. Fall back to Ollama
        try {
          providerUsed = 'ollama';
          rawText = await callWithRetry(() => callOllama(prompt), 1, 500);
        } catch (ollamaError) {
          errors.ollama = ollamaError.message;
          console.error('❌ Ollama fallback failed:', ollamaError.message);
          
          console.error('❌ All hybrid AI providers failed. Summary of errors:', errors);
          const finalErr = new Error(`AI service failed on all providers. Details: ${JSON.stringify(errors)}`);
          finalErr.isAllProvidersFailed = true;
          finalErr.details = errors;
          throw finalErr;
        }
      }
    }
  }

  console.log(`🤖 [HYBRID AI] Completion generated successfully using provider: ${providerUsed}`);

  // Clean JSON response
  const cleaned = rawText
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (jsonError) {
    console.error('Failed to parse AI JSON response:', rawText, jsonError);
    throw new Error(`Failed to parse AI response into structured JSON. Raw response was: ${rawText}`);
  }
};

/**
 * 1. Analyze resume text and return ATS insights
 */
const analyzeResume = async (resumeText) => {
  const prompt = `
You are an expert ATS (Applicant Tracking System) and career coach AI.

Analyze the following resume and return a JSON object with EXACTLY this structure:

{
  "atsScore": <number 0-100>,
  "summary": "<brief 2-3 sentence summary of the candidate>",
  "experienceLevel": "<Fresher|Junior|Mid-Level|Senior>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "missingKeywords": ["<keyword1>", "<keyword2>", ...],
  "suggestedImprovements": ["<improvement1>", "<improvement2>", ...],
  "skills": {
    "technical": ["<skill1>", "<skill2>", ...],
    "soft": ["<skill1>", "<skill2>", ...]
  },
  "roleSuitability": [
    { "role": "<role name>", "matchPercent": <0-100> },
    { "role": "<role name>", "matchPercent": <0-100> }
  ]
}

Return ONLY the JSON, no markdown, no explanation.

RESUME TEXT:
${resumeText}
`;
  return await generateJSONContent(prompt);
};

/**
 * 2. Generate a learning roadmap for a given role and level
 */
const generateRoadmap = async (role, level, duration) => {
  const prompt = `
You are an expert software engineering mentor and career coach.

Generate a detailed ${duration} learning roadmap for someone who wants to become a ${role} developer at ${level} level.

Return a JSON object with EXACTLY this structure:
{
  "title": "<roadmap title>",
  "overview": "<2-3 sentence overview>",
  "careerMilestones": ["<milestone1>", "<milestone2>", ...],
  "recommendedProjects": ["<project1>", "<project2>", ...],
  "weeks": [
    {
      "weekNumber": 1,
      "title": "<week title>",
      "topics": ["<topic1>", "<topic2>"],
      "resources": [
        { "title": "<resource name>", "url": "<url or 'Search on YouTube'>", "type": "video|article|course|practice" }
      ],
      "projects": ["<project1>"],
      "milestones": ["<milestone1>"],
      "estimatedHours": <number>
    }
  ]
}

Generate ${parseInt(duration)} weeks of content. Return ONLY the JSON, no markdown.
`;
  return await generateJSONContent(prompt);
};

/**
 * 3. Generate a mock interview question
 */
const generateInterviewQuestion = async (role, difficulty, interviewType, previousQuestions = []) => {
  const prev = previousQuestions.length > 0
    ? `\nAvoid repeating these questions: ${previousQuestions.join(', ')}`
    : '';

  const prompt = `
You are an expert technical interviewer at a top tech company.
Generate ONE ${difficulty} ${interviewType} interview question for a ${role} position.
${prev}

Return a JSON object:
{
  "question": "<the interview question>",
  "category": "<category like DSA, System Design, React, etc.>",
  "expectedKeyPoints": ["<point1>", "<point2>", "<point3>"]
}

Return ONLY the JSON, no markdown.
`;
  return await generateJSONContent(prompt);
};

/**
 * 4. Evaluate an interview answer
 */
const evaluateInterviewAnswer = async (question, answer, role) => {
  const prompt = `
You are an expert technical interviewer. Evaluate this interview answer.

Role: ${role}
Question: ${question}
Candidate's Answer: ${answer}

Return a JSON object:
{
  "score": <number 0-10>,
  "feedback": "<detailed feedback on the answer>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
}

Return ONLY the JSON, no markdown.
`;
  return await generateJSONContent(prompt);
};

/**
 * 5. Generate AI project ideas
 */
const generateProjectIdeas = async (userPrompt, skills) => {
  const prompt = `
You are an expert software engineer and project mentor.
Generate 3 project ideas based on the following request.

User Request: ${userPrompt}
User's Skills: ${skills.join(', ')}

Return a JSON array of exactly 3 projects:
[
  {
    "title": "<project title>",
    "description": "<2-3 sentence description>",
    "difficulty": "Beginner|Intermediate|Advanced",
    "techStack": ["<tech1>", "<tech2>"],
    "features": ["<feature1>", "<feature2>", "<feature3>"],
    "architecture": "<brief architecture description>",
    "folderStructure": "<example folder structure as text>",
    "timeline": "<e.g. 2-3 weeks>",
    "estimatedHours": <number>,
    "learningOutcomes": ["<outcome1>", "<outcome2>"],
    "apiIntegrations": ["<api1>"],
    "deploymentSuggestion": "<where to deploy>"
  }
]

Return ONLY the JSON array, no markdown.
`;
  return await generateJSONContent(prompt);
};

/**
 * 6. Generate AI insights from GitHub data
 */
const generateGithubInsights = async (githubData) => {
  const prompt = `
You are an AI developer analyst. Based on this GitHub profile data, generate 5 personalized, specific, and encouraging insights about the developer's growth and activity.

GitHub Data:
- Username: ${githubData.username}
- Public Repos: ${githubData.publicRepos}
- Total Stars: ${githubData.totalStars}
- Top Languages: ${JSON.stringify(githubData.languageStats)}
- Total Commits: ${githubData.totalCommits}
- Followers: ${githubData.followers}

Return a JSON array of exactly 5 insight strings. Each insight should be specific, data-driven, and encouraging.

Return ONLY the JSON array, no markdown.
`;
  return await generateJSONContent(prompt);
};

/**
 * 7. Generate placement recommendations/feedback based on ML prediction
 */
const generatePlacementRecommendations = async (inputFeatures, prediction) => {
  const prompt = `
You are an expert career mentor for software developers.

Based on this developer's assessment, generate 5 specific, actionable recommendations to improve their placement readiness.

Current Scores:
- DSA Score: ${inputFeatures.dsaScore}/100
- Resume Score: ${inputFeatures.resumeScore}/100
- GitHub Activity: ${inputFeatures.githubActivity}/100
- Project Count: ${inputFeatures.projectCount}
- Mock Interview Score: ${inputFeatures.mockInterviewScore}/100
- Communication Rating: ${inputFeatures.communicationRating}/10
- Coding Consistency: ${inputFeatures.codingConsistency}/100

ML Prediction:
- Placement Readiness: ${prediction.readinessScore}%
- Predicted Role: ${prediction.predictedRole}

Return a JSON object:
{
  "recommendations": ["<rec1>", "<rec2>", "<rec3>", "<rec4>", "<rec5>"],
  "strengthAreas": ["<area1>", "<area2>"],
  "improvementAreas": ["<area1>", "<area2>", "<area3>"]
}

Return ONLY the JSON, no markdown.
`;
  return await generateJSONContent(prompt);
};

module.exports = {
  analyzeResume,
  generateRoadmap,
  generateInterviewQuestion,
  evaluateInterviewAnswer,
  generateProjectIdeas,
  generateGithubInsights,
  generatePlacementRecommendations,
  callGroq,
  callGemini,
  callOllama,
};
