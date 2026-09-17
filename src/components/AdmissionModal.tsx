import React, { useState } from 'react';
import { X, CheckCircle2, GraduationCap, Send, Sparkles } from 'lucide-react';
import { SCHOOL_FULL_TITLE } from '../data/schoolData';
import { savePersistentData, loadPersistentData } from '../utils/imageStorage';
import { syncSectionToSupabase } from '../utils/supabase';
import { AdmissionApplication } from '../types';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    gradeApplying: 'Grade 9',
    priorExperience: 'Beginner (No coding experience)',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.email) return;

    try {
      const existing = (await loadPersistentData<AdmissionApplication[]>('webdev_admissions', [])) || [];
      const newApp: AdmissionApplication = {
        id: `adm-${Date.now()}`,
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gradeApplying: formData.gradeApplying,
        priorExperience: formData.priorExperience,
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString()
      };
      const updated = [newApp, ...existing];
      await savePersistentData('webdev_admissions', updated);
      syncSectionToSupabase('admissions', updated).catch(() => {});
    } catch (err) {
      console.error('Failed to save admission:', err);
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      studentName: '',
      parentName: '',
      email: '',
      phone: '',
      gradeApplying: 'Grade 9',
      priorExperience: 'Beginner (No coding experience)',
      notes: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-blue-950 px-6 py-5 text-white flex items-center justify-between border-b-2 border-amber-400/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4 text-blue-950" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display text-white">
                Online Admissions Application
              </h3>
              <p className="text-[11px] text-amber-300 font-semibold">
                {SCHOOL_FULL_TITLE} (2026–2027)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-blue-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 bg-white">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-blue-950 font-display">
                Application Submitted!
              </h4>
              <p className="text-sm text-blue-900/80 max-w-sm mx-auto">
                Thank you. We have logged student <strong>{formData.studentName}</strong> for the 2026–2027 admissions cycle. A formal confirmation and scholarship evaluation form has been sent to <strong>{formData.email}</strong>.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-blue-950 font-black text-xs rounded-xl transition-all shadow-md shadow-amber-400/30 border border-amber-300"
              >
                Close & Return to Website
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Student's name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Parent's name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Grade Applying For
                  </label>
                  <select
                    value={formData.gradeApplying}
                    onChange={(e) => setFormData({ ...formData, gradeApplying: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs bg-white text-blue-950"
                  >
                    <option>Grade 6 (Junior Web Foundations)</option>
                    <option>Grade 7 (Junior Web Foundations)</option>
                    <option>Grade 8 (Junior Web Foundations)</option>
                    <option>Grade 9 (Incoming Freshman)</option>
                    <option>Grade 10 (Sophomore Transfer)</option>
                    <option>Grade 11 (Full Stack Diploma Track)</option>
                    <option>Grade 12 (Honors Web Systems)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                    Current Coding Knowledge
                  </label>
                  <select
                    value={formData.priorExperience}
                    onChange={(e) => setFormData({ ...formData, priorExperience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs bg-white text-blue-950"
                  >
                    <option>Beginner (No prior coding)</option>
                    <option>Scratch / Block Coding</option>
                    <option>Basic HTML & CSS</option>
                    <option>Intermediate JavaScript / Python</option>
                    <option>Advanced Full-Stack Developer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                  Additional Notes or Interests
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tell us about student interests, hobbies, or questions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-blue-200 text-xs text-blue-950 bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/30 transition-all flex items-center justify-center gap-2 border border-amber-300"
                >
                  <Send className="w-3.5 h-3.5 text-blue-950" />
                  <span>Submit Application for Review</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
