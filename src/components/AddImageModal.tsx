import React, { useState, useRef } from 'react';
import { GalleryItem } from '../types';
import { compressImage } from '../utils/imageStorage';
import {
  X,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (item: GalleryItem) => void;
}

export const AddImageModal: React.FC<AddImageModalProps> = ({
  isOpen,
  onClose,
  onAddImage,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'labs' | 'campus' | 'events' | 'sports'>('labs');
  const [date, setDate] = useState('Fall 2026');
  const [description, setDescription] = useState('');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    setError(null);
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      if (cleanName) {
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      setImageSrc(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setError('Please enter a valid image URL');
      return;
    }
    setImageSrc(urlInput.trim());
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) {
      setError('Please upload an image or provide an image link.');
      return;
    }

    const finalTitle = title.trim() || 'WEB DEVELOPER Campus Photo';

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: finalTitle,
      category,
      image: imageSrc,
      description: description.trim() || 'Campus photo from WEB DEVELOPER School.',
      date: date.trim() || 'Academic Year',
    };

    onAddImage(newItem);

    // Reset form
    setTitle('');
    setDescription('');
    setImageSrc('');
    setUrlInput('');
    setError(null);
    onClose();
  };

  return (
    <div
      id="add-image-modal-overlay"
      className="fixed inset-0 z-50 bg-blue-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="add-image-modal-card"
        className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-blue-100 my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Header: Royal Blue with Gold Accent */}
        <div className="bg-blue-950 px-6 py-5 text-white flex items-center justify-between border-b-2 border-amber-400/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-sm">
              <Upload className="w-5 h-5 text-blue-950" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display text-white">
                Add Image to Campus Gallery
              </h3>
              <p className="text-[11px] text-amber-300 font-semibold">
                Upload new campus photos, tech lab setups, or student events
              </p>
            </div>
          </div>
          <button
            id="close-add-image-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-blue-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 bg-white">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Method Toggle */}
          <div>
            <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
              Image Source *
            </label>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                id="toggle-file-upload-mode"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  uploadMode === 'file'
                    ? 'bg-blue-900 text-amber-300 border-2 border-amber-400 shadow-xs'
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </button>
              <button
                type="button"
                id="toggle-url-upload-mode"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  uploadMode === 'url'
                    ? 'bg-blue-900 text-amber-300 border-2 border-amber-400 shadow-xs'
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Image Web URL</span>
              </button>
            </div>

            {/* Upload Area: Drag & Drop + Click File Picker */}
            {uploadMode === 'file' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="gallery-file-input"
                />

                {!imageSrc ? (
                  <div
                    id="gallery-dropzone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-amber-400 bg-amber-50/60 scale-[1.01]'
                        : 'border-blue-200 hover:border-amber-400 hover:bg-blue-50/40 bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-950 mx-auto flex items-center justify-center mb-3">
                      <ImageIcon className="w-6 h-6 text-blue-950" />
                    </div>
                    <p className="text-sm font-bold text-blue-950">
                      Drag and drop your image here, or <span className="text-amber-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-blue-800/70 mt-1">
                      Supports JPG, PNG, WEBP, SVG (Max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-blue-950 group">
                    <img
                      src={imageSrc}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 text-blue-950 font-bold text-xs shadow-sm hover:bg-amber-300"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSrc('')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-sm hover:bg-red-500"
                      >
                        Remove Photo
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-blue-950/90 text-amber-300 text-[10px] font-bold border border-amber-400/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                      <span>Ready to Add</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="image-url-input-field"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/40"
                  >
                    Load
                  </button>
                </div>
                {imageSrc && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-blue-950">
                    <img
                      src={imageSrc}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => setImageSrc('')}
                        className="p-1 rounded-full bg-red-600 text-white hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1">
                Photo Title *
              </label>
              <input
                type="text"
                id="image-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI & Full-Stack Robotics Laboratory"
                className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-500" />
                  <span>Category</span>
                </label>
                <select
                  id="image-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs bg-white text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900"
                >
                  <option value="labs">Tech & Coding Labs</option>
                  <option value="campus">Campus Architecture</option>
                  <option value="events">Hackathons & Expos</option>
                  <option value="sports">Sports & Athletics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  <span>Date / Semester</span>
                </label>
                <input
                  type="text"
                  id="image-date-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Fall 2026 or Spring 2027"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 text-xs text-blue-950 focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-500" />
                <span>Description</span>
              </label>
              <textarea
                id="image-description-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief detail about what students or visitors see in this photo..."
                className="w-full px-3.5 py-2 rounded-xl border border-blue-200 text-xs text-blue-950 bg-white focus:ring-2 focus:ring-amber-400/50 focus:border-blue-900"
              />
            </div>
          </div>

          {/* Buttons: Gold Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-blue-100">
            <button
              type="button"
              id="cancel-add-image-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-blue-900 hover:bg-blue-50 border border-blue-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-image-btn"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-blue-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/30 transition-all flex items-center gap-1.5 border border-amber-300 hover:scale-[1.01]"
            >
              <Upload className="w-3.5 h-3.5 text-blue-950" />
              <span>Add Image to Gallery</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
