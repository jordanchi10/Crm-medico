import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  RefreshCw, 
  UserPlus, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { MedicalLead, PipelineSubView, StageId } from '../types';
import { KanbanBoard } from './KanbanBoard';
import { LeadsTableView } from './LeadsTableView';
import { CalendarView } from './CalendarView';
import { RenewalsManagerView } from './RenewalsManagerView';
import { getRenewalsSummary } from '../utils/renewalUtils';

interface PipelineWorkspaceProps {
  leads: MedicalLead[];
  subView: PipelineSubView;
  onSubViewChange: (view: PipelineSubView) => void;
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onDeleteLead: (leadId: string) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onAddNewLeadInStage: (stage: StageId) => void;
  onOpenNewLead: () => void;
  onOpenReceipt: (lead: MedicalLead) => void;
  onOpenServicesModal?: () => void;
  onOpenNotificationCenter?: () => void;
  onSaveLead: (lead: MedicalLead) => void;
}

export const PipelineWorkspace: React.FC<PipelineWorkspaceProps> = ({
  leads,
  subView,
  onSubViewChange,
  onOpenEdit,
  onOpenWhatsApp,
  onDeleteLead,
  onStageChange,
  onAddNewLeadInStage,
  onOpenNewLead,
  onOpenReceipt,
  onOpenServicesModal,
  onOpenNotificationCenter,
  onSaveLead
}) => {
  // Counts for each view
  const activeCount = leads.filter(l => l.stage !== 'perdido').length;
  const totalCount = leads.length;
  const appointmentsCount = leads.filter(l => l.stage === 'demo_agendada' || l.nextFollowUpDate).length;
  const renewalsSummary = getRenewalsSummary(leads);
  const pendingRenewalsCount = renewalsSummary.urgent15Count + renewalsSummary.due30Count;

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Workspace Bar: Unified View Selector */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-8 py-3 sm:py-3.5 sticky top-15 sm:top-16 z-15 shadow-2xs backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Segmented Control Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/95 dark:bg-slate-800/95 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none self-start md:self-auto w-full md:w-auto shadow-2xs">
            {/* 1. Tablero Kanban */}
            <button
              type="button"
              onClick={() => onSubViewChange('kanban')}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[40px] ${
                subView === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-750'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${subView === 'kanban' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300'}`} />
              <span>Tablero Kanban</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
                subView === 'kanban' ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300' : 'text-slate-750 dark:text-slate-300 bg-slate-200/90 dark:bg-slate-700'
              }`}>
                {activeCount}
              </span>
            </button>

            {/* 2. Directorio Tabla */}
            <button
              type="button"
              onClick={() => onSubViewChange('table')}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[40px] ${
                subView === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-750'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
              }`}
            >
              <Users className={`w-4 h-4 ${subView === 'table' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300'}`} />
              <span>Directorio</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
                subView === 'table' ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300' : 'text-slate-750 dark:text-slate-300 bg-slate-200/90 dark:bg-slate-700'
              }`}>
                {totalCount}
              </span>
            </button>

            {/* 3. Calendario */}
            <button
              type="button"
              onClick={() => onSubViewChange('calendar')}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[40px] ${
                subView === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-750'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
              }`}
            >
              <Calendar className={`w-4 h-4 ${subView === 'calendar' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'}`} />
              <span>Citas y Demos</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
                subView === 'calendar' ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300' : 'text-slate-750 dark:text-slate-300 bg-slate-200/90 dark:bg-slate-700'
              }`}>
                {appointmentsCount}
              </span>
            </button>

            {/* 4. Renovaciones */}
            <button
              type="button"
              onClick={() => onSubViewChange('renewals')}
              className={`shrink-0 inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[40px] ${
                subView === 'renewals'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-750'
                  : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${subView === 'renewals' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`} />
              <span>Renovaciones</span>
              {pendingRenewalsCount > 0 && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  {pendingRenewalsCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Action: New Lead Button */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={onOpenNewLead}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer touch-manipulation"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Registrar Médico</span>
            </button>
          </div>

        </div>
      </div>

      {/* Subview Content */}
      <div className="flex-1">
        {subView === 'kanban' && (
          <KanbanBoard
            leads={leads}
            onOpenEdit={onOpenEdit}
            onOpenWhatsApp={onOpenWhatsApp}
            onDeleteLead={onDeleteLead}
            onStageChange={onStageChange}
            onAddNewLeadInStage={onAddNewLeadInStage}
            onOpenServicesModal={onOpenServicesModal}
            onOpenNotificationCenter={onOpenNotificationCenter}
          />
        )}

        {subView === 'table' && (
          <LeadsTableView
            leads={leads}
            onOpenEdit={onOpenEdit}
            onOpenWhatsApp={onOpenWhatsApp}
            onDeleteLead={onDeleteLead}
            onStageChange={onStageChange}
            onOpenReceipt={onOpenReceipt}
          />
        )}

        {subView === 'calendar' && (
          <CalendarView
            leads={leads}
            onOpenEdit={onOpenEdit}
            onOpenWhatsApp={onOpenWhatsApp}
            onAddNewAppointment={() => onAddNewLeadInStage('demo_agendada')}
            onOpenReceipt={onOpenReceipt}
          />
        )}

        {subView === 'renewals' && (
          <RenewalsManagerView
            leads={leads}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEdit={onOpenEdit}
            onSaveLead={onSaveLead || (() => {})}
            onOpenReceipt={onOpenReceipt}
          />
        )}
      </div>
    </div>
  );
};
