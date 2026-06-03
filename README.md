# 🚀 DevMentor AI — AI-Powered Developer Growth Ecosystem

> A production-grade SaaS platform combining AI, ML, Full Stack Engineering, GitHub Intelligence, Resume Analysis, Career Roadmaps, and Placement Prediction.

![DevMentor AI](https://img.shields.io/badge/DevMentor-AI-6366f1?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🤖 **AI Resume Analyzer** | Upload PDF → Get ATS score, skills gap, and AI suggestions via Gemini |
| 🐙 **GitHub Intelligence** | Connect username → Language charts, commit trends, AI narrative insights |
| 🗺️ **AI Roadmap Generator** | Choose role → Get a 8-24 week personalized weekly learning plan |
| 🎯 **Placement Prediction** | 7-feature ML model (Random Forest) predicts your placement readiness % |
| 💬 **AI Mock Interview** | Role-specific Q&A with real-time Gemini AI feedback on each answer |
| 💡 **AI Project Generator** | Describe your stack → Get 3 complete project ideas with architecture |
| 📊 **Analytics Dashboard** | Skill radar, weekly activity chart, placement gauge, AI insights |

---

## 🏗️ Architecture

```
DevMentor AI
├── frontend/          # React + Vite + Tailwind + Framer Motion
├── backend/           # Node.js + Express + MongoDB + Gemini AI
└── ml-service/        # Python FastAPI + Scikit-learn Random Forest
```

**Data flow:**
```
Browser → React Frontend → Express Backend API → MongoDB
                                 ↓
                          Gemini AI API (resume, roadmap, interview, projects)
                                 ↓
                          FastAPI ML Service (placement prediction)
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

---

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd DEVMentorAI
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in:
#   MONGODB_URI=your_atlas_uri
#   GEMINI_API_KEY=your_key
#   JWT_SECRET=your_secret

npm run dev       # Starts on http://localhost:5000
```

### 3. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
python training/train_model.py    # Trains Random Forest model (~30 seconds)
python app.py                     # Starts on http://localhost:8000
```

> The training script generates 2000 synthetic samples and trains both a Random Forest regressor (readiness score) and classifier (role prediction).

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GITHUB_TOKEN` | GitHub PAT (optional, increases rate limit) |
| `ML_SERVICE_URL` | URL of the FastAPI ML service |
| `FRONTEND_URL` | Frontend URL for CORS |

---

## 🗂️ Project Structure

### Backend
```
backend/
├── config/db.js              # MongoDB connection
├── controllers/              # 8 controllers (auth, resume, github, roadmap, placement, interview, projects, dashboard)
├── middleware/               # Auth (JWT), error handler, rate limiter, multer upload
├── models/                   # 8 Mongoose models
├── routes/                   # 8 route files
├── services/
│   ├── aiService.js          # Gemini API wrapper (6 AI functions)
│   ├── githubService.js      # GitHub REST API
│   └── mlService.js          # FastAPI ML client
└── server.js                 # Express app entry
```

### ML Service
```
ml-service/
├── training/train_model.py   # Synthetic data generation + Random Forest training
├── prediction/predictor.py   # Lazy-load models + prediction logic
├── model/                    # Saved .pkl files (created after training)
├── datasets/                 # synthetic_data.csv (created after training)
└── app.py                    # FastAPI app with /predict and /health endpoints
```

### Frontend
```
frontend/src/
├── api/                      # 8 Axios API modules
├── components/layout/        # Navbar, Sidebar
├── components/common/        # ProtectedRoute
├── context/AuthContext.jsx   # JWT auth state
├── layouts/DashboardLayout   # Sidebar + Outlet
└── pages/                    # 13 pages (Landing, Auth, Dashboard, 9 feature pages, 404)
```

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/resume/upload` | ✅ | Upload & analyze PDF |
| POST | `/api/github/connect` | ✅ | Connect GitHub username |
| POST | `/api/roadmap/generate` | ✅ | Generate AI roadmap |
| POST | `/api/placement/predict` | ✅ | ML placement prediction |
| POST | `/api/interview/start` | ✅ | Start interview session |
| POST | `/api/interview/answer` | ✅ | Submit answer |
| POST | `/api/projects/generate` | ✅ | Generate project ideas |
| GET | `/api/dashboard/overview` | ✅ | Full dashboard data |
| GET | `/api/health` | ❌ | Health check |

### ML Service Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/predict` | Placement readiness prediction |
| GET | `/health` | Health check |
| GET | `/model-info` | Model metadata |
| GET | `/docs` | Swagger UI |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set root directory: `frontend`
4. Add env variable: `VITE_API_URL=your_backend_url`

### Backend → Render

1. Push `backend/` to GitHub
2. Create new **Web Service** on [Render](https://render.com)
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env variables from `.env.example`

### ML Service → Render/Railway

```bash
# Using Docker (recommended)
docker build -t devmentorai-ml .
docker run -p 8000:8000 devmentorai-ml
```

Or deploy to Railway:
1. Connect GitHub repo
2. Set root directory: `ml-service`
3. Railway auto-detects Python and uses `requirements.txt`

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite 8**
- **Tailwind CSS 3**
- **Framer Motion** — Page & component animations
- **GSAP + ScrollTrigger** — Scroll animations
- **Recharts** — Analytics charts
- **TanStack Query** — Server state management
- **React Router DOM 6**
- **React Hot Toast**
- **React Dropzone**
- **Lucide React** — Icons

### Backend
- **Node.js 18** + **Express 4**
- **Mongoose** + **MongoDB Atlas**
- **JWT** + **bcryptjs** — Authentication
- **Multer** + **pdf-parse** — Resume upload & extraction
- **@google/generative-ai** — Gemini AI
- **Helmet** + **express-rate-limit** — Security
- **Axios** — GitHub API calls

### ML Service
- **FastAPI** + **Uvicorn**
- **Scikit-learn** — Random Forest (regressor + classifier)
- **Pandas** + **NumPy** — Data processing
- **Joblib** — Model persistence
- **Pydantic** — Request validation

---

## 🧠 ML Model Details

**Algorithm**: Random Forest (Regressor for score, Classifier for role)

**Features** (7 inputs):
1. DSA Score (0-100)
2. Resume Score (0-100)
3. GitHub Activity (0-100)
4. Project Count (0-20)
5. Mock Interview Score (0-100)
6. Communication Rating (0-10)
7. Coding Consistency (0-100)

**Outputs**:
- Placement Readiness Score (0-100%)
- Predicted Role (Frontend | Backend | Full Stack | AI/ML | DevOps)
- Confidence Score

**Training**: 2000 synthetic samples with realistic distributions. Models auto-train on first startup if `.pkl` files are missing.

---

## 📄 License

MIT © DevMentor AI 2025

---

Built with ❤️ for developers. Powered by Gemini AI + Random Forest ML.
