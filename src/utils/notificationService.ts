import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';

export interface OverdueLeadInfo {
  lead: MedicalLead;
  hoursElapsed: number;
  daysElapsed: number;
  lastContactText: string;
  isOverdue: boolean;
}

export type ImmediateUrgencyType = 
  | 'today_appointment'    // Cita/Demo para hoy
  | 'overdue_appointment'  // Cita/Demo vencida sin registrar resultado
  | 'overdue_followup'     // Fecha de próximo contacto vencida
  | 'high_priority_stale'  // Lead de Prioridad Alta sin contacto en >24h
  | 'overdue_contact';     // Sin contacto por >48h (o >threshold)

export interface ImmediateAttentionLeadInfo {
  lead: MedicalLead;
  type: ImmediateUrgencyType;
  title: string;
  description: string;
  badgeLabel: string;
  badgeColor: string;
  urgency: 'critical' | 'high' | 'medium';
  hoursElapsed: number;
}

export interface LeadStageChangeRecord {
  id: string;
  leadId: string;
  doctorName: string;
  specialty: string;
  clinicOrHospital?: string;
  fromStageId: StageId;
  fromStageName: string;
  toStageId: StageId;
  toStageName: string;
  timestamp: number;
  formattedTime: string;
  isWon?: boolean;
}

export interface NotificationPreferences {
  notifyStageChange: boolean;
  notifyImmediateAttention: boolean;
  notifyOverdueLeads: boolean;
  soundEnabled: boolean;
  thresholdHours: number;
}

const LAST_NOTIFIED_KEY = 'medcrm_last_notification_time';
const LAST_URGENT_NOTIFIED_KEY = 'medcrm_last_urgent_notification_time';
const NOTIFICATION_COOLDOWN_MS = 20 * 60 * 1000; // 20 minutes cooldown between automatic alerts
const RECENT_STAGE_CHANGES_KEY = 'medcrm_recent_stage_changes_v1';
const NOTIFICATION_PREFS_KEY = 'medcrm_notification_prefs_v1';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  notifyStageChange: true,
  notifyImmediateAttention: true,
  notifyOverdueLeads: true,
  soundEnabled: true,
  thresholdHours: 48
};

/**
 * Load user notification preferences from local storage
 */
export function loadNotificationPreferences(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Save user notification preferences
 */
export function saveNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): NotificationPreferences {
  try {
    const current = loadNotificationPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

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
 * Detects all leads requiring immediate attention:
 * 1. Demo appointments or calls scheduled for TODAY
 * 2. Follow-up dates that are overdue / past due
 * 3. High-priority leads without contact in >24h
 * 4. Leads overdue for +48h
 */
export function getImmediateAttentionLeads(
  leads: MedicalLead[],
  thresholdHours: number = 48,
  currentTimeMs: number = Date.now()
): ImmediateAttentionLeadInfo[] {
  const todayStr = new Date(currentTimeMs).toISOString().split('T')[0];
  const results: ImmediateAttentionLeadInfo[] = [];

  for (const lead of leads) {
    if (!isLeadInActivePipeline(lead)) continue;

    const overdueInfo = getLeadOverdueInfo(lead, thresholdHours, currentTimeMs);
    const hasFollowUp = !!lead.nextFollowUpDate;
    const isToday = hasFollowUp && lead.nextFollowUpDate === todayStr;
    const isPast = hasFollowUp && lead.nextFollowUpDate < todayStr;
    const isHighPriority = lead.priority === 'alta';

    // 1. Cita/Demo programada para HOY
    if (lead.stage === 'demo_agendada' && isToday) {
      results.push({
        lead,
        type: 'today_appointment',
        title: 'Demostración Agendada para HOY',
        description: `${lead.doctorName} tiene demo programada para hoy${lead.nextFollowUpTime ? ` a las ${lead.nextFollowUpTime}` : ''}. Prepara la videollamada o visita.`,
        badgeLabel: `Cita Hoy ${lead.nextFollowUpTime || ''}`.trim(),
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
        urgency: 'critical',
        hoursElapsed: overdueInfo.hoursElapsed
      });
      continue;
    }

    if (isToday) {
      results.push({
        lead,
        type: 'today_appointment',
        title: 'Próximo Contacto Pautado para HOY',
        description: `Contacto planificado hoy con ${lead.doctorName}${lead.nextFollowUpTime ? ` a las ${lead.nextFollowUpTime}` : ''}.`,
        badgeLabel: `Hoy ${lead.nextFollowUpTime || ''}`.trim(),
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
        urgency: 'critical',
        hoursElapsed: overdueInfo.hoursElapsed
      });
      continue;
    }

    // 2. Demo o seguimiento con fecha pasada vencida
    if (isPast) {
      const isDemo = lead.stage === 'demo_agendada';
      results.push({
        lead,
        type: isDemo ? 'overdue_appointment' : 'overdue_followup',
        title: isDemo ? 'Demostración Atrasada' : 'Seguimiento Atrasado',
        description: `La fecha acordada era ${lead.nextFollowUpDate}. No dejes enfriar el interés del ${lead.doctorName}.`,
        badgeLabel: `Venció ${lead.nextFollowUpDate}`,
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800',
        urgency: 'high',
        hoursElapsed: overdueInfo.hoursElapsed
      });
      continue;
    }

    // 3. Prioridad Alta sin contacto en >24 horas
    if (isHighPriority && overdueInfo.hoursElapsed >= 24) {
      results.push({
        lead,
        type: 'high_priority_stale',
        title: 'Lead Prioritario sin Contacto Reciente',
        description: `${lead.doctorName} está marcado con Prioridad Alta y lleva ${overdueInfo.hoursElapsed}h sin contacto comercial.`,
        badgeLabel: `Prioridad Alta (${overdueInfo.hoursElapsed}h)`,
        badgeColor: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800',
        urgency: 'critical',
        hoursElapsed: overdueInfo.hoursElapsed
      });
      continue;
    }

    // 4. Inactividad prolongada +48h
    if (overdueInfo.isOverdue) {
      results.push({
        lead,
        type: 'overdue_contact',
        title: `Sin Contacto Comercial (+${thresholdHours}h)`,
        description: `${lead.doctorName} acumula ${overdueInfo.hoursElapsed} horas sin actualización en el embudo.`,
        badgeLabel: `${overdueInfo.hoursElapsed}h inactivo`,
        badgeColor: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-200 dark:border-orange-800',
        urgency: overdueInfo.hoursElapsed >= 72 ? 'critical' : 'high',
        hoursElapsed: overdueInfo.hoursElapsed
      });
    }
  }

  // Sort: critical first, then high, then most hours elapsed
  return results.sort((a, b) => {
    const urgencyWeight = { critical: 3, high: 2, medium: 1 };
    const diff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
    if (diff !== 0) return diff;
    return b.hoursElapsed - a.hoursElapsed;
  });
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
 * Play subtle dual-tone or celebratory chimes using Web Audio API
 */
export function playNotificationSound(soundType: 'stage_change' | 'urgent' | 'won' | 'default' = 'default'): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (soundType === 'won') {
      // Celebratory cheerful arpeggio (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
      return;
    }

    if (soundType === 'urgent') {
      // Two-tone alerting chime (A5 - F5 - A5)
      const freqs = [880, 698.46, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.18);
      });
      return;
    }

    if (soundType === 'stage_change') {
      // Crisp two-tone ping (E5 -> B5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
      return;
    }

    // Default gentle bell (D5 -> A5)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

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
 * Sends a native browser desktop/mobile push notification if granted.
 * Integrates with Service Worker registration when available for PWA/Mobile reliability.
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    // If Service Worker registration is active, also trigger showNotification
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options
        }).catch(() => {});
      }).catch(() => {});
    }

    const notification = new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options
    });

    notification.onclick = () => {
      try {
        window.focus();
      } catch {}
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return notification;
  } catch (e) {
    // Fallback attempt via service worker if new Notification() is blocked
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          icon: '/pwa-192x192.png',
          ...options
        }).catch(() => {});
      }).catch(() => {});
    }
    console.warn('Native notification dispatch fallback:', e);
    return null;
  }
}

/**
 * Get recent stage changes log
 */
export function getRecentStageChanges(): LeadStageChangeRecord[] {
  try {
    const raw = localStorage.getItem(RECENT_STAGE_CHANGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Record a stage change in the local activity history
 */
export function addRecentStageChange(
  record: Omit<LeadStageChangeRecord, 'id' | 'timestamp' | 'formattedTime'>
): LeadStageChangeRecord {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];
  const newRecord: LeadStageChangeRecord = {
    ...record,
    id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    formattedTime: `${dateStr} ${timeStr}`
  };

  try {
    const current = getRecentStageChanges();
    const updated = [newRecord, ...current].slice(0, 30); // Keep last 30 changes
    localStorage.setItem(RECENT_STAGE_CHANGES_KEY, JSON.stringify(updated));
  } catch {}

  return newRecord;
}

/**
 * Clears the local stage changes history
 */
export function clearRecentStageChanges(): void {
  try {
    localStorage.removeItem(RECENT_STAGE_CHANGES_KEY);
  } catch {}
}

/**
 * Dispatches a native browser notification when a lead changes stage.
 * Customizes messaging, sound and visual flair based on the target stage.
 */
export function notifyLeadStageChange(
  lead: MedicalLead,
  previousStageId: StageId,
  newStageId: StageId,
  onNavigateToLead?: (lead: MedicalLead) => void
): boolean {
  if (previousStageId === newStageId) return false;

  const prefs = loadNotificationPreferences();
  const prevMeta = STAGES.find((s) => s.id === previousStageId);
  const newMeta = STAGES.find((s) => s.id === newStageId);

  const prevName = prevMeta?.name || previousStageId;
  const newName = newMeta?.name || newStageId;

  // Record stage change in recent logs
  addRecentStageChange({
    leadId: lead.id,
    doctorName: lead.doctorName,
    specialty: lead.specialty,
    clinicOrHospital: lead.clinicOrHospital,
    fromStageId: previousStageId,
    fromStageName: prevName,
    toStageId: newStageId,
    toStageName: newName,
    isWon: newStageId === 'ganado'
  });

  if (!prefs.notifyStageChange) return false;

  let title = '';
  let body = '';
  let soundType: 'stage_change' | 'urgent' | 'won' = 'stage_change';

  if (newStageId === 'ganado') {
    title = `🎉 ¡Venta Ganada! · ${lead.doctorName}`;
    body = `${lead.doctorName} (${lead.specialty}) cerró su suscripción por $${lead.estimatedValue || 99} USD. ¡Excelente logro comercial!`;
    soundType = 'won';
  } else if (newStageId === 'demo_agendada') {
    title = `📅 Demostración Agendada · ${lead.doctorName}`;
    body = `Cita demo confirmada con el ${lead.doctorName} (${lead.specialty}). Fecha: ${lead.nextFollowUpDate || 'Pendiente'}${lead.nextFollowUpTime ? ` a las ${lead.nextFollowUpTime}` : ''}.`;
    soundType = 'stage_change';
  } else if (newStageId === 'propuesta_enviada') {
    title = `📑 Propuesta Enviada · ${lead.doctorName}`;
    body = `Propuesta comercial de $${lead.estimatedValue || 99} USD enviada al ${lead.doctorName} (${lead.specialty}).`;
    soundType = 'stage_change';
  } else if (newStageId === 'contactado') {
    title = `💬 Primer Contacto · ${lead.doctorName}`;
    body = `Se inició contacto con ${lead.doctorName} (${lead.specialty}${lead.sector ? ` - ${lead.sector}` : ''}).`;
    soundType = 'stage_change';
  } else if (newStageId === 'perdido') {
    title = `📉 Lead Pospuesto · ${lead.doctorName}`;
    body = `El ${lead.doctorName} se movió a pospuesto/perdido.`;
    soundType = 'stage_change';
  } else {
    title = `🔄 Etapa Actualizada: ${lead.doctorName}`;
    body = `Movido de "${prevName}" ➔ "${newName}". Especialidad: ${lead.specialty}${lead.sector ? ` · ${lead.sector}` : ''}.`;
    soundType = 'stage_change';
  }

  const notif = sendBrowserNotification(title, {
    body,
    tag: `stage-change-${lead.id}`,
    onClick: () => {
      if (onNavigateToLead) {
        onNavigateToLead(lead);
      }
    }
  });

  if (prefs.soundEnabled) {
    playNotificationSound(soundType);
  }

  return !!notif;
}

/**
 * Dispatches an alert for leads requiring immediate attention
 * (today's demos, overdue followups, high-priority neglected leads)
 */
export function notifyImmediateAttentionLeads(
  urgentLeads: ImmediateAttentionLeadInfo[],
  isManualTrigger: boolean = false,
  onNavigateToLead?: (lead: MedicalLead) => void
): boolean {
  const prefs = loadNotificationPreferences();
  if (!prefs.notifyImmediateAttention && !isManualTrigger) return false;

  if (urgentLeads.length === 0) {
    if (isManualTrigger) {
      sendBrowserNotification('MedCRM: ¡Todo al día! ✅', {
        body: 'No hay citas pendientes para hoy ni seguimientos urgentes que requieran atención inmediata.'
      });
      if (prefs.soundEnabled) playNotificationSound('default');
    }
    return false;
  }

  // Check cooldown if not manually triggered
  if (!isManualTrigger) {
    try {
      const last = localStorage.getItem(LAST_URGENT_NOTIFIED_KEY);
      if (last && Date.now() - parseInt(last, 10) < NOTIFICATION_COOLDOWN_MS) {
        return false;
      }
    } catch {}
  }

  try {
    localStorage.setItem(LAST_URGENT_NOTIFIED_KEY, Date.now().toString());
  } catch {}

  const top = urgentLeads[0];
  const count = urgentLeads.length;

  let title = '';
  let body = '';

  if (count === 1) {
    title = `🚨 ${top.title}: ${top.lead.doctorName}`;
    body = `${top.description} (${top.lead.specialty} · ${top.lead.sector || top.lead.city || 'Ecuador'}).`;
  } else {
    title = `🚨 MedCRM: ${count} médicos requieren atención inmediata`;
    body = `${top.title}: ${top.lead.doctorName} (${top.lead.specialty}) y ${count - 1} más tienen citas o seguimientos pendientes hoy.`;
  }

  const notif = sendBrowserNotification(title, {
    body,
    tag: 'immediate-attention-alert',
    requireInteraction: true,
    onClick: () => {
      if (onNavigateToLead) {
        onNavigateToLead(top.lead);
      }
    }
  });

  if (prefs.soundEnabled) {
    playNotificationSound('urgent');
  }

  return !!notif;
}

/**
 * Dispatches an alert for leads needing follow up (>48h)
 */
export function notifyStaleLeadsBrowserAlert(
  overdueLeads: OverdueLeadInfo[],
  isManualTrigger: boolean = false,
  onNavigateToLead?: (lead: MedicalLead) => void
): boolean {
  const prefs = loadNotificationPreferences();
  if (!prefs.notifyOverdueLeads && !isManualTrigger) return false;

  if (overdueLeads.length === 0) {
    if (isManualTrigger) {
      sendBrowserNotification('MedCRM: ¡Todo al día! ✅', {
        body: 'No hay prospectos médicos que superen las 48 horas sin actualización de contacto.'
      });
      if (prefs.soundEnabled) playNotificationSound('default');
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
    } catch {}
  }

  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, Date.now().toString());
  } catch {}

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

  if (prefs.soundEnabled) {
    playNotificationSound('default');
  }

  return !!notif;
}

