import React, { useState, useRef, useEffect } from 'react';
import { PageId } from '../../types';
import { FACULTY_MEMBERS, SCHOOL_MOTTO, SCHOOL_FULL_TITLE } from '../../data/schoolData';
import { compressImage, savePersistentData, idbGet } from '../../utils/imageStorage';
import {
  Sparkles,
  Award,
  Target,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Lightbulb,
  BookOpen,
  Camera,
  ImageIcon,
  Trash2,
  Upload,
  User
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApplyModal: () => void;
  facultyImages?: Record<string, string>;
  onUpdateFacultyImage?: (id: string, imageSrc: string) => void;
  onRemoveFacultyImage?: (id: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onOpenApplyModal,
  facultyImages: propFacultyImages,
  onUpdateFacultyImage,
  onRemoveFacultyImage,
}) => {
  const [internalFacultyImages, setInternalFacultyImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('webdev_faculty_images');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const facultyImages = propFacultyImages ?? internalFacultyImages;
  const [activeFacultyForUpload, setActiveFacultyForUpload] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate from IndexedDB for zero-quota lossless storage
  useEffect(() => {
    idbGet<Record<string, string>>('webdev_faculty_images').then((stored) => {
      if (stored && typeof stored === 'object') {
        setInternalFacultyImages(stored);
      }
    });
  }, []);

  const handleTriggerUpload = (facultyId: string) => {
    setActiveFacultyForUpload(facultyId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFacultyForUpload) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.85);
      if (onUpdateFacultyImage) {
        onUpdateFacultyImage(activeFacultyForUpload, compressed);
      } else {
        setInternalFacultyImages((prev) => {
          const updated = { ...prev, [activeFacultyForUpload]: compressed };
          savePersistentData('webdev_faculty_images', updated);
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const handleRemoveImage = (facultyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onRemoveFacultyImage) {
      onRemoveFacultyImage(facultyId);
    } else {
      setInternalFacultyImages((prev) => {
        const updated = { ...prev };
        delete updated[facultyId];
        savePersistentData('webdev_faculty_images', updated);
        return updated;
      });
    }
  };

  const milestones = [
    { year: "2018", title: "School Founded", desc: "Established with a groundbreaking mission: empowering middle and high school students with professional full-stack web engineering." },
    { year: "2020", title: "10Gbps Fiber Campus & Tech Lab", desc: "Constructed our dedicated Silicon Boulevard facility with ultra-fast dual-screen coding stations." },
    { year: "2022", title: "National STEM Accreditation", desc: "Recognized nationally for excellence in computational education and 100% college matriculation." },
    { year: "2024", title: "Global Hackathon Championship", desc: "Student team took 1st place in the International Junior Web Innovation Summit." },
    { year: "2026", title: "AI & Next-Gen Systems Lab", desc: "Inaugurated our autonomous agents and web intelligence research center." },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hidden file input for faculty card photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. HERO BANNER */}
      <section className="pt-12 pb-16 bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-blue-950 text-xs font-bold mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Accredited Academy of Web & Computational Sciences</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight font-display">
            About WEB DEVELOPER School
          </h1>

          <p className="mt-4 text-base sm:text-lg text-blue-900/80 leading-relaxed">
            {SCHOOL_FULL_TITLE} was founded on a singular conviction: young learners deserve access to the exact technologies, practices, and collaborative standards shaping the modern world.
          </p>

          <p className="mt-3 text-sm text-amber-600 font-mono font-bold">
            &ldquo;{SCHOOL_MOTTO}&rdquo;
          </p>
        </div>
      </section>

      {/* 2. MISSION, VISION & PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center mb-6 font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 font-display mb-3">
              Our Mission
            </h3>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              To cultivate world-class problem-solvers who wield code, design empathy, and computational architecture to engineer impactful solutions for humanity.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center mb-6 font-bold">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 font-display mb-3">
              Our Vision
            </h3>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              A future where every adolescent possesses the practical literacy to author digital platforms, launch web applications, and govern algorithmic systems responsibly.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center mb-6 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-blue-950 font-display mb-3">
              Our Pedagogy
            </h3>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              Project-driven mastery over standardized rote memorization. Every student maintains a public Git portfolio with live deployed production applications.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FACULTY & LEADERSHIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
            Mentors & Instructors
          </span>
          <h2 className="text-3xl font-black text-blue-950 font-display mt-1">
            Distinguished Faculty
          </h2>
          <p className="text-blue-900/80 text-sm mt-2">
            Educators who bring rigorous computer science academia and real-world tech industry leadership directly to the classroom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACULTY_MEMBERS.map((fac) => {
            const facImage = facultyImages[fac.id] || fac.image;
            return (
              <div
                key={fac.id}
                className="rounded-3xl bg-white border-2 border-blue-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Image Area or "Add Image" Placeholder */}
                  <div className="h-56 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                    {facImage ? (
                      <>
                        <img
                          src={facImage}
                          alt={fac.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-blue-950/90 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/40 shadow-sm">
                          {fac.department}
                        </div>
                        {/* Quick Action Overlay on Image */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleTriggerUpload(fac.id)}
                            className="px-3 py-1.5 bg-white text-blue-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md hover:bg-amber-50 cursor-pointer"
                            title="Change photo"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-600" />
                            <span>Change</span>
                          </button>
                          <button
                            onClick={(e) => handleRemoveImage(fac.id, e)}
                            className="p-1.5 bg-white text-red-600 rounded-lg text-xs font-bold shadow-md hover:bg-red-50 cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Clean empty state when image is removed */
                      <div
                        onClick={() => handleTriggerUpload(fac.id)}
                        className="w-full h-full border-2 border-dashed border-slate-300 hover:border-amber-400 bg-linear-to-b from-slate-50 to-blue-50/50 flex flex-col items-center justify-center p-4 cursor-pointer group transition-all"
                        title="Click to add image"
                      >
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-blue-950/90 text-amber-300 text-[10px] font-mono font-bold border border-amber-400/40 shadow-sm">
                          {fac.department}
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 group-hover:border-amber-400 group-hover:scale-105 transition-all flex items-center justify-center text-amber-600 mb-2">
                          <Camera className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-bold text-blue-950 group-hover:text-amber-600 transition-colors">
                          + Add Image
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Upload Mentor Photo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Faculty Details */}
                  <div className="p-6 pb-2">
                    <h3 className="text-lg font-bold text-blue-950 font-display">
                      {fac.name}
                    </h3>
                    <p className="text-xs font-bold text-amber-600">{fac.role}</p>
                    <p className="text-[11px] text-blue-800/70 mt-1">{fac.qualification}</p>
                    <p className="text-xs text-blue-900/80 leading-relaxed mt-3">
                      {fac.bio}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer: "Add Image" button */}
                <div className="p-6 pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTriggerUpload(fac.id)}
                    className="w-full py-2 px-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#0B2347] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                    title="Add or change image"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>{facImage ? 'Change Image' : 'Add Image'}</span>
                  </button>
                  {facImage && (
                    <button
                      onClick={(e) => handleRemoveImage(fac.id, e)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SCHOOL MILESTONES / TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-amber-400/30">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-widest">
              OUR JOURNEY
            </span>
            <h2 className="text-3xl font-bold font-display mt-1 text-white">
              Milestones of Growth
            </h2>
            <p className="text-blue-200 text-sm mt-2">
              From our first cohort of 24 young coders to an internationally acclaimed center of computational learning.
            </p>
          </div>

          <div className="relative border-l-2 border-blue-800 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-8">
            {milestones.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Node dot in Gold */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-amber-400 border-4 border-blue-950" />
                <span className="text-xs font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-blue-900 border border-amber-400/40">
                  {item.year}
                </span>
                <h4 className="text-lg font-bold font-display text-white mt-1">
                  {item.title}
                </h4>
                <p className="text-sm text-blue-200 mt-1 max-w-2xl">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-blue-950 text-white border-2 border-amber-400/30 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
            Want to learn more about our community?
          </h3>
          <p className="text-blue-200 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            View our modern coding laboratories in the gallery, or reach out to our admissions advisors directly.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-amber-300 border border-amber-400/50 font-bold rounded-xl text-sm shadow-xs flex items-center gap-2"
            >
              <span>View Campus Gallery</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={onOpenApplyModal}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black rounded-xl text-sm shadow-lg shadow-amber-400/30 flex items-center gap-2 border border-amber-300"
            >
              <GraduationCap className="w-4 h-4 text-blue-950" />
              <span>Apply for Admissions</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
