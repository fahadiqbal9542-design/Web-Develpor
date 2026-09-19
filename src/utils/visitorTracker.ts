import { PageId, PageVisitEvent, VisitorSession } from '../types';
import { loadPersistentData, savePersistentData } from './imageStorage';
import { syncSectionToSupabase } from './supabase';

const STORAGE_KEY_VISITORS = 'webdev_visitor_history';
const STORAGE_KEY_CURRENT_SESSION = 'webdev_current_session_id';
const STORAGE_KEY_PERMANENT_VISITOR = 'webdev_unique_visitor_id';

const PAGE_NAMES: Record<PageId, string> = {
  home: 'Home Page',
  about: 'About School & Founder',
  campus: 'Campus Facilities & Labs',
  classes: 'Online Virtual Classes',
  gallery: 'Campus Gallery',
  attendance: 'Attendance Register',
  contact: 'Contact Us & Inquiries',
  admissions: 'Admissions Form & Portal'
};

// Helper: Detect Device Type
function getDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Helper: Detect Browser & OS
function getBrowserAndOS(): { browser: string; os: string } {
  if (typeof window === 'undefined') return { browser: 'Unknown', os: 'Unknown' };
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'OS';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome')) browser = 'Google Chrome';
  else if (ua.includes('Safari')) browser = 'Apple Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

// Get or create unique permanent visitor ID
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'vis_server';
  let vid = localStorage.getItem(STORAGE_KEY_PERMANENT_VISITOR);
  if (!vid) {
    vid = `v-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
    localStorage.setItem(STORAGE_KEY_PERMANENT_VISITOR, vid);
  }
  return vid;
}

// Get or create session ID (unique per tab or browser session)
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ses_server';
  let sid = sessionStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
  if (!sid) {
    sid = `ses-${Math.random().toString(36).substring(2, 7)}-${Date.now().toString(36)}`;
    sessionStorage.setItem(STORAGE_KEY_CURRENT_SESSION, sid);
  }
  return sid;
}

/**
 * Tracks a page visit whenever the user changes or opens any page on the website.
 */
export async function trackPageVisit(pageId: PageId): Promise<VisitorSession[]> {
  if (typeof window === 'undefined') return [];

  try {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const pageName = PAGE_NAMES[pageId] || pageId;

    const event: PageVisitEvent = {
      pageId,
      pageName,
      timestamp: now.toISOString(),
      formattedTime
    };

    const existingSessions = (await loadPersistentData<VisitorSession[]>(STORAGE_KEY_VISITORS, [])) || [];

    // Find current session or create new
    let sessionIndex = existingSessions.findIndex((s) => s.sessionId === sessionId);

    if (sessionIndex >= 0) {
      const current = existingSessions[sessionIndex];
      // Only append if the last page was different or more than 5 seconds ago
      const lastVisit = current.history[current.history.length - 1];
      const isDuplicateImmediate = lastVisit && lastVisit.pageId === pageId &&
        (Date.now() - new Date(lastVisit.timestamp).getTime() < 3000);

      if (!isDuplicateImmediate) {
        current.history.push(event);
        current.lastActiveAt = now.toISOString();
        current.pageViewsCount = (current.pageViewsCount || current.history.length);
      }
      existingSessions[sessionIndex] = current;
    } else {
      const { browser, os } = getBrowserAndOS();
      const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
      const ref = typeof document !== 'undefined' && document.referrer ? document.referrer : 'Direct / Bookmark';

      const newSession: VisitorSession = {
        sessionId,
        visitorId,
        firstVisitedAt: now.toISOString(),
        lastActiveAt: now.toISOString(),
        deviceType: getDeviceType(),
        browser,
        os,
        screenResolution: screenRes,
        language: navigator.language || 'en',
        referrer: ref,
        history: [event],
        pageViewsCount: 1,
        contactSubmitted: false
      };

      // Put latest session at the top
      existingSessions.unshift(newSession);
    }

    // Keep up to 200 visitor sessions to prevent oversized storage
    const trimmed = existingSessions.slice(0, 200);
    await savePersistentData(STORAGE_KEY_VISITORS, trimmed);

    // Background sync to Supabase if configured
    syncSectionToSupabase('visitorHistory' as any, trimmed).catch(() => {});

    // Notify any active components (like Admin Dashboard or Header)
    window.dispatchEvent(new CustomEvent('webdev:visitor_updated', { detail: { count: trimmed.length } }));

    return trimmed;
  } catch (err) {
    console.warn('Failed to track visitor page:', err);
    return [];
  }
}

/**
 * Marks that a contact inquiry was submitted during this visitor's session
 */
export async function markContactSubmittedInCurrentSession(): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    const sessions = (await loadPersistentData<VisitorSession[]>(STORAGE_KEY_VISITORS, [])) || [];
    const index = sessions.findIndex((s) => s.sessionId === sessionId);
    if (index >= 0) {
      sessions[index].contactSubmitted = true;
      await savePersistentData(STORAGE_KEY_VISITORS, sessions);
      syncSectionToSupabase('visitorHistory' as any, sessions).catch(() => {});
      window.dispatchEvent(new CustomEvent('webdev:visitor_updated'));
    }
  } catch (err) {
    console.warn('Failed to mark contact submitted:', err);
  }
}

/**
 * Fetches all tracked visitor sessions from local persistent storage
 */
export async function getAllVisitorSessions(): Promise<VisitorSession[]> {
  try {
    return (await loadPersistentData<VisitorSession[]>(STORAGE_KEY_VISITORS, [])) || [];
  } catch {
    return [];
  }
}

/**
 * Clears visitor history
 */
export async function clearAllVisitorSessions(): Promise<void> {
  try {
    await savePersistentData(STORAGE_KEY_VISITORS, []);
    syncSectionToSupabase('visitorHistory' as any, []).catch(() => {});
    window.dispatchEvent(new CustomEvent('webdev:visitor_updated', { detail: { count: 0 } }));
  } catch (err) {
    console.error('Failed to clear visitor history:', err);
  }
}
