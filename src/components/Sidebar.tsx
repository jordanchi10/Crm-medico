import React, { useState } from 'react';
import { 
  Stethoscope, 
  UserPlus, 
  Users, 
  RotateCcw, 
  Sparkles, 
  Save, 
  HardDrive, 
  Briefcase, 
  Bell, 
  BellRing, 
  LayoutDashboard, 
  BarChart3, 
  MessageCircle, 
  Tag, 
  CheckCircle2, 
  FileSpreadsheet,
  Calendar,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { AppTab, MedicalLead, PipelineSubView, WhatsAppSubView } from '../types';
import { formatCurrency } from '../utils/storage';
import { 
  ThreeDKanbanIcon, 
  ThreeDProspectsIcon, 
  ThreeDAnalyticsIcon, 
  ThreeDWhatsAppIcon, 
  ThreeDServicesIcon, 
  ThreeDDashboardIcon, 
  ThreeDCalendarIcon, 
  ThreeDCadenceIcon, 
  ThreeDRenewalsIcon 
} from './ThreeDIcons';
import { PWAInstallButton } from './PWAInstallButton';
import { getRenewalsSummary } from '../utils/renewalUtils';

interface SidebarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  pipelineSubView?: PipelineSubView;
  onPipelineSubViewChange?: (view: PipelineSubView) => void;
  whatsappSubView?: WhatsAppSubView;
  onWhatsAppSubViewChange?: (view: WhatsAppSubView) => void;
  leads: MedicalLead[];
  onNewLeadClick: () => void;
  onOpenServicesModal: () => void;
  onOpenNotificationCenter?: () => void;
  onOpenBulkModal?: () => void;
  onManualSave: () => void;
  onOpenLocalHostingModal: () => void;
  overdueCount?: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  pipelineSubView = 'kanban',
  onPipelineSubViewChange,
  whatsappSubView = 'cadence',
  onWhatsAppSubViewChange,
  leads,
  onNewLeadClick,
  onOpenServicesModal,
  onOpenNotificationCenter,
  onOpenBulkModal,
  onManualSave,
  onOpenLocalHostingModal,
  overdueCount = 0,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Quick summary metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.stage === 'ganado');
  const wonRevenue = wonLeads.reduce(
    (acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue),
    0
  );
  const renewalsSummary = getRenewalsSummary(leads);
  const pendingRenewalsCount = renewalsSummary.urgent15Count + renewalsSummary.due30Count;

  const handleManualSave = () => {
    onManualSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const navItems = [
    {
      id: 'today' as const,
      label: 'Mi Jornada',
      description: 'Panel de inicio diario',
      icon: <ThreeDDashboardIcon size={20} />,
      badge: 'Hoy',
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'pipeline' as const,
      label: 'Embudo y Médicos',
      description: 'Tablero, citas y directorio',
      icon: <ThreeDKanbanIcon size={20} />,
      badge: overdueCount > 0 ? `${overdueCount}` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'whatsapp' as const,
      label: 'WhatsApp Hub',
      description: 'Cadencias y plantillas',
      icon: <ThreeDWhatsAppIcon size={20} />,
      badge: 'Auto',
      badgeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'analytics' as const,
      label: 'Reportes',
      description: 'Métricas y conversión',
      icon: <ThreeDAnalyticsIcon size={20} />,
      badge: null
    }
  ];

  return (
    <aside 
      className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 h-screen sticky top-0 z-30 shadow-[2px_0_12px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_12px_rgba(0,0,0,0.2)] select-none transition-colors duration-200"
      aria-label="Barra de Navegación Lateral"
    >
      {/* Brand & Logo Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 flex items-center justify-center text-white shadow-md shadow-red-500/25 shrink-0 border border-white/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                MédicoEC CRM
              </span>
              <span 
                className="text-teal-800 dark:text-teal-300 font-bold text-[10px] px-1 py-0.2 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 shadow-2xs"
                title="Ecuador (+593)"
              >
                🇪🇨
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium leading-none mt-0.5">
              Gestión Médica Pro
            </p>
          </div>
        </div>
      </div>

      {/* Main Action: Primary Button "+ Nuevo Médico" */}
      <div className="p-3 shrink-0">
        <button
          id="sidebar-btn-new-lead"
          onClick={onNewLeadClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:from-teal-800 active:to-emerald-800 text-white text-xs font-bold shadow-sm shadow-teal-600/30 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:scale-98"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>Nuevo Médico</span>
        </button>
      </div>

      {/* Navigation Group (Clean 4 Core Pillars) */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 scrollbar-thin">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
          Espacios de Trabajo
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <div key={item.id} className="space-y-0.5">
              <button
                id={`sidebar-nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs translate-x-0.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-0.5 rounded-lg transition-transform ${isActive ? 'scale-105' : 'opacity-85'}`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className={`leading-none ${isActive ? 'font-black text-teal-900 dark:text-teal-200' : 'font-semibold'}`}>
                      {item.label}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}

                {isActive && !item.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                )}
              </button>

              {/* Quiet Submenu for Pipeline Workspace */}
              {item.id === 'pipeline' && isActive && (
                <div className="pl-8 pr-1 py-1 space-y-0.5 animate-in fade-in duration-100">
                  {[
                    { id: 'kanban' as const, label: 'Tablero Kanban' },
                    { id: 'table' as const, label: 'Directorio' },
                    { id: 'calendar' as const, label: 'Citas y Demos' },
                    { id: 'renewals' as const, label: 'Renovaciones', badge: pendingRenewalsCount > 0 ? `${pendingRenewalsCount}` : null }
                  ].map((sub) => {
                    const isSubActive = pipelineSubView === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (onPipelineSubViewChange) onPipelineSubViewChange(sub.id);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          isSubActive
                            ? 'text-teal-900 dark:text-teal-200 font-bold bg-teal-100/60 dark:bg-teal-900/40'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span className="text-[9px] font-bold px-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quiet Submenu for WhatsApp Workspace */}
              {item.id === 'whatsapp' && isActive && (
                <div className="pl-8 pr-1 py-1 space-y-0.5 animate-in fade-in duration-100">
                  {[
                    { id: 'cadence' as const, label: 'Cadencias (6 Pasos)' },
                    { id: 'templates' as const, label: 'Biblioteca Plantillas' }
                  ].map((sub) => {
                    const isSubActive = whatsappSubView === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (onWhatsAppSubViewChange) onWhatsAppSubViewChange(sub.id);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          isSubActive
                            ? 'text-purple-900 dark:text-purple-200 font-bold bg-purple-100/60 dark:bg-purple-900/40'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Direct Services & Pricing Plan Tab */}
        <button
          id="sidebar-nav-services"
          onClick={onOpenServicesModal}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-teal-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 border border-emerald-200/70 dark:border-emerald-800/60 transition-all cursor-pointer shadow-2xs hover:translate-x-0.5 mt-2"
          title="Catálogo de Planes: 1 año $99 y 2 años $150"
        >
          <div className="flex items-center gap-2.5">
            <ThreeDServicesIcon size={20} />
            <span className="font-bold text-emerald-950 dark:text-emerald-200">Planes / Precios</span>
          </div>
          <span className="text-[10px] font-black bg-emerald-600 dark:bg-emerald-500 text-white px-1.5 py-0.2 rounded-md shadow-2xs">
            $99/$150
          </span>
        </button>

        {/* Quick Tools & Management Section */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
            Herramientas
          </div>

          {/* Bulk Import */}
          {onOpenBulkModal && (
            <button
              onClick={onOpenBulkModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Carga Masiva Excel</span>
            </button>
          )}

          {/* Local Hosting / Offline Mode */}
          <button
            onClick={onOpenLocalHostingModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Modo Offline / PWA</span>
          </button>

          {/* Quick Manual Snapshot Save */}
          <button
            onClick={handleManualSave}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              savedFeedback
                ? 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 shadow-xs'
                : 'bg-teal-50/90 dark:bg-slate-800 hover:bg-teal-100/90 dark:hover:bg-slate-750 text-teal-800 dark:text-teal-300 border-teal-200/80 dark:border-slate-700 shadow-2xs hover:translate-x-0.5'
            }`}
            title="Guardar instantánea del CRM en memoria local"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  savedFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-600 dark:bg-teal-500 text-white shadow-2xs'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-teal-950 dark:text-slate-200">Guardar Snapshot</span>
            </div>
            {savedFeedback ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded animate-in fade-in">
                <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                <span>¡Guardado!</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200/60 dark:border-teal-800/60">
                Local
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Footer KPI & Dark Mode Toggle Switch Card */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0 space-y-2">
        {/* Dark Mode Quick Switcher */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
              <span>{isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
              {isDarkMode ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Médicos:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalLeads}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Recaudado:</span>
            <span className="font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(wonRevenue)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
