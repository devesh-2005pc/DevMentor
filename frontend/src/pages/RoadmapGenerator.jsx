import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Zap, ChevronDown, ChevronUp, CheckCircle, Circle, ExternalLink, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateRoadmap } from '../api/ai';

const ROLES = ['Frontend', 'Backend', 'Full Stack', 'AI Engineer', 'DevOps', 'Cybersecurity', 'Mobile', 'Data Science'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = ['8', '12', '16', '24'];

const ROLE_ICONS = {
  'Frontend': '🎨', 'Backend': '⚙️', 'Full Stack': '🚀', 'AI Engineer': '🤖',
  'DevOps': '🐳', 'Cybersecurity': '🛡️', 'Mobile': '📱', 'Data Science': '📊',
};

const RoadmapGenerator = () => {
  const [form, setForm] = useState({ role: '', level: 'Beginner', duration: '12' });
  const [roadmap, setRoadmap] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(0);

  const mutation = useMutation({
    mutationFn: generateRoadmap,
    onSuccess: (res) => {
      setRoadmap(res.data.data);
      setExpandedWeek(0);
      toast.success('Roadmap generated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Generation failed'),
  });

  const handleGenerate = () => {
    if (!form.role) { toast.error('Please select a role'); return; }
    mutation.mutate(form);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">AI Roadmap</span> Generator
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Get a personalized, week-by-week learning roadmap powered by Hybrid AI Engine
        </p>
      </motion.div>

      {/* Config Panel */}
      <div className="glass-card p-6 mb-6">
        <h3 className="font-semibold text-white text-sm mb-4">Configure Your Roadmap</h3>

        {/* Role Selection */}
        <div className="mb-5">
          <label className="text-xs font-medium mb-3 block" style={{ color: 'var(--color-text-muted)' }}>Target Role</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLES.map((role) => (
              <button key={role} onClick={() => setForm({ ...form, role })}
                className={`p-3 rounded-xl text-sm font-medium text-left transition-all duration-200 border ${
                  form.role === role
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-gray-400 hover:border-white/10'
                }`}
                style={{
                  background: form.role === role ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                }}>
                <span className="text-lg block mb-1">{ROLE_ICONS[role]}</span>
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Level */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Current Level</label>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setForm({ ...form, level: l })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                    form.level === l ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400'
                  }`}
                  style={{ background: form.level === l ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {/* Duration */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Duration (weeks)</label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setForm({ ...form, duration: d })}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                    form.duration === d ? 'border-cyan-500 text-cyan-300' : 'border-transparent text-gray-400'
                  }`}
                  style={{ background: form.duration === d ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)' }}>
                  {d}w
                </button>
              ))}
            </div>
          </div>
        </div>

        <button id="generate-roadmap-btn" onClick={handleGenerate}
          disabled={!form.role || mutation.isPending}
          className="btn-primary justify-center w-full sm:w-auto disabled:opacity-60 py-3">
          {mutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Hybrid AI is generating...</>
          ) : (
            <><Zap className="w-4 h-4" /> Generate My Roadmap</>
          )}
        </button>
      </div>

      {/* Roadmap Display */}
      <AnimatePresence>
        {roadmap && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Overview */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)' }}>
                  {ROLE_ICONS[roadmap.role]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{roadmap.title}</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{roadmap.overview}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="badge-primary">{roadmap.role}</span>
                    <span className="badge-cyan">{roadmap.level}</span>
                    <span className="badge-warning">{roadmap.duration}</span>
                    {roadmap.progress !== undefined && (
                      <span className="badge-success">{roadmap.progress}% complete</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            {roadmap.careerMilestones?.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <h3 className="font-semibold text-white text-sm mb-4">🏆 Career Milestones</h3>
                <div className="flex flex-wrap gap-2">
                  {roadmap.careerMilestones.map((m, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(168,85,247,0.12)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.2)' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Timeline */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: '#6366f1' }} /> Weekly Plan
              </h3>
              {roadmap.weeks?.map((week, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }} className="glass-card overflow-hidden">
                  <button onClick={() => setExpandedWeek(expandedWeek === i ? -1 : i)}
                    className="w-full flex items-center gap-4 p-4 text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                      style={{ background: week.completed ? '#22c55e20' : 'var(--gradient-primary)' }}>
                      {week.completed ? <CheckCircle className="w-4 h-4 text-green-400" /> : week.weekNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">Week {week.weekNumber}: {week.title}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                        {week.topics?.length} topics · ~{week.estimatedHours}h
                      </p>
                    </div>
                    {expandedWeek === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-faint)' }} />
                      : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-faint)' }} />}
                  </button>
                  <AnimatePresence>
                    {expandedWeek === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Topics */}
                          <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: '#a5b4fc' }}>📚 Topics</p>
                            <div className="flex flex-wrap gap-1.5">
                              {week.topics?.map((t, j) => (
                                <span key={j} className="px-2 py-1 rounded-lg text-xs"
                                  style={{ background: 'rgba(99,102,241,0.12)', color: '#c7d2fe' }}>{t}</span>
                              ))}
                            </div>
                          </div>
                          {/* Resources */}
                          <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: '#86efac' }}>🔗 Resources</p>
                            <div className="space-y-1.5">
                              {week.resources?.slice(0, 3).map((r, j) => (
                                <a key={j} href={r.url !== 'Search on YouTube' ? r.url : '#'}
                                  target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs hover:text-white transition-colors"
                                  style={{ color: 'var(--color-text-muted)' }}>
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{r.title}</span>
                                  <span className="badge-primary px-1.5 py-0.5 text-xs">{r.type}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                          {/* Projects */}
                          {week.projects?.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-xs font-semibold mb-2" style={{ color: '#fde68a' }}>🛠️ Projects to Build</p>
                              <div className="flex flex-wrap gap-2">
                                {week.projects.map((p, j) => (
                                  <span key={j} className="px-3 py-1 rounded-lg text-xs"
                                    style={{ background: 'rgba(245,158,11,0.12)', color: '#fcd34d' }}>{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapGenerator;
