import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Trophy,
  Users,
  Code2,
  ArrowRight,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface EventsPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApplyModal: () => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  onNavigate,
  onOpenApplyModal,
}) => {
  const [registeredEvent, setRegisteredEvent] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'hackathon' | 'workshops' | 'admissions'>('all');

  const events = [
    {
      id: 'hackathon-finals',
      title: 'Annual Hackathon Grand Finals 2025–2026',
      date: 'November 14–16, 2025',
      time: '48-Hour Continuous Sprint',
      location: 'Silicon Valley Pitch Auditorium & Coding Labs',
      type: 'hackathon',
      badge: 'Major Championship',
      description:
        'Over 40 student teams pitch production full-stack web applications and AI tools directly to Silicon Valley angel investors and tech engineering leads.',
      highlights: ['$25,000 in Scholar Grants', 'Live Investor Judging Panel', 'Open to Public Attendance'],
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'spring-expo',
      title: 'Spring Coding & Innovation Exposition 2026',
      date: 'March 28, 2026',
      time: '10:00 AM – 4:30 PM PST',
      location: 'Campus Quad & Main Exhibition Hall',
      type: 'workshops',
      badge: 'Campus Showcase',
      description:
        'Middle and High School students demonstrate their semester software creations, IoT hardware integrations, and interactive web tools to families and recruiters.',
      highlights: ['Interactive Project Booths', 'Student Product Demos', 'Family Coding Workshops'],
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'open-house-tour',
      title: 'Spring Admissions Open House & Campus Tour',
      date: 'April 12, 2026',
      time: '1:00 PM – 4:00 PM PST',
      location: 'Welcome Center & Academic Labs',
      type: 'admissions',
      badge: 'Admissions Event',
      description:
        'Prospective students and parents tour our dual-monitor fiber coding labs, meet with faculty department heads, and attend our scholarship briefing.',
      highlights: ['Guided 45-min Campus Walk', 'Live Faculty Q&A', 'Admissions Portfolio Review'],
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'robotics-iot',
      title: 'Robotics & Web IoT Micro-Controller Tournament',
      date: 'May 9, 2026',
      time: '9:00 AM – 3:00 PM PST',
      location: 'Robotics & Hardware Center',
      type: 'hackathon',
      badge: 'Hardware Competition',
      description:
        'Student-engineered autonomous rovers, web-controlled sensors, and home automation systems compete in an obstacle-navigation arena.',
      highlights: ['Obstacle Course Arena', 'Micro-Python & C++ Circuits', 'Trophy Awards Ceremony'],
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    }
  ];

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.type === filter);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. EVENTS HERO */}
      <section className="pt-12 pb-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-blue-950 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>School Hackathons, Expos & Open Days</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B2347] tracking-tight font-display">
            Upcoming Events & Tech Summits
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
            Experience student energy firsthand. Join our signature 48-hour hackathons, seasonal project expos, and prospective family open house days.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === 'all' ? 'bg-[#0B2347] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('hackathon')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === 'hackathon' ? 'bg-[#0B2347] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hackathons & Tournaments
            </button>
            <button
              onClick={() => setFilter('workshops')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === 'workshops' ? 'bg-[#0B2347] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Expositions & Demos
            </button>
            <button
              onClick={() => setFilter('admissions')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === 'admissions' ? 'bg-[#0B2347] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Admissions Open Days
            </button>
          </div>
        </div>
      </section>

      {/* 2. EVENTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden hover:border-[#0B2347] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-[#0B2347] text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md">
                    {evt.badge}
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-bold">
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <Calendar className="w-4 h-4" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {evt.time}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#0B2347] font-display">
                    {evt.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{evt.location}</span>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    {evt.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7 pt-0 border-t border-slate-100 flex items-center justify-between">
                {registeredEvent === evt.id ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>RSVP Confirmed! Badge emailed.</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setRegisteredEvent(evt.id)}
                    className="px-6 py-2.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>RSVP / Register Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => onNavigate('contact')}
                  className="text-xs font-bold text-slate-500 hover:text-[#0B2347] transition-colors"
                >
                  Event Inquiries
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INVITE & PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-[#0B2347] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border-2 border-amber-400/30">
          <div>
            <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
              INDUSTRY MENTORSHIP & SPONSORSHIPS
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display mt-1 text-white">
              Want to judge our Hackathon or host a technical workshop?
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Partner with WEB DEVELOPER School. We welcome software architects and technology founders as guest judges and project mentors.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="px-7 py-3 bg-white text-[#0B2347] hover:bg-amber-50 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            Partner With Our School
          </button>
        </div>
      </section>
    </div>
  );
};
