import React from 'react';
import { PageId } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Mail, Phone, MapPin, Play, Heart, ArrowUp, ShieldCheck, Database, Lock } from 'lucide-react';
import { SCHOOL_FULL_TITLE, SCHOOL_MOTTO } from '../data/schoolData';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onPlayPromo?: () => void;
  onOpenApplyModal: () => void;
  onOpenDatabaseModal?: () => void;
  onOpenAdminModal?: () => void;
  onLockSite?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenApplyModal,
  onOpenDatabaseModal,
  onOpenAdminModal,
  onLockSite,
}) => {
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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

  return (
    <footer className="bg-blue-950 text-blue-100 border-t border-blue-900">
      {/* Top Banner: Royal Blue + Gold */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-blue-900/80">
        <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 border-2 border-amber-400/30 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-950/60">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Admissions Open 2026–2027
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Ready to code your future with us?
            </h3>
            <p className="text-blue-200 text-sm sm:text-base mt-2 max-w-xl">
              Schedule a campus tour or apply online to reserve your seat in the incoming web engineering cohort.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenApplyModal}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-400/30 hover:scale-[1.02] border border-amber-300"
            >
              Apply Online Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Col 1: School Identity */}
        <div className="lg:col-span-2 space-y-4">
          <SchoolLogo size="lg" variant="dark" />
          <p className="text-blue-200 text-sm leading-relaxed max-w-md mt-4">
            {SCHOOL_FULL_TITLE} is a premier accredited STEM academy dedicated to educating tomorrow's software engineers, creative developers, and tech entrepreneurs.
          </p>
          <p className="text-xs text-amber-300 font-bold font-mono">
            &ldquo;{SCHOOL_MOTTO}&rdquo;
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-blue-200">
            <span className="px-2.5 py-1 bg-blue-900/70 border border-amber-400/30 text-amber-300 font-semibold rounded-md">STEM Certified</span>
            <span className="px-2.5 py-1 bg-blue-900/70 border border-amber-400/30 text-amber-300 font-semibold rounded-md">WASC Accredited</span>
            <span className="px-2.5 py-1 bg-blue-900/70 border border-blue-800 rounded-md">Est. 2018</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 text-amber-400">
            Explore Pages
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-amber-300 transition-colors text-blue-200"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('about')}
                className="hover:text-amber-300 transition-colors text-blue-200"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('admissions')}
                className="hover:text-amber-300 transition-colors text-blue-200 flex items-center gap-1.5"
              >
                <span>Admissions Form</span>
                <span className="text-[10px] bg-amber-400 text-blue-950 font-black px-1.5 py-0.2 rounded">2026</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('campus')}
                className="hover:text-amber-300 transition-colors text-blue-200"
              >
                Campus
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('classes')}
                className="hover:text-amber-300 transition-colors text-blue-200 flex items-center gap-1.5"
              >
                <span>Online Classes</span>
                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded">Live</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('gallery')}
                className="hover:text-amber-300 transition-colors text-blue-200"
              >
                Gallery
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('attendance')}
                className="hover:text-amber-300 transition-colors text-blue-200 flex items-center gap-1.5"
              >
                <span>Attendance Portal</span>
                <span className="text-[10px] bg-amber-400 text-blue-950 font-bold px-1.5 py-0.2 rounded">Protected</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-amber-300 transition-colors text-blue-200"
              >
                Contact Us
              </button>
            </li>
            {onOpenAdminModal && (
              <li>
                <button
                  id="footer-admin-portal-btn"
                  onClick={onOpenAdminModal}
                  className="hover:text-amber-300 transition-colors text-amber-400 font-extrabold flex items-center gap-1.5 cursor-pointer pt-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control Portal</span>
                </button>
              </li>
            )}
            {onOpenDatabaseModal && (
              <li>
                <button
                  onClick={onOpenDatabaseModal}
                  className="hover:text-amber-300 transition-colors text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer pt-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Database / Backup</span>
                </button>
              </li>
            )}
            {onLockSite && (
              <li>
                <button
                  onClick={onLockSite}
                  className="hover:text-amber-300 transition-colors text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer pt-1"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock Website</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Col 3: Academic Programs */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 text-amber-400">
            Specializations
          </h4>
          <ul className="space-y-2.5 text-sm text-blue-200">
            <li>Junior Web Foundations</li>
            <li>Full-Stack Web Architecture</li>
            <li>UI/UX & Creative Computing</li>
            <li>AI-Driven Web Systems</li>
            <li>DevSecOps & Cloud Clusters</li>
            <li>Hackathon Honor Guild</li>
          </ul>
        </div>

        {/* Col 4: Contact Information */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 text-amber-400">
            Campus Desk
          </h4>
          <div className="space-y-3 text-sm text-blue-200">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>404 Silicon Boulevard, Tech District, CA 94016</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>03019249721</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>fahadiqbal9542@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-blue-950/95 border-t border-blue-900 py-6 text-xs text-blue-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WEB DEVELOPER School. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Crafted for education with <Heart className="w-3 h-3 text-amber-400 fill-amber-400 inline" /> and modern web tech.
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/80 hover:bg-amber-400 hover:text-blue-950 text-amber-300 font-bold text-xs transition-all border border-amber-400/30 cursor-pointer shadow-sm"
              title="Back to top (اوپر جائیں)"
            >
              <span>Top (اوپر جائیں)</span>
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
