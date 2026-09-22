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
  Tag
} from 'lucide-react';
import { MedicalLead } from '../types';
import { formatCurrency } from '../utils/storage';
import { 
  ThreeDKanbanIcon, 
  ThreeDProspectsIcon, 
  ThreeDAnalyticsIcon, 
  ThreeDWhatsAppIcon,
  ThreeDServicesIcon
} from './ThreeDIcons';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: 'kanban' | 'table' | 'analytics' | 'templates';
  setCurrentTab: (tab: 'kanban' | 'table' | 'analytics' | 'templates') => void;
  leads: MedicalLead[];
  onNewLeadClick: () => void;
  onResetData: () => void;
  onOpenLocalHostingModal: () => void;
  onManualSave: () => void;
  onOpenServicesModal: () => void;
  overdueCount?: number;
  onOpenNotificationCenter?: () => void;
  onOpenBulkModal?: () => void;
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
  onOpenBulkModal
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

  return (
    <>
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
            
            {/* Brand Logo & Country Tag */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-red-400 flex items-center justify-center text-white shadow-md shadow-red-500/30 shrink-0 border border-white/20">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  MedCRM
                </span>
                <span 
                  className="text-teal-800 font-bold text-xs px-1.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 flex items-center justify-center shadow-2xs"
                  title="Ecuador (+593)"
                >
                  <span className="text-sm leading-none">🇪🇨</span>
                </span>
              </div>
            </div>

            {/* Desktop 3D Navigation Tabs with Tactile Depth */}
            <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner" aria-label="Tabs">
              <button
                id="tab-kanban"
                onClick={() => setCurrentTab('kanban')}
                className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'kanban'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 -translate-y-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ThreeDKanbanIcon size={20} />
                <span>Tablero</span>
              </button>

              <button
                id="tab-table"
                onClick={() => setCurrentTab('table')}
                className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'table'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 -translate-y-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ThreeDProspectsIcon size={20} />
                <span>Prospectos</span>
              </button>

              <button
                id="tab-analytics"
                onClick={() => setCurrentTab('analytics')}
                className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'analytics'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 -translate-y-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ThreeDAnalyticsIcon size={20} />
                <span>Reportes</span>
              </button>

              <button
                id="tab-templates"
                onClick={() => setCurrentTab('templates')}
                className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'templates'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 -translate-y-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ThreeDWhatsAppIcon size={20} />
                <span>Plantillas</span>
              </button>

              {/* Direct 3D Services Tab */}
              <button
                id="tab-services"
                onClick={onOpenServicesModal}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/80 transition-all cursor-pointer hover:-translate-y-0.5 shadow-2xs"
                title="Servicios de base: 1 año $99 y 2 años $150"
              >
                <ThreeDServicesIcon size={20} />
                <span className="flex items-center gap-1">
                  <span>Servicios</span>
                  <span className="text-[10px] font-black bg-teal-600 text-white px-1.5 py-0.2 rounded-md shadow-2xs">
                    $99/$150
                  </span>
                </span>
              </button>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              
              {/* Quick KPI pill on desktop */}
              <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 shadow-2xs">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {totalLeads} médicos
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-bold text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {formatCurrency(wonRevenue)}
                </span>
              </div>

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
                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                aria-label="Notificaciones"
              >
                {overdueCount > 0 ? (
                  <BellRing className="w-4 h-4 text-rose-600 animate-pulse" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-600" />
                )}
                {overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs border-2 border-white animate-bounce">
                    {overdueCount}
                  </span>
                )}
              </button>

              {/* PWA Install Button (Mobile & Desktop) */}
              <PWAInstallButton variant="navbar" />

              {/* Primary Action Button: "Nuevo Médico" (Icon on Mobile, Icon+Text on Desktop) */}
              <button
                id="btn-new-lead"
                onClick={onNewLeadClick}
                title="Registrar Nuevo Especialista Médico"
                className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:from-teal-800 active:to-emerald-800 text-white text-xs font-bold shadow-sm shadow-teal-600/30 hover:shadow-md transition-all whitespace-nowrap cursor-pointer hover:-translate-y-0.5 active:scale-95"
                aria-label="Registrar Nuevo Médico"
              >
                <UserPlus className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">Nuevo Médico</span>
              </button>

              {/* Options & Backup Dropdown Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  id="btn-options-menu"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  title="Opciones del sistema, respaldos y catálogo"
                  className="inline-flex items-center justify-center p-2 sm:px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  aria-expanded={isMenuOpen}
                >
                  <span className="hidden sm:inline mr-1 font-bold">Opciones</span>
                  <ChevronDown className="w-3.5 h-3.5 hidden sm:inline text-slate-500" />
                  <MoreVertical className="w-4 h-4 sm:hidden text-slate-600" />
                </button>

                {/* Dropdown Popover */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-68 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                    
                    {/* Header in dropdown */}
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/80">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                          Gestión Local & Servicios
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        CRM Autónomo para Ecuador (+593)
                      </p>
                    </div>

                    {/* Notification & Alerts Option */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenNotificationCenter) onOpenNotificationCenter();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-rose-50/70 text-slate-800 font-semibold transition-colors cursor-pointer"
                    >
                      <BellRing className={`w-4 h-4 shrink-0 ${overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span>Alertas de Inactividad</span>
                          {overdueCount > 0 ? (
                            <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full border border-rose-200">
                              {overdueCount} alerta{overdueCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                              Al día
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Supervisión de +48h y alertas de escritorio
                        </div>
                      </div>
                    </button>

                    {/* Services Manager Option */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenServicesModal();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-teal-50/70 text-slate-800 font-semibold transition-colors cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-teal-600 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span>Catálogo de Servicios</span>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded">
                            $99/$150
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Planes 1 y 2 años + agregar nuevos
                        </div>
                      </div>
                    </button>

                    {/* Bulk Leads Import Option */}
                    {onOpenBulkModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBulkModal();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-teal-50/70 text-slate-800 font-semibold transition-colors cursor-pointer border-t border-slate-100"
                      >
                        <Users className="w-4 h-4 text-teal-600 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>Carga Masiva de Médicos</span>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded">
                              Excel/CSV
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Importa múltiples especialistas en lote
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Manual Save Option */}
                    <button
                      type="button"
                      onClick={() => {
                        handleManualSave();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-teal-600 shrink-0" />
                      <div className="flex-1">
                        <div>{savedFeedback ? '¡Información Guardada!' : 'Guardar Información'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Forzar guardado inmediato en almacenamiento local
                        </div>
                      </div>
                    </button>

                    {/* Backup & cPanel Option */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenLocalHostingModal();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="flex-1">
                        <div>Respaldos Diarios & cPanel</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Exportar JSON, Excel o restaurar copias
                        </div>
                      </div>
                    </button>

                    {/* PWA Mobile App Install in Menu */}
                    <PWAInstallButton variant="menu-item" onInstalled={() => setIsMenuOpen(false)} />

                    {/* Demo Data Reset Option */}
                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onResetData();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-700 font-medium transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Restaurar datos de prueba</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Native App Dock with Crisp High-Contrast Icons & Clear Typography) */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none" 
        style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <nav className="grid grid-cols-5 h-16 items-center px-1">
          {/* 1. Tablero Kanban */}
          <button
            id="mobile-nav-kanban"
            onClick={() => setCurrentTab('kanban')}
            className="relative flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Tablero Kanban"
          >
            <div className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'kanban'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
              <LayoutDashboard className="w-4.5 h-4.5 stroke-[2.2]" />
              {overdueCount > 0 && currentTab !== 'kanban' && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <span className={`text-[11px] leading-none mt-1 transition-colors ${
              currentTab === 'kanban'
                ? 'font-bold text-teal-800'
                : 'font-medium text-slate-500'
            }`}>
              Tablero
            </span>
          </button>

          {/* 2. Médicos (Tabla) */}
          <button
            id="mobile-nav-table"
            onClick={() => setCurrentTab('table')}
            className="relative flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Listado de Médicos"
          >
            <div className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'table'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
              <Users className="w-4.5 h-4.5 stroke-[2.2]" />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {overdueCount}
                </span>
              )}
            </div>
            <span className={`text-[11px] leading-none mt-1 transition-colors ${
              currentTab === 'table'
                ? 'font-bold text-teal-800'
                : 'font-medium text-slate-500'
            }`}>
              Médicos
            </span>
          </button>

          {/* 3. Reportes (Analytics) */}
          <button
            id="mobile-nav-analytics"
            onClick={() => setCurrentTab('analytics')}
            className="relative flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Reportes y Métricas"
          >
            <div className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'analytics'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
              <BarChart3 className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <span className={`text-[11px] leading-none mt-1 transition-colors ${
              currentTab === 'analytics'
                ? 'font-bold text-teal-800'
                : 'font-medium text-slate-500'
            }`}>
              Reportes
            </span>
          </button>

          {/* 4. WhatsApp (Plantillas) */}
          <button
            id="mobile-nav-templates"
            onClick={() => setCurrentTab('templates')}
            className="relative flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Plantillas WhatsApp"
          >
            <div className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
              currentTab === 'templates'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
              <MessageCircle className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <span className={`text-[11px] leading-none mt-1 transition-colors ${
              currentTab === 'templates'
                ? 'font-bold text-teal-800'
                : 'font-medium text-slate-500'
            }`}>
              WhatsApp
            </span>
          </button>

          {/* 5. Catálogo de Planes / Servicios */}
          <button
            id="mobile-nav-services"
            onClick={onOpenServicesModal}
            className="relative flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer active:scale-95"
            aria-label="Planes y Servicios Médicos"
          >
            <div className="relative flex items-center justify-center w-11 h-7 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs hover:bg-emerald-100 transition-colors">
              <Tag className="w-4.5 h-4.5 stroke-[2.2] text-emerald-700" />
            </div>
            <span className="text-[11px] leading-none mt-1 font-bold text-emerald-800">
              Planes
            </span>
          </button>
        </nav>
      </div>
    </>
  );
};
