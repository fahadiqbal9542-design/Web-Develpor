import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  Camera,
  Upload,
  Plus,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { compressImage, savePersistentData, loadPersistentData } from '../../utils/imageStorage';
import { syncSectionToSupabase } from '../../utils/supabase';

interface CampusPageProps {
  onNavigate: (page: PageId) => void;
  onOpenApplyModal: () => void;
}

export interface CampusFacility {
  id: string;
  name: string;
  category: string;
  capacity: string;
  description: string;
  specs: string[];
  image: string;
}

export const DEFAULT_CAMPUS_FACILITIES: CampusFacility[] = [
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
    id: 'abdullah',
    name: 'Abdullah web developer Coding Studio',
    category: 'Cloud & AI Innovation Core',
    capacity: '28 Dedicated Workstations • 4 Scrum Pods',
    description:
      'Ultra-fast cloud infrastructure and full-stack software development studio equipped with containerized sandboxes, AI GPU clusters, and live code review projection walls.',
    specs: ['Cloud Sandbox Clusters', 'Full-Stack Workstations', 'M3 Max Testing Pods', 'Live Code Collaboration Wall'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
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

export const CampusPage: React.FC<CampusPageProps> = ({
  onNavigate,
  onOpenApplyModal,
}) => {
  const [facilities, setFacilities] = useState<CampusFacility[]>(() => {
    try {
      const saved = localStorage.getItem('webdev_campus_facilities');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure abdullah facility is present if not already
        const hasAbdullah = parsed.some((f: CampusFacility) => f.id === 'abdullah');
        if (!hasAbdullah) {
          const abdullahFac = DEFAULT_CAMPUS_FACILITIES.find(f => f.id === 'abdullah');
          if (abdullahFac) {
            parsed.splice(1, 0, abdullahFac);
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CAMPUS_FACILITIES;
  });

  const [activeFacility, setActiveFacility] = useState<string>('labs');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddFacilityModalOpen, setIsAddFacilityModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Hidden file input for direct photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load async from IndexedDB on mount
  useEffect(() => {
    loadPersistentData<CampusFacility[]>('webdev_campus_facilities', DEFAULT_CAMPUS_FACILITIES).then((data) => {
      if (data && data.length > 0) {
        const hasAbdullah = data.some((f) => f.id === 'abdullah');
        if (!hasAbdullah) {
          const abdullahFac = DEFAULT_CAMPUS_FACILITIES.find(f => f.id === 'abdullah');
          if (abdullahFac) {
            data.splice(1, 0, abdullahFac);
          }
        }
        setFacilities(data);
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateFacilityImage = async (facilityId: string, newImage: string) => {
    const updated = facilities.map((fac) => {
      if (fac.id === facilityId) {
        return { ...fac, image: newImage };
      }
      return fac;
    });
    setFacilities(updated);
    await savePersistentData('webdev_campus_facilities', updated);
    syncSectionToSupabase('campusFacilities', updated).catch(() => {});
    showToast('Facility image updated and saved permanently!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processing & compressing image...');
      const compressed = await compressImage(file, 1400, 1000, 0.85);
      await handleUpdateFacilityImage(activeFacility, compressed);
    } catch (err) {
      console.error(err);
      showToast('Failed to upload image. Please try another file.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyCustomUrl = async () => {
    if (!customImageUrl.trim()) return;
    await handleUpdateFacilityImage(activeFacility, customImageUrl.trim());
    setCustomImageUrl('');
    setIsImageModalOpen(false);
  };

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
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
          <div className="flex flex-wrap gap-2">
            {facilities.map((fac) => (
              <button
                key={fac.id}
                onClick={() => setActiveFacility(fac.id)}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeFacility === fac.id
                    ? 'bg-[#0B2347] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {fac.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsAddFacilityModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Facility</span>
          </button>
        </div>

        {/* Selected Facility Card */}
        <div className="rounded-3xl bg-white border-2 border-slate-200 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 relative">
          <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[380px] group">
            <img
              src={currentFacility.image}
              alt={currentFacility.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute top-4 left-4 bg-[#0B2347]/90 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-xl backdrop-blur-xs shadow-md">
              {currentFacility.category}
            </div>

            {/* Direct Add / Change Image Button right on the photo */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                type="button"
                id="facility-add-img-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-[#0B2347]/90 hover:bg-[#0B2347] text-white hover:text-amber-300 text-xs font-bold rounded-xl shadow-lg backdrop-blur-md transition-all flex items-center gap-2 hover:scale-105 cursor-pointer border border-white/20"
                title="Upload or change image for this lab"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Add / Change Image</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl shadow-md text-xs font-bold transition-all hover:scale-105 cursor-pointer"
                title="Paste Image URL"
              >
                <Upload className="w-4 h-4 text-blue-900" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  {currentFacility.capacity}
                </span>
                {facilities.length > 2 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Remove "${currentFacility.name}" from campus facilities?`)) {
                        const filtered = facilities.filter(f => f.id !== currentFacility.id);
                        setFacilities(filtered);
                        setActiveFacility(filtered[0].id);
                        await savePersistentData('webdev_campus_facilities', filtered);
                        showToast('Facility removed.');
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Remove facility"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-[#0B2347] border border-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>Add Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-xs font-bold text-[#0B2347] hover:text-amber-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Schedule tour</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenApplyModal}
                className="px-5 py-2.5 bg-[#0B2347] hover:bg-[#123363] text-white font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Image URL / Upload Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0B2347] font-bold text-base font-display">
                <Camera className="w-5 h-5 text-amber-500" />
                <span>Add / Change Facility Image</span>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Image from Computer / Phone:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsImageModalOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full py-3.5 px-4 bg-amber-50 hover:bg-amber-100 border-2 border-dashed border-amber-300 rounded-2xl text-blue-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Choose Image File (Auto-Compressed)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] font-bold text-slate-400 uppercase">OR</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste Image URL (Unsplash, Web, etc.):
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  disabled={!customImageUrl.trim()}
                  className="px-5 py-2 bg-[#0B2347] text-white text-xs font-bold rounded-xl hover:bg-[#123363] disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Update Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Facility Modal */}
      {isAddFacilityModalOpen && (
        <AddFacilityModal
          onClose={() => setIsAddFacilityModalOpen(false)}
          onAdd={async (newFac) => {
            const updated = [newFac, ...facilities];
            setFacilities(updated);
            setActiveFacility(newFac.id);
            await savePersistentData('webdev_campus_facilities', updated);
            syncSectionToSupabase('campusFacilities', updated).catch(() => {});
            setIsAddFacilityModalOpen(false);
            showToast(`"${newFac.name}" added to campus facilities!`);
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2347] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-amber-400 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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

interface AddFacilityModalProps {
  onClose: () => void;
  onAdd: (facility: CampusFacility) => void;
}

const AddFacilityModal: React.FC<AddFacilityModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Academic Core');
  const [capacity, setCapacity] = useState('30 Workstations');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('10 Gbps Fiber, Dual 4K Displays, Linux Dev Environment, Hardware Debuggers');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80');
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const handleModalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1400, 1000, 0.85);
      setImage(compressed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const specs = specsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newFacility: CampusFacility = {
      id: `fac-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || 'Tech Facility',
      capacity: capacity.trim() || 'Workstation Space',
      description: description.trim() || 'Specialized educational facility designed for collaborative learning.',
      specs: specs.length > 0 ? specs : ['High-Speed Network', 'Modern Hardware'],
      image: image.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    };

    onAdd(newFacility);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#0B2347] font-bold text-base font-display">
            <Plus className="w-5 h-5 text-amber-500" />
            <span>Add New Campus Facility / Lab</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Facility / Lab Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Abdullah web developer Coding Studio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Cloud & AI Core"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Capacity / Tag</label>
              <input
                type="text"
                placeholder="e.g. 32 Workstations"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Facility Image</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Image URL..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30 text-xs"
              />
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl flex items-center gap-1 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>
            <input
              type="file"
              ref={modalFileInputRef}
              onChange={handleModalFile}
              accept="image/*"
              className="hidden"
            />
            {image && (
              <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-200">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Describe the environment, seating, and tools..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Technical Specifications (comma-separated)
            </label>
            <input
              type="text"
              placeholder="10 Gbps Fiber, Dual 4K Displays, M3 Macs"
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900/30"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0B2347] text-white font-bold rounded-xl hover:bg-[#123363] shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>Add Facility</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
