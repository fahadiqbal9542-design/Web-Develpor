import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Play, Pause, SkipForward, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface IntroPromoProps {
  onComplete: () => void;
  onSelectPagePreview?: (page: PageId) => void;
}

export const IntroPromo: React.FC<IntroPromoProps> = ({ onComplete, onSelectPagePreview }) => {
  // Current time in seconds (0 to 18)
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTourPage, setActiveTourPage] = useState<PageId>('home');
  const timerRef = useRef<number | null>(null);

  // Phases:
  // 0:00 - 0:05 (0 - 5.0s): Logo showcase
  // 0:05 - 0:08 (5.0 - 8.0s): WEB DEVELOPER school name reveal
  // 0:08 - 0:12 (8.0 - 12.0s): School name fade out, Website open & Homepage important sections quick preview
  // 0:12 - 0:17 (12.0 - 17.0s): Smooth preview transitions of Home -> About -> Gallery -> Contact
  // 17.0s+: Completion

  useEffect(() => {
    if (!isPlaying) return;

    const interval = 100; // update every 100ms
    timerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;

        // Auto switch tour page during 12s - 17s
        if (next >= 8.0 && next < 12.0) {
          setActiveTourPage('home');
          if (onSelectPagePreview) onSelectPagePreview('home');
        } else if (next >= 12.0 && next < 13.5) {
          setActiveTourPage('about');
          if (onSelectPagePreview) onSelectPagePreview('about');
        } else if (next >= 13.5 && next < 15.0) {
          setActiveTourPage('gallery');
          if (onSelectPagePreview) onSelectPagePreview('gallery');
        } else if (next >= 15.0 && next < 16.5) {
          setActiveTourPage('contact');
          if (onSelectPagePreview) onSelectPagePreview('contact');
        }

        if (next >= 17.0) {
          if (timerRef.current) clearInterval(timerRef.current);
          onComplete();
          return 17.0;
        }

        return next;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, onComplete, onSelectPagePreview]);

  const jumpToTime = (time: number) => {
    setCurrentTime(time);
    if (time >= 8.0 && time < 12.0) {
      setActiveTourPage('home');
      if (onSelectPagePreview) onSelectPagePreview('home');
    } else if (time >= 12.0 && time < 13.5) {
      setActiveTourPage('about');
      if (onSelectPagePreview) onSelectPagePreview('about');
    } else if (time >= 13.5 && time < 15.0) {
      setActiveTourPage('gallery');
      if (onSelectPagePreview) onSelectPagePreview('gallery');
    } else if (time >= 15.0) {
      setActiveTourPage('contact');
      if (onSelectPagePreview) onSelectPagePreview('contact');
    }
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const ms = Math.floor((secs % 1) * 10);
    return `0:${s < 10 ? '0' + s : s}.${ms}`;
  };

  const progressPercentage = Math.min(100, (currentTime / 17.0) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-blue-950 flex flex-col justify-between overflow-hidden text-white select-none">
      {/* Ambient background particles & grid: Royal Blue + Gold */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.18),rgba(30,58,138,0.4))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Header Controls */}
      <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-blue-900/80 bg-blue-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>OFFICIAL SCHOOL PROMO</span>
          </div>
          <span className="text-xs text-blue-200 font-mono hidden sm:inline">
            Time: {formatTime(currentTime)} / 0:17.0
          </span>
        </div>

        {/* Phase Badges */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => jumpToTime(0)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              currentTime < 5.0 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 shadow-md' : 'text-blue-200 hover:text-white bg-blue-900/60'
            }`}
          >
            0:00 Logo (5s)
          </button>
          <button
            onClick={() => jumpToTime(5.0)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              currentTime >= 5.0 && currentTime < 8.0 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 shadow-md' : 'text-blue-200 hover:text-white bg-blue-900/60'
            }`}
          >
            0:05 WEB DEVELOPER
          </button>
          <button
            onClick={() => jumpToTime(8.0)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              currentTime >= 8.0 && currentTime < 12.0 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 shadow-md' : 'text-blue-200 hover:text-white bg-blue-900/60'
            }`}
          >
            0:08 Website Open
          </button>
          <button
            onClick={() => jumpToTime(12.0)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              currentTime >= 12.0 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 shadow-md' : 'text-blue-200 hover:text-white bg-blue-900/60'
            }`}
          >
            0:12+ Pages Preview
          </button>
        </div>

        {/* Skip Button: Gold */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-amber-300 border border-blue-800 transition-colors"
            title={isPlaying ? "Pause promo" : "Resume promo"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-300 text-amber-300" />}
          </button>
          <button
            id="skip-intro-btn"
            onClick={onComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black text-xs transition-all shadow-lg shadow-amber-400/25 hover:scale-[1.02] border border-amber-300"
          >
            <span>Skip to Website</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Central Cinematic Stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* PHASE 1: 0:00 to 0:05 — 5 SECONDS LOGO SHOWCASE */}
          {currentTime < 5.0 && (
            <motion.div
              key="phase-logo"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="flex flex-col items-center text-center max-w-xl mx-auto"
            >
              {/* Outer Light Gold Energy Pulse Ring */}
              <div className="relative mb-8">
                <div className="absolute -inset-6 rounded-full bg-amber-400/25 blur-2xl animate-pulse" />
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-blue-900/90 border-2 border-amber-400 shadow-2xl shadow-blue-900/50 flex items-center justify-center p-4 relative backdrop-blur-xl">
                  {/* Glowing Crest Graphic in Blue + Gold */}
                  <SchoolLogo size="xl" showText={false} animated={true} />
                </div>
              </div>

              {/* Tagline / Welcome */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="space-y-3"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  PREMIER TECHNOLOGY & WEB ENGINEERING ACADEMY
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-display">
                  Code the Future. Build with Purpose.
                </h2>
                <p className="text-sm text-blue-200 max-w-md mx-auto">
                  Accredited STEM Institution • Dual-Enrollment High School & Middle School Computing
                </p>
              </motion.div>

              {/* 5-Second Countdown Rings: Light Gold */}
              <div className="mt-8 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((sec) => (
                  <div
                    key={sec}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentTime >= sec - 0.2
                        ? 'w-8 bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                        : 'w-4 bg-blue-900'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* PHASE 2: 0:05 to 0:08 — SCHOOL NAME “WEB DEVELOPER” REVEAL */}
          {currentTime >= 5.0 && currentTime < 8.0 && (
            <motion.div
              key="phase-name"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="flex flex-col items-center text-center max-w-3xl mx-auto px-4"
            >
              {/* Scaled Mini-Emblem */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mb-6 p-2 rounded-2xl bg-amber-400/20 border border-amber-400/40 backdrop-blur-md"
              >
                <SchoolLogo size="sm" showText={false} />
              </motion.div>

              <span className="text-amber-400 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
                OFFICIAL INSTITUTION OF EXCELLENCE
              </span>

              {/* Big Bold School Name “WEB DEVELOPER” in Royal Blue & Gold Finish */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-xl">
                WEB DEVELOPER
              </h1>

              <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full my-4 shadow-[0_0_12px_#fbbf24]" />

              <p className="text-base sm:text-xl text-white font-semibold max-w-xl">
                SCHOOL OF ADVANCED WEB TECHNOLOGY & DIGITAL CREATION
              </p>

              <p className="text-xs sm:text-sm text-blue-200 mt-2">
                Admissions Open 2026–2027 • Full-Stack Curriculum • Global Coding Honors
              </p>
            </motion.div>
          )}

          {/* PHASE 3: 0:08 to 0:12 — WEBSITE OPEN & HOMEPAGE IMPORTANT SECTIONS QUICK PREVIEW */}
          {currentTime >= 8.0 && currentTime < 12.0 && (
            <motion.div
              key="phase-open"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  0:08–0:12 — Website Smoothly Opening
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Welcome to WEB DEVELOPER School Homepage
                </h3>
                <p className="text-xs sm:text-sm text-blue-200">
                  Quick preview of our primary academic portals and student showcases
                </p>
              </div>

              {/* Interactive Virtual Browser Mockup showing Homepage Sections */}
              <div className="rounded-2xl border border-blue-800 bg-blue-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
                {/* Browser top chrome */}
                <div className="bg-blue-950 px-4 py-2.5 border-b border-blue-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="px-4 py-1 rounded-lg bg-blue-900 text-xs font-mono text-amber-300 border border-blue-800">
                    https://webdeveloper.school/home
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase">Homepage Open</span>
                </div>

                {/* Homepage Key Sections Quick Preview Grid */}
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Section 1: Hero & Admissions */}
                  <div className="p-4 rounded-xl bg-blue-950/70 border border-amber-400/40 hover:border-amber-400 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white font-display">Hero & Admissions</h4>
                    <p className="text-xs text-blue-200 mt-1">
                      Welcome banner, merit scholarship announcements, and quick enrollment links.
                    </p>
                  </div>

                  {/* Section 2: Academic Programs */}
                  <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-600 hover:border-amber-400 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-blue-700/60 text-amber-300 flex items-center justify-center mb-3">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white font-display">Coding Curriculum</h4>
                    <p className="text-xs text-blue-200 mt-1">
                      Junior Web, Full-Stack Architecture, UI/UX Design, and AI web applications.
                    </p>
                  </div>

                  {/* Section 3: Campus & Tech Labs */}
                  <div className="p-4 rounded-xl bg-blue-950/70 border border-amber-400/40 hover:border-amber-400 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white font-display">10Gbps Fiber Labs</h4>
                    <p className="text-xs text-blue-200 mt-1">
                      Dual-screen engineering stations, cloud clusters, and collaborative spaces.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 4: 0:12+ — SMOOTH PREVIEWS OF HOME, ABOUT, GALLERY, CONTACT */}
          {currentTime >= 12.0 && (
            <motion.div
              key="phase-tour"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="text-center mb-4">
                <span className="text-xs font-mono text-amber-300 font-bold tracking-wider uppercase">
                  PAGE SHOWCASE PREVIEW
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                  Exploring WEB DEVELOPER School Portals
                </h3>
              </div>

              {/* 4-Tab Page Switcher Preview */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {(['home', 'about', 'gallery', 'contact'] as PageId[]).map((page) => {
                  const isActive = activeTourPage === page;
                  const labels: Record<PageId, string> = {
                    home: 'Home Page',
                    about: 'About Page',
                    academics: 'Academics Page',
                    campus: 'Campus Page',
                    gallery: 'Gallery Page',
                    events: 'Events Page',
                    contact: 'Contact Page',
                    attendance: 'Attendance Portal'
                  };
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        setActiveTourPage(page);
                        if (onSelectPagePreview) onSelectPagePreview(page);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 shadow-lg shadow-amber-400/30 scale-105'
                          : 'bg-blue-900/80 text-blue-200 hover:text-white border border-blue-800'
                      }`}
                    >
                      {labels[page]}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Page Preview Card */}
              <div className="p-6 rounded-2xl bg-blue-900/90 border border-blue-800 shadow-2xl backdrop-blur-md">
                <AnimatePresence mode="wait">
                  {activeTourPage === 'home' && (
                    <motion.div
                      key="preview-home"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 uppercase">Home Page Preview</span>
                        <span className="text-xs text-blue-300">Admissions & Core Highlights</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Full-Featured Digital Campus Landing</h4>
                      <p className="text-sm text-blue-100">
                        Displays our mission, academic programs, student accolades, high-speed labs, and director's address.
                      </p>
                    </motion.div>
                  )}

                  {activeTourPage === 'about' && (
                    <motion.div
                      key="preview-about"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 uppercase">About Page Preview</span>
                        <span className="text-xs text-blue-300">History, Leadership & Pedagogy</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Who We Are & What We Stand For</h4>
                      <p className="text-sm text-blue-100">
                        Read our educational philosophy, meet the leadership faculty, and explore our milestones since 2018.
                      </p>
                    </motion.div>
                  )}

                  {activeTourPage === 'gallery' && (
                    <motion.div
                      key="preview-gallery"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 uppercase">Gallery Page Preview</span>
                        <span className="text-xs text-blue-300">Campus, Hackathons & Tech Labs</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Visual Tour of Campus & Coding Hubs</h4>
                      <p className="text-sm text-blue-100">
                        High-resolution photo galleries of dual-screen labs, student demo day, libraries, and athletic grounds.
                      </p>
                    </motion.div>
                  )}

                  {activeTourPage === 'contact' && (
                    <motion.div
                      key="preview-contact"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 uppercase">Contact Page Preview</span>
                        <span className="text-xs text-blue-300">Inquiry & Campus Tour Scheduling</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Connect with Admissions & Visit Us</h4>
                      <p className="text-sm text-blue-100">
                        Interactive inquiry form, live office phone numbers, campus address map, and appointment booking.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Timeline Bar: Royal Blue + Gold */}
      <div className="relative z-20 w-full px-6 py-4 bg-blue-950/90 border-t border-blue-900 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Progress track */}
          <div
            className="h-2.5 w-full bg-blue-900 rounded-full overflow-hidden cursor-pointer relative border border-blue-800"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              jumpToTime(Math.round(ratio * 17.0 * 10) / 10);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full transition-all duration-100 shadow-[0_0_10px_#fbbf24]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-blue-200 font-mono">
            <span>0:00 Start Logo (5s)</span>
            <span>0:05 “WEB DEVELOPER”</span>
            <span>0:08 Website Open</span>
            <span>0:12+ Pages Preview</span>
            <button
              onClick={onComplete}
              className="text-amber-300 hover:text-amber-200 font-bold"
            >
              Enter Site →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
