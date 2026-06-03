"""
DevMentor AI - ML Training Script
Generates synthetic training data and trains a Random Forest model
for placement readiness prediction.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_absolute_error
import joblib
import os
import json

# Seed for reproducibility
np.random.seed(42)

N_SAMPLES = 2000

def generate_synthetic_data(n=N_SAMPLES):
    """Generate realistic synthetic developer placement data."""
    
    # Features
    dsa_score = np.random.beta(2, 2, n) * 100
    resume_score = np.random.beta(2, 3, n) * 100
    github_activity = np.random.beta(1.5, 2, n) * 100
    project_count = np.random.poisson(4, n).clip(0, 20).astype(float)
    mock_interview_score = np.random.beta(2, 2.5, n) * 100
    communication_rating = np.random.beta(3, 2, n) * 10
    coding_consistency = np.random.beta(2, 2, n) * 100
    
    # Weighted readiness score (ground truth)
    readiness = (
        dsa_score * 0.25 +
        resume_score * 0.20 +
        github_activity * 0.15 +
        (project_count / 20 * 100) * 0.10 +
        mock_interview_score * 0.15 +
        (communication_rating / 10 * 100) * 0.10 +
        coding_consistency * 0.05
    )
    # Add some realistic noise
    readiness += np.random.normal(0, 5, n)
    readiness = readiness.clip(0, 100)
    
    # Predicted role category based on feature weights
    role_scores = {
        'Frontend Developer': resume_score * 0.4 + github_activity * 0.3 + project_count / 20 * 100 * 0.3,
        'Backend Developer': dsa_score * 0.4 + coding_consistency * 0.3 + project_count / 20 * 100 * 0.3,
        'Full Stack Developer': (dsa_score + resume_score + github_activity) / 3,
        'AI/ML Engineer': dsa_score * 0.5 + coding_consistency * 0.3 + mock_interview_score * 0.2,
        'DevOps Engineer': github_activity * 0.4 + coding_consistency * 0.4 + project_count / 20 * 100 * 0.2,
    }
    
    role_matrix = np.column_stack(list(role_scores.values()))
    predicted_roles = np.array(list(role_scores.keys()))[np.argmax(role_matrix, axis=1)]
    
    df = pd.DataFrame({
        'dsa_score': dsa_score,
        'resume_score': resume_score,
        'github_activity': github_activity,
        'project_count': project_count,
        'mock_interview_score': mock_interview_score,
        'communication_rating': communication_rating,
        'coding_consistency': coding_consistency,
        'readiness_score': readiness,
        'predicted_role': predicted_roles,
    })
    
    return df


def train_models(df):
    """Train regression model for readiness score and classifier for role."""
    
    feature_cols = [
        'dsa_score', 'resume_score', 'github_activity', 'project_count',
        'mock_interview_score', 'communication_rating', 'coding_consistency'
    ]
    
    X = df[feature_cols]
    y_score = df['readiness_score']
    y_role = df['predicted_role']
    
    X_train, X_test, ys_train, ys_test, yr_train, yr_test = train_test_split(
        X, y_score, y_role, test_size=0.2, random_state=42
    )
    
    # Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Regression model for readiness score
    regressor = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    regressor.fit(X_train_scaled, ys_train)
    
    # Classifier for role prediction
    classifier = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    classifier.fit(X_train_scaled, yr_train)
    
    # Evaluate
    y_pred_score = regressor.predict(X_test_scaled)
    y_pred_role = classifier.predict(X_test_scaled)
    
    mae = mean_absolute_error(ys_test, y_pred_score)
    role_acc = accuracy_score(yr_test, y_pred_role)
    
    print(f"✅ Regressor MAE: {mae:.2f}")
    print(f"✅ Classifier Accuracy: {role_acc:.2%}")
    
    # Feature importance
    importances = dict(zip(feature_cols, regressor.feature_importances_.tolist()))
    print("\nFeature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
        print(f"  {feat}: {imp:.4f}")
    
    return regressor, classifier, scaler, importances


def save_models(regressor, classifier, scaler, importances):
    """Save trained models and metadata."""
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'model')
    os.makedirs(model_dir, exist_ok=True)
    
    joblib.dump(regressor, os.path.join(model_dir, 'regressor.pkl'))
    joblib.dump(classifier, os.path.join(model_dir, 'classifier.pkl'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.pkl'))
    
    metadata = {
        'version': '1.0.0',
        'features': [
            'dsa_score', 'resume_score', 'github_activity', 'project_count',
            'mock_interview_score', 'communication_rating', 'coding_consistency'
        ],
        'roles': ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'AI/ML Engineer', 'DevOps Engineer'],
        'feature_importances': importances,
        'training_samples': N_SAMPLES,
    }
    
    with open(os.path.join(model_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n✅ Models saved to {model_dir}")


if __name__ == '__main__':
    print("🔧 Generating synthetic training data...")
    df = generate_synthetic_data()
    
    # Save dataset
    dataset_dir = os.path.join(os.path.dirname(__file__), '..', 'datasets')
    os.makedirs(dataset_dir, exist_ok=True)
    df.to_csv(os.path.join(dataset_dir, 'synthetic_data.csv'), index=False)
    print(f"✅ Dataset saved ({len(df)} samples)")
    
    print("\n🧠 Training Random Forest models...")
    regressor, classifier, scaler, importances = train_models(df)
    
    print("\n💾 Saving models...")
    save_models(regressor, classifier, scaler, importances)
    
    print("\n🎉 Training complete! Run 'python app.py' to start the API.")
