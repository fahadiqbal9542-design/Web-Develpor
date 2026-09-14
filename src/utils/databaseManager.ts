// Centralized Database & Backup Management for Web Developer School
// Handles full offline persistence (IndexedDB + LocalStorage) and seamless export/import for Vercel deployment.

import { idbGet, idbSet, savePersistentData } from './imageStorage';
import { EnvironmentCard, StudentAttendanceRecord, GalleryItem } from '../types';

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
  };
}

export interface DatabaseStats {
  cardsCount: number;
  hasFounderDp: boolean;
  facultyImagesCount: number;
  galleryPhotosCount: number;
  studentsCount: number;
  totalImagesCount: number;
  estimatedSizeKb: number;
}

// 1. Fetch current live database state across IndexedDB & LocalStorage
export async function getFullDatabasePayload(): Promise<DatabaseBackupPayload> {
  const [envCards, founderDp, facultyImages, galleryPhotos, studentsAttendance] = await Promise.all([
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
  ]);

  return {
    version: '1.0',
    app: 'Web Developer School',
    exportedAt: new Date().toISOString(),
    data: {
      envCards: envCards || [],
      founderDp: founderDp || '',
      facultyImages: facultyImages || {},
      galleryPhotos: galleryPhotos || [],
      studentsAttendance: studentsAttendance || [],
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

// 3. Restore / Import Database JSON into IndexedDB + LocalStorage
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

    return true;
  } catch (err) {
    console.error('Database restore failed:', err);
    throw err;
  }
}

// 4. Calculate stats on currently stored database records
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

  return {
    cardsCount: payload.data.envCards?.length || 0,
    hasFounderDp: !!payload.data.founderDp,
    facultyImagesCount: Object.keys(payload.data.facultyImages || {}).length,
    galleryPhotosCount: payload.data.galleryPhotos?.length || 0,
    studentsCount: payload.data.studentsAttendance?.length || 0,
    totalImagesCount,
    estimatedSizeKb,
  };
}
