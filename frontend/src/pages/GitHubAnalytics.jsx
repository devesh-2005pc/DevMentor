import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { GitBranch, RefreshCw, Zap, Star, GitFork, Code2, TrendingUp, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { connectGithub, getGithubStats, refreshGithubStats } from '../api/githubApi';
import { generateGithubInsights } from '../api/ai';

const COLORS = ['#6366f1', '#a855f7', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6', '#ec4899'];

const CUSTOM_TOOLTIP = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
  color: '#f8fafc',
};

const GitHubAnalytics = () => {
  const [username, setUsername] = useState('');
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['GitBranch-stats'],
    queryFn: () => getGithubStats().then((r) => r.data.data),
    retry: false,
  });

  const connectMutation = useMutation({
    mutationFn: (u) => connectGithub(u),
    onSuccess: () => {
      queryClient.invalidateQueries(['GitBranch-stats']);
      toast.success('GitBranch connected and analyzed!');
      setUsername('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Connection failed'),
  });

  const refreshMutation = useMutation({
    mutationFn: refreshGithubStats,
    onSuccess: () => {
      queryClient.invalidateQueries(['GitBranch-stats']);
      toast.success('GitBranch stats refreshed!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Refresh failed'),
  });

  const insightsMutation = useMutation({
    mutationFn: () => generateGithubInsights(stats),
    onSuccess: () => {
      queryClient.invalidateQueries(['GitBranch-stats']);
      toast.success('AI Insights regenerated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to regenerate insights'),
  });

  const languageData = stats?.languageStats
    ? Object.entries(stats.languageStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  const repoData = stats?.repositories
    ?.sort((a, b) => b.stars - a.stars)
    .slice(0, 6)
    .map((r) => ({ name: r.name.substring(0, 12), stars: r.stars, forks: r.forks }))
    || [];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">GitBranch</span> Intelligence
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Deep analytics on your GitBranch activity with AI-generated insights
        </p>
      </motion.div>

      {/* Connect Form */}
      {!stats && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-lg mx-auto text-center mb-8">
          <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <h2 className="text-xl font-bold text-white mb-2">Connect Your GitBranch</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Enter your GitBranch username to get deep analytics and AI insights
          </p>
          <div className="flex gap-3">
            <input
              id="GitBranch-username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. torvalds"
              className="input-field flex-1"
              onKeyDown={(e) => e.key === 'Enter' && username && connectMutation.mutate(username)}
            />
            <button
              id="GitBranch-connect-btn"
              onClick={() => connectMutation.mutate(username)}
              disabled={!username || connectMutation.isPending}
              className="btn-primary px-5 disabled:opacity-60"
            >
              {connectMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Connect'}
            </button>
          </div>
        </motion.div>
      )}

      {stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Profile Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img src={stats.profileData?.avatarUrl} alt="avatar"
                  className="w-16 h-16 rounded-full border-2 border-indigo-500/30" />
                <div>
                  <h2 className="text-xl font-bold text-white">@{stats.githubUsername}</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {stats.profileData?.bio || 'No bio available'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                  className="btn-ghost text-sm py-2 px-4">
                  <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: Code2, label: 'Repositories', value: stats.profileData?.publicRepos },
                { icon: Star, label: 'Total Stars', value: stats.totalStars },
                { icon: GitFork, label: 'Total Forks', value: stats.totalForks },
                { icon: Eye, label: 'Followers', value: stats.profileData?.followers },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: '#6366f1' }} />
                  <p className="text-xl font-bold text-white">{item.value || 0}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Breakdown */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <Code2 className="w-4 h-4" style={{ color: '#a855f7' }} /> Language Breakdown
              </h3>
              {languageData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={languageData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        paddingAngle={2} dataKey="value">
                        {languageData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CUSTOM_TOOLTIP} formatter={(v) => [`${v}%`, 'Usage']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {languageData.slice(0, 5).map((lang, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs flex-1" style={{ color: 'var(--color-text-muted)' }}>{lang.name}</span>
                        <span className="text-xs font-semibold text-white">{lang.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-faint)' }}>No language data</p>
              )}
            </div>

            {/* Top Repos */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: '#f59e0b' }} /> Top Repositories
              </h3>
              {repoData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={repoData} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={CUSTOM_TOOLTIP} />
                    <Bar dataKey="stars" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-faint)' }}>No repository data</p>
              )}
            </div>
          </div>

          {/* AI Insights */}
          {stats.aiInsights?.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: '#22d3ee' }} /> AI-Generated Insights
                </h3>
                <button
                  onClick={() => insightsMutation.mutate()}
                  disabled={insightsMutation.isPending}
                  className="btn-ghost text-xs py-1 px-3 flex items-center gap-1.5"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <RefreshCw className={`w-3 h-3 ${insightsMutation.isPending ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.aiInsights.map((insight, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
                    <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22d3ee' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Repository List */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white text-sm mb-4">All Repositories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.repositories?.slice(0, 8).map((repo, i) => (
                <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer"
                  className="p-4 rounded-xl border transition-all hover:border-indigo-500/30"
                  style={{ border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white truncate">{repo.name}</p>
                    <div className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: '#f59e0b' }}>
                      <Star className="w-3 h-3" /> {repo.stars}
                    </div>
                  </div>
                  {repo.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-faint)' }}>
                      {repo.description}
                    </p>
                  )}
                  {repo.language && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                      {repo.language}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GitHubAnalytics;
