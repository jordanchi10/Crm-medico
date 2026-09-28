import React, { useState, useRef, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Users, 
  UserPlus,
  RotateCcw,
  Sparkles,
  Save,
  HardDrive,
  MoreVertical,
  ChevronDown,
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
  Sun,
  Moon,
  RefreshCw,
  Clock
} from 'lucide-react';
import { AppTab, MedicalLead } from '../types';
import { formatCurrency } from '../utils/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  leads: MedicalLead[];
  onNewLeadClick: () => void;
  onResetData: () => void;
  onOpenLocalHostingModal: () => void;
  onManualSave: () => void;
  onOpenServicesModal: () => void;
  overdueCount?: number;
  onOpenNotificationCenter?: () => void;
  onOpenBulkModal?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  leads,
  onNewLeadClick,
  onResetData,
  onOpenLocalHostingModal,
  onManualSave,
  onOpenServicesModal,
  overdueCount = 0,
  onOpenNotificationCenter,
  onOpenBulkModal,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Quick summary metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.stage === 'ganado');
  const wonRevenue = wonLeads.reduce(
    (acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue),
    0
  );

  const handleManualSave = () => {
    onManualSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const tabTitles: Record<AppTab, { title: string; subtitle: string }> = {
    today: {
      title: 'Mi Jornada de Hoy',
      subtitle: 'Panel ejecutivo diario, agenda de citas y metas del mes'
    },
    pipeline: {
      title: 'Especialistas & Embudo Comercial',
      subtitle: 'Gestión unificada: Tablero Kanban, Directorio, Citas y Renovaciones'
    },
    whatsapp: {
      title: 'Centro de WhatsApp & Secuencias',
      subtitle: 'Cadencias multicanal de 6 toques y plantillas personalizadas'
    },
    analytics: {
      title: 'Reportes y Métricas',
      subtitle: 'Tasa de conversión por especialidad e ingresos generados'
    },
    kanban: {
      title: 'Tablero Kanban',
      subtitle: 'Seguimiento visual del embudo comercial de especialistas'
    },
    table: {
      title: 'Directorio de Médicos',
      subtitle: 'Base de datos de médicos, contactos y estado de pagos'
    },
    calendar: {
      title: 'Calendario de Citas y Demos',
      subtitle: 'Planificación de visitas, llamadas y demostraciones en Google Calendar'
    },
    cadence: {
      title: 'Cadencia de Seguimiento Automática',
      subtitle: 'Secuencias multicanal de 6 toques por WhatsApp para cierre de ventas'
    },
    renewals: {
      title: 'Renovaciones Anuales y Retención',
      subtitle: 'Control de vencimientos a 30 días, prevención de churn y recurrencia'
    },
    templates: {
      title: 'Plantillas de WhatsApp',
      subtitle: 'Mensajes personalizados y archivos para prospección'
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-20 shadow-xs transition-colors duration-200">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
            
            {/* Mobile: Brand Logo & Country Tag */}
            <div className="flex md:hidden items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 flex items-center justify-center text-white shadow-md shadow-red-500/30 shrink-0 border border-white/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  MédicoEC CRM
                </span>
                <span 
                  className="text-teal-800 dark:text-teal-300 font-bold text-xs px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-center shadow-2xs"
                  title="Ecuador (+593)"
                >
                  <span className="text-sm leading-none">🇪🇨</span>
                </span>
              </div>
            </div>

            {/* Desktop: Current Section Title & Breadcrumb */}
            <div className="hidden md:flex items-center gap-3">
              <div>
                <h1 className="text-sm lg:text-base font-black text-slate-900 dark:text-white leading-tight">
                  {tabTitles[currentTab].title}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                  {tabTitles[currentTab].subtitle}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              
              {/* Quick KPI pill on desktop */}
              <div className="hidden xl:flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/70 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 shadow-2xs">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                  <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                  {totalLeads} médicos
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {formatCurrency(wonRevenue)}
                </span>
              </div>

              {/* Theme Toggle Button (Dark / Light Mode) */}
              {onToggleDarkMode && (
                <button
                  id="btn-toggle-theme"
                  onClick={onToggleDarkMode}
                  title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                  aria-label="Alternar modo oscuro"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-200" />
                  )}
                </button>
              )}

              {/* Notification Center Bell (Alerts >48h) */}
              <button
                id="btn-notifications-bell"
                onClick={onOpenNotificationCenter}
                title={
                  overdueCount > 0
                    ? `${overdueCount} prospecto(s) con más de 48h sin contacto`
                    : 'Centro de notificaciones y alertas'
                }
                className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 ${
                  overdueCount > 0
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                }`}
                aria-label="Notificaciones"
              >
                {overdueCount > 0 ? (
                  <BellRing className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                )}
                {overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-900 animate-bounce">
                    {overdueCount}
                  </span>
                )}
              </button>

              {/* PWA Install Button (Mobile & Desktop) */}
              <div className="hidden sm:block">
                <PWAInstallButton variant="navbar" />
              </div>

              {/* Primary Action Button: "Nuevo Médico" (Icon on Mobile, Hidden on Desktop since it's on Sidebar or available here) */}
              <button
                id="btn-new-lead"
                onClick={onNewLeadClick}
                title="Registrar Nuevo Especialista Médico"
                className="inline-flex md:hidden items-center justify-center gap-1.5 p-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:from-teal-800 active:to-emerald-800 text-white text-xs font-bold shadow-sm shadow-teal-600/30 hover:shadow-md transition-all whitespace-nowrap cursor-pointer hover:-translate-y-0.5 active:scale-95"
                aria-label="Registrar Nuevo Médico"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
              </button>

              {/* Options & Backup Dropdown Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  id="btn-options-menu"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  title="Opciones del sistema, respaldos y catálogo"
                  className="inline-flex items-center justify-center p-2 sm:px-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  aria-expanded={isMenuOpen}
                >
                  <span className="hidden sm:inline mr-1 font-bold">Opciones</span>
                  <ChevronDown className="w-3.5 h-3.5 hidden sm:inline text-slate-500 dark:text-slate-400" />
                  <MoreVertical className="w-4 h-4 sm:hidden text-slate-600 dark:text-slate-300" />
                </button>

                {/* Dropdown Popover */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-68 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    
                    {/* Header in dropdown */}
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>MédicoEC CRM Ecuador</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Gestión Comercial y Médica</p>
                    </div>

                    {/* Dark mode quick trigger inside dropdown */}
                    {onToggleDarkMode && (
                      <button
                        onClick={() => {
                          onToggleDarkMode();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center justify-between font-medium transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {isDarkMode ? (
                            <Sun className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Moon className="w-4 h-4 text-slate-500" />
                          )}
                          <div>
                            <div className="font-bold">Tema: {isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}</div>
                            <div className="text-[10px] text-slate-400">Alternar contraste visual</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                          {isDarkMode ? 'Oscuro' : 'Claro'}
                        </span>
                      </button>
                    )}

                    {/* Bulk Leads CSV / Excel Modal Trigger */}
                    {onOpenBulkModal && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenBulkModal();
                        }}
                        className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <div>
                          <div className="font-bold">Carga Masiva de Médicos</div>
                          <div className="text-[10px] text-slate-400">Pegar lista de doctores / Excel</div>
                        </div>
                      </button>
                    )}

                    {/* Services / Pricing Plans Manager */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenServicesModal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <div>
                        <div className="font-bold">Planes de Venta ($99 y $150)</div>
                        <div className="text-[10px] text-slate-400">Personalizar servicios y tarifas</div>
                      </div>
                    </button>

                    {/* Local Hosting / Offline Mode Info */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenLocalHostingModal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <div>
                        <div className="font-bold">Hospedaje Local / PWA</div>
                        <div className="text-[10px] text-slate-400">Ejecutar sin servidor en tu PC</div>
                      </div>
                    </button>

                    {/* Manual Save Button */}
                    <button
                      onClick={() => {
                        handleManualSave();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <div className="font-bold">Guardar Ahora (Snapshot)</div>
                        <div className="text-[10px] text-slate-400">Copia de seguridad instantánea</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    {/* Reset Demo Data Button */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onResetData();
                      }}
                      className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      <span>Restablecer datos demo</span>
                    </button>

                    {/* Footer Info */}
                    <div className="px-4 py-2 mt-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[10px] text-slate-400 text-center">
                      Auto-guardado activo · Ecuador 2026
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Native App Dock) */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] select-none transition-colors duration-200" 
        style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <nav className="grid grid-cols-5 items-center h-16 px-1">
          {/* 1. Mi Jornada */}
          <button
            id="mobile-nav-today"
            onClick={() => setCurrentTab('today')}
            className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Mi Jornada de Hoy"
          >
            <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'today'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
              <Sun className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] leading-none mt-1 transition-colors ${
              currentTab === 'today'
                ? 'font-bold text-amber-800 dark:text-amber-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            }`}>
              Jornada
            </span>
          </button>

          {/* 2. Embudo y Médicos (Pipeline Workspace) */}
          <button
            id="mobile-nav-pipeline"
            onClick={() => setCurrentTab('pipeline')}
            className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Embudo Comercial y Directorio"
          >
            <div className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'pipeline' || currentTab === 'kanban' || currentTab === 'table' || currentTab === 'calendar' || currentTab === 'renewals'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
              <LayoutDashboard className="w-4 h-4 stroke-[2.2]" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-rose-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                  {overdueCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] leading-none mt-1 transition-colors ${
              currentTab === 'pipeline' || currentTab === 'kanban' || currentTab === 'table' || currentTab === 'calendar' || currentTab === 'renewals'
                ? 'font-bold text-teal-800 dark:text-teal-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            }`}>
              Embudo
            </span>
          </button>

          {/* 3. WhatsApp Hub */}
          <button
            id="mobile-nav-whatsapp"
            onClick={() => setCurrentTab('whatsapp')}
            className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Centro de WhatsApp y Cadencias"
          >
            <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'whatsapp' || currentTab === 'cadence' || currentTab === 'templates'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
              <MessageCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] leading-none mt-1 transition-colors ${
              currentTab === 'whatsapp' || currentTab === 'cadence' || currentTab === 'templates'
                ? 'font-bold text-purple-800 dark:text-purple-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            }`}>
              WhatsApp
            </span>
          </button>

          {/* 4. Reportes & Métricas */}
          <button
            id="mobile-nav-analytics"
            onClick={() => setCurrentTab('analytics')}
            className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Reportes y Métricas"
          >
            <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'analytics'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
              <BarChart3 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] leading-none mt-1 transition-colors ${
              currentTab === 'analytics'
                ? 'font-bold text-teal-800 dark:text-teal-400'
                : 'font-medium text-slate-500 dark:text-slate-400'
            }`}>
              Reportes
            </span>
          </button>

          {/* 5. Planes ($99/$150) */}
          <button
            id="mobile-nav-services"
            onClick={onOpenServicesModal}
            className="flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Planes y Tarifas"
          >
            <div className="flex items-center justify-center w-10 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors">
              <Tag className="w-4 h-4 stroke-[2.2] text-emerald-700 dark:text-emerald-300" />
            </div>
            <span className="text-[10px] leading-none mt-1 font-bold text-emerald-800 dark:text-emerald-400">
              Planes
            </span>
          </button>
        </nav>
      </div>
    </>
  );
};
