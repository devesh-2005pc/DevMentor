import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await register({ name: form.name, email: form.email, password: form.password });
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#ef4444', '#f59e0b', '#22c55e'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="blob w-96 h-96 -top-20 -left-20 animation-delay-2000" style={{ background: '#a855f7' }} />
        <div className="blob w-80 h-80 bottom-0 right-0" style={{ background: '#6366f1' }} />

        <div className="relative z-10 max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DevMentor <span className="text-gradient">AI</span></span>
          </Link>

          <h2 className="text-4xl font-extrabold text-white mb-4">Start Your Journey</h2>
          <p className="text-lg mb-10" style={{ color: 'var(--color-text-muted)' }}>
            Join 50,000+ developers using AI to accelerate their careers.
          </p>

          <div className="space-y-4">
            {[
              { emoji: '✅', text: 'Free forever plan — no credit card' },
              { emoji: '🤖', text: 'AI-powered resume & GitBranch analysis' },
              { emoji: '🎯', text: 'ML-based placement readiness score' },
              { emoji: '🗺️', text: 'Personalized 12-week learning roadmaps' },
              { emoji: '💬', text: 'Unlimited AI mock interview practice' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xl">{item.emoji}</span>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">DevMentor <span className="text-gradient">AI</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
              <input id="register-name" name="name" type="text" placeholder="Full name"
                value={form.name} onChange={handleChange} required className="input-field pl-11" />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
              <input id="register-email" name="email" type="email" placeholder="Email address"
                value={form.email} onChange={handleChange} required className="input-field pl-11" />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
                <input id="register-password" name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange}
                  required className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-faint)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-colors duration-300"
                      style={{ background: i <= strength ? strengthColors[strength] : 'var(--color-border)' }} />
                  ))}
                  <span className="text-xs ml-2" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
              <input id="register-confirm" name="confirmPassword" type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange}
                required className="input-field pl-11" />
            </div>

            {error && (
              <p className="text-sm text-center px-3 py-2 rounded-lg"
                style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            <button id="register-submit" type="submit" disabled={loading}
              className="btn-primary justify-center mt-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Free Account
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--color-text-faint)' }}>
            By creating an account you agree to our{' '}
            <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
