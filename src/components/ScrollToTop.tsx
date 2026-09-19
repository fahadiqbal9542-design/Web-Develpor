import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.scrollY || window.pageYOffset || 0;
      const docScroll = document.documentElement?.scrollTop || 0;
      const bodyScroll = document.body?.scrollTop || 0;
      const scrollTop = Math.max(winScroll, docScroll, bodyScroll);

      const docHeight =
        Math.max(
          document.documentElement?.scrollHeight || 0,
          document.body?.scrollHeight || 0
        ) - window.innerHeight;

      // Calculate scroll progress percentage (0 to 100)
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        setScrollProgress(progress);
      }

      // Show button as soon as user scrolls down more than 100px
      if (scrollTop > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check in case page starts scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) {
      try {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        document.documentElement.scrollTop = 0;
      }
    }
    if (document.body) {
      try {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        document.body.scrollTop = 0;
      }
    }
  };

  // Circular progress math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center justify-center"
        >
          <button
            id="scroll-to-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll back to top (اوپر جائیں)"
            className="group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-full bg-[#0B2347] hover:bg-[#123363] text-white shadow-2xl border-2 border-amber-400 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-400/40 cursor-pointer"
            title="Scroll to top / صفحہ کے اوپر جائیں"
          >
            {/* Left Circular Ring with Arrow inside */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-blue-950 shrink-0 shadow-sm">
              {/* Progress Ring SVG */}
              <svg
                className="absolute -inset-1 w-10 h-10 -rotate-90 pointer-events-none"
                viewBox="0 0 44 44"
              >
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-amber-400/25"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-amber-400 transition-all duration-150 ease-out"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <ArrowUp className="w-4 h-4 text-[#0B2347] stroke-[3] transition-transform duration-300 group-hover:-translate-y-0.5" />
            </div>

            {/* Urdu & English Label */}
            <div className="flex flex-col text-left leading-tight pr-1">
              <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
                Top
              </span>
              <span className="text-[10px] font-bold text-slate-200">
                اوپر جائیں
              </span>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
