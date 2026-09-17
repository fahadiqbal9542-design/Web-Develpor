import React, { useState, useEffect, useRef } from 'react';
import { PageId, GalleryItem } from '../../types';
import { GALLERY_ITEMS } from '../../data/schoolData';
import { AddImageModal } from '../AddImageModal';
import { idbGet, savePersistentData, compressImage } from '../../utils/imageStorage';
import { syncSectionToSupabase } from '../../utils/supabase';
import {
  Play,
  Sparkles,
  X,
  ZoomIn,
  Calendar,
  ArrowRight,
  Plus,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface GalleryPageProps {
  onNavigate: (page: PageId) => void;
  onPlayPromo?: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Initial gallery state: removed default images as requested by user, persisted in localStorage & IndexedDB
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('webdev_gallery_photos');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  // Hydrate from IndexedDB for reliable lossless storage
  useEffect(() => {
    idbGet<GalleryItem[]>('webdev_gallery_photos').then((stored) => {
      if (stored && Array.isArray(stored)) {
        setGalleryItems(stored);
      }
    });
  }, []);

  const categories = [
    { id: 'all', label: 'All Campus Media' },
    { id: 'labs', label: 'Tech & Coding Labs' },
    { id: 'campus', label: 'Campus Architecture' },
    { id: 'events', label: 'Hackathons & Expos' },
    { id: 'sports', label: 'Sports & Athletics' },
  ];

  const handleAddImage = (newItem: GalleryItem) => {
    const updated = [newItem, ...galleryItems];
    setGalleryItems(updated);
    savePersistentData('webdev_gallery_photos', updated);
    syncSectionToSupabase('galleryPhotos', updated).catch(() => {});
    setNotification(`"${newItem.title}" added to gallery successfully!`);
    setTimeout(() => setNotification(null), 3500);
  };

  // Direct File Upload from Device (one or multiple photos)
  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setNotification('Processing and optimizing uploaded photo(s)...');

    const newItems: GalleryItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const compressed = await compressImage(file, 1200, 1200, 0.85);
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const formattedTitle = cleanName
          ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
          : `Campus Photo ${galleryItems.length + i + 1}`;

        newItems.push({
          id: `gal-${Date.now()}-${i}`,
          title: formattedTitle,
          category: (selectedCategory !== 'all' ? selectedCategory : 'labs') as any,
          image: compressed,
          description: 'Uploaded photo to WEB DEVELOPER Campus Gallery.',
          date: 'Academic Year 2026–2027',
        });
      } catch (err) {
        console.error('Failed to compress file:', err);
      }
    }

    if (newItems.length > 0) {
      const updated = [...newItems, ...galleryItems];
      setGalleryItems(updated);
      await savePersistentData('webdev_gallery_photos', updated);
      syncSectionToSupabase('galleryPhotos', updated).catch(() => {});
      setSelectedCategory('all');
      setNotification(`${newItems.length} photo(s) added to gallery successfully!`);
      setTimeout(() => setNotification(null), 3500);
    } else {
      setNotification('No valid image file found.');
      setTimeout(() => setNotification(null), 3000);
    }

    // Reset file input value so user can upload same file if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDeleteImage = (id: string) => {
    const updated = galleryItems.filter((item) => item.id !== id);
    setGalleryItems(updated);
    savePersistentData('webdev_gallery_photos', updated);
    syncSectionToSupabase('galleryPhotos', updated).catch(() => {});
    if (activeItem?.id === id) {
      setActiveItem(null);
    }
    setNotification('Image removed from gallery.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClearAll = () => {
    if (galleryItems.length === 0) return;
    setGalleryItems([]);
    savePersistentData('webdev_gallery_photos', []);
    syncSectionToSupabase('galleryPhotos', []).catch(() => {});
    setActiveItem(null);
    setNotification('All images removed from gallery.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRestoreSamples = async () => {
    setSelectedCategory('all');
    setGalleryItems(GALLERY_ITEMS);
    try {
      localStorage.setItem('webdev_gallery_photos', JSON.stringify(GALLERY_ITEMS));
    } catch (e) {
      console.error(e);
    }
    await savePersistentData('webdev_gallery_photos', GALLERY_ITEMS);
    setNotification('Sample gallery photos restored successfully!');
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredItems = selectedCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-16 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div
          id="gallery-notification-toast"
          className="fixed bottom-6 right-6 z-50 bg-blue-950 text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-amber-400/60 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* 1. HERO HEADER WITH PROMINENT "+ ADD IMAGE" BUTTON */}
      <section className="pt-12 pb-14 bg-white border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-blue-950 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Campus Infrastructure & Student Life</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight font-display">
            WEB DEVELOPER Campus Gallery
          </h1>

          <p className="mt-4 text-base sm:text-lg text-blue-900/80 leading-relaxed">
            Manage, upload, and tour high-resolution photographs of our software engineering laboratories, collaborative design studios, keynote halls, and campus grounds.
          </p>

          {/* TOP ACTION BUTTONS: PROMINENT "+ ADD IMAGE" BUTTON ON TOP */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {/* Main Gold "+ Add Image" Button */}
            <button
              id="top-add-image-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="px-7 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/35 flex items-center gap-2.5 transition-all hover:scale-105 border-2 border-amber-300"
            >
              <div className="w-5 h-5 rounded-full bg-blue-950 text-amber-400 flex items-center justify-center font-bold">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>+ Add Image</span>
            </button>

            {/* Remove All Images Button (visible if items exist) */}
            {galleryItems.length > 0 && (
              <button
                id="top-remove-all-images-btn"
                onClick={handleClearAll}
                className="px-5 py-3.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs sm:text-sm rounded-xl border border-red-200 transition-all flex items-center gap-2 shadow-xs"
                title="Remove all images from gallery"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Remove All Images</span>
              </button>
            )}

            {/* Load Sample Photos option if gallery is empty */}
            {galleryItems.length === 0 && (
              <button
                id="top-restore-samples-btn"
                onClick={handleRestoreSamples}
                className="px-4 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs sm:text-sm rounded-xl border border-blue-200 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-800" />
                <span>Load Sample Photos</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTERS & STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-blue-100">
          {/* Category Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`category-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-900 text-amber-300 shadow-md border-2 border-amber-400'
                    : 'bg-white text-blue-950 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900/80">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>
              {galleryItems.length} {galleryItems.length === 1 ? 'Photo' : 'Photos'} Total
            </span>
          </div>
        </div>
      </section>

      {/* 3. PHOTO GRID / EMPTY STATE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hidden File Input for Instant Device Upload */}
        <input
          ref={directFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleDirectFileUpload}
          className="hidden"
          id="direct-gallery-file-input"
        />

        {filteredItems.length === 0 ? (
          /* Professional Empty State */
          <div
            id="gallery-empty-state"
            className="text-center py-16 px-6 bg-white rounded-3xl border-2 border-dashed border-blue-200 max-w-2xl mx-auto shadow-sm"
          >
            <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-300 text-blue-950 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ImageIcon className="w-10 h-10 text-blue-950" />
            </div>
            <h3 className="text-2xl font-black text-blue-950 font-display">
              {galleryItems.length === 0 ? 'Campus Gallery is Ready for Photos' : 'No Photos in This Category'}
            </h3>
            <p className="mt-2 text-sm text-blue-900/80 max-w-md mx-auto leading-relaxed">
              {galleryItems.length === 0
                ? 'Click the button below to upload photos from your device, or restore the sample campus pictures.'
                : `There are currently no photos categorized under "${categories.find(c => c.id === selectedCategory)?.label}".`}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {/* 1. Direct device file picker */}
              <button
                id="empty-state-add-btn"
                type="button"
                onClick={() => directFileInputRef.current?.click()}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/30 flex items-center gap-2 border border-amber-300 transition-all hover:scale-105 cursor-pointer"
                title="Select image files from your computer or phone"
              >
                <Plus className="w-4 h-4 text-blue-950 stroke-[3]" />
                <span>Add Your First Image</span>
              </button>

              {/* 2. Or add with custom details modal */}
              <button
                id="empty-state-details-modal-btn"
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-3.5 bg-white hover:bg-slate-50 text-blue-950 font-bold text-xs sm:text-sm rounded-xl border-2 border-blue-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Add with Details Form</span>
              </button>

              {/* 3. Restore Sample Photos */}
              <button
                id="empty-state-restore-btn"
                type="button"
                onClick={handleRestoreSamples}
                className="px-5 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-xs sm:text-sm rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-900" />
                <span>Restore Sample Photos</span>
              </button>
            </div>
          </div>
        ) : (
          /* Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                id={`gallery-item-card-${item.id}`}
                onClick={() => setActiveItem(item)}
                className="group rounded-3xl overflow-hidden bg-white border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer flex flex-col relative"
              >
                <div className="relative h-56 overflow-hidden bg-blue-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center shadow-lg font-bold">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Category Pill on Top Left */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-950/90 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/40">
                    {item.category}
                  </div>

                  {/* Sleek Delete / Remove Button on Top Right */}
                  <button
                    id={`remove-photo-btn-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(item.id);
                    }}
                    title="Remove this photo"
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-lg transition-all hover:scale-110 flex items-center justify-center border border-white/40"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-800/70 font-semibold mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="font-bold text-base text-blue-950 font-display group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-blue-900/80 mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Bottom Quick Actions */}
                  <div className="mt-4 pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 group-hover:text-amber-600 flex items-center gap-1">
                      <span>View Full Size</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(item.id);
                      }}
                      className="text-red-600 hover:text-red-700 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. LIGHTBOX MODAL WITH OPTIONAL REMOVE ACTION */}
      {activeItem && (
        <div
          id="gallery-lightbox-modal"
          className="fixed inset-0 z-50 bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl w-full bg-blue-950 rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Control Bar in Lightbox */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                id="lightbox-delete-btn"
                onClick={() => handleDeleteImage(activeItem.id)}
                className="p-2 rounded-full bg-red-600/90 text-white hover:bg-red-600 border border-white/30 transition-colors flex items-center gap-1 px-3 text-xs font-bold"
                title="Remove this image"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Image</span>
              </button>
              <button
                id="lightbox-close-btn"
                onClick={() => setActiveItem(null)}
                className="p-2 rounded-full bg-blue-900/80 text-amber-300 hover:text-white border border-amber-400/40 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="w-full h-auto max-h-[65vh] object-contain"
              />
            </div>

            <div className="p-6 sm:p-8 bg-blue-950 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  {activeItem.category}
                </span>
                <span className="text-xs text-blue-200">{activeItem.date}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {activeItem.title}
              </h3>
              <p className="text-sm text-blue-200 mt-2">
                {activeItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD IMAGE MODAL COMPONENT */}
      <AddImageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddImage={handleAddImage}
      />

      {/* 6. VIRTUAL CAMPUS INVITATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-blue-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-400/30 shadow-2xl">
          <div>
            <h3 className="text-2xl font-bold font-display text-white">
              Prefer an In-Person Campus Visit?
            </h3>
            <p className="text-blue-200 text-sm mt-1 max-w-xl">
              Parents and prospective students can tour our live dual-screen coding stations, sit in on a real classroom session, and talk with the dean.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black rounded-xl text-sm shrink-0 flex items-center gap-2 border border-amber-300 shadow-lg shadow-amber-400/30"
          >
            <span>Book a Campus Tour</span>
            <ArrowRight className="w-4 h-4 text-blue-950" />
          </button>
        </div>
      </section>
    </div>
  );
};

