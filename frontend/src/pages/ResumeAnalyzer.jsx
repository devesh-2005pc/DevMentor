import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, CheckCircle, AlertCircle, TrendingUp,
  Zap, Star, ChevronDown, ChevronUp, RefreshCw, Clock, Keyboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadResume, getResumeHistory } from '../api/resumeApi';
import { analyzeResume as analyzeResumeText } from '../api/ai';

const ScoreGauge = ({ score, label }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 38}
            initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
            animate={{ strokeDashoffset: (1 - score / 100) * 2 * Math.PI * 38 }}
            transition={{ duration: 1.5, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white">{score}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
};

const ResumeAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [mode, setMode] = useState('upload'); // upload | text
  const [result, setResult] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const queryClient = useQueryClient();

  const { data: history } = useQuery({
    queryKey: ['resume-history'],
    queryFn: () => getResumeHistory().then((r) => r.data.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('resume', file);
      return uploadResume(formData);
    },
    onSuccess: (res) => {
      setResult(res.data.data);
      queryClient.invalidateQueries(['resume-history']);
      toast.success('Resume analyzed successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Analysis failed');
    },
  });

  const textMutation = useMutation({
    mutationFn: (text) => analyzeResumeText(text),
    onSuccess: (res) => {
      setResult(res.data.data);
      queryClient.invalidateQueries(['resume-history']);
      toast.success('Resume analyzed successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Analysis failed');
    },
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleAnalyze = () => {
    if (mode === 'upload' && selectedFile) {
      uploadMutation.mutate(selectedFile);
    } else if (mode === 'text' && resumeText.trim()) {
      textMutation.mutate(resumeText);
    }
  };

  const toggleSection = (key) => setExpandedSection(expandedSection === key ? null : key);

  const currentResult = result || (history?.[0] ? history[0] : null);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">AI Resume</span> Analyzer
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Upload your PDF resume and get an instant ATS score + AI-powered improvements
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10" style={{ maxWidth: 280 }}>
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload PDF
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                mode === 'text' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              Paste Text
            </button>
          </div>

          {/* Mode-specific Input */}
          {mode === 'upload' ? (
            /* Drop Zone */
            <div
              {...getRootProps()}
              className={`glass-card p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/5' : ''
              }`}
              style={{ minHeight: 220 }}
            >
              <input {...getInputProps()} id="resume-dropzone" />
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.15)' }}
              >
                <Upload className="w-8 h-8" style={{ color: isDragActive ? '#a5b4fc' : '#6366f1' }} />
              </motion.div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-semibold text-white mb-1">📄 {selectedFile.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    {(selectedFile.size / 1024).toFixed(0)} KB — Ready to analyze
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {isDragActive ? 'Drop your resume here!' : 'Drag & drop your PDF resume'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    or click to browse · PDF only · Max 5MB
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Text Input Area */
            <div className="glass-card p-4 flex flex-col gap-3" style={{ minHeight: 220 }}>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your plain text resume content here... (skills, experience, projects, etc.)"
                rows={8}
                className="w-full bg-transparent text-sm resize-none outline-none"
                style={{ color: 'var(--color-text)', caretColor: '#6366f1' }}
              />
            </div>
          )}

          {/* Action Button */}
          {((mode === 'upload' && selectedFile) || (mode === 'text' && resumeText.trim())) && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              id="analyze-resume-btn"
              onClick={handleAnalyze}
              disabled={uploadMutation.isPending || textMutation.isPending}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
            >
              {uploadMutation.isPending || textMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with Hybrid AI...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Analyze Resume
                </>
              )}
            </motion.button>
          )}

          {/* History */}
          {history && history.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                Recent Analyses
              </h3>
              <div className="space-y-2">
                {history.slice(0, 3).map((h, i) => (
                  <button key={i} onClick={() => setResult(h)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-white/5">
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#6366f1' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{h.fileName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                        {new Date(h.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge-primary text-xs">{h.atsScore}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {currentResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Score */}
              <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
                <ScoreGauge score={currentResult.atsScore || 0} label="ATS Score" />
                <div className="flex-1">
                  <div className="badge-primary mb-2 w-fit">{currentResult.experienceLevel || 'Fresher'}</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {currentResult.summary}
                  </p>
                </div>
              </div>

              {/* Role Suitability */}
              {currentResult.roleSuitability?.length > 0 && (
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: '#a855f7' }} /> Role Suitability
                  </h4>
                  <div className="space-y-2">
                    {currentResult.roleSuitability.map((r, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--color-text-muted)' }}>{r.role}</span>
                          <span className="font-semibold text-white">{r.matchPercent}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${r.matchPercent}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            style={{ background: 'var(--gradient-primary)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Sections */}
              {[
                { key: 'strengths', icon: CheckCircle, title: 'Strengths', color: '#22c55e', items: currentResult.strengths },
                { key: 'weaknesses', icon: AlertCircle, title: 'Weaknesses', color: '#ef4444', items: currentResult.weaknesses },
                { key: 'missing', icon: Star, title: 'Missing Keywords', color: '#f59e0b', items: currentResult.missingKeywords },
                { key: 'improvements', icon: Zap, title: 'Improvements', color: '#6366f1', items: currentResult.suggestedImprovements },
              ].map(({ key, icon: Icon, title, color, items }) => items?.length > 0 && (
                <div key={key} className="glass-card overflow-hidden">
                  <button onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Icon className="w-4 h-4" style={{ color }} /> {title} ({items.length})
                    </span>
                    {expandedSection === key ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === key && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-4 flex flex-wrap gap-2">
                          {items.map((item, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card flex flex-col items-center justify-center p-12 text-center"
            >
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-white font-semibold mb-2">No analysis yet</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Upload your PDF resume to get your ATS score and AI-powered feedback
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
