import React, { useState, useRef, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Users, 
  RotateCcw,
  Sparkles,
  Save,
  HardDrive,
  MoreVertical,
  ChevronDown,
  Briefcase,
  Bell,
  BellRing
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

              {/* Primary Action Button: "+ Nuevo Médico" */}
              <button
                id="btn-new-lead"
                onClick={onNewLeadClick}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:from-teal-800 active:to-emerald-800 text-white text-xs font-bold shadow-sm shadow-teal-600/30 hover:shadow-md transition-all whitespace-nowrap cursor-pointer hover:-translate-y-0.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Nuevo Médico</span>
                <span className="xs:hidden">Médico</span>
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

      {/* Mobile Bottom Navigation Bar (Native App Dock with 3D Icons, Badges & Haptic Touch Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] select-none" style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom, 0px))' }}>
        <nav className="grid grid-cols-5 h-15 items-center px-1">
          <button
            id="mobile-nav-kanban"
            onClick={() => setCurrentTab('kanban')}
            className={`relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer active:scale-90 ${
              currentTab === 'kanban'
                ? 'text-teal-700 font-extrabold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-all ${currentTab === 'kanban' ? 'bg-teal-50 shadow-2xs scale-105' : ''}`}>
              <ThreeDKanbanIcon size={22} />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <span className="leading-tight mt-0.5">Tablero</span>
            {currentTab === 'kanban' && (
              <span className="w-1.5 h-1 bg-teal-600 rounded-full mt-0.5 animate-in fade-in" />
            )}
          </button>

          <button
            id="mobile-nav-table"
            onClick={() => setCurrentTab('table')}
            className={`relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer active:scale-90 ${
              currentTab === 'table'
                ? 'text-teal-700 font-extrabold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-all ${currentTab === 'table' ? 'bg-teal-50 shadow-2xs scale-105' : ''}`}>
              <ThreeDProspectsIcon size={22} />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {overdueCount}
                </span>
              )}
            </div>
            <span className="leading-tight mt-0.5">Médicos</span>
            {currentTab === 'table' && (
              <span className="w-1.5 h-1 bg-teal-600 rounded-full mt-0.5 animate-in fade-in" />
            )}
          </button>

          <button
            id="mobile-nav-analytics"
            onClick={() => setCurrentTab('analytics')}
            className={`relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer active:scale-90 ${
              currentTab === 'analytics'
                ? 'text-teal-700 font-extrabold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${currentTab === 'analytics' ? 'bg-teal-50 shadow-2xs scale-105' : ''}`}>
              <ThreeDAnalyticsIcon size={22} />
            </div>
            <span className="leading-tight mt-0.5">Reportes</span>
            {currentTab === 'analytics' && (
              <span className="w-1.5 h-1 bg-teal-600 rounded-full mt-0.5 animate-in fade-in" />
            )}
          </button>

          <button
            id="mobile-nav-templates"
            onClick={() => setCurrentTab('templates')}
            className={`relative flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer active:scale-90 ${
              currentTab === 'templates'
                ? 'text-teal-700 font-extrabold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${currentTab === 'templates' ? 'bg-teal-50 shadow-2xs scale-105' : ''}`}>
              <ThreeDWhatsAppIcon size={22} />
            </div>
            <span className="leading-tight mt-0.5">WhatsApp</span>
            {currentTab === 'templates' && (
              <span className="w-1.5 h-1 bg-teal-600 rounded-full mt-0.5 animate-in fade-in" />
            )}
          </button>

          <button
            id="mobile-nav-services"
            onClick={onOpenServicesModal}
            className="flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold text-teal-800 hover:text-teal-900 transition-all cursor-pointer active:scale-90"
          >
            <div className="p-1 rounded-xl bg-teal-50/90 border border-teal-200/60 shadow-2xs">
              <ThreeDServicesIcon size={22} />
            </div>
            <span className="leading-tight mt-0.5 font-black text-teal-900">$99 / $150</span>
          </button>
        </nav>
      </div>
    </>
  );
};
