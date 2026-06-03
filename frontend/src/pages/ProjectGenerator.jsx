import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Zap, Clock, Code2, ArrowRight, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateProjects } from '../api/ai';

const EXAMPLE_PROMPTS = [
  'I want a MERN + AI project that solves a real problem',
  'Build a SaaS dashboard with React and Node.js',
  'A React Native app with Firebase and AI features',
  'Python ML project for healthcare data analysis',
  'Full stack e-commerce with Next.js and Stripe',
];

const DIFFICULTY_COLORS = {
  Beginner: { bg: 'rgba(34,197,94,0.12)', color: '#86efac', border: 'rgba(34,197,94,0.2)' },
  Intermediate: { bg: 'rgba(245,158,11,0.12)', color: '#fde68a', border: 'rgba(245,158,11,0.2)' },
  Advanced: { bg: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: 'rgba(239,68,68,0.2)' },
};

const ProjectCard = ({ project, index }) => {
  const diff = DIFFICULTY_COLORS[project.difficulty] || DIFFICULTY_COLORS.Intermediate;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {project.description}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
          style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>
          {project.difficulty}
        </span>
      </div>

      {/* Tech Stack */}
      <div className="mb-4">
        <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: '#a5b4fc' }}>
          <Code2 className="w-3 h-3" /> Tech Stack
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.techStack?.map((t, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#c7d2fe', border: '1px solid rgba(99,102,241,0.2)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      {project.features?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: '#86efac' }}>
            ✨ Key Features
          </p>
          <ul className="space-y-1">
            {project.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#6366f1' }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Architecture */}
      {project.architecture && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: '#fde68a' }}>
            <Layers className="w-3 h-3" /> Architecture
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{project.architecture}</p>
        </div>
      )}

      {/* Folder Structure */}
      {project.folderStructure && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: '#f9a8d4' }}>📁 Folder Structure</p>
          <pre className="text-xs p-3 rounded-xl overflow-x-auto font-mono leading-relaxed"
            style={{ background: 'rgba(0,0,0,0.3)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}>
            {project.folderStructure}
          </pre>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-faint)' }}>
          <Clock className="w-3.5 h-3.5" /> {project.timeline}
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-faint)' }}>
          ~{project.estimatedHours}h total
        </div>
        {project.deploymentSuggestion && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-faint)' }}>
            🚀 {project.deploymentSuggestion}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProjectGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState([]);

  const mutation = useMutation({
    mutationFn: generateProjects,
    onSuccess: (res) => {
      setProjects(res.data.data.projects || []);
      toast.success('Project ideas generated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Generation failed'),
  });

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">AI Project</span> Generator
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Describe what you want to build and get 3 complete project ideas with architecture and timeline
        </p>
      </motion.div>

      {/* Input */}
      <div className="glass-card p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <textarea
            id="project-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your project idea or tech stack... e.g. 'I want a MERN + AI project for productivity'"
            rows={3}
            className="input-field flex-1 resize-none"
          />
        </div>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {EXAMPLE_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setPrompt(p)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all hover:border-indigo-500/30 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-faint)', border: '1px solid var(--color-border)' }}>
              {p}
            </button>
          ))}
        </div>

        <button id="generate-projects-btn" onClick={() => mutation.mutate({ prompt })}
          disabled={!prompt.trim() || mutation.isPending}
          className="btn-primary justify-center disabled:opacity-60 py-3">
          {mutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating 3 project ideas...</>
          ) : (
            <><Zap className="w-4 h-4" /> Generate Project Ideas</>
          )}
        </button>
      </div>

      {/* Projects */}
      <AnimatePresence>
        {projects.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5" style={{ color: '#f59e0b' }} />
              3 Project Ideas Generated
            </h2>
            {projects.map((project, i) => (
              <ProjectCard key={i} project={project} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectGenerator;
