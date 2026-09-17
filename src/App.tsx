import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId, EnvironmentCard } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage, DEFAULT_ENVIRONMENT_CARDS } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { CampusPage } from './components/pages/CampusPage';
import { GalleryPage } from './components/pages/GalleryPage';
import { ContactPage } from './components/pages/ContactPage';
import { AttendancePage } from './components/pages/AttendancePage';
import { OnlineClassesPage } from './components/pages/OnlineClassesPage';
import { AdmissionModal } from './components/AdmissionModal';
import { DatabaseModal } from './components/DatabaseModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ScrollToTop } from './components/ScrollToTop';
import { FloatingSideContact } from './components/FloatingSideContact';
import { WebsiteLockScreen } from './components/WebsiteLockScreen';
import founderProfileAvatar from './assets/images/founder_profile_avatar_1788521375468.jpg';
import { idbGet, savePersistentData } from './utils/imageStorage';
import { trackPageVisit } from './utils/visitorTracker';
import {
  syncSectionToSupabase,
  isSupabaseConfigured,
  pullFromSupabase,
  subscribeToSupabase
} from './utils/supabase';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Automatically track every page visited by any user in real-time
  useEffect(() => {
    trackPageVisit(activePage);
  }, [activePage]);

  // Master Website Lock State (defaults to unlocked so website content is immediately visible)
  const [isSiteUnlocked, setIsSiteUnlocked] = useState<boolean>(() => {
    try {
      const manuallyLocked = sessionStorage.getItem('webdev_site_manually_locked');
      if (manuallyLocked === 'true') return false;
      return true;
    } catch (e) {
      return true;
    }
  });

  const handleUnlockSite = () => {
    setIsSiteUnlocked(true);
    try {
      sessionStorage.removeItem('webdev_site_manually_locked');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLockSite = () => {
    setIsSiteUnlocked(false);
    try {
      sessionStorage.setItem('webdev_site_manually_locked', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  // Persistent Environment Cards state across all page transitions & reloads
  const [cards, setCards] = useState<EnvironmentCard[]>(() => {
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

  // Persistent Founder DP state
  const [founderDp, setFounderDp] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('webdev_founder_dp');
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return founderProfileAvatar;
  });

  // Persistent Faculty Images state across all page transitions & reloads
  const [facultyImages, setFacultyImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('webdev_faculty_images');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Async hydration from IndexedDB for zero-quota lossless storage
  useEffect(() => {
    idbGet<EnvironmentCard[]>('webdev_home_env_cards').then((stored) => {
      if (stored && Array.isArray(stored) && stored.length > 0) {
        const updated = stored.map((c) => {
          if (c.id === 'card-4' || c.title === 'Robotics & Micro-Controller Testing Center') {
            return { ...c, title: 'Asad web developer' };
          }
          return c;
        });
        setCards(updated);
        savePersistentData('webdev_home_env_cards', updated);
      }
    });
    idbGet<string>('webdev_founder_dp').then((stored) => {
      if (stored) {
        setFounderDp(stored);
      }
    });
    idbGet<Record<string, string>>('webdev_faculty_images').then((stored) => {
      if (stored && typeof stored === 'object') {
        setFacultyImages(stored);
      }
    });

    // Real-time Supabase listener
    if (isSupabaseConfigured()) {
      const unsub = subscribeToSupabase((payload) => {
        if (payload.envCards && Array.isArray(payload.envCards)) {
          setCards(payload.envCards);
          savePersistentData('webdev_home_env_cards', payload.envCards);
        }
        if (payload.founderDp) {
          setFounderDp(payload.founderDp);
          savePersistentData('webdev_founder_dp', payload.founderDp);
        }
        if (payload.facultyImages) {
          setFacultyImages(payload.facultyImages);
          savePersistentData('webdev_faculty_images', payload.facultyImages);
        }
      });
      return () => {
        unsub();
      };
    }
  }, []);

  const handleUpdateCardImage = (cardId: string, imageSrc: string) => {
    setCards((prev) => {
      const updated = prev.map((c) => (c.id === cardId ? { ...c, image: imageSrc } : c));
      savePersistentData('webdev_home_env_cards', updated);
      syncSectionToSupabase('envCards', updated).catch(() => {});
      return updated;
    });
  };

  const handleUpdateFounderDp = (imageSrc: string) => {
    setFounderDp(imageSrc);
    savePersistentData('webdev_founder_dp', imageSrc);
    syncSectionToSupabase('founderDp', imageSrc).catch(() => {});
  };

  const handleUpdateFacultyImage = (id: string, imageSrc: string) => {
    setFacultyImages((prev) => {
      const updated = { ...prev, [id]: imageSrc };
      savePersistentData('webdev_faculty_images', updated);
      syncSectionToSupabase('facultyImages', updated).catch(() => {});
      return updated;
    });
  };

  const handleRemoveFacultyImage = (id: string) => {
    setFacultyImages((prev) => {
      const updated = { ...prev };
      delete updated[id];
      savePersistentData('webdev_faculty_images', updated);
      syncSectionToSupabase('facultyImages', updated).catch(() => {});
      return updated;
    });
  };

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If website is locked, show the master lock screen
  if (!isSiteUnlocked) {
    return <WebsiteLockScreen onUnlock={handleUnlockSite} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-blue-950 selection:bg-amber-400 selection:text-blue-950">
      {/* 1. PERSISTENT WEBSITE HEADER */}
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenApplyModal={() => setIsApplyModalOpen(true)}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLockSite={handleLockSite}
      />

      {/* 2. MAIN PAGE CONTENT WITH SMOOTH TRANSITIONS */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activePage === 'home' && (
            <motion.div
              key="page-home"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <HomePage
                onNavigate={handleNavigate}
                onOpenApplyModal={() => setIsApplyModalOpen(true)}
                cards={cards}
                onUpdateCardImage={handleUpdateCardImage}
                founderDp={founderDp}
                onUpdateFounderDp={handleUpdateFounderDp}
              />
            </motion.div>
          )}

          {activePage === 'about' && (
            <motion.div
              key="page-about"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <AboutPage
                onNavigate={handleNavigate}
                onOpenApplyModal={() => setIsApplyModalOpen(true)}
                facultyImages={facultyImages}
                onUpdateFacultyImage={handleUpdateFacultyImage}
                onRemoveFacultyImage={handleRemoveFacultyImage}
              />
            </motion.div>
          )}

          {activePage === 'campus' && (
            <motion.div
              key="page-campus"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <CampusPage
                onNavigate={handleNavigate}
                onOpenApplyModal={() => setIsApplyModalOpen(true)}
              />
            </motion.div>
          )}

          {activePage === 'gallery' && (
            <motion.div
              key="page-gallery"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <GalleryPage
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {activePage === 'classes' && (
            <motion.div
              key="page-classes"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <OnlineClassesPage
                onNavigate={handleNavigate}
                onOpenApplyModal={() => setIsApplyModalOpen(true)}
              />
            </motion.div>
          )}

          {activePage === 'contact' && (
            <motion.div
              key="page-contact"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <ContactPage onNavigate={handleNavigate} />
            </motion.div>
          )}

          {activePage === 'attendance' && (
            <motion.div
              key="page-attendance"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <AttendancePage
                onNavigate={handleNavigate}
                onOpenDatabaseModal={() => setIsDbModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. WEBSITE FOOTER */}
      <Footer
        onNavigate={handleNavigate}
        onOpenApplyModal={() => setIsApplyModalOpen(true)}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLockSite={handleLockSite}
      />

      {/* 5. ADMISSIONS APPLICATION MODAL */}
      <AdmissionModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      {/* 6. SCROLL TO TOP FLOATING BUTTON */}
      <ScrollToTop />

      {/* 7. FLOATING RIGHT SIDE CONTACT DOCK (PHONE, EMAIL, LOCATION, DATABASE, LOCK, ADMIN) */}
      <FloatingSideContact
        onNavigate={handleNavigate}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLockSite={handleLockSite}
      />

      {/* 8. DATABASE & VERCEL BACKUP MODAL */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onDatabaseRestored={() => {
          window.location.reload();
        }}
      />

      {/* 9. ADMIN DASHBOARD & VISITOR PAGE TRACKING PORTAL */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onOpenDatabaseModal={() => setIsDbModalOpen(true)}
        onLockSite={handleLockSite}
      />
    </div>
  );
}
