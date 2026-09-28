import { MedicalLead } from '../types';
import { formatCurrency } from './storage';

export interface LeadRenewalInfo {
  leadId: string;
  doctorName: string;
  specialty: string;
  city: string;
  sector: string;
  clinicOrHospital: string;
  phone: string;
  planName: string;
  planPrice: number;
  durationYears: number;
  startDate: string;
  renewalDate: string; // YYYY-MM-DD
  daysRemaining: number;
  status: 'expired' | 'urgent_15' | 'due_30' | 'due_60' | 'active';
  statusLabel: string;
  badgeBg: string;
  badgeText: string;
}

export interface RenewalsSummary {
  totalActiveClients: number;
  urgent15Count: number;
  due30Count: number;
  due60Count: number;
  expiredCount: number;
  activeCount: number;
  revenueAtStake30Days: number;
  totalAnnualRecurringRevenue: number;
  retentionRate: number; // 0 - 100
}

/**
 * Calculates renewal metadata for a single lead.
 * If lead already has a stored renewalDate, uses it.
 * Otherwise, derives it from createdAt + 1 year (or 2 years if $150 plan).
 */
export function getLeadRenewalInfo(lead: MedicalLead): LeadRenewalInfo {
  const isTwoYears = lead.estimatedValue === 150 || (lead.serviceName && lead.serviceName.includes('2'));
  const durationYears = lead.renewalYears || (isTwoYears ? 2 : 1);
  const planPrice = lead.paidAmount > 0 ? lead.paidAmount : (isTwoYears ? 150 : 99);
  const planName = lead.serviceName || (durationYears === 2 ? 'Perfil Médico 2 años ($150)' : 'Perfil Médico 1 año ($99)');

  // Determine start date
  const startDate = lead.createdAt || new Date().toISOString().split('T')[0];

  // Determine expiration date
  let renewalDate = lead.renewalDate;
  if (!renewalDate) {
    try {
      const parts = startDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10) + durationYears;
        const m = parts[1];
        const d = parts[2];
        renewalDate = `${y}-${m}-${d}`;
      } else {
        const d = new Date(startDate);
        d.setFullYear(d.getFullYear() + durationYears);
        renewalDate = d.toISOString().split('T')[0];
      }
    } catch {
      renewalDate = `${new Date().getFullYear() + 1}-12-31`;
    }
  }

  // Calculate days remaining compared to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renDateObj = new Date(renewalDate + 'T00:00:00');
  const diffTime = renDateObj.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: LeadRenewalInfo['status'] = 'active';
  let statusLabel = 'Al Día';
  let badgeBg = 'bg-emerald-50 border-emerald-200';
  let badgeText = 'text-emerald-700';

  if (daysRemaining < 0) {
    status = 'expired';
    statusLabel = `Vencido hace ${Math.abs(daysRemaining)} d`;
    badgeBg = 'bg-rose-100 border-rose-300';
    badgeText = 'text-rose-800';
  } else if (daysRemaining <= 15) {
    status = 'urgent_15';
    statusLabel = `Vence en ${daysRemaining} días`;
    badgeBg = 'bg-rose-50 border-rose-300 animate-pulse';
    badgeText = 'text-rose-700';
  } else if (daysRemaining <= 30) {
    status = 'due_30';
    statusLabel = `Vence en ${daysRemaining} días`;
    badgeBg = 'bg-amber-50 border-amber-300';
    badgeText = 'text-amber-800';
  } else if (daysRemaining <= 60) {
    status = 'due_60';
    statusLabel = `Vence en ${daysRemaining} días`;
    badgeBg = 'bg-sky-50 border-sky-300';
    badgeText = 'text-sky-800';
  } else {
    status = 'active';
    statusLabel = `Activo (${daysRemaining} d)`;
    badgeBg = 'bg-emerald-50 border-emerald-200';
    badgeText = 'text-emerald-700';
  }

  return {
    leadId: lead.id,
    doctorName: lead.doctorName,
    specialty: lead.specialty,
    city: lead.city || 'Ecuador',
    sector: lead.sector || 'Centro',
    clinicOrHospital: lead.clinicOrHospital,
    phone: lead.phone,
    planName,
    planPrice,
    durationYears,
    startDate,
    renewalDate,
    daysRemaining,
    status,
    statusLabel,
    badgeBg,
    badgeText
  };
}

/**
 * Computes renewals overview metrics across all paid / closed leads.
 */
export function getRenewalsSummary(leads: MedicalLead[]): RenewalsSummary {
  // Only leads that have purchased or are in 'ganado' stage
  const activeClients = leads.filter(
    (l) => l.stage === 'ganado' || l.paymentStatus === 'pagado' || l.paidAmount > 0
  );

  let urgent15Count = 0;
  let due30Count = 0;
  let due60Count = 0;
  let expiredCount = 0;
  let activeCount = 0;
  let revenueAtStake30Days = 0;
  let totalAnnualRecurringRevenue = 0;

  activeClients.forEach((lead) => {
    const info = getLeadRenewalInfo(lead);
    totalAnnualRecurringRevenue += info.planPrice;

    if (info.status === 'expired') {
      expiredCount++;
    } else if (info.status === 'urgent_15') {
      urgent15Count++;
      revenueAtStake30Days += info.planPrice;
    } else if (info.status === 'due_30') {
      due30Count++;
      revenueAtStake30Days += info.planPrice;
    } else if (info.status === 'due_60') {
      due60Count++;
    } else {
      activeCount++;
    }
  });

  const totalClosed = activeClients.length;
  const nonChurned = totalClosed - expiredCount;
  const retentionRate = totalClosed > 0 ? Math.round((nonChurned / totalClosed) * 100) : 100;

  return {
    totalActiveClients: totalClosed,
    urgent15Count,
    due30Count,
    due60Count,
    expiredCount,
    activeCount,
    revenueAtStake30Days,
    totalAnnualRecurringRevenue,
    retentionRate
  };
}

/**
 * Prepares professional WhatsApp renewal reminder text tailored for Ecuador
 */
export function buildRenewalWhatsAppMessage(info: LeadRenewalInfo): string {
  const isUrgent = info.daysRemaining <= 15;
  const daysText = info.daysRemaining <= 0 
    ? 'ha finalizado recientemente' 
    : `vence en ${info.daysRemaining} días (el ${info.renewalDate})`;

  return (
    `Estimado(a) *${info.doctorName}*, le saluda cordialmente el equipo de *Directorio Médico Ecuador* 🇪🇨.\n\n` +
    `Esperamos que se encuentre muy bien. Nos comunicamos para comentarle que su membresía anual de *Perfil Médico Destacado* en *${info.city}* (${info.sector}) ${daysText}.\n\n` +
    `Durante este periodo, su consultorio en *${info.clinicOrHospital}* ha estado visible para cientos de pacientes que buscan especialistas en ${info.specialty}.\n\n` +
    `Para mantener su posición destacada, visibilidad ininterrumpida y botón directo de WhatsApp activo, hemos reservado su *renovación preferencial por sólo $${info.planPrice} USD*.\n\n` +
    `¿Desea que le facilitemos los datos de transferencia (Banco Pichincha / Deuna) para registrar su nuevo año de vigencia?\n\n` +
    `Quedamos a su entera disposición.`
  );
}
