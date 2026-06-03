import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Zap, CheckCircle, XCircle, ChevronRight, Trophy, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateInterviewQuestion as startInterview, evaluateInterviewAnswer as submitAnswer } from '../api/ai';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer', 'Node.js Developer', 'Data Scientist', 'DevOps Engineer', 'ML Engineer'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TYPES = ['Technical', 'HR', 'System Design', 'Behavioral', 'Mixed'];

const MockInterview = () => {
  const [config, setConfig] = useState({ role: '', difficulty: 'Medium', interviewType: 'Technical' });
  const [phase, setPhase] = useState('config'); // config | interview | result
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [qNumber, setQNumber] = useState(1);
  const [lastEval, setLastEval] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  const startMutation = useMutation({
    mutationFn: startInterview,
    onSuccess: (res) => {
      setSession({ interviewId: res.data.data.interviewId });
      setCurrentQuestion(res.data.data.question);
      setQNumber(1);
      setPhase('interview');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to start interview'),
  });

  const answerMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (res) => {
      const data = res.data;
      if (data.completed) {
        setFinalResult(data.data);
        setPhase('result');
      } else {
        setLastEval(data.data.lastEvaluation);
        setCurrentQuestion(data.data.question);
        setQNumber(data.data.questionNumber);
        setAnswer('');
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit answer'),
  });

  const handleStart = () => {
    if (!config.role) { toast.error('Please select a role'); return; }
    startMutation.mutate(config);
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) { toast.error('Please write an answer'); return; }
    answerMutation.mutate({
      interviewId: session.interviewId,
      question: currentQuestion.question,
      answer,
      category: currentQuestion.category,
    });
  };

  const handleRestart = () => {
    setPhase('config');
    setSession(null);
    setCurrentQuestion(null);
    setAnswer('');
    setLastEval(null);
    setFinalResult(null);
    setConfig({ role: '', difficulty: 'Medium', interviewType: 'Technical' });
  };

  const ScoreColor = (s) => s >= 8 ? '#22c55e' : s >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="page-container max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">AI Mock</span> Interview
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Practice with AI. Get instant feedback on every answer.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Config Phase */}
        {phase === 'config' && (
          <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Configure Your Interview</h2>

              {/* Role */}
              <div className="mb-6">
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Target Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => setConfig({ ...config, role: r })}
                      className={`p-3 rounded-xl text-sm text-left transition-all border ${
                        config.role === r ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                          : 'border-transparent bg-white/3 text-gray-400 hover:border-white/10'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Difficulty */}
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button key={d} onClick={() => setConfig({ ...config, difficulty: d })}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                          config.difficulty === d ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-transparent bg-white/3 text-gray-400'
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Type */}
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Interview Type</label>
                  <select value={config.interviewType} onChange={(e) => setConfig({ ...config, interviewType: e.target.value })}
                    className="input-field text-sm">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-xs" style={{ color: '#a5b4fc' }}>
                  📋 You'll answer <strong>5 questions</strong>. Each is evaluated by Hybrid AI Engine. You'll get feedback, score, and a final report.
                </p>
              </div>

              <button id="start-interview-btn" onClick={handleStart}
                disabled={!config.role || startMutation.isPending}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                {startMutation.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Starting...</>
                ) : (
                  <><MessageSquare className="w-4 h-4" /> Start Interview</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Interview Phase */}
        {phase === 'interview' && currentQuestion && (
          <motion.div key="interview" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${n < qNumber ? 'bg-green-500' : n === qNumber ? '' : 'bg-white/10'}`}
                  style={n === qNumber ? { background: 'var(--gradient-primary)' } : {}} />
              ))}
              <span className="text-xs font-semibold text-white ml-2">{qNumber}/5</span>
            </div>

            {/* Question Card */}
            <motion.div key={qNumber} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-primary">{currentQuestion.category}</span>
                <span className="badge-cyan">{config.difficulty}</span>
              </div>
              <p className="text-white font-semibold text-lg leading-relaxed">{currentQuestion.question}</p>
              {currentQuestion.expectedKeyPoints && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Key points to cover:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentQuestion.expectedKeyPoints.map((kp, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-faint)' }}>{kp}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Last eval feedback */}
            {lastEval && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 rounded-xl mb-4"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>Previous Answer Feedback</p>
                  <span className="text-sm font-bold" style={{ color: ScoreColor(lastEval.score) }}>
                    {lastEval.score}/10
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{lastEval.feedback}</p>
              </motion.div>
            )}

            {/* Answer Input */}
            <div className="glass-card p-4 mb-4">
              <textarea
                id="interview-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be as detailed as possible."
                rows={6}
                className="w-full bg-transparent text-sm resize-none outline-none"
                style={{ color: 'var(--color-text)', caretColor: '#6366f1' }}
              />
            </div>

            <button id="submit-answer-btn" onClick={handleSubmitAnswer}
              disabled={!answer.trim() || answerMutation.isPending}
              className="btn-primary justify-center py-3.5 disabled:opacity-60"
              style={{ minWidth: 200 }}>
              {answerMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Evaluating...</>
              ) : qNumber < 5 ? (
                <><ChevronRight className="w-4 h-4" /> Submit & Next Question</>
              ) : (
                <><Trophy className="w-4 h-4" /> Submit Final Answer</>
              )}
            </button>
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === 'result' && finalResult && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass-card p-8 text-center mb-6"
              style={{ boxShadow: '0 0 40px rgba(99,102,241,0.15)' }}>
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#f59e0b' }} />
              <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
              <div className="flex items-center justify-center gap-6 mt-6">
                {[
                  { label: 'Overall', value: `${finalResult.overallScore}%`, color: '#6366f1' },
                  { label: 'Technical', value: `${finalResult.technicalScore}%`, color: '#a855f7' },
                  { label: 'Communication', value: `${finalResult.communicationScore}%`, color: '#22d3ee' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {finalResult.aiSummary && (
              <div className="glass-card p-5 mb-4">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{finalResult.aiSummary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {finalResult.strengthPoints?.length > 0 && (
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Strengths
                  </h4>
                  {finalResult.strengthPoints.map((s, i) => (
                    <p key={i} className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>• {s}</p>
                  ))}
                </div>
              )}
              {finalResult.improvementPoints?.length > 0 && (
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" /> Improve On
                  </h4>
                  {finalResult.improvementPoints.map((s, i) => (
                    <p key={i} className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>• {s}</p>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleRestart} className="btn-primary justify-center py-3 px-8">
              <MessageSquare className="w-4 h-4" /> Start Another Interview
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockInterview;
