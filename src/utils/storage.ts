import { MedicalLead, SpecialtyConversionMetric, WhatsAppTemplate, MedicalSpecialty, MedicalService } from '../types';
import { INITIAL_LEADS } from '../data/initialData';
import { DEFAULT_WHATSAPP_TEMPLATES } from '../data/whatsappTemplates';
import { SPECIALTIES_LIST } from '../data/specialties';
import { loadServices, saveServices } from '../data/servicesData';
import { formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';

const LEADS_STORAGE_KEY = 'medcrm_leads_v1';
const TEMPLATES_STORAGE_KEY = 'medcrm_templates_v4';

export function loadLeads(): MedicalLead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      saveLeads(INITIAL_LEADS);
      return INITIAL_LEADS;
    }
    const parsed: MedicalLead[] = JSON.parse(raw);
    let modified = false;
    const migrated = parsed.map((lead, idx) => {
      let updatedLead = { ...lead };

      // 1. Sanitize Phone Numbers to Ecuador +593 format
      if (updatedLead.phone) {
        let phoneStr = String(updatedLead.phone).trim();
        // If it has old Mexican prefix +52, strip or replace
        if (phoneStr.startsWith('+52') || phoneStr.startsWith('52')) {
          phoneStr = phoneStr.replace(/^\+?52\s?1?/, '');
        }
        const { displayPhone } = formatEcuadorPhoneForWhatsApp(phoneStr);
        if (displayPhone && displayPhone !== updatedLead.phone && displayPhone.startsWith('+593')) {
          updatedLead.phone = displayPhone;
          modified = true;
        } else if (!updatedLead.phone.startsWith('+593')) {
          const rawDigits = updatedLead.phone.replace(/\D/g, '');
          const lastNine = rawDigits.slice(-9);
          const standardPhone = `+593 9${lastNine.slice(-8)}`;
          updatedLead.phone = standardPhone;
          modified = true;
        }
      } else {
        updatedLead.phone = '+593 99 123 4567';
        modified = true;
      }

      // 2. Sanitize and Normalize Pricing Plans ($99 and $150 only)
      // Check if lead had old MXN/legacy prices (e.g. 2100, 2800, 1200, 2400 or > 150)
      const currentEstimated = Number(updatedLead.estimatedValue) || 99;
      const isTwoYearPlan = 
        currentEstimated === 150 || 
        currentEstimated >= 2000 || 
        updatedLead.serviceId === 'srv-base-2anos' || 
        (updatedLead.serviceName && (updatedLead.serviceName.includes('2 año') || updatedLead.serviceName.includes('150')));

      if (isTwoYearPlan) {
        if (updatedLead.estimatedValue !== 150) {
          updatedLead.estimatedValue = 150;
          modified = true;
        }
        if (updatedLead.serviceId !== 'srv-base-2anos') {
          updatedLead.serviceId = 'srv-base-2anos';
          modified = true;
        }
        if (updatedLead.serviceName !== 'Perfil Médico 2 años ($150)' && updatedLead.serviceName !== 'Consultorio Digital (2 años - $150)') {
          updatedLead.serviceName = 'Perfil Médico 2 años ($150)';
          modified = true;
        }
        if (updatedLead.paymentStatus === 'pagado' && updatedLead.paidAmount !== 150) {
          updatedLead.paidAmount = 150;
          modified = true;
        } else if (updatedLead.paidAmount > 150) {
          updatedLead.paidAmount = 150;
          modified = true;
        }
      } else {
        // 1 Year Plan ($99)
        if (updatedLead.estimatedValue !== 99 && updatedLead.estimatedValue !== 150) {
          updatedLead.estimatedValue = 99;
          modified = true;
        }
        if (!updatedLead.serviceId || updatedLead.serviceId !== 'srv-base-1ano') {
          updatedLead.serviceId = 'srv-base-1ano';
          modified = true;
        }
        if (!updatedLead.serviceName || updatedLead.serviceName.includes('2.100') || updatedLead.serviceName.includes('1.200') || updatedLead.serviceName.includes('2100') || updatedLead.serviceName.includes('1200')) {
          updatedLead.serviceName = 'Perfil Médico 1 año ($99)';
          modified = true;
        }
        if (updatedLead.paymentStatus === 'pagado' && updatedLead.paidAmount !== 99) {
          updatedLead.paidAmount = 99;
          modified = true;
        } else if (updatedLead.paidAmount > 99) {
          updatedLead.paidAmount = 99;
          modified = true;
        }
      }

      // 3. Location / Sector Sanitize for Ecuador
      if (!updatedLead.sector) {
        const match = INITIAL_LEADS.find(l => l.id === lead.id);
        const fallbackSectors = ['Centro', 'Jocay', 'La Pradera', 'Los Esteros', 'Tarqui', 'Barbasquillo'];
        updatedLead.sector = match?.sector || fallbackSectors[idx % fallbackSectors.length];
        modified = true;
      }
      if (!updatedLead.city || ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro'].includes(updatedLead.city)) {
        updatedLead.city = 'Manta';
        modified = true;
      }

      // 4. Priority
      if (!updatedLead.priority) {
        if (updatedLead.tags?.some(t => t.toLowerCase().includes('alta') || t.toLowerCase().includes('urgente'))) {
          updatedLead.priority = 'alta';
        } else if (updatedLead.tags?.some(t => t.toLowerCase().includes('vip'))) {
          updatedLead.priority = 'alta';
        } else if (idx % 3 === 0) {
          updatedLead.priority = 'alta';
        } else if (idx % 3 === 1) {
          updatedLead.priority = 'media';
        } else {
          updatedLead.priority = 'baja';
        }
        modified = true;
      }

      // 5. Order
      if (updatedLead.order === undefined) {
        updatedLead.order = idx;
        modified = true;
      }

      // 6. Sanitize Notes & History from legacy strings
      if (updatedLead.notes && (updatedLead.notes.includes('+52') || updatedLead.notes.includes('2100') || updatedLead.notes.includes('2800') || updatedLead.notes.includes('1200'))) {
        updatedLead.notes = updatedLead.notes
          .replace(/\+52/g, '+593')
          .replace(/\$2,?100|\$2\.100/g, '$150')
          .replace(/\$2,?800|\$2\.800/g, '$150')
          .replace(/\$1,?200|\$1\.200/g, '$99');
        modified = true;
      }

      return updatedLead;
    });

    if (modified) {
      saveLeads(migrated);
    }
    return migrated;
  } catch (e) {
    console.error('Error loading leads from storage', e);
    return INITIAL_LEADS;
  }
}

export function saveLeads(leads: MedicalLead[]): void {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Error saving leads to storage', e);
  }
}

export function resetLeadsToDefault(): MedicalLead[] {
  saveLeads(INITIAL_LEADS);
  return INITIAL_LEADS;
}

export function loadTemplates(): WhatsAppTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      saveTemplates(DEFAULT_WHATSAPP_TEMPLATES);
      return DEFAULT_WHATSAPP_TEMPLATES;
    }
    const parsed: WhatsAppTemplate[] = JSON.parse(raw);
    const enriched = parsed.map((t) => {
      const defaultTpl = DEFAULT_WHATSAPP_TEMPLATES.find((d) => d.id === t.id);
      return {
        ...t,
        attachments: (t.attachments && t.attachments.length > 0)
          ? t.attachments
          : (defaultTpl?.attachments || [])
      };
    });
    return enriched;
  } catch (e) {
    console.error('Error loading templates from storage', e);
    return DEFAULT_WHATSAPP_TEMPLATES;
  }
}

export function saveTemplates(templates: WhatsAppTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Error saving templates to storage', e);
  }
}

export function resetTemplatesToDefault(): WhatsAppTemplate[] {
  saveTemplates(DEFAULT_WHATSAPP_TEMPLATES);
  return DEFAULT_WHATSAPP_TEMPLATES;
}

// Format currency standard USD for Ecuador ($99 USD / $150 USD)
export function formatCurrency(amount: number): string {
  const safeNum = Math.round(Number(amount) || 0);
  return `$${safeNum} USD`;
}

// Compute specialty conversion analytics
export function computeSpecialtyAnalytics(leads: MedicalLead[]): SpecialtyConversionMetric[] {
  const map = new Map<MedicalSpecialty, { total: number; won: number; lost: number; inProgress: number; revenue: number }>();

  // Initialize with all predefined specialties that have at least one lead or present in system
  SPECIALTIES_LIST.forEach((spec) => {
    map.set(spec.name, { total: 0, won: 0, lost: 0, inProgress: 0, revenue: 0 });
  });

  leads.forEach((lead) => {
    if (!map.has(lead.specialty)) {
      map.set(lead.specialty, { total: 0, won: 0, lost: 0, inProgress: 0, revenue: 0 });
    }
    const current = map.get(lead.specialty)!;
    current.total += 1;
    if (lead.stage === 'ganado') {
      current.won += 1;
      current.revenue += (lead.paidAmount > 0 ? lead.paidAmount : lead.estimatedValue);
    } else if (lead.stage === 'perdido') {
      current.lost += 1;
    } else {
      current.inProgress += 1;
    }
  });

  const results: SpecialtyConversionMetric[] = [];
  map.forEach((data, specialty) => {
    if (data.total > 0) {
      const conversionRate = data.total > 0 ? (data.won / data.total) * 100 : 0;
      const averageTicket = data.won > 0 ? data.revenue / data.won : 0;
      results.push({
        specialty,
        totalLeads: data.total,
        wonLeads: data.won,
        lostLeads: data.lost,
        inProgressLeads: data.inProgress,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalRevenue: data.revenue,
        averageTicket: Math.round(averageTicket)
      });
    }
  });

  // Sort by highest conversion rate, then by total revenue
  return results.sort((a, b) => b.conversionRate - a.conversionRate || b.totalRevenue - a.totalRevenue);
}

export interface SectorConversionMetric {
  sector: string;
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
  totalRevenue: number;
}

// Compute location / sector conversion analytics
export function computeSectorAnalytics(leads: MedicalLead[]): SectorConversionMetric[] {
  const map = new Map<string, { total: number; won: number; revenue: number }>();

  leads.forEach((lead) => {
    const sec = lead.sector || 'Sin Sector';
    if (!map.has(sec)) {
      map.set(sec, { total: 0, won: 0, revenue: 0 });
    }
    const current = map.get(sec)!;
    current.total += 1;
    if (lead.stage === 'ganado') {
      current.won += 1;
      current.revenue += (lead.paidAmount > 0 ? lead.paidAmount : lead.estimatedValue);
    }
  });

  const results: SectorConversionMetric[] = [];
  map.forEach((data, sector) => {
    const rate = data.total > 0 ? (data.won / data.total) * 100 : 0;
    results.push({
      sector,
      totalLeads: data.total,
      wonLeads: data.won,
      conversionRate: Math.round(rate * 10) / 10,
      totalRevenue: data.revenue
    });
  });

  return results.sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalLeads - a.totalLeads);
}

export interface ServiceConversionMetric {
  serviceName: string;
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
  totalRevenue: number;
}

// Compute service conversion analytics
export function computeServiceAnalytics(leads: MedicalLead[]): ServiceConversionMetric[] {
  const map = new Map<string, { total: number; won: number; revenue: number }>();

  leads.forEach((lead) => {
    const srv = lead.serviceName || 'Sin Servicio';
    if (!map.has(srv)) {
      map.set(srv, { total: 0, won: 0, revenue: 0 });
    }
    const current = map.get(srv)!;
    current.total += 1;
    if (lead.stage === 'ganado') {
      current.won += 1;
      current.revenue += (lead.paidAmount > 0 ? lead.paidAmount : lead.estimatedValue);
    }
  });

  const results: ServiceConversionMetric[] = [];
  map.forEach((data, serviceName) => {
    const rate = data.total > 0 ? (data.won / data.total) * 100 : 0;
    results.push({
      serviceName,
      totalLeads: data.total,
      wonLeads: data.won,
      conversionRate: Math.round(rate * 10) / 10,
      totalRevenue: data.revenue
    });
  });

  return results.sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalLeads - a.totalLeads);
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  leadsCount: number;
  totalRevenue: number;
  triggerType?: 'manual' | 'interval' | 'daily_scheduled' | 'initial';
  data: BackupData;
}

export interface PlatformConfig {
  country: string;
  currency: string;
  defaultPhonePrefix: string;
  dailyAutoBackupEnabled: boolean;
  backupFrequency: 'interval' | 'daily_time';
  backupIntervalHours: number; // e.g. 1, 2, 4, 6, 12, 24
  backupScheduledTime: string; // e.g. "18:00"
  lastDailyBackupDate: string;
  lastBackupTimestamp: string;
  maxStoredSnapshots?: number;
}

export interface BackupData {
  version: string;
  exportDate: string;
  app: string;
  country: string;
  config: PlatformConfig;
  leads: MedicalLead[];
  templates: WhatsAppTemplate[];
  services?: MedicalService[];
}

const DAILY_SNAPSHOTS_KEY = 'medcrm_daily_snapshots_v1';
const PLATFORM_CONFIG_KEY = 'medcrm_platform_config_v1';

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  country: 'Ecuador',
  currency: 'USD',
  defaultPhonePrefix: '+593',
  dailyAutoBackupEnabled: true,
  backupFrequency: 'interval',
  backupIntervalHours: 4, // Every 4 hours default
  backupScheduledTime: '18:00', // 6:00 PM
  lastDailyBackupDate: '',
  lastBackupTimestamp: '',
  maxStoredSnapshots: 30
};

export function loadPlatformConfig(): PlatformConfig {
  try {
    const raw = localStorage.getItem(PLATFORM_CONFIG_KEY);
    if (!raw) return DEFAULT_PLATFORM_CONFIG;
    return { ...DEFAULT_PLATFORM_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PLATFORM_CONFIG;
  }
}

export function savePlatformConfig(config: PlatformConfig): void {
  try {
    localStorage.setItem(PLATFORM_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config', e);
  }
}

// Load daily snapshots
export function getDailySnapshots(): DailySnapshot[] {
  try {
    const raw = localStorage.getItem(DAILY_SNAPSHOTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// Save a daily snapshot and keep up to max stored backups
export function saveDailySnapshot(snapshot: DailySnapshot, maxKeep: number = 30): void {
  try {
    const existing = getDailySnapshots().filter((s) => s.timestamp !== snapshot.timestamp && s.date !== snapshot.date);
    const updated = [snapshot, ...existing].slice(0, maxKeep);
    localStorage.setItem(DAILY_SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving daily snapshot', e);
  }
}

// Check if a scheduled auto backup is due based on config
export function shouldPerformScheduledBackup(config: PlatformConfig): { shouldRun: boolean; reason: string } {
  if (!config.dailyAutoBackupEnabled) {
    return { shouldRun: false, reason: 'Respaldos automáticos desactivados' };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // If never backed up before
  if (!config.lastBackupTimestamp) {
    return { shouldRun: true, reason: 'Primer respaldo del sistema' };
  }

  const lastTime = new Date(config.lastBackupTimestamp).getTime();
  const currentTime = now.getTime();
  const elapsedHours = (currentTime - lastTime) / (1000 * 60 * 60);

  if (config.backupFrequency === 'interval') {
    const targetInterval = config.backupIntervalHours || 4;
    if (elapsedHours >= targetInterval) {
      return { shouldRun: true, reason: `Intervalo de ${targetInterval}h cumplido (${Math.round(elapsedHours * 10) / 10}h transcurridas)` };
    }
  } else if (config.backupFrequency === 'daily_time') {
    // Scheduled time comparison (e.g. 18:00)
    const [targetHour, targetMinute] = (config.backupScheduledTime || '18:00').split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Has it run today?
    if (config.lastDailyBackupDate !== todayStr) {
      if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
        return { shouldRun: true, reason: `Hora programada alcanzada (${config.backupScheduledTime})` };
      }
    }
  }

  return { shouldRun: false, reason: 'En espera del próximo horario programado' };
}

// Check and perform automatic backup (or manual save with force = true)
export function performDailyAutoBackup(
  leads: MedicalLead[], 
  templates: WhatsAppTemplate[],
  force: boolean = false,
  triggerType: 'manual' | 'interval' | 'daily_scheduled' | 'initial' = 'interval'
): { performed: boolean; date: string; message: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const nowIso = now.toISOString();
  const config = loadPlatformConfig();

  if (!force) {
    const check = shouldPerformScheduledBackup(config);
    if (!check.shouldRun) {
      return { performed: false, date: today, message: check.reason };
    }
  }

  const wonLeads = leads.filter((l) => l.stage === 'ganado');
  const totalRevenue = wonLeads.reduce((acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue), 0);

  const updatedConfig: PlatformConfig = {
    ...config,
    lastDailyBackupDate: today,
    lastBackupTimestamp: nowIso
  };

  const backupData: BackupData = {
    version: '2.0-ecuador',
    exportDate: nowIso,
    app: 'MedCRM Ecuador - Especialistas Médicos',
    country: 'Ecuador (+593)',
    config: updatedConfig,
    leads,
    templates,
    services: loadServices()
  };

  const snapshot: DailySnapshot = {
    date: today,
    timestamp: nowIso,
    leadsCount: leads.length,
    totalRevenue,
    triggerType: force ? 'manual' : triggerType,
    data: backupData
  };

  saveDailySnapshot(snapshot, config.maxStoredSnapshots || 30);
  savePlatformConfig(updatedConfig);

  return { 
    performed: true, 
    date: today, 
    message: force ? 'Respaldo manual completado' : `Respaldo automático programado completado (${now.toLocaleTimeString()})`
  };
}

// Full JSON Backup Export for cPanel / local offline backups
export function downloadBackupJSON(leads: MedicalLead[], templates: WhatsAppTemplate[], config?: PlatformConfig): void {
  const currentConfig = config || loadPlatformConfig();
  const today = new Date().toISOString().split('T')[0];

  const backup: BackupData = {
    version: '2.0-ecuador',
    exportDate: new Date().toISOString(),
    app: 'MedCRM Ecuador - Especialistas Médicos',
    country: 'Ecuador (+593)',
    config: {
      ...currentConfig,
      lastDailyBackupDate: today
    },
    leads,
    templates,
    services: loadServices()
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `respaldo_medcrm_ecuador_${today}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  // Also record this as today's backup
  performDailyAutoBackup(leads, templates);
}

// Full JSON Backup Import (Supports both data and platform configuration)
export function parseBackupJSON(jsonString: string): { 
  leads: MedicalLead[]; 
  templates?: WhatsAppTemplate[]; 
  services?: MedicalService[];
  config?: PlatformConfig;
  exportDate?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.leads)) {
      throw new Error('El archivo no contiene un formato de respaldo válido de MedCRM.');
    }
    if (Array.isArray(parsed.services) && parsed.services.length > 0) {
      saveServices(parsed.services);
    }
    return {
      leads: parsed.leads,
      templates: Array.isArray(parsed.templates) ? parsed.templates : undefined,
      services: Array.isArray(parsed.services) ? parsed.services : undefined,
      config: parsed.config,
      exportDate: parsed.exportDate
    };
  } catch (e: any) {
    throw new Error(e.message || 'Error al procesar el archivo JSON');
  }
}

// Export all medical leads to CSV (Excel compatible)
export function exportAllLeadsCSV(leads: MedicalLead[]): void {
  const headers = [
    'ID',
    'Médico',
    'Especialidad',
    'Clínica/Hospital',
    'WhatsApp/Teléfono',
    'Email',
    'Ciudad',
    'Etapa Embudo',
    'Valor Propuesta ($)',
    'Monto Cobrado ($)',
    'Estado de Pago',
    'Método de Pago',
    'Próximo Seguimiento',
    'Hora Seguimiento',
    'Fecha Cierre Esperada',
    'Fecha Registro',
    'Notas'
  ];

  const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const rows = leads.map((l) => [
    escapeCSV(l.id),
    escapeCSV(l.doctorName),
    escapeCSV(l.specialty),
    escapeCSV(l.clinicOrHospital),
    escapeCSV(l.phone),
    escapeCSV(l.email),
    escapeCSV(l.city || ''),
    escapeCSV(l.stage),
    l.estimatedValue,
    l.paidAmount,
    escapeCSV(l.paymentStatus),
    escapeCSV(l.paymentMethod),
    escapeCSV(l.nextFollowUpDate),
    escapeCSV(l.nextFollowUpTime || ''),
    escapeCSV(l.expectedClosingDate || ''),
    escapeCSV(l.createdAt),
    escapeCSV(l.notes)
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `medicos_prospectos_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Calculate storage stats
export function getLocalStorageUsage(): { bytes: number; kb: number; leadsCount: number } {
  try {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    const leadsRaw = localStorage.getItem(LEADS_STORAGE_KEY) || '[]';
    const leadsCount = JSON.parse(leadsRaw).length;
    return {
      bytes: totalBytes,
      kb: Math.round((totalBytes / 1024) * 10) / 10,
      leadsCount
    };
  } catch (e) {
    return { bytes: 0, kb: 0, leadsCount: 0 };
  }
}

