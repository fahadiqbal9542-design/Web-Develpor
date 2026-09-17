import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MapPin, ExternalLink, Check, Copy, X, Database, Lock, ShieldCheck } from 'lucide-react';
import { PageId, ContactInquiry } from '../types';
import { loadPersistentData } from '../utils/imageStorage';

interface FloatingSideContactProps {
  onNavigate: (page: PageId) => void;
  onOpenDatabaseModal?: () => void;
  onOpenAdminModal?: () => void;
  onLockSite?: () => void;
}

type ActiveFlyout = 'phone' | 'mail' | 'location' | null;

export const FloatingSideContact: React.FC<FloatingSideContactProps> = ({
  onNavigate,
  onOpenDatabaseModal,
  onOpenAdminModal,
  onLockSite,
}) => {
  const [activeFlyout, setActiveFlyout] = useState<ActiveFlyout>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        const inqs = (await loadPersistentData<ContactInquiry[]>('webdev_inquiries', [])) || [];
        setUnreadCount(inqs.filter((i) => !i.status || i.status === 'new').length);
      } catch {
        // ignore
      }
    };
    check();
    const handleUpdate = () => check();
    window.addEventListener('webdev:inquiry_updated', handleUpdate);
    return () => window.removeEventListener('webdev:inquiry_updated', handleUpdate);
  }, []);

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const toggleFlyout = (type: ActiveFlyout) => {
    setActiveFlyout((prev) => (prev === type ? null : type));
  };

  return (
    <>
      {/* Floating Side Docked Container */}
      <aside
        id="side-contact-dock"
        aria-label="Quick contact side widget"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center"
      >
        {/* Flyout Card (appears on the left side of the bar) */}
        <AnimatePresence>
          {activeFlyout && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mr-3 bg-white text-blue-950 rounded-2xl shadow-2xl border-2 border-blue-100 p-4 w-72 backdrop-blur-md relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveFlyout(null)}
                className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {activeFlyout === 'phone' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Admissions Phone
                      </h4>
                      <p className="text-sm font-black text-blue-950">
                        03019249721
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Available Mon–Fri from 8:00 AM – 5:30 PM for admissions & campus tour inquiries.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="tel:03019249721"
                      className="flex-1 py-2 px-3 bg-[#0B2347] hover:bg-[#133568] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-300" />
                      <span>Call Now</span>
                    </a>
                    <button
                      onClick={(e) => handleCopy('03019249721', 'phone', e)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-blue-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                      title="Copy phone number"
                    >
                      {copiedText === 'phone' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>{copiedText === 'phone' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeFlyout === 'mail' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Official Email
                      </h4>
                      <p className="text-xs font-black text-blue-950 truncate max-w-[180px]">
                        fahadiqbal9542@gmail.com
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Inquire about syllabi, scholarships, enrollment, and coding tracks.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="mailto:fahadiqbal9542@gmail.com?subject=School%20Admissions%20Inquiry"
                      className="flex-1 py-2 px-3 bg-[#0B2347] hover:bg-[#133568] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-300" />
                      <span>Send Email</span>
                    </a>
                    <button
                      onClick={() => {
                        setActiveFlyout(null);
                        onNavigate('contact');
                      }}
                      className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-blue-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors border border-amber-300"
                    >
                      <span>Form</span>
                    </button>
                  </div>
                </div>
              )}

              {activeFlyout === 'location' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Campus Location
                      </h4>
                      <p className="text-xs font-black text-blue-950">
                        404 Silicon Boulevard
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tech District, San Francisco Bay Area, CA 94016 • High-Tech 10Gbps Coding Campus.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveFlyout(null);
                        onNavigate('contact');
                      }}
                      className="flex-1 py-2 px-3 bg-[#0B2347] hover:bg-[#133568] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      <span>View Map</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveFlyout(null);
                        onNavigate('campus');
                      }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-blue-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Tour</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Exact Vertical Side Bar Dock matching User Image */}
        <div
          className="bg-[#0B2347] hover:bg-[#081b37] border-l-2 border-y-2 border-r-0 border-blue-700/50 rounded-l-2xl shadow-2xl py-3 px-2 sm:px-2.5 flex flex-col items-center gap-3.5 transition-all duration-300"
          style={{ boxShadow: '-4px 4px 18px rgba(11, 35, 71, 0.35)' }}
        >
          {/* Phone Icon Button */}
          <button
            id="side-contact-phone-btn"
            onClick={() => toggleFlyout('phone')}
            aria-label="Contact Phone"
            title="Call Us: 03019249721"
            className={`p-2 rounded-xl transition-all duration-200 group relative flex items-center justify-center ${
              activeFlyout === 'phone'
                ? 'bg-blue-800 text-amber-300 scale-110'
                : 'text-white hover:text-amber-300 hover:bg-blue-900/60 hover:scale-110'
            }`}
          >
            <Phone className="w-5 h-5 transition-transform duration-200 group-hover:-rotate-12" />
            {/* Tooltip on hover if flyout not active */}
            {!activeFlyout && (
              <span className="pointer-events-none absolute right-12 px-2 py-1 rounded-md bg-[#0B2347] text-white text-[11px] font-bold shadow-lg border border-blue-700/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Call: 03019249721
              </span>
            )}
          </button>

          {/* Mail Icon Button */}
          <button
            id="side-contact-mail-btn"
            onClick={() => toggleFlyout('mail')}
            aria-label="Contact Email"
            title="Email: fahadiqbal9542@gmail.com"
            className={`p-2 rounded-xl transition-all duration-200 group relative flex items-center justify-center ${
              activeFlyout === 'mail'
                ? 'bg-blue-800 text-amber-300 scale-110'
                : 'text-white hover:text-amber-300 hover:bg-blue-900/60 hover:scale-110'
            }`}
          >
            <Mail className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            {/* Tooltip on hover if flyout not active */}
            {!activeFlyout && (
              <span className="pointer-events-none absolute right-12 px-2 py-1 rounded-md bg-[#0B2347] text-white text-[11px] font-bold shadow-lg border border-blue-700/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                fahadiqbal9542@gmail.com
              </span>
            )}
          </button>

          {/* Location Pin Icon Button */}
          <button
            id="side-contact-location-btn"
            onClick={() => toggleFlyout('location')}
            aria-label="Campus Location"
            title="Location: 404 Silicon Boulevard"
            className={`p-2 rounded-xl transition-all duration-200 group relative flex items-center justify-center ${
              activeFlyout === 'location'
                ? 'bg-blue-800 text-amber-300 scale-110'
                : 'text-white hover:text-amber-300 hover:bg-blue-900/60 hover:scale-110'
            }`}
          >
            <MapPin className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            {/* Tooltip on hover if flyout not active */}
            {!activeFlyout && (
              <span className="pointer-events-none absolute right-12 px-2 py-1 rounded-md bg-[#0B2347] text-white text-[11px] font-bold shadow-lg border border-blue-700/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Campus Location
              </span>
            )}
          </button>

          {/* Admin Control Portal Button */}
          {onOpenAdminModal && (
            <button
              id="side-contact-admin-btn"
              onClick={onOpenAdminModal}
              aria-label="Admin Control Portal"
              title="Admin Portal (Visitor History & Messages)"
              className="p-2 rounded-xl text-amber-400 hover:text-white hover:bg-slate-900 hover:scale-110 transition-all duration-200 group relative flex items-center justify-center cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
              <span className="pointer-events-none absolute right-12 px-2.5 py-1 rounded-md bg-slate-950 text-amber-300 text-[11px] font-black shadow-lg border border-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                🛡️ Admin Portal ({unreadCount > 0 ? `${unreadCount} New` : 'Live'})
              </span>
            </button>
          )}

          {/* Database & Vercel Image Storage Icon Button */}
          {onOpenDatabaseModal && (
            <button
              id="side-contact-db-btn"
              onClick={onOpenDatabaseModal}
              aria-label="Database & Vercel Backup"
              title="Database & Image Backup (Vercel)"
              className="p-2 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-blue-900/80 hover:scale-110 transition-all duration-200 group relative flex items-center justify-center cursor-pointer"
            >
              <Database className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" />
              <span className="pointer-events-none absolute right-12 px-2.5 py-1 rounded-md bg-[#0B2347] text-amber-300 text-[11px] font-bold shadow-lg border border-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                💾 Database & Images Backup
              </span>
            </button>
          )}

          {/* Lock Website Button */}
          {onLockSite && (
            <button
              id="side-contact-lock-btn"
              onClick={onLockSite}
              aria-label="Lock Website with Password"
              title="Lock Website Access"
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-blue-900/80 hover:scale-110 transition-all duration-200 group relative flex items-center justify-center cursor-pointer"
            >
              <Lock className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="pointer-events-none absolute right-12 px-2.5 py-1 rounded-md bg-[#0B2347] text-amber-300 text-[11px] font-bold shadow-lg border border-amber-400/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                🔒 Lock Website
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
