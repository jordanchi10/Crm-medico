import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Building2, 
  SlidersHorizontal, 
  Layers, 
  Columns3, 
  MapPin, 
  Briefcase, 
  Sparkles,
  Clock,
  AlertTriangle,
  BellRing
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';
import { SPECIALTIES_LIST } from '../data/specialties';
import { ECUADOR_CITIES, ECUADOR_SECTORS } from '../data/ecuadorData';
import { formatCurrency } from '../utils/storage';
import { KanbanCard } from './KanbanCard';
import { getLeadOverdueInfo } from '../utils/notificationService';

interface KanbanBoardProps {
  leads: MedicalLead[];
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
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
  onStageChange,
  onAddNewLeadInStage,
  onOpenServicesModal,
  filterOnlyOverdue = false,
  onToggleOnlyOverdue,
  onOpenNotificationCenter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [internalOnlyOverdue, setInternalOnlyOverdue] = useState(false);
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

  // Mobile stage view (default to 'prospecto' or first stage with leads)
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

  const handleDrop = (e: React.DragEvent, targetStage: StageId) => {
    e.preventDefault();
    setDragOverStage(null);
    if (draggedLeadId) {
      onStageChange(draggedLeadId, targetStage);
      setDraggedLeadId(null);
    }
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
  const activeStageLeads = filteredLeads.filter((l) => l.stage === activeMobileStage);
  const activeStageTotalValue = activeStageLeads.reduce(
    (acc, l) => acc + (l.paidAmount > 0 ? l.paidAmount : l.estimatedValue),
    0
  );

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 pb-20 md:pb-6">
      
      {/* Search Bar, Filter Tray & Sector Segment Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-2.5">
        
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-input-kanban"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por médico, sector (Jocay, Centro...), clínica o servicio..."
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
                  ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 shadow-2xs'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${effectiveOnlyOverdue ? 'text-white' : overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
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
                  ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Mobile View Toggle: Stage focus vs Column view */}
            <div className="md:hidden flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setMobileViewMode('stage')}
                title="Vista por etapas"
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mobileViewMode === 'stage'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMobileViewMode('columns')}
                title="Vista columnas completas"
                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mobileViewMode === 'columns'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Leads Counter Badge (desktop) */}
            <div className="hidden sm:block text-xs text-slate-500 whitespace-nowrap">
              <span><strong className="text-slate-800 font-bold">{filteredLeads.length}</strong> de {leads.length} médicos</span>
            </div>
          </div>

        </div>

        {/* Quick Sector Locación Segment Pills (Requested: Centro, Jocay, Pradera, Los Esteros...) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Locación:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedSector('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSector === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {['Centro', 'Jocay', 'La Pradera', 'Los Esteros', 'Tarqui', 'Barbasquillo'].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSector(selectedSector === sec ? 'all' : sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedSector === sec
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{sec}</span>
            </button>
          ))}

          {/* Quick Service Filter Pills (1 año $99 y 2 años $150) */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto pl-2 border-l border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
              <span>Plan:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedService(selectedService === '99' ? 'all' : '99')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedService === '99'
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              1 año ($99)
            </button>
            <button
              type="button"
              onClick={() => setSelectedService(selectedService === '150' ? 'all' : '150')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedService === '150'
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              2 años ($150)
            </button>
          </div>
        </div>

        {/* Collapsible Filter Tray */}
        {isFilterTrayOpen && (
          <div className="pt-2.5 border-t border-slate-100 animate-in fade-in duration-100">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              
              {/* Specialty Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Especialidad Médica
                </label>
                <select
                  id="select-filter-specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todas las Especialidades ({SPECIALTIES_LIST.length})</option>
                  {SPECIALTIES_LIST.map((spec) => (
                    <option key={spec.name} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Sector / Locación
                </label>
                <select
                  id="select-filter-sector"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todos los Sectores</option>
                  {ECUADOR_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Plan Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Servicio Médico Ofertado
                </label>
                <select
                  id="select-filter-service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todos los Planes</option>
                  <option value="99">Perfil Médico 1 año ($99)</option>
                  <option value="150">Perfil Médico 2 años ($150)</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Estado de Cobro / Pago
                </label>
                <select
                  id="select-filter-payment"
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todos los Estados de Pago</option>
                  <option value="pagado">Pagado Total</option>
                  <option value="parcial">Con Anticipo (Parcial)</option>
                  <option value="pendiente">Pendiente de Pago</option>
                  <option value="no_aplica">No Aplica</option>
                </select>
              </div>

            </div>

            {/* Reset Filters CTA */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Limpiar todos los filtros</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 48h Overdue Leads Alert Ribbon */}
      {overdueCount > 0 && !effectiveOnlyOverdue && (
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                {overdueCount === 1 
                  ? '1 prospecto médico requiere actualización (+48h)' 
                  : `${overdueCount} prospectos médicos requieren actualización (+48h)`}
              </h4>
              <p className="text-[11px] text-rose-700">
                Han transcurrido más de 48 horas sin registrar contacto en el CRM.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setInternalOnlyOverdue(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Filtrar en Tablero
            </button>
            {onOpenNotificationCenter && (
              <button
                onClick={onOpenNotificationCenter}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <span className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Mostrando únicamente los <strong>{filteredLeads.length}</strong> médicos con más de 48 horas sin actualización</span>
          </span>
          <button
            onClick={() => {
              setInternalOnlyOverdue(false);
              if (onToggleOnlyOverdue && filterOnlyOverdue) onToggleOnlyOverdue();
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 font-bold hover:bg-amber-100 transition-colors cursor-pointer text-xs"
          >
            Mostrar Todos
          </button>
        </div>
      )}

      {/* MOBILE STAGE-BY-STAGE SWIPE VIEW (Default for mobile screen efficiency) */}
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{s.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Card View */}
        <div className="bg-slate-100/90 rounded-2xl border border-slate-200 p-3 mt-2">
          
          {/* Header of Active Stage with Next / Prev Arrows */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${currentStageMeta.color}`} />
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {currentStageMeta.name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {activeStageLeads.length} médicos · {formatCurrency(activeStageTotalValue)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={!prevStage}
                onClick={() => prevStage && setActiveMobileStage(prevStage.id)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-30 cursor-pointer"
                title="Etapa anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!nextStage}
                onClick={() => nextStage && setActiveMobileStage(nextStage.id)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-30 cursor-pointer"
                title="Etapa siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leads List for this stage */}
          <div className="mt-3 space-y-2.5">
            {activeStageLeads.map((lead) => (
              <KanbanCard
                key={lead.id}
                lead={lead}
                onOpenEdit={onOpenEdit}
                onOpenWhatsApp={onOpenWhatsApp}
                onStageChange={onStageChange}
              />
            ))}

            {activeStageLeads.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs bg-white/60 rounded-xl border border-dashed border-slate-300">
                No hay médicos en la etapa {currentStageMeta.name}
              </div>
            )}

            <button
              onClick={() => onAddNewLeadInStage(activeMobileStage)}
              className="w-full py-2.5 rounded-xl border border-dashed border-teal-300 bg-teal-50/60 hover:bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
        <div className="flex gap-4 min-w-[1240px] items-start">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
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
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`w-72 sm:w-80 shrink-0 flex flex-col rounded-2xl transition-all duration-150 ${
                  isDragOver
                    ? 'bg-teal-50/90 ring-2 ring-teal-500 border-teal-400'
                    : 'bg-slate-100/80 border border-slate-200/90'
                }`}
              >
                {/* Stage Header */}
                <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${stage.color} shadow-2xs`} />
                    <h3 className="text-xs font-black text-slate-800 tracking-tight">
                      {stage.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                      {stageLeads.length}
                    </span>
                    <button
                      id={`btn-add-in-stage-${stage.id}`}
                      onClick={() => onAddNewLeadInStage(stage.id)}
                      title={`Agregar médico en ${stage.name}`}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-header: Total stage estimated amount */}
                <div className="px-3.5 py-1.5 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Valor en etapa:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(stageTotalValue)}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 min-h-[460px] max-h-[calc(100vh-250px)] overflow-y-auto">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead.id)}
                      className="transition-transform active:cursor-grabbing"
                    >
                      <KanbanCard
                        lead={lead}
                        onOpenEdit={onOpenEdit}
                        onOpenWhatsApp={onOpenWhatsApp}
                        onStageChange={onStageChange}
                      />
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl p-4 text-center">
                      <span>Sin médicos en {stage.name.toLowerCase()}</span>
                      <button
                        onClick={() => onAddNewLeadInStage(stage.id)}
                        className="mt-2 text-teal-600 hover:text-teal-700 font-bold text-[11px] cursor-pointer"
                      >
                        + Agregar
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer quick add */}
                <div className="p-2 border-t border-slate-200/80 bg-slate-50/50 rounded-b-2xl">
                  <button
                    onClick={() => onAddNewLeadInStage(stage.id)}
                    className="w-full py-1.5 text-xs text-slate-600 hover:text-teal-700 hover:bg-white rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
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

    </div>
  );
};
