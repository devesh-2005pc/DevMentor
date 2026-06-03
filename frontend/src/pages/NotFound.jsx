import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Home, ArrowLeft, Zap } from 'lucide-react';

const NotFound = () => {
  const glitchRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(glitchRef.current, {
        skewX: 3,
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        ease: 'none',
        repeatDelay: 3,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: 'var(--color-bg)' }}>

      {/* Background blobs */}
      <div className="blob w-80 h-80 top-20 left-10 opacity-10" style={{ background: '#6366f1' }} />
      <div className="blob w-64 h-64 bottom-20 right-10 opacity-10 animation-delay-2000" style={{ background: '#a855f7' }} />

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white">DevMentor <span className="text-gradient">AI</span></span>
      </Link>

      {/* 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative mb-8"
      >
        <div ref={glitchRef} className="text-[10rem] font-extrabold leading-none select-none"
          style={{ color: 'transparent', WebkitTextStroke: '2px rgba(99,102,241,0.5)' }}>
          404
        </div>
        <div className="absolute inset-0 text-[10rem] font-extrabold leading-none select-none text-gradient"
          style={{ clipPath: 'inset(0 0 60% 0)' }}>
          404
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-lg mb-8 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
          Looks like this page got lost in the void. Don't worry — your dev journey continues elsewhere.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/" className="btn-primary px-6 py-3">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link to="/dashboard" className="btn-ghost px-6 py-3">
            <ArrowLeft className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Floating dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 2 === 0 ? '#6366f1' : '#a855f7',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotFound;
