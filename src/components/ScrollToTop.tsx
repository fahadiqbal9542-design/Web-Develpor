import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate scroll progress percentage (0 to 100)
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        setScrollProgress(progress);
      }

      // Show button once user scrolls down 240px
      if (scrollTop > 240) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Circular progress math
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
        >
          <button
            id="scroll-to-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0B2347] text-amber-300 shadow-2xl hover:bg-[#123363] hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            title="Scroll to top"
          >
            {/* Circular Progress Indicator Ring */}
            <svg
              className="absolute inset-0 w-12 h-12 -rotate-90 pointer-events-none"
              viewBox="0 0 52 52"
            >
              {/* Background ring */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-amber-400/20"
                strokeWidth="2.5"
                fill="none"
              />
              {/* Active animated progress ring */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-amber-400 transition-all duration-150 ease-out"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Up Arrow Icon with upward hover animation */}
            <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />

            {/* Tooltip Badge on hover */}
            <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md bg-[#0B2347] text-white shadow-lg border border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Top
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
