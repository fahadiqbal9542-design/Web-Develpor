import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Calendar,
  Sparkles
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentGrade: 'Grade 9 (Incoming Freshman)',
    interestTrack: 'Full-Stack Web Engineering',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: "Does a student need prior coding experience to enroll in WEB DEVELOPER School?",
      a: "No prior experience is required for our Middle School and 9th Grade foundational tracks. We take students from complete beginners to confident software builders through structured, hands-on mentorship."
    },
    {
      q: "What hardware or laptops are provided on campus?",
      a: "Our campus features high-spec workstations equipped with dual 4K monitors and high-speed fiber internet. High school students also receive an enrolled development laptop for off-campus project work."
    },
    {
      q: "Are merit-based coding scholarships available for 2026–2027?",
      a: "Yes! We offer partial and full tuition merit awards for candidates who exhibit strong logical aptitude, creativity, and enthusiasm during our introductory interview."
    },
    {
      q: "How does the academic schedule integrate with standard high school diplomas?",
      a: "WEB DEVELOPER School is a fully accredited secondary institution. Students complete all standard college-preparatory coursework (Math, Sciences, Humanities) alongside our rigorous web engineering core."
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO HEADER */}
      <section className="pt-12 pb-14 bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-blue-950 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Admissions & Campus Inquiries</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight font-display">
            Contact WEB DEVELOPER School
          </h1>

          <p className="mt-4 text-base sm:text-lg text-blue-900/80 leading-relaxed">
            Have questions about admissions, campus visits, or our software engineering curriculum? Our admissions faculty is here to assist you.
          </p>
        </div>
      </section>

      {/* 2. CONTACT DETAILS & INQUIRY FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-blue-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-blue-950 font-display">
                Admissions Headquarters
              </h3>

              <div className="space-y-4 text-sm text-blue-900/80">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-950">Campus Address</h4>
                    <p className="mt-0.5">404 Silicon Boulevard, Tech District</p>
                    <p className="text-xs text-blue-800/70">San Francisco Bay Area, CA 94016</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-950">Admissions Helpline</h4>
                    <p className="mt-0.5 font-bold text-amber-600">+1 (800) 555-DEV-EDU</p>
                    <p className="text-xs text-blue-800/70">Direct desk for parent consultations</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-950">Email Contact</h4>
                    <p className="mt-0.5 font-bold text-blue-950">admissions@webdeveloper.edu</p>
                    <p className="text-xs text-blue-800/70">Response within 24 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-950">Office & Visiting Hours</h4>
                    <p className="mt-0.5">Monday – Friday: 8:00 AM – 5:30 PM</p>
                    <p className="text-xs text-blue-800/70">Saturday (Tours Only): 9:00 AM – 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campus Tour Card */}
            <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border-2 border-amber-400/30">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>WEEKLY IN-PERSON SESSIONS</span>
              </div>
              <h4 className="text-lg font-bold font-display text-white">Schedule a Guided Campus Tour</h4>
              <p className="text-xs text-blue-200 mt-2 leading-relaxed">
                Tour our dual-monitor web development laboratories, robotics workshop, and meet current high school developers.
              </p>
            </div>
          </div>

          {/* Right: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-blue-100 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-950 font-display mb-2">
                Send an Admissions Inquiry
              </h3>
              <p className="text-sm text-blue-900/80 mb-6">
                Fill out the form below to receive our 2026–2027 curriculum prospectus and schedule an interview.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-blue-950 font-display">
                    Inquiry Received Successfully!
                  </h4>
                  <p className="text-sm text-blue-950 max-w-md mx-auto">
                    Thank you, <strong>{formData.name}</strong>. Our admissions team has sent the 2026 curriculum packet to <strong>{formData.email}</strong> and will call you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        studentGrade: 'Grade 9 (Incoming Freshman)',
                        interestTrack: 'Full-Stack Web Engineering',
                        message: ''
                      });
                    }}
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all border border-amber-400/40"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. David Vance (Parent/Student)"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 text-blue-950 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="parent@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 text-blue-950 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 text-blue-950 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                        Applicant Grade Level
                      </label>
                      <select
                        value={formData.studentGrade}
                        onChange={(e) => setFormData({ ...formData, studentGrade: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white text-blue-950"
                      >
                        <option>Middle School (Grades 6–8)</option>
                        <option>Grade 9 (Incoming Freshman)</option>
                        <option>Grade 10 (Sophomore Transfer)</option>
                        <option>Grade 11 (Junior Web Specialist)</option>
                        <option>Grade 12 (Senior Honors)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                      Program of Primary Interest
                    </label>
                    <select
                      value={formData.interestTrack}
                      onChange={(e) => setFormData({ ...formData, interestTrack: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white text-blue-950"
                    >
                      <option>Modern Full-Stack Engineering (2-Year Diploma)</option>
                      <option>Junior Web Foundations (Middle School)</option>
                      <option>UI/UX & Creative Computing Specialization</option>
                      <option>AI & Next-Gen Web Systems (Honors)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                      Questions or Tour Date Preferences
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please let us know if you'd like to schedule a campus tour or discuss financial aid..."
                      className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 text-blue-950 bg-white"
                    />
                  </div>

                  {/* Submit button: Gold highlight */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/30 transition-all flex items-center justify-center gap-2 border border-amber-300 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4 text-blue-950" />
                    <span>Submit Admissions Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase mb-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>Admissions Questions</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-blue-950 font-display">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border-2 border-blue-100 bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-blue-950 text-sm sm:text-base hover:bg-blue-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-amber-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-blue-900/80 leading-relaxed border-t border-blue-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
