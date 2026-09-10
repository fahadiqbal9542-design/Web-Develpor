import { AcademicProgram, FacultyMember, GalleryItem, Testimonial, NewsItem } from '../types';
import founderProfileAvatar from '../assets/images/founder_profile_avatar_1788521375468.jpg';

export const SCHOOL_NAME = "WEB DEVELOPER";
export const SCHOOL_FULL_TITLE = "WEB DEVELOPER School of Technology & Innovation";
export const SCHOOL_MOTTO = "Code the Future. Build with Purpose.";
export const SCHOOL_ESTABLISHED = "2018";

export const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  {
    id: "prog-1",
    title: "Junior Web Foundations",
    badge: "Grades 6–8",
    duration: "Full Academic Year",
    gradeLevel: "Middle School",
    description: "Foundational logic, HTML5 structure, modern styling with CSS, and creative interactive animations using JavaScript.",
    skills: ["HTML5 & CSS3", "Visual Logic & Blocks", "JavaScript Basics", "Creative Web Design"],
    icon: "Code"
  },
  {
    id: "prog-2",
    title: "Modern Full-Stack Engineering",
    badge: "Grades 9–12",
    duration: "2-Year Diploma Track",
    gradeLevel: "High School",
    description: "Comprehensive industry curriculum covering React, Node.js, TypeScript, RESTful APIs, and cloud deployments.",
    skills: ["React & TypeScript", "Backend Architecture", "Databases & Cloud", "Git & CI/CD"],
    icon: "Layers"
  },
  {
    id: "prog-3",
    title: "UI/UX & Creative Computing",
    badge: "Elective Specialization",
    duration: "1 Semester",
    gradeLevel: "Grades 8–12",
    description: "Human-centered design systems, Figma prototyping, accessible digital interfaces, and modern frontend typography.",
    skills: ["Figma Design", "Design Systems", "Web Accessibility", "Interaction Design"],
    icon: "Palette"
  },
  {
    id: "prog-4",
    title: "AI & Next-Gen Web Systems",
    badge: "Advanced Honors",
    duration: "Full Academic Year",
    gradeLevel: "Senior Honors",
    description: "Integration of modern machine learning models, autonomous web agents, secure APIs, and responsive data visualizations.",
    skills: ["Generative AI APIs", "Full-Stack Security", "Data Visualization", "Production Testing"],
    icon: "Cpu"
  }
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: "fac-1",
    name: "Mushahid Web Developer",
    role: "Head of School & Principal",
    department: "Computer Science & Leadership",
    qualification: "Lead Full-Stack Software Engineer & Founder",
    bio: "Pioneering project-based STEM pedagogy that bridges theoretical computer science with real-world software engineering.",
    image: ""
  },
  {
    id: "fac-2",
    name: "Abdullah web developer",
    role: "Dean of Web Technologies",
    department: "Full Stack Engineering",
    qualification: "M.S. Software Engineering (Stanford), Ex-Tech Lead",
    bio: "Passionate about modern web architectures, distributed systems, and guiding students from their first line of code to production.",
    image: ""
  },
  {
    id: "fac-3",
    name: "Bilal web developer",
    role: "Director of UI/UX & Design Labs",
    department: "Creative Computing",
    qualification: "Master of Design (Rhode Island School of Design)",
    bio: "Specializing in design psychology, accessible interactive systems, and empowering students to design empathetic digital interfaces.",
    image: ""
  },
  {
    id: "fac-4",
    name: "Asad web developer",
    role: "Lead Systems & Cloud Instructor",
    department: "Cloud & DevSecOps",
    qualification: "B.S. Cybernetics, Certified Cloud Architect",
    bio: "Mentors student teams for international coding olympiads and oversees our high-speed student server cluster.",
    image: ""
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Mushahid web developer",
    category: "labs",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80",
    description: "Students collaborating on full-stack web applications in our 10Gbps fiber-connected main development hub.",
    date: "Spring 2026"
  },
  {
    id: "gal-2",
    title: "Abdullah web developer",
    category: "events",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80",
    description: "Over 40 student teams pitching live production web applications to Silicon Valley industry judges.",
    date: "Fall 2025"
  },
  {
    id: "gal-3",
    title: "Bilal web developer",
    category: "campus",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80",
    description: "A serene, quiet space equipped with reference technical libraries, private pairing pods, and digital resources.",
    date: "Academic Year"
  },
  {
    id: "gal-4",
    title: "Asad web developer",
    category: "labs",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
    description: "Where IoT web interfaces connect to physical hardware, automation circuits, and autonomous rovers.",
    date: "Winter 2025"
  },
  {
    id: "gal-5",
    title: "Campus Amphitheater & Keynote Hall",
    category: "campus",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    description: "Students attending a guest lecture on Artificial Intelligence and Future Web Protocols.",
    date: "January 2026"
  },
  {
    id: "gal-6",
    title: "Campus Athletic & Recreation Complex",
    category: "sports",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
    description: "Balanced minds require physical well-being. Our all-weather sports grounds and indoor gymnasium.",
    date: "Weekly Activities"
  },
  {
    id: "gal-7",
    title: "Student UI/UX Design Critique Session",
    category: "labs",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    description: "Interactive peer critique and design review for digital accessibility projects.",
    date: "February 2026"
  },
  {
    id: "gal-8",
    title: "Tech Expo & Community Demo Day",
    category: "events",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
    description: "Parents, alumni, and tech industry recruiters exploring student web projects and interactive demos.",
    date: "Annual Showcase"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    studentName: "Aarav Sharma",
    grade: "Class of 2025 (Now at MIT)",
    quote: "At WEB DEVELOPER School, we didn't just memorize syntax; we built real production web services that handled thousands of daily visits. The mentors believed in us from day one.",
    achievement: "Winner, National High School Web Innovation Cup",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "test-2",
    studentName: "Maya Lin",
    grade: "Grade 11 Student",
    quote: "The combination of deep computer science theory and modern frontend design gave me the confidence to launch my own open-source accessibility toolkit.",
    achievement: "12,000+ GitHub Stars on Student Project",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "test-3",
    studentName: "Zain Malik",
    grade: "Class of 2024 (Google Intern)",
    quote: "The hands-on coding labs and collaborative team culture at WEB DEVELOPER prepared me better than any standard school curriculum ever could.",
    achievement: "Youngest Google Summer of Code Contributor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
  }
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-1",
    title: "Admissions Open for Academic Year 2026–2027",
    date: "March 2026",
    category: "Admissions",
    summary: "Applications are now open for Middle & High School web engineering tracks. Merit-based coding scholarships available."
  },
  {
    id: "news-2",
    title: "WEB DEVELOPER Students Clinch 1st Place at Global Code Fest",
    date: "February 2026",
    category: "Achievement",
    summary: "Our senior full-stack team designed an automated solar power grid monitoring dashboard, winning the $10,000 grand prize."
  },
  {
    id: "news-3",
    title: "New 10Gbps AI & Cloud Research Lab Inaugurated",
    date: "January 2026",
    category: "Campus Update",
    summary: "Equipped with high-performance workstations and dedicated server racks to support deep web analytics and machine learning."
  }
];

export const SCHOOL_STATS = [
  { label: "Student Placement & University Acceptance", value: "99.4%" },
  { label: "Student-to-Mentor Ratio", value: "8:1" },
  { label: "Production Web Apps Built by Students", value: "450+" },
  { label: "National & Global Tech Awards Won", value: "68" }
];
