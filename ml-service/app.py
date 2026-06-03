"""
DevMentor AI - ML Microservice
FastAPI application exposing placement readiness prediction API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import uvicorn
import os
import sys

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(__file__))

from prediction.predictor import predict, get_model_info

app = FastAPI(
    title="DevMentor AI - ML Service",
    description="Machine Learning microservice for placement readiness prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    dsa_score: float = Field(..., ge=0, le=100, description="DSA problem-solving score (0-100)")
    resume_score: float = Field(..., ge=0, le=100, description="Resume quality score (0-100)")
    github_activity: float = Field(..., ge=0, le=100, description="GitHub activity score (0-100)")
    project_count: float = Field(..., ge=0, le=50, description="Number of projects built")
    mock_interview_score: float = Field(..., ge=0, le=100, description="Mock interview score (0-100)")
    communication_rating: float = Field(..., ge=0, le=10, description="Communication rating (0-10)")
    coding_consistency: float = Field(..., ge=0, le=100, description="Coding consistency score (0-100)")

    model_config = {"json_schema_extra": {
        "example": {
            "dsa_score": 75.0,
            "resume_score": 80.0,
            "github_activity": 65.0,
            "project_count": 5.0,
            "mock_interview_score": 70.0,
            "communication_rating": 7.5,
            "coding_consistency": 60.0,
        }
    }}


class PredictionResponse(BaseModel):
    readiness_score: float
    predicted_role: str
    confidence: float
    model_version: str


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "DevMentor AI ML Service",
        "version": "1.0.0",
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_placement(request: PredictionRequest):
    """
    Predict developer placement readiness and role suitability.
    
    Returns readiness score (0-100) and predicted role category.
    """
    try:
        features = request.model_dump()
        result = predict(features)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/model-info")
async def model_info():
    """Get model metadata and feature importances."""
    try:
        info = get_model_info()
        return {"success": True, "data": info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {
        "message": "DevMentor AI ML Service 🤖",
        "docs": "/docs",
        "health": "/health",
        "predict": "POST /predict",
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
