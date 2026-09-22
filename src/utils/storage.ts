import { MedicalLead, SpecialtyConversionMetric, WhatsAppTemplate, MedicalSpecialty, MedicalService } from '../types';
import { INITIAL_LEADS } from '../data/initialData';
import { DEFAULT_WHATSAPP_TEMPLATES } from '../data/whatsappTemplates';
import { SPECIALTIES_LIST } from '../data/specialties';
import { loadServices, saveServices } from '../data/servicesData';

const LEADS_STORAGE_KEY = 'medcrm_leads_v1';
const TEMPLATES_STORAGE_KEY = 'medcrm_templates_v1';

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
      if (!updatedLead.sector) {
        const match = INITIAL_LEADS.find(l => l.id === lead.id);
        const fallbackSectors = ['Centro', 'Jocay', 'La Pradera', 'Los Esteros', 'Tarqui', 'Barbasquillo'];
        updatedLead.sector = match?.sector || fallbackSectors[idx % fallbackSectors.length];
        modified = true;
      }
      if (!updatedLead.serviceName) {
        const match = INITIAL_LEADS.find(l => l.id === lead.id);
        if (match?.serviceName) {
          updatedLead.serviceName = match.serviceName;
          updatedLead.serviceId = match.serviceId;
        } else {
          const isTwoYears = updatedLead.estimatedValue >= 150;
          updatedLead.serviceName = isTwoYears ? 'Perfil Médico 2 años ($150)' : 'Perfil Médico 1 año ($99)';
          updatedLead.serviceId = isTwoYears ? 'srv-base-2anos' : 'srv-base-1ano';
        }
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
    // Garantizar que si las plantillas guardadas no tenían attachments o están vacías,
    // se complementen con las secuencias multimedia predeterminadas
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

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
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
  data: BackupData;
}

export interface PlatformConfig {
  country: string;
  currency: string;
  defaultPhonePrefix: string;
  dailyAutoBackupEnabled: boolean;
  lastDailyBackupDate: string;
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
  lastDailyBackupDate: ''
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

// Save a daily snapshot and keep up to the last 30 daily backups
export function saveDailySnapshot(snapshot: DailySnapshot): void {
  try {
    const existing = getDailySnapshots().filter((s) => s.date !== snapshot.date);
    const updated = [snapshot, ...existing].slice(0, 30);
    localStorage.setItem(DAILY_SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving daily snapshot', e);
  }
}

// Check and perform daily automatic backup (or manual save with force = true)
export function performDailyAutoBackup(
  leads: MedicalLead[], 
  templates: WhatsAppTemplate[],
  force: boolean = false
): { performed: boolean; date: string } {
  const today = new Date().toISOString().split('T')[0];
  const config = loadPlatformConfig();

  // If already backed up today and not forced, return false
  if (!force && config.lastDailyBackupDate === today) {
    return { performed: false, date: today };
  }

  const wonLeads = leads.filter((l) => l.stage === 'ganado');
  const totalRevenue = wonLeads.reduce((acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue), 0);

  const backupData: BackupData = {
    version: '2.0-ecuador',
    exportDate: new Date().toISOString(),
    app: 'MedCRM Ecuador - Especialistas Médicos',
    country: 'Ecuador (+593)',
    config: {
      ...config,
      lastDailyBackupDate: today
    },
    leads,
    templates,
    services: loadServices()
  };

  const snapshot: DailySnapshot = {
    date: today,
    timestamp: new Date().toISOString(),
    leadsCount: leads.length,
    totalRevenue,
    data: backupData
  };

  saveDailySnapshot(snapshot);
  savePlatformConfig({
    ...config,
    lastDailyBackupDate: today
  });

  return { performed: true, date: today };
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

