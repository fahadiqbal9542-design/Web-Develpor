import React, { useState, useEffect, useRef } from 'react';
import { PageId, OnlineClass } from '../../types';
import {
  Video,
  Play,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  Camera,
  Upload,
  X,
  Check,
  CheckCircle2,
  MessageSquare,
  Send,
  Mic,
  MicOff,
  VideoOff,
  Radio,
  Tv,
  HelpCircle,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { compressImage, savePersistentData, loadPersistentData } from '../../utils/imageStorage';
import { syncSectionToSupabase } from '../../utils/supabase';
import { VirtualClassroomModal } from '../VirtualClassroomModal';

interface OnlineClassesPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApplyModal?: () => void;
}

export const DEFAULT_ONLINE_CLASSES: OnlineClass[] = [
  {
    id: 'class-1',
    title: 'Full-Stack Modern Web Development Masterclass',
    instructor: 'Abdullah Web Developer',
    instructorRole: 'Lead Cloud & Full-Stack Architect',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    subject: 'Web Development',
    schedule: 'Mon, Wed & Fri • 6:00 PM - 7:30 PM (PKT)',
    duration: '90 mins',
    status: 'live',
    level: 'All Cohorts',
    meetingUrl: 'https://meet.google.com/live-webdev-abdullah',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    description: 'Live interactive coding workshop: building high-performance web applications with React 19, TypeScript, Tailwind CSS, and cloud deployment.',
    enrolledStudentsCount: 48,
    topics: ['React 19', 'Next.js', 'Tailwind CSS', 'Cloud Functions', 'State Management']
  },
  {
    id: 'class-2',
    title: 'Frontend Architecture & Modern JavaScript Mastery',
    instructor: 'Mushahid Web Developer',
    instructorRole: 'Senior Frontend Engineer & Mentor',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    subject: 'Frontend Engineering',
    schedule: 'Tue & Thu • 4:00 PM - 5:30 PM (PKT)',
    duration: '75 mins',
    status: 'upcoming',
    level: 'Intermediate',
    meetingUrl: 'https://meet.google.com/live-mushahid-frontend',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    description: 'Deep dive into asynchronous JavaScript, modular architectures, accessible UI systems, and browser rendering engines.',
    enrolledStudentsCount: 36,
    topics: ['ESNext', 'Clean Architecture', 'Web Vitals', 'DOM Optimization']
  },
  {
    id: 'class-3',
    title: 'Backend Scalability, REST APIs & Databases',
    instructor: 'Bilal Web Developer',
    instructorRole: 'Database & Systems Specialist',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    subject: 'Backend & Cloud',
    schedule: 'Saturdays • 11:00 AM - 1:00 PM (PKT)',
    duration: '120 mins',
    status: 'upcoming',
    level: 'Grade 10-A',
    meetingUrl: 'https://meet.google.com/live-bilal-backend',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    description: 'Learn how to architect resilient backend services with Node.js, Express, PostgreSQL, Redis caching, and JSON Web Tokens.',
    enrolledStudentsCount: 29,
    topics: ['Node.js', 'PostgreSQL', 'Redis Cache', 'REST APIs', 'JWT Security']
  },
  {
    id: 'class-4',
    title: 'IoT Telemetry Dashboards & Microcontroller Interfaces',
    instructor: 'Asad Web Developer',
    instructorRole: 'Embedded Systems & IoT Engineer',
    instructorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    subject: 'Hardware & IoT',
    schedule: 'Recorded Self-Paced • 8 Modules',
    duration: '6 hours',
    status: 'recorded',
    level: 'Advanced',
    meetingUrl: 'https://youtube.com/playlist?list=iot-hardware-stream',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    description: 'Connecting Arduino, ESP32 microcontrollers, and sensor arrays to responsive web sockets and live charts.',
    enrolledStudentsCount: 54,
    topics: ['WebSockets', 'ESP32', 'Sensor Telemetry', 'MQTT', 'Real-time UI']
  }
];

export const OnlineClassesPage: React.FC<OnlineClassesPageProps> = ({
  onNavigate,
  onOpenApplyModal
}) => {
  const [classes, setClasses] = useState<OnlineClass[]>(() => {
    try {
      const local = localStorage.getItem('webdev_online_classes');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ONLINE_CLASSES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'recorded'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<OnlineClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<OnlineClass | null>(null);
  const [activeVirtualRoomClass, setActiveVirtualRoomClass] = useState<OnlineClass | null>(null);
  const [dpClassTarget, setDpClassTarget] = useState<OnlineClass | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load async from IndexedDB on mount
  useEffect(() => {
    loadPersistentData<OnlineClass[]>('webdev_online_classes', DEFAULT_ONLINE_CLASSES).then((data) => {
      if (data && data.length > 0) {
        setClasses(data);
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Instructor DP change handler (updates this class and all classes by this instructor)
  const handleSaveInstructorDp = async (newAvatarUrl: string) => {
    if (!dpClassTarget) return;
    const instructorName = dpClassTarget.instructor;

    const updated = classes.map((c) => {
      if (
        c.id === dpClassTarget.id ||
        (c.instructor && c.instructor.trim().toLowerCase() === instructorName.trim().toLowerCase())
      ) {
        return { ...c, instructorAvatar: newAvatarUrl };
      }
      return c;
    });

    setClasses(updated);
    await savePersistentData('webdev_online_classes', updated);
    syncSectionToSupabase('onlineClasses', updated).catch(() => {});
    try {
      localStorage.setItem('webdev_online_classes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Synchronize with About Page faculty list if applicable
    try {
      const savedFaculty = localStorage.getItem('webdev_faculty_images');
      const facultyMap = savedFaculty ? JSON.parse(savedFaculty) : {};
      if (instructorName.toLowerCase().includes('abdullah')) {
        facultyMap['fac-2'] = newAvatarUrl;
      } else if (instructorName.toLowerCase().includes('mushahid')) {
        facultyMap['fac-1'] = newAvatarUrl;
      } else if (instructorName.toLowerCase().includes('bilal')) {
        facultyMap['fac-3'] = newAvatarUrl;
      } else if (instructorName.toLowerCase().includes('asad')) {
        facultyMap['fac-4'] = newAvatarUrl;
      }
      localStorage.setItem('webdev_faculty_images', JSON.stringify(facultyMap));
    } catch (e) {
      console.error(e);
    }

    showToast(`${instructorName} ki profile photo (DP) kamyabi se change ho gayi!`);
    setDpClassTarget(null);
  };

  // Filtered classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || cls.subject === subjectFilter;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Unique subjects for filter tabs
  const subjects = ['all', ...Array.from(new Set(classes.map((c) => c.subject)))];

  // Stats calculation
  const liveCount = classes.filter((c) => c.status === 'live').length;
  const upcomingCount = classes.filter((c) => c.status === 'upcoming').length;
  const totalStudents = classes.reduce((sum, c) => sum + (c.enrolledStudentsCount || 0), 0);

  // Delete handler
  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    const updated = classes.filter((c) => c.id !== classToDelete.id);
    setClasses(updated);
    await savePersistentData('webdev_online_classes', updated);
    syncSectionToSupabase('onlineClasses', updated).catch(() => {});
    showToast(`Class "${classToDelete.title}" removed.`);
    setClassToDelete(null);
  };

  return (
    <div className="space-y-12 pb-24">
      {/* 1. HERO HEADER */}
      <section className="pt-12 pb-14 bg-gradient-to-b from-blue-50/70 via-white to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-extrabold uppercase tracking-wider">Live Virtual Campus & Webinars</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B2347] tracking-tight font-display">
                Online Classes & Live Coding Sessions
              </h1>

              <p className="text-base text-slate-700 leading-relaxed">
                Join live remote coding workshops, interact directly with software engineering mentors, or add your own live sessions to the official school curriculum.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* PROMINENT KHUD CLASS ADD KARNE KA BUTTON */}
                <button
                  type="button"
                  id="add-new-class-hero-btn"
                  onClick={() => {
                    setEditingClass(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-6 py-3.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>+ Add New Online Class (Class Add Karein)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('campus')}
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 text-[#0B2347] font-bold text-sm rounded-2xl border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Physical Campus</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm max-w-lg w-full">
              <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 font-extrabold text-2xl font-display">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  <span>{liveCount}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  Live Now
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
                <div className="text-[#0B2347] font-extrabold text-2xl font-display">
                  {upcomingCount}
                </div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  Upcoming
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-center col-span-2 sm:col-span-1">
                <div className="text-amber-800 font-extrabold text-2xl font-display">
                  {totalStudents}+
                </div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                  Enrolled Students
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & CONTROLS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search class title, instructor (e.g. Abdullah, Mushahid), or topics..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/30 text-xs sm:text-sm font-medium bg-slate-50/50"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start md:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#0B2347] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({classes.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('live')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  statusFilter === 'live'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-red-700 hover:bg-red-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Live ({liveCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'upcoming'
                    ? 'bg-[#0B2347] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('recorded')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'recorded'
                    ? 'bg-[#0B2347] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recorded
              </button>
            </div>

            {/* Direct "+ Add Class" Secondary Button */}
            <button
              type="button"
              id="add-class-btn-top"
              onClick={() => {
                setEditingClass(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Class</span>
            </button>
          </div>

          {/* Subject Pills */}
          {subjects.length > 2 && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider shrink-0">
                Category:
              </span>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubjectFilter(sub)}
                  className={`px-3 py-1 rounded-full font-bold transition-all capitalize whitespace-nowrap cursor-pointer ${
                    subjectFilter === sub
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {sub === 'all' ? 'All Subjects' : sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. CLASSES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredClasses.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#0B2347] font-display">
              No Online Classes Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No online classes match your current search or filters. Click below to add a new online class to the register.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingClass(null);
                setIsAddModalOpen(true);
              }}
              className="px-6 py-3 bg-[#0B2347] hover:bg-[#123363] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              + Add Class Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => {
              const isLive = cls.status === 'live';
              const isUpcoming = cls.status === 'upcoming';

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail banner */}
                    <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={cls.image}
                        alt={cls.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Status badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {isLive ? (
                          <span className="px-3 py-1 bg-red-600 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shadow-md uppercase tracking-wider animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            Live Now
                          </span>
                        ) : isUpcoming ? (
                          <span className="px-3 py-1 bg-[#0B2347]/90 text-amber-300 font-bold text-[11px] rounded-xl flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Upcoming
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-800/90 text-slate-200 font-bold text-[11px] rounded-xl flex items-center gap-1.5 backdrop-blur-xs">
                            <Tv className="w-3 h-3" />
                            Recorded
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-white/90 text-slate-900 font-bold text-[10px] rounded-xl shadow-xs">
                          {cls.subject}
                        </span>
                      </div>

                      {/* Edit / Delete overlay buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClass(cls);
                            setIsAddModalOpen(true);
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-900 rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                          title="Edit Class"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setClassToDelete(cls)}
                          className="p-2 bg-white/90 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Level & Enrolled overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-bold text-amber-300 bg-[#0B2347]/80 px-2 py-0.5 rounded-lg backdrop-blur-xs">
                          {cls.level}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-200 bg-black/50 px-2 py-0.5 rounded-lg backdrop-blur-xs">
                          <Users className="w-3 h-3 text-amber-400" />
                          <span>{cls.enrolledStudentsCount || 0} Students</span>
                        </span>
                      </div>
                    </div>

                    {/* Class Details Body */}
                    <div className="p-6 space-y-4">
                      {/* Teacher Profile with Change DP Button */}
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Circular Avatar with Camera overlay & Clickable to change */}
                          <div
                            onClick={() => setDpClassTarget(cls)}
                            className="relative group shrink-0 cursor-pointer"
                            title={`Click to change ${cls.instructor}'s DP`}
                          >
                            {cls.instructorAvatar ? (
                              <img
                                src={cls.instructorAvatar}
                                alt={cls.instructor}
                                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-xs group-hover:brightness-90 transition-all"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-[#0B2347] text-white flex items-center justify-center font-bold text-sm border-2 border-amber-400 shadow-xs">
                                {cls.instructor.charAt(0)}
                              </div>
                            )}
                            {/* Camera overlay hover */}
                            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Camera className="w-4 h-4 text-amber-300" />
                            </div>
                            {/* Small round camera badge on the avatar */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDpClassTarget(cls);
                              }}
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0B2347] text-amber-300 hover:bg-amber-400 hover:text-[#0B2347] flex items-center justify-center border-2 border-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
                              title="Change DP (Photo Badlein)"
                            >
                              <Camera className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#0B2347] flex items-center gap-1.5 truncate">
                              <span className="truncate">{cls.instructor}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50 shrink-0" />
                            </h4>
                            <span className="text-[11px] text-slate-500 font-medium block truncate">
                              {cls.instructorRole || 'Lead Instructor'}
                            </span>
                          </div>
                        </div>

                        {/* Explicit Change DP Button */}
                        <button
                          type="button"
                          id={`change-dp-btn-${cls.id}`}
                          onClick={() => setDpClassTarget(cls)}
                          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-[#0B2347] hover:text-amber-700 text-xs font-bold border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group/dpbtn"
                          title={`Change DP for ${cls.instructor}`}
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-600 group-hover/dpbtn:scale-110 transition-transform" />
                          <span>Change DP</span>
                        </button>
                      </div>

                      <h3 className="font-black text-lg text-slate-900 leading-snug line-clamp-2 font-display">
                        {cls.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {cls.description}
                      </p>

                      {/* Timing & Schedule */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">{cls.schedule}</span>
                      </div>

                      {/* Topics Chips */}
                      {cls.topics && cls.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cls.topics.slice(0, 4).map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 text-[11px] font-bold border border-blue-200"
                            >
                              {topic}
                            </span>
                          ))}
                          {cls.topics.length > 4 && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                              +{cls.topics.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-6 pt-0 border-t border-slate-100 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveVirtualRoomClass(cls)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                        isLive
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                          : 'bg-[#0B2347] hover:bg-[#123363] text-white shadow-blue-200'
                      }`}
                    >
                      {isLive ? (
                        <>
                          <Radio className="w-4 h-4 text-white animate-pulse" />
                          <span>Join Live Classroom</span>
                        </>
                      ) : isUpcoming ? (
                        <>
                          <Calendar className="w-4 h-4 text-amber-300" />
                          <span>Enter Virtual Room</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                          <span>Watch Recorded Session</span>
                        </>
                      )}
                    </button>

                    {cls.meetingUrl && cls.meetingUrl.startsWith('http') && (
                      <a
                        href={cls.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-[#0B2347] rounded-xl transition-colors cursor-pointer"
                        title="Open External Google Meet / Zoom Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MODAL: ADD / EDIT CLASS (Khod class add karne ka form) */}
      {isAddModalOpen && (
        <AddEditClassModal
          initialClass={editingClass}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingClass(null);
          }}
          onSave={async (savedClass) => {
            let updated: OnlineClass[];
            if (editingClass) {
              updated = classes.map((c) => (c.id === savedClass.id ? savedClass : c));
              showToast(`Class "${savedClass.title}" updated successfully!`);
            } else {
              updated = [savedClass, ...classes];
              showToast(`New online class "${savedClass.title}" added to schedule!`);
            }
            setClasses(updated);
            await savePersistentData('webdev_online_classes', updated);
            syncSectionToSupabase('onlineClasses', updated).catch(() => {});
            setIsAddModalOpen(false);
            setEditingClass(null);
          }}
        />
      )}

      {/* 5. MODAL: DELETE CONFIRMATION (Reliable in iFrame) */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1.5 font-display">
              Remove Online Class?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Are you sure you want to remove <strong className="text-slate-800 font-bold">"{classToDelete.title}"</strong> taught by {classToDelete.instructor}?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteClass}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: INTERACTIVE VIRTUAL CLASSROOM VIEWER */}
      {activeVirtualRoomClass && (
        <VirtualClassroomModal
          onlineClass={activeVirtualRoomClass}
          onClose={() => setActiveVirtualRoomClass(null)}
        />
      )}

      {/* 7. MODAL: CHANGE INSTRUCTOR DP (DP BADLEIN) */}
      {dpClassTarget && (
        <ChangeInstructorDpModal
          onlineClass={dpClassTarget}
          onClose={() => setDpClassTarget(null)}
          onSave={handleSaveInstructorDp}
        />
      )}

      {/* 8. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2347] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-amber-400 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   CHANGE INSTRUCTOR DP MODAL COMPONENT (Upload from Device, Link, Presets)
   ========================================================================= */

const INSTRUCTOR_DP_PRESETS = [
  {
    name: 'Modern Tech Dev (Current)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Software Engineer',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Tech Lead / Architect',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Cloud & Systems Specialist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Senior Full-Stack Mentor',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Solutions Architect',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  }
];

interface ChangeInstructorDpModalProps {
  onlineClass: OnlineClass;
  onClose: () => void;
  onSave: (newAvatarUrl: string) => void;
}

const ChangeInstructorDpModal: React.FC<ChangeInstructorDpModalProps> = ({
  onlineClass,
  onClose,
  onSave
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    onlineClass.instructorAvatar || INSTRUCTOR_DP_PRESETS[0].url
  );
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 400, 400, 0.88);
      setSelectedAvatar(compressed);
    } catch (err) {
      console.error('Error compressing DP image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setSelectedAvatar(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleSave = () => {
    if (!selectedAvatar.trim()) return;
    onSave(selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0B2347] font-display">
                Change Profile DP
              </h3>
              <p className="text-xs text-slate-500">
                Update instructor photo for <strong className="text-[#0B2347]">{onlineClass.instructor}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DP Preview */}
        <div className="py-6 flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl border border-slate-100 mt-4 text-center">
          <div className="relative group mb-3">
            <img
              src={selectedAvatar}
              alt={onlineClass.instructor}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-400 shadow-lg"
            />
            <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
            </span>
          </div>
          <h4 className="font-extrabold text-base text-[#0B2347] flex items-center gap-1.5">
            <span>{onlineClass.instructor}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
          </h4>
          <span className="text-xs text-slate-500 font-semibold mt-0.5">
            {onlineClass.instructorRole || 'Lead Instructor'}
          </span>
          <span className="mt-2 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
            Live Preview (Naya Photo)
          </span>
        </div>

        {/* Upload options */}
        <div className="mt-5 space-y-4">
          {/* Method 1: Device File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Apne Mobile / Computer Se Photo Upload Karein
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-blue-300 hover:border-amber-500 bg-blue-50/50 hover:bg-amber-50/40 text-[#0B2347] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Upload className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>{isUploading ? 'Compressing & Loading...' : 'Choose Photo from Device (Gallery / Files)'}</span>
            </button>
          </div>

          {/* Method 2: Web Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Ya Image Ka Link (URL) Paste Karein
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2.5 bg-[#0B2347] hover:bg-[#123363] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Preview Link
              </button>
            </div>
          </div>

          {/* Method 3: Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Ya Ready-made Professional Developer DP Select Karein
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {INSTRUCTOR_DP_PRESETS.map((preset, idx) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`relative p-1 rounded-2xl transition-all cursor-pointer group ${
                      isSelected
                        ? 'ring-3 ring-amber-400 bg-amber-50'
                        : 'border border-slate-200 hover:border-amber-300 bg-slate-50'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-14 rounded-xl object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="save-instructor-dp-btn"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-[#0B2347] text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply DP (DP Update Karein)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   ADD / EDIT CLASS MODAL COMPONENT (Upload Image or Paste URL supported)
   ========================================================================= */

interface AddEditClassModalProps {
  initialClass: OnlineClass | null;
  onClose: () => void;
  onSave: (cls: OnlineClass) => void;
}

const AddEditClassModal: React.FC<AddEditClassModalProps> = ({
  initialClass,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(initialClass?.title || '');
  const [instructor, setInstructor] = useState(initialClass?.instructor || 'Abdullah Web Developer');
  const [instructorRole, setInstructorRole] = useState(initialClass?.instructorRole || 'Lead Instructor');
  const [subject, setSubject] = useState(initialClass?.subject || 'Web Development');
  const [schedule, setSchedule] = useState(initialClass?.schedule || 'Mon, Wed & Fri • 6:00 PM - 7:30 PM (PKT)');
  const [duration, setDuration] = useState(initialClass?.duration || '90 mins');
  const [status, setStatus] = useState<'live' | 'upcoming' | 'recorded'>(initialClass?.status || 'live');
  const [level, setLevel] = useState(initialClass?.level || 'All Cohorts');
  const [meetingUrl, setMeetingUrl] = useState(initialClass?.meetingUrl || 'https://meet.google.com/class-live');
  const [image, setImage] = useState(
    initialClass?.image ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  );
  const [description, setDescription] = useState(
    initialClass?.description ||
      'Hands-on interactive live software development session covering production web architectures.'
  );
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState<number>(
    initialClass?.enrolledStudentsCount || 35
  );
  const [topicsText, setTopicsText] = useState(
    initialClass?.topics?.join(', ') || 'React 19, TypeScript, Tailwind CSS, REST APIs'
  );
  const [instructorAvatar, setInstructorAvatar] = useState(
    initialClass?.instructorAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 800, 0.85);
      setImage(compressed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.88);
      setInstructorAvatar(compressed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructor.trim()) return;

    const topics = topicsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const savedRecord: OnlineClass = {
      id: initialClass?.id || `class-${Date.now()}`,
      title: title.trim(),
      instructor: instructor.trim(),
      instructorRole: instructorRole.trim() || 'Lead Mentor',
      instructorAvatar: instructorAvatar.trim(),
      subject: subject.trim() || 'Web Development',
      schedule: schedule.trim() || 'Daily 5:00 PM',
      duration: duration.trim() || '90 mins',
      status,
      level: level.trim() || 'All Cohorts',
      meetingUrl: meetingUrl.trim() || 'https://meet.google.com/',
      image: image.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      description: description.trim() || 'Interactive live programming session.',
      enrolledStudentsCount: Number(enrolledStudentsCount) || 1,
      topics: topics.length > 0 ? topics : ['Web Dev', 'Programming']
    };

    onSave(savedRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <Video className="w-5 h-5 text-[#0B2347]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0B2347] font-display">
                {initialClass ? 'Edit Online Class' : 'Add New Online Class (Class Add Karein)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Provide class title, instructor name, schedule, and thumbnail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Class Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Class Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Full-Stack Web Development Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 font-semibold text-slate-900 text-sm"
            />
          </div>

          {/* Instructor and Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Instructor / Teacher Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Abdullah Web Developer"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Instructor Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Cloud Architect"
                value={instructorRole}
                onChange={(e) => setInstructorRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              />
            </div>
          </div>

          {/* Instructor Avatar (DP) in Add/Edit form */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Instructor Profile Photo (DP)
            </label>
            <div className="flex items-center gap-3">
              <img
                src={instructorAvatar}
                alt="Avatar Preview"
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-xs shrink-0"
              />
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#0B2347] text-xs font-bold transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-700" />
                  <span>Upload DP from Device</span>
                </button>
                <input
                  type="url"
                  placeholder="Or paste image URL"
                  value={instructorAvatar}
                  onChange={(e) => setInstructorAvatar(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Subject & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subject / Domain
              </label>
              <input
                type="text"
                placeholder="e.g. Web Development, Python & AI, UI/UX"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Class Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 bg-white font-semibold"
              >
                <option value="live">🔴 Live Now</option>
                <option value="upcoming">🕒 Upcoming Schedule</option>
                <option value="recorded">📹 Recorded Archive</option>
              </select>
            </div>
          </div>

          {/* Schedule & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Schedule / Days & Time
              </label>
              <input
                type="text"
                placeholder="e.g. Mon, Wed & Fri • 6:00 PM - 7:30 PM"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Cohort / Grade Level
              </label>
              <input
                type="text"
                placeholder="e.g. Grade 10-A, Beginner, All Cohorts"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              />
            </div>
          </div>

          {/* Meeting URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Class Meeting URL (Google Meet / Zoom / Custom)
            </label>
            <input
              type="text"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            />
          </div>

          {/* Thumbnail Image (File upload or URL) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Class Cover Image (Upload or URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 text-xs"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-blue-950 font-bold rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>Upload File</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            {image && (
              <div className="mt-2 h-28 rounded-2xl overflow-hidden border border-slate-200 relative">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-semibold">
                  Thumbnail Preview
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Class Overview & Syllabus Summary
            </label>
            <textarea
              rows={2}
              placeholder="What will students learn in this live session?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Topics Covered (Comma-separated tags)
            </label>
            <input
              type="text"
              placeholder="e.g. React 19, TypeScript, Tailwind CSS, Git"
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>{initialClass ? 'Save Changes' : '+ Add to Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
