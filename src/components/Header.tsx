import React, { useState, useEffect } from 'react';
import { PageId, ContactInquiry } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Menu, X, Sparkles, PhoneCall, GraduationCap, Database, Lock, ShieldCheck } from 'lucide-react';
import { loadPersistentData } from '../utils/imageStorage';

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onPlayPromo?: () => void;
  onOpenApplyModal: () => void;
  onOpenDatabaseModal: () => void;
  onOpenAdminModal: () => void;
  onLockSite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenApplyModal,
  onOpenDatabaseModal,
  onOpenAdminModal,
  onLockSite,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);

  // Check unread/new inquiries for notification badge
  useEffect(() => {
    const checkInquiries = async () => {
      try {
        const list = (await loadPersistentData<ContactInquiry[]>('webdev_inquiries', [])) || [];
        const unread = list.filter((i) => !i.status || i.status === 'new').length;
        setNewInquiriesCount(unread);
      } catch {
        // ignore
      }
    };
    checkInquiries();

    const handleUpdate = () => checkInquiries();
    window.addEventListener('webdev:inquiry_updated', handleUpdate);
    return () => window.removeEventListener('webdev:inquiry_updated', handleUpdate);
  }, []);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'campus', label: 'Campus' },
    { id: 'classes', label: 'Online Classes' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 shadow-xs">
      {/* Top micro-bar */}
      <div className="bg-[#0B2347] text-white text-xs py-2 px-4 sm:px-6 hidden sm:flex justify-between items-center border-b border-blue-900/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Admissions Open 2026–2027
          </span>
          <span className="text-blue-400">•</span>
          <span className="text-blue-100 font-medium">Empowering Next-Generation Software Creators</span>
        </div>
        <div className="flex items-center gap-4 text-blue-100">
          <button
            id="top-admin-portal-btn"
            onClick={onOpenAdminModal}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-extrabold transition-colors cursor-pointer text-xs bg-blue-900/80 hover:bg-blue-800 px-2.5 py-1 rounded-lg border border-amber-400/50"
            title="Open Admin Dashboard (Visitor History & Contact Messages)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Portal</span>
            {newInquiriesCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                {newInquiriesCount}
              </span>
            )}
          </button>
          <span className="text-blue-700">|</span>
          <button
            id="top-database-sync-btn"
            onClick={onOpenDatabaseModal}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold transition-colors cursor-pointer text-xs"
            title="Database & Image Backup for Vercel"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Database & Vercel Sync</span>
          </button>
          {onLockSite && (
            <>
              <span className="text-blue-700">|</span>
              <button
                id="top-lock-site-btn"
                onClick={onLockSite}
                className="flex items-center gap-1.5 text-blue-200 hover:text-amber-300 font-bold transition-colors cursor-pointer text-xs"
                title="Lock Website Access with Password"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Lock Website</span>
              </button>
            </>
          )}
          <span className="text-blue-700">|</span>
          <a href="tel:03019249721" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-medium">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            03019249721
          </a>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            id="header-brand"
            onClick={() => handleNavClick('home')}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <SchoolLogo size="md" />
          </div>

          {/* Desktop Navigation matching image */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-sm font-bold transition-all relative py-1.5 ${
                    isActive
                      ? 'text-[#0B2347] font-extrabold'
                      : 'text-slate-600 hover:text-[#0B2347]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0B2347] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions on Desktop: Admin, Database Manager & Apply Now */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              id="header-admin-btn"
              onClick={onOpenAdminModal}
              className="relative px-3.5 py-2 text-xs font-black text-white bg-[#0B2347] hover:bg-[#123363] border-2 border-amber-400 rounded-xl shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Admin Control Panel (Visitor Browsing History & Contact Messages)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
              {newInquiriesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs animate-pulse">
                  {newInquiriesCount}
                </span>
              )}
            </button>

            <button
              id="header-database-btn"
              onClick={onOpenDatabaseModal}
              className="px-3.5 py-2 text-xs font-bold text-[#0B2347] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Manage database, export backup for Vercel, and restore images"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Database / Backup</span>
            </button>

            <button
              id="header-apply-btn"
              onClick={onOpenApplyModal}
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#0B2347] hover:bg-[#123363] rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Apply Now
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-blue-950 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-blue-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 gap-1 pb-3 border-b border-blue-100">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-base text-left ${
                    isActive ? 'bg-blue-800 text-white' : 'text-blue-950 hover:bg-blue-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-xs bg-amber-400 text-blue-950 font-bold px-2 py-0.5 rounded">Active</span>}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              id="mobile-admin-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminModal();
              }}
              className="w-full flex items-center justify-between py-3 px-4 rounded-xl border-2 border-amber-400 text-white font-black text-sm bg-slate-950 shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Dashboard (Tracking & Messages)</span>
              </div>
              {newInquiriesCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                  {newInquiriesCount} New
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDatabaseModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-amber-400 text-blue-950 font-bold text-sm bg-amber-50 shadow-xs cursor-pointer"
            >
              <Database className="w-4 h-4 text-amber-600" />
              <span>Database & Image Backup (Vercel)</span>
            </button>

            {onLockSite && (
              <button
                id="mobile-lock-site-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLockSite();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Lock Website Access</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApplyModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 font-black text-sm shadow-md"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Apply for Admissions</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
