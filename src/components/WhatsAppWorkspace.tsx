import React from 'react';
import { 
  Sparkles, 
  MessageSquareText, 
  Layers, 
  Clock, 
  Send,
  HelpCircle
} from 'lucide-react';
import { MedicalLead, WhatsAppSubView, WhatsAppTemplate, StageId } from '../types';
import { CadenceManagerView } from './CadenceManagerView';
import { TemplatesManager } from './TemplatesManager';

interface WhatsAppWorkspaceProps {
  leads: MedicalLead[];
  templates: WhatsAppTemplate[];
  subView: WhatsAppSubView;
  onSubViewChange: (view: WhatsAppSubView) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onOpenEdit: (lead: MedicalLead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onLogActivity: (leadId: string, description: string) => void;
  onSaveTemplates: (templates: WhatsAppTemplate[]) => void;
  onResetTemplates: () => void;
}

export const WhatsAppWorkspace: React.FC<WhatsAppWorkspaceProps> = ({
  leads,
  templates,
  subView,
  onSubViewChange,
  onOpenWhatsApp,
  onOpenEdit,
  onStageChange,
  onLogActivity,
  onSaveTemplates,
  onResetTemplates
}) => {
  // Count prospects in cadence
  const activeInCadence = leads.filter(l => l.stage !== 'ganado' && l.stage !== 'perdido').length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Workspace Bar: Segmented Switcher */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 sticky top-15 sm:top-16 z-15 shadow-2xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700 overflow-x-auto scrollbar-none w-full sm:w-auto">
            {/* 1. Cadencias Multitoque */}
            <button
              type="button"
              onClick={() => onSubViewChange('cadence')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[40px] ${
                subView === 'cadence'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-750'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${subView === 'cadence' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-300'}`} />
              <span>Cadencias de Seguimiento</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
                subView === 'cadence' ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300 bg-slate-200/90 dark:bg-slate-700'
              }`}>
                {activeInCadence} en curso
              </span>
            </button>

            {/* 2. Biblioteca de Plantillas */}
            <button
              type="button"
              onClick={() => onSubViewChange('templates')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation min-h-[40px] ${
                subView === 'templates'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-750'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              <MessageSquareText className={`w-4 h-4 ${subView === 'templates' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-300'}`} />
              <span>Plantillas de Mensajes</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
                subView === 'templates' ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300 bg-slate-200/90 dark:bg-slate-700'
              }`}>
                {templates.length}
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Canal activo: WhatsApp Web / Desktop (+593 Ecuador)</span>
          </div>

        </div>
      </div>

      {/* Subview Content */}
      <div className="flex-1">
        {subView === 'cadence' && (
          <CadenceManagerView
            leads={leads}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEdit={onOpenEdit}
            onStageChange={onStageChange}
            onLogActivity={onLogActivity}
          />
        )}

        {subView === 'templates' && (
          <TemplatesManager
            templates={templates}
            leads={leads}
            onOpenWhatsApp={onOpenWhatsApp}
            onSaveTemplates={onSaveTemplates}
            onResetTemplates={onResetTemplates}
          />
        )}
      </div>
    </div>
  );
};
