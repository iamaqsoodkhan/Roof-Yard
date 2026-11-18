import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeMode } from '../types';

interface SplashScreenProps {
  show: boolean;
  theme: ThemeMode;
  onFinish: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  radius: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  show,
  theme,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!show) return;

    const timer = window.setTimeout(() => {
      onFinish();
    }, 1750);

    return () => window.clearTimeout(timer);
  }, [show, onFinish]);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const colors = ['#ef4444', '#fbbf24', '#f97316', '#fda4af', '#ffffff'];
    const particles: Particle[] = [];

    const spawnBurst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        const speed = 2.2 + Math.random() * 4.8;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: 1.8 + Math.random() * 2.2,
        });
      }
    };

    spawnBurst(canvas.width * 0.3, canvas.height * 0.34, 28);
    spawnBurst(canvas.width * 0.7, canvas.height * 0.32, 28);
    const t2 = window.setTimeout(() => {
      spawnBurst(canvas.width * 0.5, canvas.height * 0.26, 36);
      spawnBurst(canvas.width * 0.22, canvas.height * 0.62, 22);
      spawnBurst(canvas.width * 0.78, canvas.height * 0.6, 22);
    }, 450);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha -= 0.017;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.clearTimeout(t2);
      cancelAnimationFrame(animId);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#090204] via-[#1d050a] to-[#0b0305] text-white'
              : 'bg-gradient-to-br from-[#fff5f5] via-[#ffe4e6] to-[#fff1f2] text-[#1c0b0e]'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 w-full h-full"
          />

          <motion.div
            initial={{ scale: 0.35, opacity: 0, y: 24 }}
            animate={{
              scale: [0.35, 1.14, 0.94, 1.04, 1],
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1.05,
              times: [0, 0.45, 0.68, 0.85, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="relative p-4 rounded-3xl">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl scale-110"
              />
              <img
                src={theme === 'dark' ? '/images/logo-dark.webp' : '/images/logo-light.webp'}
                alt="Roof Yard — De Cafe & Grill"
                className="relative w-40 sm:w-48 h-auto object-contain drop-shadow-2xl"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
              className="mt-3 text-sm sm:text-base font-medium tracking-wide text-red-700 dark:text-red-300"
            >
              Rooftop Retreat for Foodies · 5:30 PM – 3:00 AM
            </motion.p>

            <motion.button
              type="button"
              onClick={onFinish}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ delay: 0.7 }}
              className="mt-5 text-xs underline underline-offset-4 hover:opacity-100"
            >
              Skip intro
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
