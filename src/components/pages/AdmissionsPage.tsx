import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  Sparkles,
  Award,
  BookOpen,
  FileCheck,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  User,
  Laptop,
  Check,
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';
import { PageId, AdmissionApplication } from '../../types';
import { SCHOOL_FULL_TITLE, SCHOOL_NAME } from '../../data/schoolData';
import { savePersistentData, loadPersistentData } from '../../utils/imageStorage';
import { syncSectionToSupabase } from '../../utils/supabase';

interface AdmissionsPageProps {
  onNavigate: (page: PageId) => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    gradeApplying: 'Grade 9',
    priorExperience: 'Beginner (No coding experience)',
    trackPreference: 'Full-Stack Web Engineering',
    previousSchool: '',
    needScholarship: false,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Please fill in student name, email, and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const existing = (await loadPersistentData<AdmissionApplication[]>('webdev_admissions', [])) || [];
      const newApp: AdmissionApplication = {
        id: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gradeApplying: formData.gradeApplying,
        priorExperience: `${formData.priorExperience} • Track: ${formData.trackPreference}${formData.needScholarship ? ' • [Scholarship Requested]' : ''}`,
        notes: [
          formData.previousSchool ? `Prev School: ${formData.previousSchool}` : '',
          formData.dob ? `DOB: ${formData.dob} (${formData.gender})` : '',
          formData.notes.trim()
        ].filter(Boolean).join(' | '),
        createdAt: new Date().toISOString()
      };

      const updated = [newApp, ...existing];
      await savePersistentData('webdev_admissions', updated);
      syncSectionToSupabase('admissions', updated).catch(() => {});

      // Dispatch event for Admin Portal live sync
      window.dispatchEvent(new CustomEvent('webdev:admission_updated', { detail: { count: updated.length } }));

      setSubmittedApp(newApp);
    } catch (err) {
      console.error('Failed to submit admission application:', err);
      alert('Application could not be saved. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedApp(null);
    setFormData({
      studentName: '',
      parentName: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'Male',
      gradeApplying: 'Grade 9',
      priorExperience: 'Beginner (No coding experience)',
      trackPreference: 'Full-Stack Web Engineering',
      previousSchool: '',
      needScholarship: false,
      notes: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#081830] via-[#0B2347] to-[#0E2E5C] text-white py-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Academic Session 2026–2027 • Admissions Now Open</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
                Admissions Application Form
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
                Join {SCHOOL_FULL_TITLE}. Prepare your child for real-world software engineering, AI robotics, and modern web systems from Grade 6 to Grade 12.
              </p>
            </div>

            {/* Quick Cohort Stats Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl space-y-2 text-xs w-full sm:w-auto min-w-[240px]">
              <div className="flex items-center justify-between text-blue-200">
                <span>Fall Cohort Start:</span>
                <strong className="text-white font-bold">Oct 15, 2026</strong>
              </div>
              <div className="flex items-center justify-between text-blue-200">
                <span>Seats Availability:</span>
                <span className="text-amber-400 font-bold">Limited (24 / Lab)</span>
              </div>
              <div className="flex items-center justify-between text-blue-200">
                <span>Scholarships:</span>
                <span className="text-emerald-400 font-bold">Up to 100% Merit</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-amber-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Direct Admin Notification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADMISSION JOURNEY 4 STEPS */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              01
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">Online Form</div>
              <p className="text-[11px] text-slate-500">Fill details below</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              02
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">Tech Aptitude</div>
              <p className="text-[11px] text-slate-500">Logic & creative test</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0">
              03
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">Lab Interview</div>
              <p className="text-[11px] text-slate-500">Meet lead instructors</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
              04
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Enrollment</div>
              <p className="text-[11px] text-amber-800">Welcome kit & portal</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN APPLICATION SECTION */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FORM CONTAINER (LEFT 7-8 COLS) */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
            {submittedApp ? (
              /* SUCCESS RECEIPT */
              <div className="p-8 sm:p-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Application Successfully Received
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-blue-950 font-display">
                    Welcome to {SCHOOL_NAME}, {submittedApp.studentName}!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your application has been registered with the admissions office. Our team will review your submission and contact you within 24–48 hours.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Application Voucher ID:</span>
                    <span className="font-mono font-black text-blue-950 text-sm bg-amber-100 px-2.5 py-0.5 rounded-md text-blue-950">
                      {submittedApp.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student Name:</span>
                    <strong className="text-slate-800">{submittedApp.studentName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Parent / Guardian:</span>
                    <span className="text-slate-800">{submittedApp.parentName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Grade Applying:</span>
                    <span className="font-bold text-blue-900">{submittedApp.gradeApplying}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Registered Email:</span>
                    <span className="text-blue-600">{submittedApp.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact Phone:</span>
                    <span className="text-slate-800 font-semibold">{submittedApp.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>Submission Timestamp:</span>
                    <span>{new Date(submittedApp.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Application Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-6 py-2.5 bg-[#0B2347] hover:bg-[#123363] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('classes')}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-blue-950 text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Explore Virtual Classes
                  </button>
                </div>
              </div>
            ) : (
              /* THE APPLICATION FORM */
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2 text-blue-900">
                    <GraduationCap className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg sm:text-xl font-bold font-display text-blue-950">
                      Student & Academic Enrollment Details
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide accurate information for academic review and student ID generation.
                  </p>
                </div>

                {/* Section 1: Student Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    1. Student Identity
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Student Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        placeholder="e.g., Hamza Ahmed Khan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Parent / Guardian Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        placeholder="e.g., Tariq Ahmed Khan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Grade Applying For <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.gradeApplying}
                        onChange={(e) => setFormData({ ...formData, gradeApplying: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-950 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      >
                        <option value="Grade 6">Grade 6 (Coding Foundations)</option>
                        <option value="Grade 7">Grade 7 (Algorithms & Python)</option>
                        <option value="Grade 8">Grade 8 (Web Architecture)</option>
                        <option value="Grade 9">Grade 9 (Full-Stack & TypeScript)</option>
                        <option value="Grade 10">Grade 10 (Databases & APIs)</option>
                        <option value="Grade 11">Grade 11 (Cloud & AI Systems)</option>
                        <option value="Grade 12">Grade 12 (Capstone Engineering)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Details */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    2. Communication Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Contact Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="parent.email@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Contact Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-950 mb-1">
                      Current / Previous School & City
                    </label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      placeholder="e.g., Army Public School, Lahore / Beaconhouse"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                    />
                  </div>
                </div>

                {/* Section 3: Technical Track Preference */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    3. Technical Background & Specialty Track
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Prior Programming Background
                      </label>
                      <select
                        value={formData.priorExperience}
                        onChange={(e) => setFormData({ ...formData, priorExperience: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      >
                        <option value="Beginner (No coding experience)">Beginner (Complete beginner, eager to learn)</option>
                        <option value="Basic (Knows HTML/CSS or Scratch)">Basic (Knows some HTML/CSS or Scratch)</option>
                        <option value="Intermediate (Builds small JavaScript or Python apps)">Intermediate (Builds JavaScript or Python apps)</option>
                        <option value="Advanced (Has published GitHub projects/APIs)">Advanced (Has published GitHub repositories)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">
                        Preferred Engineering Track
                      </label>
                      <select
                        value={formData.trackPreference}
                        onChange={(e) => setFormData({ ...formData, trackPreference: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                      >
                        <option value="Full-Stack Web Engineering">Full-Stack Web Engineering (React, Node, Cloud)</option>
                        <option value="Artificial Intelligence & Python">Artificial Intelligence & Python Data Labs</option>
                        <option value="Mobile App Architecture">Mobile Application Architecture (Flutter/React Native)</option>
                        <option value="Cybersecurity & Network Systems">Cybersecurity & Network Systems</option>
                      </select>
                    </div>
                  </div>

                  {/* Scholarship toggle */}
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="scholarshipCheckbox"
                      checked={formData.needScholarship}
                      onChange={(e) => setFormData({ ...formData, needScholarship: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-amber-300 cursor-pointer"
                    />
                    <label htmlFor="scholarshipCheckbox" className="text-xs text-blue-950 cursor-pointer">
                      <strong className="block font-bold">Apply for Merit / Need-Based Scholarship (Up to 100% Tuition Aid)</strong>
                      <span className="text-slate-600">
                        Check this box if you wish to be evaluated for our tech talent scholarship quota.
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-950 mb-1">
                      Student Aspirations / Special Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Share your interest in technology, favorite projects, or any questions for the admissions committee..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/60 focus:border-blue-900 bg-white"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Your data is stored securely and directly routed to the admissions desk.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black text-sm rounded-xl transition-all shadow-md shadow-amber-400/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Processing Application...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Admission Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SIDEBAR INFORMATION (RIGHT 4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Criteria Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-blue-950 font-display">
                  Eligibility & Criteria
                </h3>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Minimum 65% aggregate in previous academic year (Mathematics & English).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Demonstrated passion for computers, technology, logic, or creativity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Clearing the 45-minute basic logic and algorithmic reasoning test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Personal or virtual interview with student and parents.</span>
                </li>
              </ul>
            </div>

            {/* Document Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-blue-950 font-display">
                  Documents Required
                </h3>
              </div>

              <ul className="space-y-2 text-xs text-slate-600">
                <li className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>2 Passport-size recent student photographs</span>
                </li>
                <li className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Copy of Birth Certificate / B-Form</span>
                </li>
                <li className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Previous school progress report / transcript</span>
                </li>
                <li className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Parent / Guardian CNIC copy</span>
                </li>
              </ul>
            </div>

            {/* Helpline & WhatsApp Direct */}
            <div className="bg-[#0B2347] text-white rounded-3xl p-6 border border-blue-900 shadow-md space-y-4">
              <h3 className="font-bold text-sm text-white font-display flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Admissions Helpline</span>
              </h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Have questions regarding tuition, hostel facilities, or syllabus? Reach out to our admissions counselors:
              </p>

              <div className="space-y-2 text-xs">
                <a
                  href="tel:+923001234567"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Direct Call: +92 300 1234567</span>
                </a>

                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 transition-colors text-white font-bold"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>Instant WhatsApp Guidance</span>
                </a>

                <a
                  href="mailto:admissions@webdeveloper.edu.pk"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <Mail className="w-4 h-4 text-blue-300" />
                  <span>admissions@webdeveloper.edu.pk</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
