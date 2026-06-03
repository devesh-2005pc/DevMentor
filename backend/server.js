require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const githubRoutes = require('./routes/githubRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const placementRoutes = require('./routes/placementRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const projectRoutes = require('./routes/projectRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', generalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DevMentor AI Backend is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// AI Health check
app.get('/api/health/ai', async (req, res) => {
  const status = {
    groq: { status: 'unknown' },
    gemini: { status: 'unknown' },
  };

  // Check Groq
  try {
    const { callGroq } = require('./services/aiService');
    const start = Date.now();
    await callGroq("Respond with 'OK'");
    status.groq = { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err) {
    status.groq = { status: 'unhealthy', error: err.message };
  }

  // Check Gemini
  try {
    const { callGemini } = require('./services/aiService');
    const start = Date.now();
    await callGemini("Respond with 'OK'");
    status.gemini = { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err) {
    status.gemini = { status: 'unhealthy', error: err.message };
  }

  const isHealthy = status.groq.status === 'healthy' || status.gemini.status === 'healthy';

  res.status(isHealthy ? 200 : 500).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    providers: status,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DevMentor AI Backend running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
