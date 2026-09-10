import React, { useState } from 'react';
import { PageId } from '../../types';
import {
  MapPin,
  Wifi,
  Sparkles,
  Layers,
  Monitor,
  Cpu,
  Coffee,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CampusPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApplyModal: () => void;
}

export const CampusPage: React.FC<CampusPageProps> = ({
  onNavigate,
  onOpenApplyModal,
}) => {
  const [activeFacility, setActiveFacility] = useState<string>('labs');

  const facilities = [
    {
      id: 'labs',
      name: 'Mushahid web developer Coding Labs',
      category: 'Academic Core',
      capacity: '32 Workstations per Lab • 6 Dedicated Labs',
      description:
        'Equipped with 10Gbps symmetric fiber-optic backbones, dual 4K monitors, ergonomic Herman Miller seating, and isolated local development servers.',
      specs: ['10 Gbps Fiber', 'Dual 4K Displays', 'Linux & Mac Toolchains', 'Hardware Debuggers'],
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'library',
      name: 'Bilal web developer Library Hub',
      category: 'Research & Study',
      capacity: '180 Seats • 12 Private Pods',
      description:
        'A light-filled academic space offering reference technical literature, digital subscription databases (IEEE, ACM), acoustic privacy pods, and tea study bars.',
      specs: ['Acoustic Silence Zones', 'Whiteboard Collaboration Rooms', 'Digital IEEE/ACM Access', 'Device Charging Hubs'],
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'robotics',
      name: 'Asad web developer',
      category: 'Hardware & IoT',
      capacity: '4 Specialist Workbenches',
      description:
        'Where software interfaces meet physical circuitry. Features 3D rapid prototyping printers, oscilloscope analyzers, solder fume extractors, and robotic arenas.',
      specs: ['3D Printing Array', 'Soldering Stations', 'Arduino & Raspberry Pi Kits', 'Obstacle Testing Arena'],
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'auditorium',
      name: 'Silicon Valley Pitch & Hackathon Auditorium',
      category: 'Community & Events',
      capacity: '450 Seat Capacity',
      description:
        'A high-tier presentation hall with 8K LED stage walls, live multi-camera streaming capability, and surround sound acoustics for demo days and guest lectures.',
      specs: ['8K LED Video Wall', 'Multi-Cam Live Streaming', 'Acoustic Wall Treatment', 'Dual Podium Controls'],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'cafeteria',
      name: 'Clean Nutrition Dining Hall & Coffee Commons',
      category: 'Wellness & Dining',
      capacity: '300 Seating Capacity',
      description:
        'Farm-to-table organic meals prepared daily by certified chefs, barista-serviced specialty espresso drinks for senior students, and sunlit outdoor garden patios.',
      specs: ['Nutritious Balanced Menus', 'Allergen-Safe Stations', 'Espresso & Tea Bar', 'Outdoor Courtyard'],
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    }
  ];

  const currentFacility = facilities.find((f) => f.id === activeFacility) || facilities[0];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. CAMPUS HERO */}
      <section className="pt-12 pb-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-blue-950 text-xs font-bold mb-4">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Silicon Valley Educational District Campus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B2347] tracking-tight font-display">
            Modern Tech Campus Designed for Discovery
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
            Spanning over 15 acres of purpose-built architectural space, WEB DEVELOPER School blends cutting-edge computer laboratories with tranquil natural study courtyards.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="px-7 py-3.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book an In-Person Campus Tour</span>
            </button>
            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#0B2347] font-bold text-sm rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-2"
            >
              <span>View Media Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. CAMPUS SPECS QUICK STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-50 border-2 border-slate-200">
          <div className="text-center p-3">
            <div className="text-3xl font-black text-[#0B2347] font-display">15+</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Acres of Campus</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-black text-[#0B2347] font-display">10 Gbps</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Fiber Backbone</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-black text-[#0B2347] font-display">1:1</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Workstation Ratio</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl font-black text-[#0B2347] font-display">24/7</div>
            <div className="text-xs font-bold text-slate-600 mt-1 uppercase tracking-wider">Monitored Security</div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FACILITY VIEWER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B2347] font-display">
              Explore Our Campus Facilities
            </h2>
            <div className="w-2.5 h-2.5 bg-[#0B2347] rounded-full mt-2" />
          </div>
          <p className="text-slate-600 text-sm max-w-md">
            Select a facility below to inspect the specifications, technology toolchains, and student work environments.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 pb-2">
          {facilities.map((fac) => (
            <button
              key={fac.id}
              onClick={() => setActiveFacility(fac.id)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeFacility === fac.id
                  ? 'bg-[#0B2347] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {fac.name}
            </button>
          ))}
        </div>

        {/* Selected Facility Card */}
        <div className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[380px]">
            <img
              src={currentFacility.image}
              alt={currentFacility.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#0B2347]/90 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-xl backdrop-blur-xs">
              {currentFacility.category}
            </div>
          </div>

          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                {currentFacility.capacity}
              </span>
              <h3 className="text-2xl font-black text-[#0B2347] font-display">
                {currentFacility.name}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {currentFacility.description}
              </p>

              <div className="pt-2">
                <div className="text-xs font-bold text-[#0B2347] uppercase tracking-wider mb-2.5">
                  Technical Specifications:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {currentFacility.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onNavigate('contact')}
                className="text-xs font-bold text-[#0B2347] hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                <span>Schedule tour to this facility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenApplyModal}
                className="px-5 py-2.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAMPUS SAFETY & STANDARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-blue-50/60 border-2 border-blue-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B2347] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B2347]">Secure Gated Access</h4>
              <p className="text-xs text-slate-600 mt-1">
                Biometric access cards for all classrooms and 24/7 on-campus trained security personnel.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B2347] text-white flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B2347]">Air-Gapped Sandbox Labs</h4>
              <p className="text-xs text-slate-600 mt-1">
                Enterprise security student network isolated for ethical hacking and container tests.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0B2347] text-white flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B2347]">Wellness & Green Spaces</h4>
              <p className="text-xs text-slate-600 mt-1">
                Acreage devoted to landscaped gardens, sunlight exposure, and mental rejuvenation courtyards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
