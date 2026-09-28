import React, { useState } from 'react';
import { 
  Sun, 
  Calendar, 
  Clock, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  UserPlus, 
  Sparkles, 
  Check, 
  ChevronRight,
  Stethoscope,
  Building2,
  MapPin,
  RefreshCw,
  Flame,
  FileText
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';
import { getSpecialtyMeta } from '../data/specialties';
import { formatCurrency } from '../utils/storage';
import { getLeadOverdueInfo } from '../utils/notificationService';
import { getRenewalsSummary } from '../utils/renewalUtils';
import { ThreeDDashboardIcon } from './ThreeDIcons';

interface DailyCockpitViewProps {
  leads: MedicalLead[];
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onQuickMarkContacted: (leadId: string) => void;
  onOpenNewLead: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenReceipt?: (lead: MedicalLead) => void;
}

export const DailyCockpitView: React.FC<DailyCockpitViewProps> = ({
  leads,
  onOpenEdit,
  onOpenWhatsApp,
  onQuickMarkContacted,
  onOpenNewLead,
  onNavigateTab,
  onOpenReceipt
}) => {
  const [completedTodayIds, setCompletedTodayIds] = useState<string[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];

  // Format today's date in full Spanish
  const todayFormatted = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Today's follow-ups
  const todayLeads = leads.filter((l) => l.nextFollowUpDate === todayStr && l.stage !== 'ganado' && l.stage !== 'perdido');

  // Today's demos
  const todayDemos = leads.filter((l) => (l.stage === 'demo_agendada' || l.nextFollowUpDate === todayStr) && l.stage !== 'ganado');

  // Overdue leads (+48h)
  const overdueLeads = leads.filter((l) => {
    if (l.stage === 'ganado' || l.stage === 'perdido') return false;
    const info = getLeadOverdueInfo(l, 48);
    return info.isOverdue;
  });

  // High priority leads not yet won
  const hotLeads = leads.filter((l) => l.priority === 'alta' && l.stage !== 'ganado' && l.stage !== 'perdido');

  // Month revenue & progress
  const wonLeads = leads.filter((l) => l.stage === 'ganado');
  const totalRevenue = wonLeads.reduce((acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue), 0);
  const monthlyGoal = 2500; // USD Monthly target for subscriptions
  const progressPercent = Math.min(100, Math.round((totalRevenue / monthlyGoal) * 100));

  // Renewals summary
  const renewals = getRenewalsSummary(leads);

  const handleToggleComplete = (leadId: string) => {
    if (completedTodayIds.includes(leadId)) {
      setCompletedTodayIds(prev => prev.filter(id => id !== leadId));
    } else {
      setCompletedTodayIds(prev => [...prev, leadId]);
      onQuickMarkContacted(leadId);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      
      {/* Executive Greeting Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 dark:from-slate-950 dark:via-teal-950 dark:to-slate-950 rounded-2xl p-5 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <ThreeDDashboardIcon size={34} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Jornada Diaria
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {todayFormatted}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              ¡Buenos días! Tu panel de acción comercial
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              MédicoEC CRM · Contactos clave, citas programadas y oportunidades del día.
            </p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            type="button"
            onClick={onOpenNewLead}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Médico</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('kanban')}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/10"
          >
            Ver Tablero
          </button>
        </div>
      </div>

      {/* 4 Main Daily KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Today's calls */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Contactos Hoy</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {todayLeads.length}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">médicos agendados</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:underline">
            <span>Ver agenda del día</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Hot Opportunities */}
        <div 
          onClick={() => onNavigateTab('kanban')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Prospectos Calientes</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {hotLeads.length}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">prioridad alta</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:underline">
            <span>Enfocar cierres</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Overdue (+48h) */}
        <div 
          onClick={() => onNavigateTab('cadence')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sin Contacto (+48h)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {overdueLeads.length}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">requieren cadencia</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
            <span>Activar seguimiento</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Month Revenue & Renewals */}
        <div 
          onClick={() => onNavigateTab('renewals')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Recaudación / Meta</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
              ${totalRevenue}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">de ${monthlyGoal} USD</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Dual Grid: Today's Priority Agenda & Hot Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Agenda de Hoy */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                  Agenda Priorizada de Hoy ({todayLeads.length})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Llamadas, visitas y demostraciones programadas para el día
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('calendar')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold"
            >
              Ver Calendario
            </button>
          </div>

          {todayLeads.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-1" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">¡Al día! No tienes llamadas pendientes con fecha de hoy.</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Puedes revisar la lista de prospectos calientes o activar una secuencia en el módulo de Cadencias.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('cadence')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Revisar Cadencias Sugeridas</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLeads.map((lead) => {
                const specMeta = getSpecialtyMeta(lead.specialty);
                const isCompleted = completedTodayIds.includes(lead.id);

                return (
                  <div
                    key={lead.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 opacity-60' 
                        : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(lead.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-teal-500 bg-white dark:bg-slate-800'
                        }`}
                        title={isCompleted ? 'Marcar como pendiente' : 'Marcar como contactado'}
                      >
                        {isCompleted && <Check className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs sm:text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                            {lead.doctorName}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${specMeta.bgLight} dark:bg-opacity-20 ${specMeta.color}`}>
                            {lead.specialty}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
                            ⏰ {lead.nextFollowUpTime || '11:00'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>🏥 {lead.clinicOrHospital}</span>
                          <span>📍 {lead.city || 'Manta'} ({lead.sector || 'Centro'})</span>
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEdit(lead)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ficha
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Hot Pipeline & Urgent Renewals */}
        <div className="space-y-6">
          
          {/* Box 1: Prospectos Calientes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Cierres Clave (Prioridad Alta)
                </h4>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                {hotLeads.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {hotLeads.slice(0, 4).map((lead) => (
                <div 
                  key={lead.id}
                  onClick={() => onOpenEdit(lead)}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {lead.doctorName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {lead.specialty} · {lead.city || 'Manta'}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-teal-700 dark:text-teal-400">
                      ${lead.estimatedValue || 99}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">
                      {STAGES.find(s => s.id === lead.stage)?.name.slice(0, 10)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Alertas de Renovación Inminente (< 30 días) */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                  Renovaciones Próximas
                </h4>
              </div>
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-200/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                {renewals.urgent15Count + renewals.due30Count}
              </span>
            </div>

            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
              Hay <strong>${renewals.revenueAtStake30Days} USD</strong> en ingresos anuales recurrentes a renovar en los próximos 30 días.
            </p>

            <button
              type="button"
              onClick={() => onNavigateTab('renewals')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Módulo de Renovaciones</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
