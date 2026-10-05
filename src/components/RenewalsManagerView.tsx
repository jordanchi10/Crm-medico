import React, { useState } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  MessageCircle, 
  ShieldCheck, 
  Clock, 
  Building2, 
  MapPin, 
  User, 
  FileText, 
  Plus, 
  ChevronRight, 
  Send, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { MedicalLead } from '../types';
import { 
  getLeadRenewalInfo, 
  getRenewalsSummary, 
  buildRenewalWhatsAppMessage, 
  LeadRenewalInfo 
} from '../utils/renewalUtils';
import { getSpecialtyMeta } from '../data/specialties';
import { formatCurrency, generateActivityId } from '../utils/storage';
import { formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';
import { openExternalLink } from '../utils/navigation';
import { ThreeDRenewalsIcon } from './ThreeDIcons';
import confetti from 'canvas-confetti';

interface RenewalsManagerViewProps {
  leads: MedicalLead[];
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onOpenEdit: (lead: MedicalLead) => void;
  onSaveLead: (lead: MedicalLead) => void;
  onOpenReceipt: (lead: MedicalLead) => void;
}

type RenewalFilter = 'all' | 'urgent_15' | 'due_30' | 'due_60' | 'expired' | 'active';

export const RenewalsManagerView: React.FC<RenewalsManagerViewProps> = ({
  leads,
  onOpenWhatsApp,
  onOpenEdit,
  onSaveLead,
  onOpenReceipt
}) => {
  const [filter, setFilter] = useState<RenewalFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [renewingLeadId, setRenewingLeadId] = useState<string | null>(null);

  // Compute renewals data
  const summary = getRenewalsSummary(leads);

  // Filter clients that have closed or paid
  const activeClients = leads.filter(
    (l) => l.stage === 'ganado' || l.paymentStatus === 'pagado' || l.paidAmount > 0
  );

  const clientRenewalInfos: Array<{ lead: MedicalLead; info: LeadRenewalInfo }> = activeClients.map((l) => ({
    lead: l,
    info: getLeadRenewalInfo(l)
  }));

  // Filter list
  const filteredList = clientRenewalInfos.filter(({ lead, info }) => {
    // Status filter
    if (filter === 'urgent_15' && info.status !== 'urgent_15') return false;
    if (filter === 'due_30' && info.status !== 'due_30') return false;
    if (filter === 'due_60' && info.status !== 'due_60') return false;
    if (filter === 'expired' && info.status !== 'expired') return false;
    if (filter === 'active' && info.status !== 'active') return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDoc = lead.doctorName.toLowerCase().includes(term);
      const matchSpec = lead.specialty.toLowerCase().includes(term);
      const matchCity = (lead.city || '').toLowerCase().includes(term);
      const matchClinic = lead.clinicOrHospital.toLowerCase().includes(term);
      return matchDoc || matchSpec || matchCity || matchClinic;
    }

    return true;
  });

  // Sort by urgency: expired first, then urgent_15, then due_30, then active
  filteredList.sort((a, b) => a.info.daysRemaining - b.info.daysRemaining);

  const handleSendRenewalWhatsApp = (lead: MedicalLead, info: LeadRenewalInfo) => {
    const message = buildRenewalWhatsAppMessage(info);
    const { cleanWhatsAppNumber } = formatEcuadorPhoneForWhatsApp(lead.phone);
    if (cleanWhatsAppNumber) {
      const url = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(message)}`;
      openExternalLink(url);
    } else {
      onOpenWhatsApp(lead);
    }
  };

  const handleExecuteRenewal = (lead: MedicalLead, addYears: number = 1) => {
    const today = new Date().toISOString().split('T')[0];
    const info = getLeadRenewalInfo(lead);
    
    // Calculate new expiration date
    let newRenewalDate: string;
    const baseDate = info.daysRemaining < 0 ? today : info.renewalDate;
    try {
      const parts = baseDate.split('-');
      const newYear = parseInt(parts[0], 10) + addYears;
      newRenewalDate = `${newYear}-${parts[1]}-${parts[2]}`;
    } catch {
      newRenewalDate = `${new Date().getFullYear() + addYears}-12-31`;
    }

    const price = addYears === 2 ? 150 : 99;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

    const updatedLead: MedicalLead = {
      ...lead,
      stage: 'ganado',
      paymentStatus: 'pagado',
      paidAmount: price,
      renewalDate: newRenewalDate,
      renewalYears: addYears,
      serviceName: `Perfil Médico ${addYears} ${addYears === 1 ? 'año' : 'años'} ($${price})`,
      lastContactDate: today,
      history: [
        {
          id: generateActivityId('act-ren'),
          date: dateStr,
          type: 'renovacion',
          description: `Renovación registrada exitosamente por ${addYears} año(s) ($${price} USD). Nueva vigencia hasta ${newRenewalDate}.`
        },
        ...(lead.history || [])
      ]
    };

    onSaveLead(updatedLead);
    setRenewingLeadId(null);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60 shrink-0">
            <ThreeDRenewalsIcon size={28} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Módulo de Renovaciones Anuales</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {summary.retentionRate}% Tasa de Retención
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestión de recurrencia anual ($99) y bienal ($150) para prevenir Churn y asegurar ingresos estables.
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar especialista, clínica..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Directory Clients */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Médicos con Perfil Activo</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.totalActiveClients}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">suscripciones</span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">
            ${summary.totalAnnualRecurringRevenue} USD facturación base
          </p>
        </div>

        {/* Card 2: Due in 30 Days (At Stake) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Vencimientos en ≤ 30 Días</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400">
              {summary.urgent15Count + summary.due30Count}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">médicos</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
            ${summary.revenueAtStake30Days} USD en juego este mes
          </p>
        </div>

        {/* Card 3: Urgents (< 15 days) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Urgentes (&lt; 15 días)</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-400">
              {summary.urgent15Count}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">prioritarios</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-400 font-bold mt-1">
            Enviar recordatorio por WhatsApp
          </p>
        </div>

        {/* Card 4: Churn / Expired */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Membresías Vencidas</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {summary.expiredCount}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">por reactivar</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
            Tasa de retención actual: {summary.retentionRate}%
          </p>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
              : 'text-slate-750 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Todos ({clientRenewalInfos.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('urgent_15')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'urgent_15'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          🔴 Urgentes &lt; 15 días ({summary.urgent15Count})
        </button>

        <button
          type="button"
          onClick={() => setFilter('due_30')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'due_30'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          🟡 Próximos 16-30 días ({summary.due30Count})
        </button>

        <button
          type="button"
          onClick={() => setFilter('due_60')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'due_60'
              ? 'bg-sky-600 text-white shadow-2xs'
              : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
          }`}
        >
          🔵 En 31-60 días ({summary.due60Count})
        </button>

        <button
          type="button"
          onClick={() => setFilter('expired')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'expired'
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          ⚠️ Vencidos ({summary.expiredCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === 'active'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          🟢 Al Día ({summary.activeCount})
        </button>
      </div>

      {/* Renewals Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-1" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No hay especialistas en este filtro de renovación.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Selecciona "Todos" para ver el directorio completo de médicos adscritos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.map(({ lead, info }, idx) => {
              const specMeta = getSpecialtyMeta(lead.specialty);
              const isRenewing = renewingLeadId === lead.id;

              return (
                <div key={`${lead.id || 'renewal-lead'}-${idx}`} className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-850/60 transition-colors space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Doctor Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-sm border border-teal-100 dark:border-teal-900/60 shrink-0">
                        {lead.doctorName.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {lead.doctorName}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${specMeta.bgLight} ${specMeta.color}`}>
                            {lead.specialty}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${info.badgeBg} ${info.badgeText}`}>
                            {info.statusLabel}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-medium">
                          <span>🏥 {lead.clinicOrHospital}</span>
                          <span>📍 {lead.city || 'Manta'} ({lead.sector || 'Centro'})</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">📱 {lead.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Plan Details & Dates */}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap sm:flex-nowrap">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right min-w-[130px] sm:min-w-[140px] flex-1 sm:flex-none">
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">Plan Actual</span>
                        <strong className="text-slate-900 dark:text-white font-black text-sm">${info.planPrice} USD</strong>
                        <span className="text-xs text-slate-700 dark:text-slate-300 block font-medium">
                          {info.durationYears} {info.durationYears === 1 ? 'año' : 'años'}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[140px] sm:min-w-[150px] flex-1 sm:flex-none">
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">Vigencia</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 block font-medium">Alta: {info.startDate}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">
                          Vence: <span className="font-mono text-emerald-700 dark:text-emerald-400">{info.renewalDate}</span>
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendRenewalWhatsApp(lead, info)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs min-h-[38px] touch-manipulation"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp Renovación</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenReceipt(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Ver o generar recibo oficial de pago"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Recibo Oficial</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEdit(lead)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Ver Ficha
                      </button>
                    </div>

                    {/* Fast Renewal Trigger */}
                    <div className="flex items-center gap-2">
                      {!isRenewing ? (
                        <button
                          type="button"
                          onClick={() => setRenewingLeadId(lead.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>+ Registrar Renovación</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 p-1 bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 rounded-xl animate-in fade-in">
                          <button
                            type="button"
                            onClick={() => handleExecuteRenewal(lead, 1)}
                            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            +1 Año ($99)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExecuteRenewal(lead, 2)}
                            className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            +2 Años ($150)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenewingLeadId(null)}
                            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
