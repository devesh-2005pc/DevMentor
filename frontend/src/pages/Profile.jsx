import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Code2, GitBranch, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const EXPERIENCE_LEVELS = ['Fresher', '1-2 years', '2-5 years', '5+ years'];
const TARGET_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer', 'Data Scientist'];

const Profile = () => {
  const { user, updateUserState } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    githubUsername: user?.githubUsername || '',
    targetRole: user?.targetRole || 'Full Stack Developer',
    experience: user?.experience || 'Fresher',
    skills: user?.skills?.join(', ') || '',
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      updateUserState(res.data.user);
      toast.success('Profile updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">My Profile</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Manage your personal information and developer profile
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Card */}
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
              style={{ background: 'var(--gradient-primary)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="badge-primary">{user?.experience || 'Fresher'}</span>
              {user?.githubUsername && (
                <span className="badge-cyan">@{user.githubUsername}</span>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: '#6366f1' }} /> Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>Full Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>GitBranch Username</label>
              <div className="relative">
                <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
                <input className="input-field pl-10" value={form.githubUsername}
                  onChange={(e) => setForm({ ...form, githubUsername: e.target.value })} placeholder="username" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>Bio</label>
              <textarea className="input-field resize-none" rows={3} value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
            </div>
          </div>
        </div>

        {/* Career Info */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Briefcase className="w-4 h-4" style={{ color: '#a855f7' }} /> Career Goals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>Target Role</label>
              <select className="input-field" value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>Experience Level</label>
              <div className="flex gap-2">
                {EXPERIENCE_LEVELS.map((l) => (
                  <button key={l} type="button" onClick={() => setForm({ ...form, experience: l })}
                    className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium transition-all border ${
                      form.experience === l ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-transparent bg-white/3 text-gray-400'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
                Skills (comma-separated)
              </label>
              <input className="input-field" value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="React, Node.js, TypeScript, Python..." />
            </div>
          </div>
        </div>

        <button id="save-profile-btn" type="submit" disabled={mutation.isPending}
          className="btn-primary justify-center py-3.5 disabled:opacity-60">
          {mutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Save className="w-4 h-4" /> Save Profile</>
          )}
        </button>
      </form>
    </div>
  );
};

export default Profile;
