import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="blob w-96 h-96 -top-20 -left-20" style={{ background: '#6366f1' }} />
        <div className="blob w-80 h-80 bottom-0 right-0 animation-delay-2000" style={{ background: '#a855f7' }} />

        <div className="relative z-10 text-center max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DevMentor <span className="text-gradient">AI</span></span>
          </Link>
          <h2 className="text-4xl font-extrabold text-white mb-4">Welcome Back!</h2>
          <p className="text-lg mb-10" style={{ color: 'var(--color-text-muted)' }}>
            Continue your journey to becoming a top developer.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🎯', label: 'Placement Score', value: 'Track Progress' },
              { icon: '🤖', label: 'AI Interview', value: 'Practice Daily' },
              { icon: '📄', label: 'Resume ATS', value: 'Get 90+ Score' },
              { icon: '🗺️', label: 'Roadmaps', value: 'Follow Plan' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card p-4 text-left"
                style={{ boxShadow: 'none' }}
              >
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{item.value}</p>
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
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">DevMentor <span className="text-gradient">AI</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                className="input-field pl-11"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="input-field pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-faint)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary justify-center mt-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="font-semibold mb-1" style={{ color: '#a5b4fc' }}>Demo Account</p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Email: <span className="font-mono text-white">demo@devmentor.ai</span><br />
              Password: <span className="font-mono text-white">demo123</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
