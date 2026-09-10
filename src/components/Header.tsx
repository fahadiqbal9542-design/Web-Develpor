import React, { useState } from 'react';
import { PageId } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { Menu, X, Sparkles, PhoneCall, GraduationCap } from 'lucide-react';

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onPlayPromo?: () => void;
  onOpenApplyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenApplyModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'campus', label: 'Campus' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'events', label: 'Events' },
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
          <a href="tel:+1800555932" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-medium">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            +1 (800) 555-DEV-EDU
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

          {/* Actions on Desktop: Apply Now in Dark Navy matching screenshot */}
          <div className="hidden sm:flex items-center gap-3">
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
