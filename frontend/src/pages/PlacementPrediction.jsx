import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { generatePlacementFeedback } from '../api/ai';

const FIELDS = [
  { key: 'dsaScore', label: 'DSA Score', icon: '🧠', desc: 'LeetCode / HackerRank', min: 0, max: 100, step: 1 },
  { key: 'resumeScore', label: 'Resume Score', icon: '📄', desc: 'ATS + quality', min: 0, max: 100, step: 1 },
  { key: 'githubActivity', label: 'GitBranch Activity', icon: '🐙', desc: 'Contributions & commits', min: 0, max: 100, step: 1 },
  { key: 'projectCount', label: 'Project Count', icon: '💻', desc: 'Completed projects', min: 0, max: 20, step: 1 },
  { key: 'mockInterviewScore', label: 'Interview Score', icon: '🎤', desc: 'Mock interview performance', min: 0, max: 100, step: 1 },
  { key: 'communicationRating', label: 'Communication', icon: '🗣️', desc: 'Self-rated (0-10)', min: 0, max: 10, step: 0.5 },
  { key: 'codingConsistency', label: 'Coding Consistency', icon: '🔥', desc: 'Daily coding habit %', min: 0, max: 100, step: 1 },
];

const AnimatedGauge = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  const label = score >= 80 ? 'Highly Ready' : score >= 60 ? 'Moderately Ready' : score >= 40 ? 'Needs Work' : 'Not Ready';
  const radius = 58;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <motion.circle cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: (1 - score / 100) * circ }}
          transition={{ duration: 2, ease: 'easeOut' }}
          transform="rotate(-90 80 80)" />
        <text x="80" y="72" textAnchor="middle" fill={color} fontSize="32" fontWeight="800" fontFamily="Inter">{score}%</text>
        <text x="80" y="92" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="Inter">Readiness</text>
      </svg>
      <div className="px-4 py-2 rounded-full text-sm font-semibold"
        style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
        {label}
      </div>
    </div>
  );
};

const PlacementPrediction = () => {
  const [scores, setScores] = useState({
    dsaScore: 50, resumeScore: 50, githubActivity: 50,
    projectCount: 3, mockInterviewScore: 50, communicationRating: 6, codingConsistency: 50,
  });
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: generatePlacementFeedback,
    onSuccess: (res) => {
      setResult(res.data.data);
      toast.success('Prediction complete!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Prediction failed'),
  });

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">Placement</span> Readiness Prediction
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          ML-powered prediction using Random Forest trained on 2000+ developer profiles
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white text-sm mb-5">Rate Your Skills (7 features)</h3>
            <div className="space-y-5">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <span>{field.icon}</span> {field.label}
                    </label>
                    <span className="font-bold text-sm px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                      {scores[field.key]}
                      {field.max === 10 ? '/10' : field.max === 20 ? '' : '%'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id={`slider-${field.key}`}
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={scores[field.key]}
                      onChange={(e) => setScores({ ...scores, [field.key]: parseFloat(e.target.value) })}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #6366f1 ${(scores[field.key] / field.max) * 100}%, rgba(255,255,255,0.1) 0%)`,
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>{field.desc}</p>
                </div>
              ))}
            </div>

            <button id="predict-btn" onClick={() => mutation.mutate(scores)}
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center mt-6 py-3.5 disabled:opacity-60">
              {mutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ML Model Predicting...</>
              ) : (
                <><Target className="w-4 h-4" /> Predict My Readiness</>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Gauge */}
              <div className="glass-card p-8 flex flex-col items-center gap-4">
                <AnimatedGauge score={result.prediction?.readinessScore || 0} />
                <div className="text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Best Fit Role</p>
                  <p className="text-xl font-bold text-white mt-1">{result.prediction?.predictedRole}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>
                    Confidence: {Math.round((result.prediction?.confidence || 0) * 100)}%
                  </p>
                </div>
              </div>

              {/* Strengths */}
              {result.strengthAreas?.length > 0 && (
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.strengthAreas.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#86efac', border: '1px solid rgba(34,197,94,0.2)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas to Improve */}
              {result.improvementAreas?.length > 0 && (
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Areas to Improve
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.improvementAreas.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.2)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {result.aiRecommendations?.length > 0 && (
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" style={{ color: '#6366f1' }} /> AI Recommendations
                  </h4>
                  <div className="space-y-2">
                    {result.aiRecommendations.map((r, i) => (
                      <div key={i} className="flex gap-2 p-3 rounded-xl text-xs"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }} />
                        <p style={{ color: 'var(--color-text-muted)' }}>{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <Target className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-white font-semibold mb-2">Ready for prediction?</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Adjust the sliders to reflect your current skills and click "Predict"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlacementPrediction;
