import React, { useState, useRef } from 'react';
import { PageId, GalleryItem, EnvironmentCard } from '../../types';
import { ACADEMIC_PROGRAMS, SCHOOL_STATS, TESTIMONIALS, NEWS_ITEMS } from '../../data/schoolData';
import campusBuildingPhoto from '../../assets/images/modern_school_campus_1788520124392.jpg';
import founderProfileAvatar from '../../assets/images/founder_profile_avatar_1788521375468.jpg';
import { compressImage, savePersistentData } from '../../utils/imageStorage';
import { AddImageModal } from '../AddImageModal';
import {
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  Trophy,
  Users,
  Compass,
  GraduationCap,
  Play,
  Monitor,
  Cpu,
  Layers,
  Palette,
  Phone,
  Calendar,
  Image as ImageIcon,
  Plus,
  Globe,
  Award,
  Camera,
  Lock
} from 'lucide-react';

export interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onPlayPromo?: () => void;
  onOpenApplyModal: () => void;
  cards?: EnvironmentCard[];
  onUpdateCardImage?: (cardId: string, imageSrc: string) => void;
  founderDp?: string;
  onUpdateFounderDp?: (imageSrc: string) => void;
}

export const DEFAULT_ENVIRONMENT_CARDS: EnvironmentCard[] = [
  {
    id: 'card-1',
    category: 'LABS',
    date: 'Spring 2026',
    title: 'Mushahid web developer',
    description: 'Students collaborating on full-stack web applications in our 10Gbps fiber-optic development lab.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    targetPage: 'campus'
  },
  {
    id: 'card-2',
    category: 'CLASSES',
    date: 'Fall 2025',
    title: 'Abdullah web developer',
    description: 'Over 40 student teams pitching live production web applications to Silicon Valley venture leaders.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    targetPage: 'classes'
  },
  {
    id: 'card-3',
    category: 'CAMPUS',
    date: 'Academic Year',
    title: 'Bilal web developer',
    description: 'A serene, quiet space equipped with reference technical libraries, private acoustic study pods, and research commons.',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    targetPage: 'campus'
  },
  {
    id: 'card-4',
    category: 'LABS',
    date: 'Winter 2025',
    title: 'Asad web developer',
    description: 'Where IoT web interfaces connect to physical hardware, automation circuits, and autonomous systems.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    targetPage: 'campus'
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onPlayPromo,
  onOpenApplyModal,
  cards: propCards,
  onUpdateCardImage,
  founderDp: propFounderDp,
  onUpdateFounderDp,
}) => {
  // Local state fallback if not managed at App level
  const [internalCards, setInternalCards] = useState<EnvironmentCard[]>(() => {
    try {
      const saved = localStorage.getItem('webdev_home_env_cards');
      if (saved) {
        const parsed: EnvironmentCard[] = JSON.parse(saved);
        return parsed.map((c) => {
          if (c.id === 'card-1' && c.title === 'High-Speed Dual-Monitor Coding Lab') {
            return { ...c, title: 'Mushahid web developer' };
          }
          if (c.id === 'card-2') {
            return {
              ...c,
              title: c.title === 'Annual Hackathon Grand Finals' ? 'Abdullah web developer' : c.title,
              targetPage: (c.targetPage as string) === 'events' ? 'classes' : c.targetPage
            };
          }
          if (c.id === 'card-3' && c.title === 'Modern Collaborative Library & Study Hub') {
            return { ...c, title: 'Bilal web developer' };
          }
          if (c.id === 'card-4' || c.title === 'Robotics & Micro-Controller Testing Center') {
            return { ...c, title: 'Asad web developer' };
          }
          return c;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ENVIRONMENT_CARDS;
  });

  const cards = propCards ?? internalCards;

  const [activeCardForUpload, setActiveCardForUpload] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const cardFileInputRef = useRef<HTMLInputElement>(null);

  const [internalFounderDp, setInternalFounderDp] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('webdev_founder_dp');
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return founderProfileAvatar;
  });
  const founderDp = propFounderDp ?? internalFounderDp;
  const dpFileInputRef = useRef<HTMLInputElement>(null);

  const handleDpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.85);
      if (onUpdateFounderDp) {
        onUpdateFounderDp(compressed);
      } else {
        setInternalFounderDp(compressed);
        savePersistentData('webdev_founder_dp', compressed);
      }
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const handleOpenAddImage = (cardId: string) => {
    setActiveCardForUpload(cardId);
    if (cardFileInputRef.current) {
      cardFileInputRef.current.click();
    }
  };

  const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCardForUpload) return;
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      if (onUpdateCardImage) {
        onUpdateCardImage(activeCardForUpload, compressed);
      } else {
        setInternalCards((prev) => {
          const updated = prev.map((c) =>
            c.id === activeCardForUpload ? { ...c, image: compressed } : c
          );
          savePersistentData('webdev_home_env_cards', updated);
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code2 className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-16 pb-20 overflow-x-hidden bg-white">
      {/* Hidden file input for card photo replacement */}
      <input
        type="file"
        ref={cardFileInputRef}
        onChange={handleCardFileChange}
        accept="image/*"
        className="hidden"
      />
      {/* Hidden file input for founder DP replacement */}
      <input
        type="file"
        ref={dpFileInputRef}
        onChange={handleDpFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. HERO SECTION (Seamless Panorama matching user screenshot) */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 min-h-[500px] lg:min-h-[560px] flex items-center">
        {/* Decorative Golden Laurel Branch on far left edge */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block opacity-40 pointer-events-none select-none z-10">
          <svg width="65" height="340" viewBox="0 0 65 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C28 90 28 250 12 340" stroke="#C88A2C" strokeWidth="2" opacity="0.6"/>
            {/* Leaves in rich warm gold matching screenshot */}
            <path d="M22 28C34 24 44 14 42 4C28 9 22 20 22 28Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M14 58C3 54 -4 44 -2 34C10 39 15 50 14 58Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M26 90C40 85 50 74 48 62C33 67 26 80 26 90Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M16 122C4 117 -3 106 -1 95C12 100 17 112 16 122Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M27 156C42 150 52 138 50 126C34 131 27 145 27 156Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M15 188C3 183 -4 172 -2 161C11 166 16 178 15 188Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M26 222C40 216 50 204 48 192C33 197 26 211 26 222Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M14 254C2 249 -5 238 -3 227C10 232 15 244 14 254Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M23 286C36 281 46 270 44 258C30 263 23 276 23 286Z" fill="#C88A2C" fillOpacity="0.55"/>
            <path d="M12 316C1 311 -6 300 -4 290C8 295 13 306 12 316Z" fill="#C88A2C" fillOpacity="0.55"/>
          </svg>
        </div>

        {/* Right Half: Campus Building Image with seamless gradient fade to the left */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[58%] xl:w-[60%] h-full pointer-events-none select-none overflow-hidden z-0">
          <img
            src={campusBuildingPhoto}
            alt="WEB DEVELOPER Modern Academy Campus Building"
            className="w-full h-full object-cover object-[70%_center] lg:object-center"
          />
          {/* Soft Left Feathering Gradient - blends photo into the white left half */}
          <div className="absolute inset-y-0 left-0 w-32 sm:w-64 lg:w-96 bg-gradient-to-r from-white via-white/85 to-transparent" />
          {/* Subtle bottom blend */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/30 to-transparent" />
          {/* On small mobile screens, an overall wash ensures text readability */}
          <div className="absolute inset-0 bg-white/75 sm:bg-transparent lg:hidden" />
        </div>

        {/* Left Half: Typography and Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 lg:py-16">
          <div className="max-w-xl lg:max-w-2xl relative pl-2 sm:pl-6">
            {/* 5 Dots Vertical Indicator from screenshot */}
            <div className="flex flex-col gap-1.5 mb-3.5">
              <span className="w-2 h-2 rounded-full bg-[#0B2347]" />
              <span className="w-2 h-2 rounded-full bg-[#0B2347]" />
              <span className="w-2 h-2 rounded-full bg-[#0B2347]" />
              <span className="w-2 h-2 rounded-full bg-[#0B2347]" />
              <span className="w-2 h-2 rounded-full bg-[#C88A2C]" />
            </div>

            {/* Blue Eyebrow Tag */}
            <div className="text-xs sm:text-sm font-extrabold text-[#0B2347] tracking-widest uppercase mb-2">
              WELCOME TO
            </div>

            {/* Main Title: WEB in Navy, DEVELOPER in Gold */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black tracking-tight leading-[1.06] font-display">
              <span className="text-[#0B2347]">WEB </span>
              <span className="text-[#B8860B]">DEVELOPER</span>
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-3 font-display">
              Modern Education For A Bright Future
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-4 max-w-lg">
              We provide a supportive and innovative learning environment where students grow, explore and achieve excellence.
            </p>

            {/* Action Buttons: Discover More & Contact Us */}
            <div className="pt-6 flex flex-wrap items-center gap-3.5">
              <button
                id="hero-discover-more-btn"
                onClick={() => onNavigate('about')}
                className="px-7 py-3 bg-[#0B2347] hover:bg-[#123363] text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Discover More</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-contact-us-btn"
                onClick={() => onNavigate('contact')}
                className="px-7 py-3 bg-white hover:bg-slate-50 text-[#0B2347] border border-slate-300 font-bold text-sm rounded-full shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#0B2347]" />
                <span>Contact Us</span>
              </button>

              <button
                id="hero-attendance-portal-btn"
                onClick={() => onNavigate('attendance')}
                className="px-6 py-3 bg-amber-50 hover:bg-amber-100 text-[#0B2347] border border-amber-300 font-bold text-sm rounded-full shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                title="Open Student Presence & Attendance Form"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Attendance Form</span>
              </button>
            </div>

            {/* 3 Trust Metrics underneath matching image */}
            <div className="pt-8 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-slate-100 mt-8 max-w-xl">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-[#0B2347] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#0B2347] leading-tight">Experienced</div>
                  <div className="text-[11px] text-slate-500 font-medium">Teachers</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Monitor className="w-8 h-8 text-[#B8860B] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#0B2347] leading-tight">Modern</div>
                  <div className="text-[11px] text-slate-500 font-medium">Classrooms</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-[#0B2347] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#0B2347] leading-tight">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "EXPLORE OUR ENVIRONMENT" SECTION (Exactly Matching image.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B2347] font-display">
            Explore Our Environment
          </h2>
          <div className="w-2 h-2 rounded-full bg-[#0B2347] mx-auto mt-2" />
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Image with Badge */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top-Left Category Badge (LABS, EVENTS, CAMPUS) */}
                  <div className="absolute top-3 left-3 bg-[#0B2347] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {card.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2.5">
                  {/* Date with Calendar icon */}
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{card.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base text-[#0B2347] font-display leading-snug">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: "Learn More →" button and "Add Image" button side by side */}
              <div className="p-5 pt-0 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onNavigate(card.targetPage)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-[#0B2347] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:border-blue-400"
                >
                  <Phone className="w-3 h-3 text-[#0B2347]" />
                  <span>Learn More</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleOpenAddImage(card.id)}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#0B2347] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                  title="Upload or change image for this card"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Add Image</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FOUR FEATURE STRIP (Smart Classrooms, Expert Teachers, Active Students, Global Standards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Smart Classrooms */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B2347] flex items-center justify-center shrink-0 border border-blue-100">
              <Monitor className="w-6 h-6 text-[#0B2347]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B2347] font-display">Smart Classrooms</h4>
              <p className="text-xs text-slate-500">Technology driven learning</p>
            </div>
          </div>

          {/* Feature 2: Expert Teachers */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B2347] font-display">Expert Teachers</h4>
              <p className="text-xs text-slate-500">Qualified & experienced</p>
            </div>
          </div>

          {/* Feature 3: Active Students */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B2347] flex items-center justify-center shrink-0 border border-blue-100">
              <GraduationCap className="w-6 h-6 text-[#0B2347]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B2347] font-display">Active Students</h4>
              <p className="text-xs text-slate-500">Join a vibrant community</p>
            </div>
          </div>

          {/* Feature 4: Global Standards */}
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B2347] flex items-center justify-center shrink-0 border border-blue-100">
              <Globe className="w-6 h-6 text-[#0B2347]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B2347] font-display">Global Standards</h4>
              <p className="text-xs text-slate-500">Education for the future</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACADEMIC PROGRAMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
            Curriculum & Specializations
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B2347] font-display">
            Designed for Modern Web Engineers
          </h2>
          <p className="text-slate-600 text-sm">
            From middle school visual logic to production-grade distributed full-stack web applications, our tracks cater to every age and experience tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ACADEMIC_PROGRAMS.map((prog) => (
            <div
              key={prog.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-[#0B2347] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0B2347] text-amber-300">
                    {prog.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {prog.duration}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0B2347] flex items-center justify-center font-bold">
                    {getProgramIcon(prog.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-[#0B2347] font-display">
                    {prog.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {prog.description}
                </p>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {prog.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Grade Level: <strong className="text-[#0B2347] font-bold">{prog.gradeLevel}</strong>
                </span>
                <button
                  onClick={onOpenApplyModal}
                  className="px-4 py-2 bg-[#0B2347] hover:bg-[#123363] text-white font-bold rounded-xl text-xs flex items-center gap-1 group transition-colors"
                >
                  <span>Enroll in Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRINCIPAL'S WELCOME STATEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B2347] rounded-3xl p-8 sm:p-12 text-white shadow-xl border-2 border-amber-400/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl mb-4 bg-slate-900">
                  <img
                    src={founderDp}
                    alt="Mushahid Web Developer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <button
                  onClick={() => dpFileInputRef.current?.click()}
                  className="absolute bottom-4 right-1 bg-amber-400 hover:bg-amber-300 text-[#0B2347] p-2 rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                  title="Upload or Change DP Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-bold text-lg font-display text-white">Mushahid Web Developer</h4>
              <p className="text-xs text-amber-300 font-bold">Head of School & Founder</p>
              <p className="text-[11px] text-blue-200 mt-1">Lead Full-Stack Software Engineer & Web Architect</p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                HEAD OF SCHOOL ADDRESS
              </span>
              <blockquote className="text-lg sm:text-xl text-blue-100 font-normal leading-relaxed italic">
                &ldquo;At WEB DEVELOPER School, we teach students that code is not merely a tool for employment; it is the modern literacy of problem-solving. When a student builds their first interactive web application, they realize they have the power to shape the digital world.&rdquo;
              </blockquote>
              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0B2347] font-black rounded-xl text-xs transition-all shadow-md"
                >
                  Read Our Full Story & Philosophy →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
            Voices of Our Alumni
          </span>
          <h2 className="text-3xl font-black text-[#0B2347] font-display mt-1">
            Real Stories, Real Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex flex-col justify-between hover:border-[#0B2347] transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={t.avatar}
                    alt={t.studentName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div>
                    <h4 className="font-bold text-[#0B2347] text-sm font-display">
                      {t.studentName}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold">{t.grade}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-[#0B2347]">
                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{t.achievement}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
