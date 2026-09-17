import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Eye,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Compass,
  FileText,
  GraduationCap,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Database,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VisitorSession, ContactInquiry, AdmissionApplication } from '../types';
import {
  getAllVisitorSessions,
  clearAllVisitorSessions
} from '../utils/visitorTracker';
import { loadPersistentData, savePersistentData } from '../utils/imageStorage';
import { syncSectionToSupabase } from '../utils/supabase';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDatabaseModal?: () => void;
  onLockSite?: () => void;
}

type AdminTab = 'visitors' | 'inquiries' | 'admissions' | 'settings';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onOpenDatabaseModal,
  onLockSite
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('visitors');
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter state
  const [visitorSearch, setVisitorSearch] = useState('');
  const [selectedPageFilter, setSelectedPageFilter] = useState('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'contacted'>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Notification / Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load all tracking and inquiry data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [sessions, inqs, adms] = await Promise.all([
        getAllVisitorSessions(),
        loadPersistentData<ContactInquiry[]>('webdev_inquiries', []),
        loadPersistentData<AdmissionApplication[]>('webdev_admissions', [])
      ]);
      setVisitorSessions(sessions || []);
      setInquiries(inqs || []);
      setAdmissions(adms || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  // Real-time listener for updates
  useEffect(() => {
    const handleVisitorUpdate = () => {
      getAllVisitorSessions().then((res) => setVisitorSessions(res || []));
    };
    const handleInquiryUpdate = () => {
      loadPersistentData<ContactInquiry[]>('webdev_inquiries', []).then((res) => setInquiries(res || []));
    };

    window.addEventListener('webdev:visitor_updated', handleVisitorUpdate);
    window.addEventListener('webdev:inquiry_updated', handleInquiryUpdate);

    return () => {
      window.removeEventListener('webdev:visitor_updated', handleVisitorUpdate);
      window.removeEventListener('webdev:inquiry_updated', handleInquiryUpdate);
    };
  }, []);

  if (!isOpen) return null;

  // Toggle Inquiry Status
  const handleToggleInquiryStatus = async (inquiryId: string) => {
    const updated = inquiries.map((item) => {
      if (item.id === inquiryId) {
        const nextStatus = item.status === 'contacted' ? 'new' : 'contacted';
        return { ...item, status: nextStatus as 'new' | 'contacted' };
      }
      return item;
    });
    setInquiries(updated);
    await savePersistentData('webdev_inquiries', updated);
    syncSectionToSupabase('inquiries', updated).catch(() => {});
    showToast('Inquiry status updated successfully.');
  };

  // Delete an inquiry
  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!window.confirm('Are you sure you want to remove this inquiry?')) return;
    const updated = inquiries.filter((item) => item.id !== inquiryId);
    setInquiries(updated);
    await savePersistentData('webdev_inquiries', updated);
    syncSectionToSupabase('inquiries', updated).catch(() => {});
    showToast('Inquiry deleted.');
  };

  // Delete an admission application
  const handleDeleteAdmission = async (admId: string) => {
    if (!window.confirm('Are you sure you want to delete this admission record?')) return;
    const updated = admissions.filter((item) => item.id !== admId);
    setAdmissions(updated);
    await savePersistentData('webdev_admissions', updated);
    syncSectionToSupabase('admissions', updated).catch(() => {});
    showToast('Admission application deleted.');
  };

  // Clear visitor history
  const handleClearVisitors = async () => {
    if (!window.confirm('Are you sure you want to clear all visitor history logs?')) return;
    await clearAllVisitorSessions();
    setVisitorSessions([]);
    showToast('Visitor history logs cleared.');
  };

  // Export Visitors to CSV
  const handleExportVisitorsCSV = () => {
    if (visitorSessions.length === 0) {
      alert('No visitor records to export.');
      return;
    }
    const headers = ['Session ID', 'Visitor ID', 'Device', 'Browser', 'OS', 'First Seen', 'Last Active', 'Total Page Views', 'Pages Trail', 'Contact Form Filled'];
    const rows = visitorSessions.map((s) => [
      `"${s.sessionId}"`,
      `"${s.visitorId}"`,
      `"${s.deviceType}"`,
      `"${s.browser}"`,
      `"${s.os}"`,
      `"${new Date(s.firstVisitedAt).toLocaleString()}"`,
      `"${new Date(s.lastActiveAt).toLocaleString()}"`,
      s.pageViewsCount || s.history.length,
      `"${s.history.map((h) => `${h.pageName} (${h.formattedTime})`).join(' -> ')}"`,
      s.contactSubmitted ? 'YES' : 'NO'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visitor_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Visitor history exported to CSV.');
  };

  // Export Inquiries to CSV
  const handleExportInquiriesCSV = () => {
    if (inquiries.length === 0) {
      alert('No contact inquiries to export.');
      return;
    }
    const headers = ['Inquiry ID', 'Date', 'Full Name', 'Email', 'Phone', 'Grade', 'Track', 'Message', 'Status'];
    const rows = inquiries.map((i) => [
      `"${i.id}"`,
      `"${new Date(i.createdAt).toLocaleString()}"`,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.email}"`,
      `"${i.phone || ''}"`,
      `"${i.studentGrade || ''}"`,
      `"${i.interestTrack || ''}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`,
      `"${i.status || 'new'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contact_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inquiries exported to CSV.');
  };

  // Calculated Stats
  const totalPageViews = visitorSessions.reduce((acc, s) => acc + (s.pageViewsCount || s.history.length), 0);
  const newInquiriesCount = inquiries.filter((i) => !i.status || i.status === 'new').length;

  // Filtered Visitors
  const filteredVisitors = visitorSessions.filter((session) => {
    const matchesSearch =
      visitorSearch === '' ||
      session.sessionId.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      session.browser.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      session.os.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      session.deviceType.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      session.history.some((h) => h.pageName.toLowerCase().includes(visitorSearch.toLowerCase()));

    const matchesPage =
      selectedPageFilter === 'all' ||
      session.history.some((h) => h.pageId === selectedPageFilter);

    return matchesSearch && matchesPage;
  });

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inquirySearch === '' ||
      inq.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.email.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (inq.phone && inq.phone.includes(inquirySearch)) ||
      (inq.message && inq.message.toLowerCase().includes(inquirySearch.toLowerCase()));

    const matchesStatus =
      inquiryStatusFilter === 'all' ||
      (inquiryStatusFilter === 'new' && (!inq.status || inq.status === 'new')) ||
      (inquiryStatusFilter === 'contacted' && inq.status === 'contacted');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative max-w-6xl w-full h-[94vh] sm:h-[90vh] bg-slate-900 text-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-2xl animate-in slide-in-from-top duration-150 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 1. TOP HEADER */}
        <header className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-display">
                  Admin Control & Tracking Portal
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide">
                  Live Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time visitor page history tracking & contact inquiry records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAllData}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Refresh all data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. STATS OVERVIEW RIBBON */}
        <div className="bg-[#0c1322] border-b border-slate-800 px-4 sm:px-6 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <Users className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Visitors</div>
              <div className="text-sm font-black text-white">{visitorSessions.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <Eye className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Page Views</div>
              <div className="text-sm font-black text-white">{totalPageViews}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <Mail className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Contact Inquiries</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1">
                <span>{inquiries.length}</span>
                {newInquiriesCount > 0 && (
                  <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full">
                    {newInquiriesCount} new
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Admissions Form</div>
              <div className="text-sm font-black text-white">{admissions.length}</div>
            </div>
          </div>
        </div>

        {/* 3. NAVIGATION TABS */}
        <div className="px-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('visitors')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'visitors'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Visitor Page History ({visitorSessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Us Messages ({inquiries.length})</span>
            {newInquiriesCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {newInquiriesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admissions')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'admissions'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Admissions Applications ({admissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & Cloud Sync</span>
          </button>
        </div>

        {/* 4. TAB PANELS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 min-h-0">
          {/* =========================================================================
              TAB 1: VISITOR BROWSING HISTORY
              ========================================================================= */}
          {activeTab === 'visitors' && (
            <div className="space-y-4">
              {/* Controls & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search visitor ID, device, browser, or page..."
                      value={visitorSearch}
                      onChange={(e) => setVisitorSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  {/* Page Filter */}
                  <select
                    value={selectedPageFilter}
                    onChange={(e) => setSelectedPageFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="all">All Pages Visited</option>
                    <option value="home">Home Page</option>
                    <option value="classes">Online Classes</option>
                    <option value="campus">Campus Facilities</option>
                    <option value="contact">Contact Us</option>
                    <option value="attendance">Attendance Register</option>
                    <option value="gallery">Campus Gallery</option>
                    <option value="about">About School</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportVisitorsCSV}
                    className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearVisitors}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                </div>
              </div>

              {/* Visitors Chronological Cards */}
              {filteredVisitors.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-slate-800/80 space-y-3">
                  <Compass className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No visitor sessions recorded yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When someone opens your website, their device information and every page they open will automatically appear right here in real time!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVisitors.map((session, idx) => {
                    const isExpanded = expandedSessionId === session.sessionId;
                    const DeviceIcon =
                      session.deviceType === 'Mobile'
                        ? Smartphone
                        : session.deviceType === 'Tablet'
                        ? Tablet
                        : Monitor;

                    return (
                      <div
                        key={session.sessionId}
                        className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-slate-700"
                      >
                        {/* Session Summary Header */}
                        <div
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.sessionId)}
                          className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-bold shrink-0">
                              <DeviceIcon className="w-4 h-4" />
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-white">
                                  Visitor #{filteredVisitors.length - idx}
                                </span>
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                                  {session.browser} • {session.os}
                                </span>
                                <span className="text-[10px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-md">
                                  {session.deviceType}
                                </span>
                                {session.contactSubmitted && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-400" />
                                    Filled Contact Form!
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>First seen: {new Date(session.firstVisitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span>Active: {new Date(session.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-500">ID: {session.sessionId.slice(0, 14)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-xs font-black text-amber-400">
                                {session.pageViewsCount || session.history.length} Pages Visited
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {session.history[session.history.length - 1]?.pageName || 'Home'}
                              </div>
                            </div>

                            <button
                              type="button"
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Step-by-Step Page Trail */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-[#080d18] border-t border-slate-800/80 space-y-3 text-xs animate-in fade-in">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                              <span>Full Page Browsing Trail (Chronological Order):</span>
                              <span>Resolution: {session.screenResolution} • Language: {session.language}</span>
                            </div>

                            {/* Step Sequence Breadcrumbs */}
                            <div className="space-y-2">
                              {session.history.map((step, stepIdx) => (
                                <div
                                  key={stepIdx}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                                      {stepIdx + 1}
                                    </div>
                                    <span className="font-bold text-white">{step.pageName}</span>
                                    <span className="text-[10px] font-mono text-slate-500">
                                      (/#{step.pageId})
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>{step.formattedTime}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: CONTACT US INQUIRIES & MESSAGES
              ========================================================================= */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {/* Filter and Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search applicant name, email, phone, message..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <select
                    value={inquiryStatusFilter}
                    onChange={(e) => setInquiryStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="all">All Messages ({inquiries.length})</option>
                    <option value="new">New Only ({newInquiriesCount})</option>
                    <option value="contacted">Contacted / Handled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportInquiriesCSV}
                    className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Inquiry List */}
              {filteredInquiries.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-slate-800/80 space-y-3">
                  <Mail className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No contact inquiries found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When parents or students submit the Contact Us form, their full details, phone, and message appear here instantly!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInquiries.map((inq) => {
                    const isNew = !inq.status || inq.status === 'new';

                    return (
                      <div
                        key={inq.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isNew
                            ? 'bg-slate-950/90 border-amber-500/40 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 opacity-90'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          {/* Sender Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>{inq.name}</span>
                              </h4>
                              {isNew ? (
                                <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full uppercase">
                                  NEW INQUIRY
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                                  CONTACTED
                                </span>
                              )}
                              {inq.studentGrade && (
                                <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md font-semibold">
                                  {inq.studentGrade}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <a
                                href={`mailto:${inq.email}`}
                                className="hover:text-amber-400 flex items-center gap-1 transition-colors text-blue-300"
                              >
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{inq.email}</span>
                              </a>
                              {inq.phone && (
                                <a
                                  href={`tel:${inq.phone}`}
                                  className="hover:text-amber-400 flex items-center gap-1 transition-colors text-amber-300 font-semibold"
                                >
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <span>{inq.phone}</span>
                                </a>
                              )}
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(inq.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {inq.interestTrack && (
                              <div className="text-[11px] text-slate-400">
                                Interested Track:{' '}
                                <strong className="text-slate-200">{inq.interestTrack}</strong>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Email Reply */}
                            <a
                              href={`mailto:${inq.email}?subject=Re: Admissions Inquiry at WEB DEVELOPER School&body=Dear ${encodeURIComponent(
                                inq.name
                              )},\n\nThank you for contacting WEB DEVELOPER School regarding our engineering tracks.`}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Reply via Email"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="hidden sm:inline">Reply Email</span>
                            </a>

                            {/* Phone Call */}
                            {inq.phone && (
                              <a
                                href={`tel:${inq.phone}`}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Call phone"
                              >
                                <Phone className="w-3 h-3" />
                                <span className="hidden sm:inline">Call</span>
                              </a>
                            )}

                            {/* WhatsApp */}
                            {inq.phone && (
                              <a
                                href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            )}

                            {/* Toggle Handled status */}
                            <button
                              type="button"
                              onClick={() => handleToggleInquiryStatus(inq.id)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                              title={isNew ? 'Mark as Contacted' : 'Mark as New'}
                            >
                              <CheckCircle2 className={`w-4 h-4 ${!isNew ? 'text-emerald-400' : ''}`} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/80 rounded-xl cursor-pointer transition-colors"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inquiry Message Text */}
                        {inq.message && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              Message Content:
                            </span>
                            {inq.message}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: ADMISSIONS APPLICATIONS
              ========================================================================= */}
          {activeTab === 'admissions' && (
            <div className="space-y-4">
              {admissions.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-slate-800/80 space-y-3">
                  <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-300">No admission applications submitted yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When students apply via the 'Apply Now' button, their full academic profile and parent contact info will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {admissions.map((adm) => (
                    <div
                      key={adm.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{adm.studentName}</h4>
                            <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md">
                              Applying for {adm.gradeApplying}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Parent/Guardian: <strong className="text-slate-300">{adm.parentName}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${adm.email}`}
                            className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg font-bold transition-colors"
                          >
                            Email
                          </a>
                          <a
                            href={`tel:${adm.phone}`}
                            className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg font-bold transition-colors"
                          >
                            Call
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmission(adm.id)}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/80 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                        <div>
                          Email: <span className="text-slate-200">{adm.email}</span>
                        </div>
                        <div>
                          Phone: <span className="text-slate-200 font-semibold">{adm.phone}</span>
                        </div>
                        <div>
                          Prior Experience:{' '}
                          <span className="text-slate-200">{adm.priorExperience}</span>
                        </div>
                        <div>
                          Submitted:{' '}
                          <span className="text-slate-200">{new Date(adm.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {adm.notes && (
                        <div className="p-2 rounded-lg bg-slate-900 text-slate-300 text-[11px]">
                          <strong>Notes:</strong> {adm.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 4: SETTINGS & DATABASE SYNC
              ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Central Database & Image Backup</h4>
                    <p className="text-xs text-slate-400">
                      Manage full website data JSON exports, restore pictures, and configure Supabase.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {onOpenDatabaseModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDatabaseModal();
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer transition-all shadow-md"
                    >
                      Open Database & Vercel Sync Manager
                    </button>
                  )}
                  {onLockSite && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLockSite();
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lock Website with Password</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>How Real-Time Tracking Works</span>
                </div>
                <p className="leading-relaxed">
                  Every time any user opens your website on a computer or mobile phone, a new session is started.
                  As they browse from Home to Online Classes, Campus, Attendance, or Contact Us, every single page
                  click is logged with exact timestamps, device type, and browser details.
                </p>
                <p className="leading-relaxed">
                  When a parent or student submits the Contact Us form, their inquiry is immediately saved,
                  linked to their session, and shown at the top of the 'Contact Us Messages' tab with direct
                  one-click Email, Call, and WhatsApp reply buttons.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
