import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap, GitBranch, FileText, Target, Map, MessageSquare,
  Lightbulb, TrendingUp, Star, ArrowRight, CheckCircle,
  Brain, Code2, Rocket, Shield, BarChart3, Users,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: '50K+', label: 'Developers', icon: Users },
  { value: '94%', label: 'Placement Rate', icon: Target },
  { value: '200+', label: 'AI Roadmaps', icon: Map },
  { value: '1M+', label: 'AI Insights', icon: Brain },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'AI Resume Analyzer',
    desc: 'Get an ATS score, keyword gap analysis, and AI-powered improvement suggestions in seconds.',
    color: '#6366f1',
    gradient: 'from-indigo-500/20 to-purple-500/10',
  },
  {
    icon: GitBranch,
    title: 'GitBranch Intelligence',
    desc: 'Deep-dive into your GitBranch activity, language trends, commit consistency, and AI-generated growth insights.',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-pink-500/10',
  },
  {
    icon: Map,
    title: 'AI Roadmap Generator',
    desc: 'Get a personalized, week-by-week learning roadmap tailored to your target role and current skill level.',
    color: '#22d3ee',
    gradient: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    icon: Target,
    title: 'Placement Prediction ML',
    desc: 'Real Random Forest ML model predicts your placement readiness % based on 7 key developer metrics.',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: MessageSquare,
    title: 'AI Mock Interviews',
    desc: 'Practice with an AI interviewer that asks role-specific questions and gives instant feedback on every answer.',
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    icon: Lightbulb,
    title: 'AI Project Generator',
    desc: 'Describe your stack and goals — get complete project ideas with architecture, folder structure, and timeline.',
    color: '#f43f5e',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
];

const TESTIMONIALS = [
  {
    name: 'Arjun Sharma',
    role: 'Software Engineer @ Google',
    avatar: 'AS',
    color: '#6366f1',
    text: 'DevMentor AI completely transformed my prep. The placement prediction was spot-on — I was at 82% readiness and got placed within 3 weeks!',
    stars: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Full Stack Developer @ Razorpay',
    avatar: 'PN',
    color: '#a855f7',
    text: 'The AI roadmap generator gave me a clear 12-week plan to master full stack. The weekly structure kept me accountable and focused.',
    stars: 5,
  },
  {
    name: 'Rahul Gupta',
    role: 'ML Engineer @ Amazon',
    avatar: 'RG',
    color: '#22d3ee',
    text: 'Mock interviews with instant AI feedback are a game changer. It\'s like having a senior engineer review every single answer you give.',
    stars: 5,
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['5 AI resume analyses', '3 roadmap generations', 'Basic GitBranch analytics', '10 mock interview questions'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    features: ['Unlimited AI analyses', 'Unlimited roadmaps', 'Advanced GitBranch intelligence', 'Unlimited mock interviews', 'ML placement prediction', 'Priority AI responses'],
    cta: 'Start Pro Free',
    highlight: true,
  },
  {
    name: 'Team',
    price: '₹999',
    period: '/month',
    features: ['Everything in Pro', 'Up to 10 team members', 'Team analytics dashboard', 'Custom roadmaps', 'Dedicated support', 'API access'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);

  // Animated counter
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stat-number', {
        textContent: 0,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // Feature cards stagger on scroll
      gsap.from('.feature-card', {
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#features',
          start: 'top 70%',
        },
      });

      // Testimonial cards
      gsap.from('.testimonial-card', {
        opacity: 0,
        scale: 0.9,
        stagger: 0.15,
        duration: 0.7,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top 70%',
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
      <Navbar />

      {/* ==================== HERO ==================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" ref={heroRef}>
        {/* Background blobs */}
        <div className="blob w-96 h-96 top-20 -left-32" style={{ background: '#6366f1' }} />
        <div className="blob w-80 h-80 top-40 right-0 animation-delay-2000" style={{ background: '#a855f7' }} />
        <div className="blob w-64 h-64 bottom-20 left-1/3 animation-delay-4000" style={{ background: '#22d3ee' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc',
            }}
          >
            <Zap className="w-4 h-4" />
            Powered by Hybrid AI Engine + Random Forest ML
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
          >
            Your AI-Powered
            <br />
            <span className="neon-text">Developer Mentor</span>
            <br />
            <span className="text-white">& Growth Ecosystem</span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Analyze your resume, connect GitBranch, get AI roadmaps, take mock interviews,
            and predict your placement readiness — all in one futuristic platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/register" className="btn-primary text-base px-8 py-4 group">
              Start For Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-4">
              Sign In
            </Link>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="glass-card p-6 rounded-2xl"
              style={{ boxShadow: '0 0 80px rgba(99,102,241,0.2), 0 0 40px rgba(168,85,247,0.1)' }}>
              {/* Mock Dashboard UI */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Placement Score', value: '84%', color: '#6366f1' },
                  { label: 'Resume ATS', value: '91/100', color: '#a855f7' },
                  { label: 'GitBranch Activity', value: '78%', color: '#22d3ee' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="glass-card p-4 text-left"
                    style={{ boxShadow: 'none' }}
                  >
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-faint)' }}>{item.label}</p>
                    <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                  </motion.div>
                ))}
              </div>
              {/* Fake bar chart */}
              <div className="flex items-end gap-2 h-20 px-2">
                {[40, 65, 55, 80, 70, 90, 75, 85, 60, 88, 78, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.1 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
                    style={{
                      background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#a855f7' : '#334155',
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-faint)' }}>12-week growth analytics</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== STATS ==================== */}
      <section ref={statsRef} className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {STATS.map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="glass-card p-6 text-center" style={{ boxShadow: 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <stat.icon className="w-5 h-5" style={{ color: '#6366f1' }} />
                </div>
                <p className="stat-number text-3xl font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="badge-primary mx-auto mb-4 w-fit"
            >
              <Rocket className="w-3 h-3" /> Platform Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1 }}
              className="section-heading mb-4"
            >
              Everything you need to{' '}
              <span className="text-gradient">land your dream role</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="section-subheading max-w-xl mx-auto"
            >
              Six powerful AI-driven modules working together as your personal growth ecosystem.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <div key={i} className={`feature-card glass-card p-6 bg-gradient-to-br ${feat.gradient}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feat.color}20`, border: `1px solid ${feat.color}30` }}>
                  <feat.icon className="w-6 h-6" style={{ color: feat.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-heading mb-4">How it <span className="text-gradient">Works</span></h2>
            <p className="section-subheading">Four simple steps to transform your developer career</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up in 30 seconds. No credit card required.' },
              { step: '02', title: 'Connect & Upload', desc: 'Link your GitBranch username and upload your resume PDF.' },
              { step: '03', title: 'Get AI Analysis', desc: 'Receive instant AI insights on your resume, GitBranch activity, and skill gaps.' },
              { step: '04', title: 'Grow & Get Placed', desc: 'Follow your AI roadmap, practice interviews, and track your placement readiness.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-8 mb-10 relative"
              >
                <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center font-mono font-bold text-sm z-10"
                  style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-neon-indigo)' }}>
                  {item.step}
                </div>
                <div className="glass-card p-6 flex-1" style={{ boxShadow: 'none' }}>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-heading mb-4">Loved by <span className="text-gradient">Developers</span></h2>
            <p className="section-subheading">Join thousands of developers who have accelerated their careers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-heading mb-4">Simple <span className="text-gradient">Pricing</span></h2>
            <p className="section-subheading">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 relative ${plan.highlight ? 'border-indigo-500/50' : ''}`}
                style={plan.highlight ? { boxShadow: '0 0 40px rgba(99,102,241,0.2)' } : {}}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-primary text-xs px-3 py-1">Most Popular</span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#6366f1' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={plan.highlight ? 'btn-primary w-full justify-center' : 'btn-ghost w-full justify-center'}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}
          >
            <div className="blob w-64 h-64 -top-20 -right-20 opacity-30" style={{ background: '#6366f1' }} />
            <div className="blob w-64 h-64 -bottom-20 -left-20 opacity-30 animation-delay-2000" style={{ background: '#a855f7' }} />
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Ready to <span className="text-gradient">level up</span>?
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Join 50,000+ developers who are using AI to accelerate their careers.
              </p>
              <Link to="/register" className="btn-primary text-base px-10 py-4 group">
                Start For Free — No Credit Card
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">DevMentor <span className="text-gradient">AI</span></span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>
              © 2025 DevMentor AI. Built with ❤️ for developers.
            </p>
            <div className="flex gap-6 text-sm" style={{ color: 'var(--color-text-faint)' }}>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
