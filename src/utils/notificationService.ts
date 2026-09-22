import { MedicalLead } from '../types';

export interface OverdueLeadInfo {
  lead: MedicalLead;
  hoursElapsed: number;
  daysElapsed: number;
  lastContactText: string;
  isOverdue: boolean;
}

const LAST_NOTIFIED_KEY = 'medcrm_last_notification_time';
const NOTIFICATION_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes cooldown between automatic browser alert spam

/**
 * Checks if a lead is in an active sales pipeline stage (not won, not lost)
 */
export function isLeadInActivePipeline(lead: MedicalLead): boolean {
  return lead.stage !== 'ganado' && lead.stage !== 'perdido';
}

/**
 * Parses the most recent contact timestamp from history or lastContactDate
 */
export function getLeadLastContactTime(lead: MedicalLead): number {
  // Check latest history entry
  if (lead.history && lead.history.length > 0) {
    const dates = lead.history
      .map((h) => {
        if (!h.date) return 0;
        const normalized = h.date.includes(' ') && !h.date.includes('T')
          ? h.date.replace(' ', 'T')
          : h.date;
        const parsed = Date.parse(normalized);
        return isNaN(parsed) ? 0 : parsed;
      })
      .filter((t) => t > 0);

    if (dates.length > 0) {
      return Math.max(...dates);
    }
  }

  // Fallback to lastContactDate (e.g. "2026-09-20")
  if (lead.lastContactDate) {
    const parts = lead.lastContactDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day, 12, 0, 0);
      return d.getTime();
    }
    const parsed = Date.parse(lead.lastContactDate);
    if (!isNaN(parsed)) return parsed;
  }

  // Fallback to createdAt
  if (lead.createdAt) {
    const parsed = Date.parse(lead.createdAt);
    if (!isNaN(parsed)) return parsed;
  }

  return Date.now() - 72 * 3600 * 1000;
}

/**
 * Analyzes whether the lead has passed the inactivity threshold (default 48 hours)
 */
export function getLeadOverdueInfo(
  lead: MedicalLead,
  thresholdHours: number = 48,
  currentTimeMs: number = Date.now()
): OverdueLeadInfo {
  const lastTime = getLeadLastContactTime(lead);
  const diffMs = Math.max(0, currentTimeMs - lastTime);
  const hoursElapsed = Math.floor(diffMs / (1000 * 60 * 60));
  const daysElapsed = Math.floor(hoursElapsed / 24);

  const isOverdue = isLeadInActivePipeline(lead) && hoursElapsed >= thresholdHours;

  let lastContactText = '';
  if (hoursElapsed < 1) {
    lastContactText = 'Hace menos de 1 hora';
  } else if (hoursElapsed < 24) {
    lastContactText = `Hace ${hoursElapsed}h`;
  } else if (daysElapsed === 1) {
    lastContactText = `Ayer (${hoursElapsed}h)`;
  } else {
    lastContactText = `Hace ${daysElapsed} días (${hoursElapsed}h)`;
  }

  return {
    lead,
    hoursElapsed,
    daysElapsed,
    lastContactText,
    isOverdue
  };
}

/**
 * Returns all active leads that have exceeded 48 hours without contact
 */
export function getOverdueLeads(
  leads: MedicalLead[],
  thresholdHours: number = 48,
  currentTimeMs: number = Date.now()
): OverdueLeadInfo[] {
  return leads
    .map((lead) => getLeadOverdueInfo(lead, thresholdHours, currentTimeMs))
    .filter((info) => info.isOverdue)
    .sort((a, b) => b.hoursElapsed - a.hoursElapsed); // Most critical first
}

/**
 * Check if the browser supports standard Web Notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  try {
    return Notification.permission;
  } catch {
    return 'denied';
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error solicitando permisos de notificación del navegador:', e);
    return 'denied';
  }
}

/**
 * Play a subtle dual-tone chime using Web Audio API
 */
export function playNotificationSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio autoplay might be suspended by browser until user gesture
  }
}

/**
 * Sends a native browser desktop/mobile notification if granted
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notification = new Notification(title, {
      icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230d9488"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return notification;
  } catch (e) {
    console.warn('Native notification failed to render:', e);
    return null;
  }
}

/**
 * Dispatches an alert for leads needing follow up (>48h)
 */
export function notifyStaleLeadsBrowserAlert(
  overdueLeads: OverdueLeadInfo[],
  isManualTrigger: boolean = false,
  onNavigateToLead?: (lead: MedicalLead) => void
): boolean {
  if (overdueLeads.length === 0) {
    if (isManualTrigger) {
      sendBrowserNotification('MedCRM: ¡Todo al día! ✅', {
        body: 'No hay prospectos médicos que superen las 48 horas sin actualización de contacto.'
      });
      playNotificationSound();
    }
    return false;
  }

  // Check cooldown if not manually triggered
  if (!isManualTrigger) {
    try {
      const last = localStorage.getItem(LAST_NOTIFIED_KEY);
      if (last && Date.now() - parseInt(last, 10) < NOTIFICATION_COOLDOWN_MS) {
        return false;
      }
    } catch {
      // ignore storage error
    }
  }

  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, Date.now().toString());
  } catch {
    // ignore
  }

  const mostOverdue = overdueLeads[0];
  const count = overdueLeads.length;

  let title = '';
  let body = '';

  if (count === 1) {
    title = `⚠️ MedCRM: ${mostOverdue.lead.doctorName} sin contacto`;
    body = `El ${mostOverdue.lead.doctorName} (${mostOverdue.lead.specialty} - ${mostOverdue.lead.sector || 'Manta'}) lleva ${mostOverdue.hoursElapsed}h sin actualización. ¡Haz seguimiento hoy!`;
  } else {
    title = `⚠️ MedCRM: ${count} prospectos sin contacto (+48h)`;
    body = `${mostOverdue.lead.doctorName} (${mostOverdue.hoursElapsed}h) y ${count - 1} médicos más requieren seguimiento urgente en el CRM.`;
  }

  const notif = sendBrowserNotification(title, {
    body,
    tag: 'stale-leads-alert',
    requireInteraction: true,
    onClick: () => {
      if (onNavigateToLead) {
        onNavigateToLead(mostOverdue.lead);
      }
    }
  });

  playNotificationSound();
  return !!notif;
}
