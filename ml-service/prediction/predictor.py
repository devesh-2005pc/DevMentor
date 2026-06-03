"""
DevMentor AI - Placement Predictor
Loads trained models and runs predictions.
"""

import os
import json
import numpy as np
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'model')

# Lazy-load models
_regressor = None
_classifier = None
_scaler = None
_metadata = None


def _load_models():
    global _regressor, _classifier, _scaler, _metadata
    
    if _regressor is None:
        regressor_path = os.path.join(MODEL_DIR, 'regressor.pkl')
        classifier_path = os.path.join(MODEL_DIR, 'classifier.pkl')
        scaler_path = os.path.join(MODEL_DIR, 'scaler.pkl')
        metadata_path = os.path.join(MODEL_DIR, 'metadata.json')
        
        if not all(os.path.exists(p) for p in [regressor_path, classifier_path, scaler_path]):
            # Auto-train if models don't exist
            print("⚠️  Models not found. Training now...")
            import subprocess
            import sys
            train_script = os.path.join(os.path.dirname(__file__), '..', 'training', 'train_model.py')
            subprocess.run([sys.executable, train_script], check=True)
            print("✅ Training complete.")
        
        _regressor = joblib.load(regressor_path)
        _classifier = joblib.load(classifier_path)
        _scaler = joblib.load(scaler_path)
        
        with open(metadata_path) as f:
            _metadata = json.load(f)
    
    return _regressor, _classifier, _scaler, _metadata


def predict(features: dict) -> dict:
    """
    Predict placement readiness and role from 7 input features.
    
    Args:
        features: dict with keys:
            dsa_score (0-100), resume_score (0-100), github_activity (0-100),
            project_count (0-50), mock_interview_score (0-100),
            communication_rating (0-10), coding_consistency (0-100)
    
    Returns:
        dict with readiness_score (0-100), predicted_role, confidence
    """
    regressor, classifier, scaler, metadata = _load_models()
    
    feature_order = metadata['features']
    X = np.array([[features[f] for f in feature_order]])
    X_scaled = scaler.transform(X)
    
    # Predict readiness score
    readiness_score = float(regressor.predict(X_scaled)[0])
    readiness_score = max(0.0, min(100.0, readiness_score))
    
    # Predict role
    predicted_role = classifier.predict(X_scaled)[0]
    role_probas = classifier.predict_proba(X_scaled)[0]
    confidence = float(max(role_probas))
    
    return {
        'readiness_score': round(readiness_score, 1),
        'predicted_role': predicted_role,
        'confidence': round(confidence, 3),
        'model_version': metadata.get('version', '1.0.0'),
    }


def get_model_info() -> dict:
    """Return model metadata."""
    _, _, _, metadata = _load_models()
    return metadata
