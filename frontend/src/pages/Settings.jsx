import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Lock, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { updatePassword, updateSettings } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, updateUserState } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    notifications: user?.settings?.notifications ?? true,
    emailUpdates: user?.settings?.emailUpdates ?? true,
  });

  const pwdMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success('Password updated!');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password update failed'),
  });

  const settingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (res) => {
      updateUserState(res.data.user);
      toast.success('Settings saved!');
    },
    onError: () => toast.error('Settings update failed'),
  });

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    pwdMutation.mutate(passwords);
  };

  const handleSettingsUpdate = () => {
    settingsMutation.mutate(notifSettings);
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{desc}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${checked ? '' : ''}`}
        style={{ background: checked ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)' }}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${checked ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="page-container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Manage your account preferences</p>
      </motion.div>

      <div className="space-y-6">
        {/* Account Info */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: '#6366f1' }} /> Account
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Role', value: user?.role },
              { label: 'Member since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString() },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: '#a855f7' }} /> Notifications
          </h3>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            <Toggle checked={notifSettings.notifications} label="Push Notifications"
              desc="Get notified about interview results and AI insights"
              onChange={(v) => setNotifSettings({ ...notifSettings, notifications: v })} />
            <Toggle checked={notifSettings.emailUpdates} label="Email Updates"
              desc="Weekly progress reports and tips"
              onChange={(v) => setNotifSettings({ ...notifSettings, emailUpdates: v })} />
          </div>
          <button onClick={handleSettingsUpdate} disabled={settingsMutation.isPending}
            className="btn-ghost text-sm py-2 px-4 mt-4 disabled:opacity-60">
            {settingsMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4" /> Save Preferences</>}
          </button>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4" style={{ color: '#22d3ee' }} /> Change Password
          </h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-3">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirmNewPassword', label: 'Confirm New Password' },
            ].map((field) => (
              <div key={field.key} className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder={field.label}
                  value={passwords[field.key]}
                  onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            ))}
            <button id="change-password-btn" type="submit" disabled={pwdMutation.isPending}
              className="btn-primary py-3 disabled:opacity-60">
              {pwdMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <><Lock className="w-4 h-4" /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
