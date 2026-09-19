export type PageId = 'home' | 'about' | 'classes' | 'campus' | 'gallery' | 'contact' | 'attendance' | 'admissions';

export interface OnlineClass {
  id: string;
  title: string;
  instructor: string;
  instructorRole?: string;
  instructorAvatar?: string;
  subject: string;
  schedule: string;
  duration?: string;
  status: 'live' | 'upcoming' | 'recorded';
  level: string;
  meetingUrl: string;
  image: string;
  description: string;
  enrolledStudentsCount: number;
  topics: string[];
}

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

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'hackathon' | 'workshops' | 'admissions' | string;
  badge: string;
  description: string;
  highlights: string[];
  image: string;
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

export interface AdmissionApplication {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  gradeApplying: string;
  priorExperience: string;
  notes?: string;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentGrade?: string;
  interestTrack?: string;
  message?: string;
  createdAt: string;
  status?: 'new' | 'contacted' | 'resolved';
  visitorSessionId?: string;
}

export interface PageVisitEvent {
  pageId: PageId;
  pageName: string;
  timestamp: string; // ISO string
  formattedTime: string;
  timeSpentSeconds?: number;
}

export interface VisitorSession {
  sessionId: string;
  visitorId: string;
  firstVisitedAt: string;
  lastActiveAt: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  screenResolution: string;
  language: string;
  referrer: string;
  history: PageVisitEvent[];
  pageViewsCount: number;
  contactSubmitted?: boolean;
}

