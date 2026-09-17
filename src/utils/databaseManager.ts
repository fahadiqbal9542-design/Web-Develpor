// Centralized Database & Backup Management for Web Developer School
// Handles full offline persistence (IndexedDB + LocalStorage) and seamless export/import for Vercel deployment & Supabase sync.

import { idbGet, idbSet, savePersistentData } from './imageStorage';
import {
  EnvironmentCard,
  StudentAttendanceRecord,
  GalleryItem,
  OnlineClass,
  CampusFacility,
  AdmissionApplication,
  ContactInquiry
} from '../types';

export interface DatabaseBackupPayload {
  version: string;
  exportedAt: string;
  app: string;
  data: {
    envCards: EnvironmentCard[];
    founderDp: string;
    facultyImages: Record<string, string>;
    galleryPhotos: GalleryItem[];
    studentsAttendance: StudentAttendanceRecord[];
    onlineClasses: OnlineClass[];
    campusFacilities: CampusFacility[];
    admissions: AdmissionApplication[];
    inquiries: ContactInquiry[];
  };
}

export interface DatabaseStats {
  cardsCount: number;
  hasFounderDp: boolean;
  facultyImagesCount: number;
  galleryPhotosCount: number;
  studentsCount: number;
  onlineClassesCount: number;
  campusFacilitiesCount: number;
  admissionsCount: number;
  inquiriesCount: number;
  totalImagesCount: number;
  estimatedSizeKb: number;
}

// 1. Fetch current live database state across all sections
export async function getFullDatabasePayload(): Promise<DatabaseBackupPayload> {
  const [
    envCards,
    founderDp,
    facultyImages,
    galleryPhotos,
    studentsAttendance,
    onlineClasses,
    campusFacilities,
    admissions,
    inquiries
  ] = await Promise.all([
    idbGet<EnvironmentCard[]>('webdev_home_env_cards').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_home_env_cards') || '[]')
    ),
    idbGet<string>('webdev_founder_dp').then(
      (res) => res || localStorage.getItem('webdev_founder_dp') || ''
    ),
    idbGet<Record<string, string>>('webdev_faculty_images').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_faculty_images') || '{}')
    ),
    idbGet<GalleryItem[]>('webdev_gallery_photos').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_gallery_photos') || '[]')
    ),
    idbGet<StudentAttendanceRecord[]>('webdev_students_attendance').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_students_attendance') || '[]')
    ),
    idbGet<OnlineClass[]>('webdev_online_classes').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_online_classes') || '[]')
    ),
    idbGet<CampusFacility[]>('webdev_campus_facilities').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_campus_facilities') || '[]')
    ),
    idbGet<AdmissionApplication[]>('webdev_admissions').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_admissions') || '[]')
    ),
    idbGet<ContactInquiry[]>('webdev_inquiries').then(
      (res) => res || JSON.parse(localStorage.getItem('webdev_inquiries') || '[]')
    ),
  ]);

  return {
    version: '2.0',
    app: 'Web Developer School',
    exportedAt: new Date().toISOString(),
    data: {
      envCards: envCards || [],
      founderDp: founderDp || '',
      facultyImages: facultyImages || {},
      galleryPhotos: galleryPhotos || [],
      studentsAttendance: studentsAttendance || [],
      onlineClasses: onlineClasses || [],
      campusFacilities: campusFacilities || [],
      admissions: admissions || [],
      inquiries: inquiries || [],
    },
  };
}

// 2. Download Database JSON file directly
export async function downloadDatabaseBackup(): Promise<void> {
  const payload = await getFullDatabasePayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `webdev-school-database-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 3. Restore / Import Database JSON into IndexedDB + LocalStorage for all sections
export async function restoreDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid database format');
    }

    const data = parsed.data || parsed;

    if (data.envCards && Array.isArray(data.envCards)) {
      await savePersistentData('webdev_home_env_cards', data.envCards);
    }
    if (data.founderDp && typeof data.founderDp === 'string') {
      await savePersistentData('webdev_founder_dp', data.founderDp);
    }
    if (data.facultyImages && typeof data.facultyImages === 'object') {
      await savePersistentData('webdev_faculty_images', data.facultyImages);
    }
    if (data.galleryPhotos && Array.isArray(data.galleryPhotos)) {
      await savePersistentData('webdev_gallery_photos', data.galleryPhotos);
    }
    if (data.studentsAttendance && Array.isArray(data.studentsAttendance)) {
      await savePersistentData('webdev_students_attendance', data.studentsAttendance);
    }
    if (data.onlineClasses && Array.isArray(data.onlineClasses)) {
      await savePersistentData('webdev_online_classes', data.onlineClasses);
    }
    if (data.campusFacilities && Array.isArray(data.campusFacilities)) {
      await savePersistentData('webdev_campus_facilities', data.campusFacilities);
    }
    if (data.admissions && Array.isArray(data.admissions)) {
      await savePersistentData('webdev_admissions', data.admissions);
    }
    if (data.inquiries && Array.isArray(data.inquiries)) {
      await savePersistentData('webdev_inquiries', data.inquiries);
    }

    return true;
  } catch (err) {
    console.error('Database restore failed:', err);
    throw err;
  }
}

// 4. Calculate stats on currently stored database records across all sections
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const payload = await getFullDatabasePayload();
  const json = JSON.stringify(payload);
  const estimatedSizeKb = Math.round(new Blob([json]).size / 1024);

  let totalImagesCount = 0;
  if (payload.data.founderDp) totalImagesCount++;
  if (payload.data.envCards) {
    totalImagesCount += payload.data.envCards.filter((c) => !!c.image).length;
  }
  if (payload.data.facultyImages) {
    totalImagesCount += Object.keys(payload.data.facultyImages).length;
  }
  if (payload.data.galleryPhotos) {
    totalImagesCount += payload.data.galleryPhotos.filter((g) => !!g.image).length;
  }
  if (payload.data.studentsAttendance) {
    totalImagesCount += payload.data.studentsAttendance.filter((s) => !!s.avatar).length;
  }
  if (payload.data.onlineClasses) {
    totalImagesCount += payload.data.onlineClasses.filter((c) => !!c.image || !!c.instructorAvatar).length;
  }
  if (payload.data.campusFacilities) {
    totalImagesCount += payload.data.campusFacilities.filter((f) => !!f.image).length;
  }

  return {
    cardsCount: payload.data.envCards?.length || 0,
    hasFounderDp: !!payload.data.founderDp,
    facultyImagesCount: Object.keys(payload.data.facultyImages || {}).length,
    galleryPhotosCount: payload.data.galleryPhotos?.length || 0,
    studentsCount: payload.data.studentsAttendance?.length || 0,
    onlineClassesCount: payload.data.onlineClasses?.length || 0,
    campusFacilitiesCount: payload.data.campusFacilities?.length || 0,
    admissionsCount: payload.data.admissions?.length || 0,
    inquiriesCount: payload.data.inquiries?.length || 0,
    totalImagesCount,
    estimatedSizeKb,
  };
}
