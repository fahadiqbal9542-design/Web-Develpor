import React, { useState } from 'react';
import { PageId } from '../../types';
import { ACADEMIC_PROGRAMS } from '../../data/schoolData';
import {
  GraduationCap,
  Code2,
  Cpu,
  Layers,
  Palette,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Laptop
} from 'lucide-react';

interface AcademicsPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApplyModal: () => void;
}

export const AcademicsPage: React.FC<AcademicsPageProps> = ({
  onNavigate,
  onOpenApplyModal,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  const tracks = [
    {
      id: 'junior-web',
      name: 'Junior Web & Logic Foundations',
      grades: 'Grades 6–8',
      duration: '3 Academic Years',
      icon: <Code2 className="w-6 h-6 text-amber-500" />,
      tag: 'Middle School',
      overview:
        'Building computational intuition through visual algorithms, semantic HTML5, modern CSS architecture, and foundational JavaScript.',
      curriculum: [
        'Computational Thinking & Flowcharts',
        'Modern HTML5 & Responsive Semantic Design',
        'CSS Flexbox, CSS Grid & Micro-Animations',
        'JavaScript Fundamentals & Event Handling',
        'Interactive Math & Logic Game Development',
        'Introduction to Git & GitHub Versioning'
      ],
      deliverable: 'Capstone: Personal Portfolio & Interactive Educational Web Application',
    },
    {
      id: 'fullstack-eng',
      name: 'Full-Stack Software Engineering',
      grades: 'Grades 9–10',
      duration: '2 Academic Years',
      icon: <Layers className="w-6 h-6 text-amber-500" />,
      tag: 'High School Core',
      overview:
        'Comprehensive software craftsmanship encompassing React, TypeScript, server architectures, databases, and continuous delivery pipelines.',
      curriculum: [
        'Advanced TypeScript & Functional React',
        'State Management & Modern Hook Architecture',
        'Node.js & Express RESTful Server APIs',
        'Relational & Document Databases (PostgreSQL / NoSQL)',
        'Authentication, Security & JWT Protocols',
        'Cloud Deployment (Cloud Run, Vercel & Containerization)'
      ],
      deliverable: 'Capstone: Production SaaS Multi-User Web Application deployed to Cloud',
    },
    {
      id: 'ai-cloud',
      name: 'AI, Cloud & Data Architectures',
      grades: 'Grades 11–12',
      duration: '2 Academic Years',
      icon: <Cpu className="w-6 h-6 text-amber-500" />,
      tag: 'Honors Track',
      overview:
        'Senior-level specialization integrating machine learning APIs, cloud scalability, distributed microservices, and system design principles.',
      curriculum: [
        'Generative AI Integrations & Prompt Engineering',
        'Vector Embeddings & Semantic Search Pipelines',
        'Cloud Microservices & Serverless Functions',
        'Scalable API Design & Asynchronous Queues',
        'Full-Stack DevOps, CI/CD & Monitoring',
        'Technical Product Management & Agile Sprints'
      ],
      deliverable: 'Capstone: AI-Powered Enterprise Web Platform presented to Silicon Valley judges',
    },
    {
      id: 'ux-design',
      name: 'Human-Centered UI/UX Engineering',
      grades: 'Elective (Grades 9–12)',
      duration: '1 Academic Year',
      icon: <Palette className="w-6 h-6 text-amber-500" />,
      tag: 'Specialization',
      overview:
        'Bridging the critical gap between visual elegance, behavioral psychology, accessibility standards (WCAG), and responsive component design systems.',
      curriculum: [
        'Figma Design Systems & Design Tokens',
        'Color Theory, Optical Typography & Spatial Rhythms',
        'Interactive Prototyping & Motion Micro-Interactions',
        'WCAG AA/AAA Accessibility & Screen-Reader Optimization',
        'Usability Testing, User Interviews & A/B Experiments',
        'Bridging Design to Code with Tailwind CSS'
      ],
      deliverable: 'Capstone: Comprehensive Design System & Accessible Web App Suite',
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. ACADEMICS HERO */}
      <section className="pt-12 pb-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-blue-950 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Academic Rigor & Industry Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B2347] tracking-tight font-display">
            Academics & Software Engineering Curriculum
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
            From foundational computational logic in middle school to deploying AI-powered cloud architectures in senior grades, our 7-year continuum equips students to innovate at global standards.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              id="academics-apply-btn"
              onClick={onOpenApplyModal}
              className="px-7 py-3.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Apply for 2026–2027</span>
            </button>
            <button
              id="academics-contact-btn"
              onClick={() => onNavigate('contact')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#0B2347] font-bold text-sm rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-2"
            >
              <span>Speak with an Academic Advisor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. THREE ACADEMIC PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-[#0B2347] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B2347] text-amber-400 flex items-center justify-center mb-4 font-bold shadow-md">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#0B2347] font-display">1:1 High-End Workstations</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Every student codes on dedicated dual-monitor high-speed workstations with gigabit connectivity and enterprise developer toolchains.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-[#0B2347] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B2347] text-amber-400 flex items-center justify-center mb-4 font-bold shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#0B2347] font-display">Production-Ready Portfolios</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Rather than standard paper exams, grading is based on live code reviews, deployed apps, and technical presentation defense.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-[#0B2347] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0B2347] text-amber-400 flex items-center justify-center mb-4 font-bold shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#0B2347] font-display">Dual Academic Accreditations</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Full state secondary school diploma alongside recognized industry certifications (AWS Cloud, Google Cloud, and Certified Web Associate).
            </p>
          </div>
        </div>
      </section>

      {/* 3. FOUR COMPREHENSIVE TRACKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B2347] font-display">
            Comprehensive Curriculum Tracks
          </h2>
          <div className="w-2.5 h-2.5 bg-[#0B2347] rounded-full mx-auto mt-2" />
          <p className="text-slate-600 text-sm mt-3">
            Click into any academic track below to review the semester breakdown and expected capstone project.
          </p>
        </div>

        <div className="space-y-6">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="rounded-3xl bg-white border-2 border-slate-200 p-6 sm:p-8 hover:border-[#0B2347] shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    {track.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0B2347] text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        {track.tag}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{track.grades}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0B2347] font-display">
                      {track.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{track.duration}</span>
                  </div>
                  <button
                    onClick={onOpenApplyModal}
                    className="px-4 py-2 bg-[#0B2347] hover:bg-[#123363] text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Enroll in Track
                  </button>
                </div>
              </div>

              <p className="mt-5 text-slate-700 text-sm leading-relaxed">
                {track.overview}
              </p>

              {/* Curriculum Modules */}
              <div className="mt-6">
                <h4 className="text-xs font-bold text-[#0B2347] uppercase tracking-wider mb-3">
                  Core Modules & Practical Competencies:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {track.curriculum.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capstone Badge */}
              <div className="mt-5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300/80 flex items-center gap-2.5 text-xs text-[#0B2347] font-bold">
                <Award className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{track.deliverable}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ADMISSIONS CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B2347] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border-2 border-amber-400/30">
          <div>
            <span className="text-xs font-mono text-amber-300 font-bold tracking-wider uppercase">
              APPLICATION WINDOW OPEN
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display mt-1 text-white">
              Ready to code your future with WEB DEVELOPER School?
            </h3>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Apply online in under 5 minutes. No prior coding experience required for Grade 6 entries.
            </p>
          </div>
          <button
            onClick={onOpenApplyModal}
            className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#0B2347] font-black text-sm rounded-xl shadow-lg transition-all hover:scale-105 shrink-0"
          >
            Start Student Application
          </button>
        </div>
      </section>
    </div>
  );
};
