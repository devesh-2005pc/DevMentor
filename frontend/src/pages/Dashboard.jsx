import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar,
} from 'recharts';
import {
  Flame, Target, GitBranch, TrendingUp, Brain, Star,
  MessageSquare, FileText, Map, Lightbulb, ArrowRight,
  Zap, AlertCircle, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDashboardOverview } from '../api/dashboardApi';
import { useAuth } from '../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CUSTOM_TOOLTIP_STYLE = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
  color: '#f8fafc',
};

const SkillRadar = ({ data }) => {
  const radarData = [
    { subject: 'DSA', value: data?.dsa || 45 },
    { subject: 'Web Dev', value: data?.webDev || 60 },
    { subject: 'System Design', value: data?.systemDesign || 35 },
    { subject: 'AI/ML', value: data?.ai_ml || 20 },
    { subject: 'DevOps', value: data?.devops || 25 },
    { subject: 'Communication', value: data?.communication || 70 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Radar name="Skills" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

const GaugeChart = ({ score, size = 120 }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = ((score || 0) / 100) * circumference;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#6366f1';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }} />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="18" fontWeight="700" fontFamily="Inter">{score || 0}%</text>
      </svg>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardOverview().then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="dashboard-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-6 h-40 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.analytics || {};
  const chartData = data?.charts || {};
  const dashUser = data?.user || user;
  const placement = data?.placement?.prediction;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-gradient">{dashUser?.name?.split(' ')[0] || 'Developer'}</span> 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Here's your growth snapshot for today
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/resume" className="btn-ghost text-sm py-2 px-4">
              <FileText className="w-4 h-4" /> Upload Resume
            </Link>
            <Link to="/interview" className="btn-primary text-sm py-2 px-4">
              <Zap className="w-4 h-4" /> Start Interview
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Flame, label: 'Coding Streak', value: `${dashUser?.codingStreak || 12} days`, color: '#f97316' },
          { icon: Target, label: 'Placement Score', value: `${dashUser?.placementReadiness || 0}%`, color: '#6366f1' },
          { icon: MessageSquare, label: 'Interviews', value: stats.totalInterviews || 0, color: '#a855f7' },
          { icon: Map, label: 'Roadmaps', value: stats.totalRoadmaps || 0, color: '#22d3ee' },
        ].map((stat, i) => (
          <motion.div key={i} variants={cardVariants} className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}20` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Placement Gauge */}
        <motion.div variants={cardVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5" style={{ color: '#6366f1' }} />
            <h3 className="font-semibold text-white text-sm">Placement Readiness</h3>
          </div>
          <div className="flex flex-col items-center gap-3">
            <GaugeChart score={dashUser?.placementReadiness || placement?.readinessScore || 0} size={140} />
            <p className="text-xs text-center px-4" style={{ color: 'var(--color-text-muted)' }}>
              {placement?.predictedRole ? `Best fit: ${placement.predictedRole}` : 'Run placement prediction to get your score'}
            </p>
            <Link to="/placement" className="btn-primary text-xs py-2 px-4">
              Get Prediction <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div variants={cardVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: '#a855f7' }} />
            <h3 className="font-semibold text-white text-sm">Skill Radar</h3>
          </div>
          <SkillRadar data={chartData.skillRadar} />
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={cardVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5" style={{ color: '#22d3ee' }} />
            <h3 className="font-semibold text-white text-sm">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {(stats.aiInsights || ['Connect your GitBranch to get personalized insights', 'Upload your resume for ATS analysis']).slice(0, 3).map((insight, i) => (
              <div key={i} className="flex gap-2 p-3 rounded-xl text-xs"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#6366f1' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div variants={cardVariants} className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" style={{ color: '#f59e0b' }} />
            <h3 className="font-semibold text-white text-sm">Weekly Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData.weeklyActivity || []}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2}
                fill="url(#colorScore)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* GitBranch Summary */}
        <motion.div variants={cardVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="font-semibold text-white text-sm">GitBranch</h3>
            </div>
            <Link to="/GitBranch" className="text-xs" style={{ color: '#6366f1' }}>View all →</Link>
          </div>
          {data?.GitBranch ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
                  {data.GitBranch.profileData?.avatarUrl && (
                    <img src={data.GitBranch.profileData.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{data.GitBranch.githubUsername}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{data.GitBranch.profileData?.publicRepos} repos</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '⭐ Stars', value: data.GitBranch.totalStars },
                  { label: '🍴 Forks', value: data.GitBranch.totalForks },
                ].map((item, i) => (
                  <div key={i} className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-sm font-bold text-white">{item.value}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 gap-3">
              <GitBranch className="w-8 h-8" style={{ color: 'var(--color-text-faint)' }} />
              <Link to="/GitBranch" className="btn-ghost text-xs py-1.5 px-3">Connect GitBranch</Link>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={cardVariants} className="glass-card p-6 lg:col-span-3">
          <h3 className="font-semibold text-white text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: FileText, label: 'Analyze Resume', path: '/resume', color: '#6366f1' },
              { icon: Map, label: 'Get Roadmap', path: '/roadmap', color: '#a855f7' },
              { icon: MessageSquare, label: 'Mock Interview', path: '/interview', color: '#22d3ee' },
              { icon: Lightbulb, label: 'Project Ideas', path: '/projects', color: '#f59e0b' },
            ].map((action, i) => (
              <Link key={i} to={action.path}
                className="glass-card p-4 flex flex-col items-center gap-3 cursor-pointer text-center group"
                style={{ boxShadow: 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `${action.color}20` }}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <span className="text-xs font-medium text-white">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
