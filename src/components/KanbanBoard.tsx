import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  SlidersHorizontal, 
  Layers, 
  Columns3, 
  MapPin, 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  BellRing
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';
import { getAllSpecialties } from '../data/specialties';
import { ECUADOR_SECTORS } from '../data/ecuadorData';
import { formatCurrency } from '../utils/storage';
import { KanbanCard } from './KanbanCard';
import { getLeadOverdueInfo } from '../utils/notificationService';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface KanbanBoardProps {
  leads: MedicalLead[];
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onDeleteLead?: (leadId: string) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onAddNewLeadInStage: (stage: StageId) => void;
  onOpenServicesModal?: () => void;
  filterOnlyOverdue?: boolean;
  onToggleOnlyOverdue?: () => void;
  onOpenNotificationCenter?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onOpenEdit,
  onOpenWhatsApp,
  onDeleteLead,
  onStageChange,
  onAddNewLeadInStage,
  onOpenServicesModal,
  filterOnlyOverdue = false,
  onToggleOnlyOverdue,
  onOpenNotificationCenter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leadToDelete, setLeadToDelete] = useState<MedicalLead | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [internalOnlyOverdue, setInternalOnlyOverdue] = useState(false);
  
  // Drag & drop state for moving cards across stages
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<StageId | null>(null);

  const effectiveOnlyOverdue = filterOnlyOverdue || internalOnlyOverdue;
  const overdueCount = leads.filter((l) => getLeadOverdueInfo(l, 48).isOverdue).length;

  const toggleOverdueFilter = () => {
    if (onToggleOnlyOverdue) {
      onToggleOnlyOverdue();
    } else {
      setInternalOnlyOverdue(!internalOnlyOverdue);
    }
  };
  
  // UI State: Filter drawer open/close
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState(false);

  // Mobile stage view (default to 'prospecto')
  const [activeMobileStage, setActiveMobileStage] = useState<StageId>('prospecto');
  // Mobile mode toggle: 'stage' (step-by-step swipe view) vs 'columns' (horizontal scroll)
  const [mobileViewMode, setMobileViewMode] = useState<'stage' | 'columns'>('stage');

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    if (effectiveOnlyOverdue) {
      const overdue = getLeadOverdueInfo(lead, 48);
      if (!overdue.isOverdue) return false;
    }

    const matchesSearch =
      searchTerm.trim() === '' ||
      lead.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.clinicOrHospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.sector && lead.sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.serviceName && lead.serviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.phone.includes(searchTerm);

    const matchesSpecialty =
      selectedSpecialty === 'all' || lead.specialty === selectedSpecialty;

    const matchesPayment =
      selectedPaymentStatus === 'all' || lead.paymentStatus === selectedPaymentStatus;

    const matchesCity =
      selectedCity === 'all' || (lead.city && lead.city.toLowerCase() === selectedCity.toLowerCase());

    const matchesSector =
      selectedSector === 'all' || (lead.sector && lead.sector.toLowerCase() === selectedSector.toLowerCase());

    const matchesService =
      selectedService === 'all' || 
      (selectedService === '99' && (lead.estimatedValue === 99 || (lead.serviceName && lead.serviceName.includes('99')))) ||
      (selectedService === '150' && (lead.estimatedValue === 150 || (lead.serviceName && lead.serviceName.includes('150')))) ||
      (lead.serviceName && lead.serviceName.toLowerCase().includes(selectedService.toLowerCase()));

    return matchesSearch && matchesSpecialty && matchesPayment && matchesCity && matchesSector && matchesService;
  });

  // Get leads for a stage
  const getStageLeads = (stageId: StageId) => {
    return filteredLeads.filter((l) => l.stage === stageId);
  };

  // Drag and drop handlers
  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: StageId) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  // Drop on column container: changes the lead's stage
  const handleDropOnColumn = (e: React.DragEvent, targetStage: StageId) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedLeadId) return;

    const draggedLead = leads.find((l) => l.id === draggedLeadId);
    if (!draggedLead) return;

    if (draggedLead.stage !== targetStage) {
      onStageChange(draggedLeadId, targetStage);
    }

    setDraggedLeadId(null);
  };

  // Count active filters (excluding search)
  const activeFiltersCount = 
    (selectedSpecialty !== 'all' ? 1 : 0) +
    (selectedPaymentStatus !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0) +
    (selectedSector !== 'all' ? 1 : 0) +
    (selectedService !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedPaymentStatus('all');
    setSelectedCity('all');
    setSelectedSector('all');
    setSelectedService('all');
  };

  // Navigation helpers for mobile stage view
  const currentStageIndex = STAGES.findIndex((s) => s.id === activeMobileStage);
  const prevStage = currentStageIndex > 0 ? STAGES[currentStageIndex - 1] : null;
  const nextStage = currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null;

  const currentStageMeta = STAGES[currentStageIndex] || STAGES[0];
  const activeStageLeads = getStageLeads(activeMobileStage);
  const activeStageTotalValue = activeStageLeads.reduce(
    (acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue),
    0
  );

  return (
    <div className="p-3 sm:p-6 w-full space-y-4 pb-20 md:pb-6">
      
      {/* Search Bar, Filter Tray & Sector Segment Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-2xs space-y-2.5 transition-colors duration-200">
        
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-input-kanban"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por médico, sector (Jocay, Centro...), clínica o servicio..."
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Quick Filter: Stale Leads (+48h) */}
            <button
              id="btn-filter-overdue-kanban"
              onClick={toggleOverdueFilter}
              title={
                effectiveOnlyOverdue 
                  ? 'Quitar filtro de inactividad' 
                  : 'Filtrar prospectos médicos con más de 48h sin contacto'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                effectiveOnlyOverdue
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : overdueCount > 0
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${effectiveOnlyOverdue ? 'text-white' : overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="hidden xs:inline">Sin contacto (+48h)</span>
              <span className="xs:hidden">+48h</span>
              {overdueCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  effectiveOnlyOverdue ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
                }`}>
                  {overdueCount}
                </span>
              )}
            </button>

            {/* Filter Toggle Button with Badge */}
            <button
              id="btn-toggle-filters"
              onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeFiltersCount > 0 || isFilterTrayOpen
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-teal-600 text-white rounded-full text-[10px] font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Expandable Filter Tray */}
        {isFilterTrayOpen && (
          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Specialty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Especialidad
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="all">Todas ({leads.length})</option>
                {getAllSpecialties().map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Ciudad (Ecuador)
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="all">Todas las ciudades</option>
                <option value="Manta">Manta</option>
                <option value="Portoviejo">Portoviejo</option>
                <option value="Guayaquil">Guayaquil</option>
                <option value="Quito">Quito</option>
                <option value="Cuenca">Cuenca</option>
              </select>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Sector / Zona
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="all">Todos los sectores</option>
                {ECUADOR_SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan / Pricing */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Plan Ofertado
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="all">Todos los planes</option>
                <option value="99">Plan 1 año ($99 USD)</option>
                <option value="150">Plan 2 años ($150 USD)</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Estado Pago
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="all">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="parcial">Anticipo / Parcial</option>
                <option value="pendiente">Pendiente</option>
                <option value="no_aplica">No Aplica</option>
              </select>
            </div>

            {/* Clear Filters Reset */}
            {activeFiltersCount > 0 && (
              <div className="sm:col-span-2 lg:col-span-5 flex justify-end pt-1">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar todos los filtros</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Bar (shown only when filters are active) */}
        {activeFiltersCount > 0 && !isFilterTrayOpen && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Filtros activos:</span>
            {selectedSpecialty !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-medium">
                {selectedSpecialty}
                <button type="button" onClick={() => setSelectedSpecialty('all')} className="hover:text-teal-950 dark:hover:text-teal-100 font-bold ml-0.5">×</button>
              </span>
            )}
            {selectedSector !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-medium">
                Sector: {selectedSector}
                <button type="button" onClick={() => setSelectedSector('all')} className="hover:text-slate-950 dark:hover:text-white font-bold ml-0.5">×</button>
              </span>
            )}
            {selectedService !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium">
                Plan: {selectedService === '99' ? '$99' : '$150'}
                <button type="button" onClick={() => setSelectedService('all')} className="hover:text-emerald-950 dark:hover:text-white font-bold ml-0.5">×</button>
              </span>
            )}
            {selectedPaymentStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[11px] font-medium">
                Pago: {selectedPaymentStatus}
                <button type="button" onClick={() => setSelectedPaymentStatus('all')} className="hover:text-sky-950 dark:hover:text-white font-bold ml-0.5">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline ml-1 cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>
        )}

      </div>

      {/* 48h Overdue Leads Alert Ribbon */}
      {overdueCount > 0 && !effectiveOnlyOverdue && (
        <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60 rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {overdueCount === 1 
                  ? '1 prospecto médico requiere actualización (+48h)' 
                  : `${overdueCount} prospectos médicos requieren actualización (+48h)`}
              </h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Han transcurrido más de 48 horas sin registrar contacto en el CRM.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setInternalOnlyOverdue(true)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Filtrar en Tablero
            </button>
            {onOpenNotificationCenter && (
              <button
                onClick={onOpenNotificationCenter}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Ver Notificaciones</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Active Alert Banner */}
      {effectiveOnlyOverdue && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <span className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Mostrando únicamente los <strong>{filteredLeads.length}</strong> médicos con más de 48 horas sin actualización</span>
          </span>
          <button
            onClick={() => {
              setInternalOnlyOverdue(false);
              if (onToggleOnlyOverdue && filterOnlyOverdue) onToggleOnlyOverdue();
            }}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs"
          >
            Mostrar Todos
          </button>
        </div>
      )}

      {/* MOBILE STAGE-BY-STAGE SWIPE VIEW */}
      <div className={`md:hidden ${mobileViewMode === 'stage' ? 'block' : 'hidden'}`}>
        
        {/* Mobile Stage Selector Pill Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {STAGES.map((s) => {
            const count = filteredLeads.filter((l) => l.stage === s.id).length;
            const isActive = activeMobileStage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveMobileStage(s.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer min-h-[40px] touch-manipulation ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{s.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Card View */}
        <div className="bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 mt-2">
          
          {/* Header of Active Stage with Next / Prev Arrows */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${currentStageMeta.color}`} />
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {currentStageMeta.name}
                </h3>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeStageLeads.length} médicos · {formatCurrency(activeStageTotalValue)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={!prevStage}
                onClick={() => prevStage && setActiveMobileStage(prevStage.id)}
                className="w-9 h-9 rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 cursor-pointer flex items-center justify-center touch-manipulation"
                title="Etapa anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!nextStage}
                onClick={() => nextStage && setActiveMobileStage(nextStage.id)}
                className="w-9 h-9 rounded-xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 cursor-pointer flex items-center justify-center touch-manipulation"
                title="Etapa siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leads List for this stage */}
          <div className="mt-3 space-y-2.5">
            {activeStageLeads.map((lead, idx) => (
              <KanbanCard
                key={`${lead.id || 'kb-mobile'}-${idx}`}
                lead={lead}
                onOpenEdit={onOpenEdit}
                onOpenWhatsApp={onOpenWhatsApp}
                onStageChange={onStageChange}
                onDeleteLead={onDeleteLead ? (l) => setLeadToDelete(l) : undefined}
              />
            ))}

            {activeStageLeads.length === 0 && (
              <div className="py-8 text-center text-slate-600 dark:text-slate-300 text-xs bg-white/60 dark:bg-slate-850/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 font-medium">
                No hay médicos en la etapa {currentStageMeta.name}
              </div>
            )}

            <button
              onClick={() => onAddNewLeadInStage(activeMobileStage)}
              className="w-full py-3 rounded-xl border border-dashed border-teal-300 dark:border-teal-700 bg-teal-50/60 dark:bg-teal-950/30 hover:bg-teal-50 dark:hover:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir médico a {currentStageMeta.name}</span>
            </button>
          </div>

        </div>

      </div>

      {/* DESKTOP FULL KANBAN BOARD (AND MOBILE COLUMN HORIZONTAL SCROLL VIEW) */}
      <div
        className={`${
          mobileViewMode === 'columns' ? 'block' : 'hidden md:block'
        } overflow-x-auto pb-4`}
      >
        <div className="flex gap-4 min-w-full items-start">
          {STAGES.map((stage) => {
            const stageLeads = getStageLeads(stage.id);
            const stageTotalValue = stageLeads.reduce(
              (acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue),
              0
            );
            const isDragOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                id={`kanban-col-${stage.id}`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnColumn(e, stage.id)}
                className={`flex-1 min-w-[290px] lg:min-w-[310px] shrink-0 flex flex-col rounded-2xl transition-all duration-150 ${
                  isDragOver
                    ? 'bg-teal-50/90 dark:bg-teal-950/40 ring-2 ring-teal-500 border-teal-400 dark:border-teal-600'
                    : 'bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Stage Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full ${stage.color} shadow-2xs`} />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                      {stage.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {stageLeads.length}
                    </span>
                    <button
                      id={`btn-add-in-stage-${stage.id}`}
                      onClick={() => onAddNewLeadInStage(stage.id)}
                      title={`Agregar médico en ${stage.name}`}
                      className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-header: Total stage estimated amount */}
                <div className="px-4 py-2 bg-slate-50/90 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <span>Valor en etapa:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(stageTotalValue)}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 min-h-[460px] max-h-[calc(100vh-250px)] overflow-y-auto">
                  {stageLeads.map((lead, idx) => {
                    return (
                      <div
                        key={`${lead.id || 'kb-col'}-${idx}`}
                        draggable
                        onDragStart={() => handleDragStart(lead.id)}
                        className="transition-all active:cursor-grabbing"
                      >
                        <KanbanCard
                          lead={lead}
                          onOpenEdit={onOpenEdit}
                          onOpenWhatsApp={onOpenWhatsApp}
                          onStageChange={onStageChange}
                          onDeleteLead={onDeleteLead ? (l) => setLeadToDelete(l) : undefined}
                        />
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-4 text-center">
                      <span>Sin médicos en {stage.name.toLowerCase()}</span>
                      <button
                        onClick={() => onAddNewLeadInStage(stage.id)}
                        className="mt-2 text-teal-600 dark:text-teal-400 hover:underline font-bold text-[11px] cursor-pointer"
                      >
                        + Agregar
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer quick add */}
                <div className="p-2 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                  <button
                    onClick={() => onAddNewLeadInStage(stage.id)}
                    className="w-full py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal for Kanban Cards */}
      <DeleteConfirmationModal
        isOpen={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={() => {
          if (leadToDelete && onDeleteLead) {
            onDeleteLead(leadToDelete.id);
          }
        }}
        lead={leadToDelete}
      />

    </div>
  );
};
