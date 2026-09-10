export type PageId = 'home' | 'about' | 'academics' | 'campus' | 'gallery' | 'events' | 'contact' | 'attendance';

export type PromoStage = 'logo' | 'name' | 'open' | 'preview_tour' | 'completed';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'off';

export interface StudentAttendanceRecord {
  id: string;
  name: string;
  rollNo: string;
  grade: string;
  avatar: string;
  yearMonth: string; // e.g. "2026-09"
  days: Record<number, AttendanceStatus>;
}

export interface AcademicProgram {
  id: string;
  title: string;
  badge: string;
  duration: string;
  gradeLevel: string;
  description: string;
  skills: string[];
  icon: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  department: string;
  qualification: string;
  bio: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'labs' | 'campus' | 'events' | 'sports';
  image: string;
  description: string;
  date: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  grade: string;
  quote: string;
  achievement: string;
  avatar: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
}

export interface EnvironmentCard {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
  targetPage: PageId;
}
