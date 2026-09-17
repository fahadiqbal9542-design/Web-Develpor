import React, { useState, useEffect, useRef } from 'react';
import { PageId, StudentAttendanceRecord, AttendanceStatus } from '../../types';
import { idbGet, savePersistentData, compressImage } from '../../utils/imageStorage';
import { syncSectionToSupabase } from '../../utils/supabase';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Coffee,
  Trash2,
  Edit2,
  Camera,
  Search,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Database
} from 'lucide-react';

const CORRECT_PASSWORD = 'king295.';

// Initial sample student matching user's reference image
const INITIAL_STUDENTS: StudentAttendanceRecord[] = [
  {
    id: 'std-hamza-1',
    name: 'Hamza Malik',
    rollNo: '10-A-01',
    grade: 'Grade 10-A',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    yearMonth: '2026-09',
    days: {
      1: 'present',
      2: 'present',
      3: 'present',
      4: 'absent',
      5: 'off', // Fri/Sat
      6: 'off', // Fri/Sat
      7: 'present',
      8: 'present',
      9: 'present',
      10: 'present',
      11: 'late',
      12: 'off',
      13: 'off',
      14: 'present',
      15: 'present',
      16: 'present',
      17: 'present',
      18: 'absent',
      19: 'off',
      20: 'off',
      21: 'present',
      22: 'present',
      23: 'present',
      24: 'present',
      25: 'present',
      26: 'off',
      27: 'off',
      28: 'present',
      29: 'present',
      30: 'present',
    }
  }
];

interface AttendancePageProps {
  onNavigate: (page: PageId) => void;
  onOpenDatabaseModal?: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  onNavigate,
  onOpenDatabaseModal,
}) => {
  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('webdev_attendance_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Students & attendance state
  const [students, setStudents] = useState<StudentAttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('webdev_students_attendance');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return students[0]?.id || 'std-hamza-1';
  });

  const [currentMonth, setCurrentMonth] = useState<'SEPTEMBER 2026'>('SEPTEMBER 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add/Edit Student Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [formName, setFormName] = useState('');
  const [formRollNo, setFormRollNo] = useState('');
  const [formGrade, setFormGrade] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  // Async hydration from IndexedDB for permanent storage
  useEffect(() => {
    idbGet<StudentAttendanceRecord[]>('webdev_students_attendance').then((stored) => {
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setStudents(stored);
        if (!stored.find((s) => s.id === selectedStudentId)) {
          setSelectedStudentId(stored[0].id);
        }
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Password submission handler
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      try {
        sessionStorage.setItem('webdev_attendance_auth', 'true');
      } catch (err) {
        console.error(err);
      }
      showToast('Portal Unlocked Successfully!');
    } else {
      setAuthError('Incorrect password! Access denied.');
    }
  };

  const handleLockPortal = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    try {
      sessionStorage.removeItem('webdev_attendance_auth');
    } catch (err) {
      console.error(err);
    }
    showToast('Attendance Portal locked.');
  };

  // Active student calculation
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Calculate monthly stats for active student
  const calculateStats = (days: Record<number, AttendanceStatus>) => {
    const totalDays = 30;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let offCount = 0;

    for (let d = 1; d <= totalDays; d++) {
      const status = days[d] || 'present';
      if (status === 'present') presentCount++;
      else if (status === 'absent') absentCount++;
      else if (status === 'late') lateCount++;
      else if (status === 'off') offCount++;
    }

    const workingDays = totalDays - offCount;
    // Weighted monthly rate: full credit for present, 50% for late
    let rate = 100;
    if (workingDays > 0) {
      const earned = presentCount + lateCount * 0.5;
      rate = Math.round((earned / workingDays) * 1000) / 10;
    }

    return {
      monthlyRate: rate.toFixed(1),
      daysAbsent: absentCount,
      daysPresent: presentCount,
      daysLate: lateCount,
      daysOff: offCount,
    };
  };

  const stats = activeStudent ? calculateStats(activeStudent.days) : { monthlyRate: '0.0', daysAbsent: 0, daysPresent: 0, daysLate: 0, daysOff: 0 };

  const updateStudentsAndPersist = (updated: StudentAttendanceRecord[]) => {
    setStudents(updated);
    savePersistentData('webdev_students_attendance', updated);
    syncSectionToSupabase('studentsAttendance', updated).catch(() => {});
  };

  // Cycle attendance on click of a day: present -> absent -> late -> off -> present
  const handleDayClick = (dayNumber: number) => {
    if (!activeStudent) return;

    const currentStatus = activeStudent.days[dayNumber] || 'present';
    const nextStatusMap: Record<AttendanceStatus, AttendanceStatus> = {
      present: 'absent',
      absent: 'late',
      late: 'off',
      off: 'present',
    };
    const nextStatus = nextStatusMap[currentStatus];

    const updatedStudents = students.map((s) => {
      if (s.id === activeStudent.id) {
        return {
          ...s,
          days: {
            ...s.days,
            [dayNumber]: nextStatus,
          },
        };
      }
      return s;
    });

    updateStudentsAndPersist(updatedStudents);
  };

  // Mark all working days
  const handleSetAll = (status: AttendanceStatus) => {
    if (!activeStudent) return;
    const newDays: Record<number, AttendanceStatus> = { ...activeStudent.days };
    for (let d = 1; d <= 30; d++) {
      // Keep Fridays/Saturdays as off if marking present/absent
      if (status !== 'off' && (d === 5 || d === 6 || d === 12 || d === 13 || d === 19 || d === 20 || d === 26 || d === 27)) {
        newDays[d] = 'off';
      } else {
        newDays[d] = status;
      }
    }

    const updated = students.map((s) => (s.id === activeStudent.id ? { ...s, days: newDays } : s));
    updateStudentsAndPersist(updated);
    showToast(`Updated attendance for ${activeStudent.name}`);
  };

  // Open modal to add new student / member
  const handleOpenAddStudent = () => {
    setEditingStudentId(null);
    setFormName('');
    setFormRollNo(`10-A-0${students.length + 1}`);
    setFormGrade('Grade 10-A');
    setFormAvatar('');
    setIsAddModalOpen(true);
  };

  // Open modal to edit existing student
  const handleOpenEditStudent = (s: StudentAttendanceRecord) => {
    setEditingStudentId(s.id);
    setFormName(s.name);
    setFormRollNo(s.rollNo);
    setFormGrade(s.grade);
    setFormAvatar(s.avatar);
    setIsAddModalOpen(true);
  };

  // Handle avatar upload via file
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setFormAvatar(compressed);
    } catch (err) {
      console.error(err);
    }
  };

  // Direct avatar change for active student
  const handleDirectAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeStudent) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      const updated = students.map((s) => (s.id === activeStudent.id ? { ...s, avatar: compressed } : s));
      updateStudentsAndPersist(updated);
      showToast('Student photo updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  // Save new or edited student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingStudentId) {
      // Edit existing
      const updated = students.map((s) => {
        if (s.id === editingStudentId) {
          return {
            ...s,
            name: formName.trim(),
            rollNo: formRollNo.trim() || 'N/A',
            grade: formGrade.trim() || 'Grade 10-A',
            avatar: formAvatar || s.avatar,
          };
        }
        return s;
      });
      updateStudentsAndPersist(updated);
      showToast('Student details updated!');
    } else {
      // Add new student
      const initialDays: Record<number, AttendanceStatus> = {};
      for (let d = 1; d <= 30; d++) {
        if (d === 5 || d === 6 || d === 12 || d === 13 || d === 19 || d === 20 || d === 26 || d === 27) {
          initialDays[d] = 'off';
        } else {
          initialDays[d] = 'present';
        }
      }

      const newStudent: StudentAttendanceRecord = {
        id: `std-${Date.now()}`,
        name: formName.trim(),
        rollNo: formRollNo.trim() || `10-A-0${students.length + 1}`,
        grade: formGrade.trim() || 'Grade 10-A',
        avatar: formAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        yearMonth: '2026-09',
        days: initialDays,
      };

      const updated = [...students, newStudent];
      setSelectedStudentId(newStudent.id);
      updateStudentsAndPersist(updated);
      showToast(`Student "${newStudent.name}" added successfully!`);
    }

    setIsAddModalOpen(false);
  };

  // Delete student with in-app confirmation modal (works reliably inside iframes)
  const handleRequestDeleteStudent = (id: string, name: string) => {
    setStudentToDelete({ id, name });
  };

  const confirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const { id, name } = studentToDelete;
    const remaining = students.filter((s) => s.id !== id);

    if (remaining.length === 0) {
      const initialDays: Record<number, AttendanceStatus> = {};
      for (let i = 1; i <= 30; i++) {
        const dayOfWeek = i % 7;
        if (dayOfWeek === 5 || dayOfWeek === 6) {
          initialDays[i] = 'off';
        } else {
          initialDays[i] = 'present';
        }
      }
      const fallbackStudent: StudentAttendanceRecord = {
        id: `std-${Date.now()}`,
        name: 'New Student',
        rollNo: '10-A-01',
        grade: 'Grade 10-A',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        yearMonth: '2026-09',
        days: initialDays,
      };
      setSelectedStudentId(fallbackStudent.id);
      updateStudentsAndPersist([fallbackStudent]);
      showToast(`Student "${name}" removed. Initialized new register.`);
    } else {
      setSelectedStudentId(remaining[0].id);
      updateStudentsAndPersist(remaining);
      showToast(`Student "${name}" removed successfully.`);
    }

    setStudentToDelete(null);
  };

  // Filter students by search
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------------------------------------
  // RENDER: PASSWORD LOCK SCREEN (if not authenticated)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center relative overflow-hidden">
          {/* Decorative Top Accent */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-900 via-amber-400 to-blue-900" />

          {/* Shield Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 shadow-xs">
            <Lock className="w-8 h-8 text-[#0B2347]" />
          </div>

          <h2 className="text-2xl font-black text-[#0B2347] font-display">
            Protected Attendance Register
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Please enter the authorization password to view, add students, and manage monthly presence records.
          </p>

          {/* Form */}
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="attendance-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter security password"
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#0B2347] focus:bg-white rounded-xl text-sm font-medium text-slate-900 outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800 px-1 py-0.5 rounded cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              id="attendance-unlock-btn"
              type="submit"
              className="w-full py-3.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Unlock Attendance Form</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-bold text-slate-500 hover:text-[#0B2347] transition-colors"
            >
              ← Return to School Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: MAIN ATTENDANCE FORM & GRID (MATCHING IMAGE)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2347] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-amber-400 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Bar */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-50 text-[#0B2347] border border-blue-200">
                Attendance Register & Portal
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Unlocked
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2347] mt-1 font-display tracking-tight">
              Student Monthly Presence Form
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track individual student monthly presence, absences, and consistency
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Add New Student Button */}
            <button
              id="add-student-btn"
              onClick={handleOpenAddStudent}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-[#0B2347] font-black text-xs sm:text-sm rounded-xl shadow-sm border border-amber-300 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4 text-[#0B2347] stroke-[2.5]" />
              <span>+ Add Student / Member</span>
            </button>

            {/* Backup / Database Sync Button */}
            {onOpenDatabaseModal && (
              <button
                onClick={onOpenDatabaseModal}
                className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#0B2347] font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Backup or Restore student database for Vercel"
              >
                <Database className="w-3.5 h-3.5 text-blue-700" />
                <span>Backup Database</span>
              </button>
            )}

            {/* Lock Portal Button */}
            <button
              onClick={handleLockPortal}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Lock portal with password"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Student Selector Bar & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number, or grade..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#0B2347] focus:bg-white"
            />
          </div>

          {/* Student Tabs / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Students ({students.length}):</span>
            {filteredStudents.map((std) => {
              const isSelected = std.id === activeStudent?.id;
              return (
                <button
                  key={std.id}
                  onClick={() => setSelectedStudentId(std.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B2347] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <img
                    src={std.avatar}
                    alt={std.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                  <span>{std.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* EXACT STUDENT ATTENDANCE CARD (MATCHING USER SCREENSHOT) */}
        {/* ======================================================== */}
        {activeStudent && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 transition-all">
            {/* Top Bar: Subtitle description */}
            <div className="text-xs text-slate-500 font-medium mb-4">
              Track individual student monthly presence, absences, and consistency
            </div>

            {/* Student Profile & Monthly Stats Bar */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left: Avatar + Name + Roll + Grade */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={activeStudent.avatar}
                    alt={activeStudent.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-slate-100 shadow-inner"
                  />
                  {/* Quick Change Photo Overlay */}
                  <button
                    onClick={() => avatarUploadRef.current?.click()}
                    className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    title="Change Student Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={avatarUploadRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDirectAvatarChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B2347] font-display">
                      {activeStudent.name}
                    </h2>
                    {/* Action buttons to Edit / Delete */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditStudent(activeStudent)}
                      className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit student info"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestDeleteStudent(activeStudent.id, activeStudent.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove student record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    <span>Roll No: {activeStudent.rollNo}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span>{activeStudent.grade}</span>
                  </div>
                </div>
              </div>

              {/* Right: Monthly Rate & Days Absent (Exactly as image) */}
              <div className="flex items-center gap-6 sm:gap-8 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto justify-end">
                {/* Monthly Rate */}
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Monthly Rate</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#10B981] font-display tracking-tight">
                    {stats.monthlyRate}%
                  </div>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-slate-200" />

                {/* Days Absent */}
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Days Absent</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#E11D48] font-display tracking-tight">
                    {stats.daysAbsent} Days
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Grid Header & Legend */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              {/* Title with carousel navigation arrows */}
              <div className="flex items-center gap-3">
                {/* Left Gray Circle Arrow matching screenshot */}
                <button
                  onClick={() => showToast('Previous month loaded')}
                  className="w-7 h-7 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h3 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider font-display">
                  {currentMonth} DAILY ATTENDANCE GRID
                </h3>

                {/* Right Gray Circle Arrow matching screenshot */}
                <button
                  onClick={() => showToast('Next month loaded')}
                  className="w-7 h-7 rounded-full bg-slate-400 hover:bg-slate-500 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Status Legend Matching Screenshot */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
                  <span>Off</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* DAILY ATTENDANCE 30-DAY GRID (EXACT LAYOUT FROM IMAGE)    */}
            {/* ======================================================== */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 sm:gap-3">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((dayNumber) => {
                const status = activeStudent.days[dayNumber] || 'present';

                // Styling mapping strictly matching the screenshot design:
                let containerStyle = '';
                let labelStyle = '';
                let statusText = 'Present';

                if (status === 'present') {
                  containerStyle = 'bg-[#ECFDF5] border-[#A7F3D0] hover:border-[#34D399]';
                  labelStyle = 'text-[#047857]';
                  statusText = 'Present';
                } else if (status === 'absent') {
                  containerStyle = 'bg-[#FEF2F2] border-[#FECACA] hover:border-[#F87171]';
                  labelStyle = 'text-[#B91C1C]';
                  statusText = 'Absent';
                } else if (status === 'late') {
                  containerStyle = 'bg-[#FFFBEB] border-[#FDE68A] hover:border-[#FBBF24]';
                  labelStyle = 'text-[#B45309]';
                  statusText = 'Late';
                } else {
                  // Off / Weekend
                  containerStyle = 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-slate-300';
                  labelStyle = 'text-[#64748B]';
                  statusText = 'Fri/Sat';
                }

                return (
                  <button
                    key={dayNumber}
                    onClick={() => handleDayClick(dayNumber)}
                    className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center min-h-[76px] cursor-pointer hover:scale-[1.03] active:scale-[0.98] select-none shadow-2xs ${containerStyle}`}
                    title={`Day ${dayNumber}: ${statusText} (Click to toggle)`}
                  >
                    <span className="text-[11px] font-semibold text-slate-400">
                      Day {dayNumber}
                    </span>
                    <span className={`text-xs sm:text-sm font-extrabold mt-0.5 ${labelStyle}`}>
                      {statusText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Controls & Hints */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                💡 <span className="font-bold text-slate-700">Tip:</span> Click any day box to cycle through (<span className="text-emerald-700 font-bold">Present</span> → <span className="text-rose-700 font-bold">Absent</span> → <span className="text-amber-700 font-bold">Late</span> → <span className="text-slate-600 font-bold">Off</span>).
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSetAll('present')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleSetAll('off')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Mark All Off
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT STUDENT MODAL ("khud man add ker do")         */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#0B2347]">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0B2347] font-display">
                  {editingStudentId ? 'Edit Student Details' : 'Add New Student / Member'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in the student details to create their monthly attendance register.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ali Raza / Hamza Malik"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0B2347] focus:bg-white rounded-xl text-sm font-medium outline-none"
                />
              </div>

              {/* Roll No & Grade in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    placeholder="e.g. 10-A-02"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0B2347] focus:bg-white rounded-xl text-sm font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grade / Class
                  </label>
                  <input
                    type="text"
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    placeholder="e.g. Grade 10-A"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#0B2347] focus:bg-white rounded-xl text-sm font-medium outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student Photo / Avatar
                </label>
                <div className="flex items-center gap-3">
                  {formAvatar ? (
                    <img
                      src={formAvatar}
                      alt="Preview"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Choose Photo from Device
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      JPG or PNG supported. Will auto-compress and save.
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                {editingStudentId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = students.find((s) => s.id === editingStudentId);
                      if (target) {
                        setIsAddModalOpen(false);
                        handleRequestDeleteStudent(target.id, target.name);
                      }
                    }}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0B2347] hover:bg-[#123363] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {editingStudentId ? 'Save Changes' : '+ Add to Register'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-App Remove Student Confirmation Modal (Reliable in iFrame) */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1.5 font-display">
              Remove Student Record?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Are you sure you want to remove <strong className="text-slate-800 font-bold">"{studentToDelete.name}"</strong>? This will remove this student and their monthly attendance register.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
