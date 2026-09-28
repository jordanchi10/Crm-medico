import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  Edit3, 
  MessageCircle, 
  Search, 
  Trash2, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle,
  SlidersHorizontal,
  X,
  MapPin,
  Briefcase,
  Clock,
  AlertTriangle,
  BellRing,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';
import { getAllSpecialties, getSpecialtyMeta } from '../data/specialties';
import { ECUADOR_CITIES, ECUADOR_SECTORS } from '../data/ecuadorData';
import { formatCurrency } from '../utils/storage';
import { getLeadOverdueInfo } from '../utils/notificationService';
import { getLeadRegistrationInfo } from '../utils/dateUtils';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface LeadsTableViewProps {
  leads: MedicalLead[];
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onDeleteLead: (leadId: string) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onOpenReceipt?: (lead: MedicalLead) => void;
}

export const LeadsTableView: React.FC<LeadsTableViewProps> = ({
  leads,
  onOpenEdit,
  onOpenWhatsApp,
  onDeleteLead,
  onStageChange,
  onOpenReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [onlyOverdue48h, setOnlyOverdue48h] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date' | 'registered'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection and Deletion State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadToDelete, setLeadToDelete] = useState<MedicalLead | null>(null);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);

  // UI filter tray state
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState(false);

  const overdueCount = leads.filter((l) => getLeadOverdueInfo(l, 48).isOverdue).length;

  // Filter
  const filtered = leads.filter((lead) => {
    if (onlyOverdue48h) {
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

    const matchesStage =
      selectedStage === 'all' || lead.stage === selectedStage;

    const matchesPayment =
      selectedPaymentStatus === 'all' || lead.paymentStatus === selectedPaymentStatus;

    const matchesCity =
      selectedCity === 'all' || (lead.city && lead.city.toLowerCase() === selectedCity.toLowerCase());

    const matchesSector =
      selectedSector === 'all' || (lead.sector && lead.sector.toLowerCase() === selectedSector.toLowerCase());

    const matchesService =
      selectedService === 'all' ||
      (selectedService === '99' && (lead.estimatedValue === 99 || (lead.serviceName && lead.serviceName.includes('99')))) ||
      (selectedService === '150' && (lead.estimatedValue === 150 || (lead.serviceName && lead.serviceName.includes('150'))));

    return matchesSearch && matchesSpecialty && matchesStage && matchesPayment && matchesCity && matchesSector && matchesService;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.doctorName.localeCompare(b.doctorName)
        : b.doctorName.localeCompare(a.doctorName);
    }
    if (sortBy === 'value') {
      return sortOrder === 'asc'
        ? a.estimatedValue - b.estimatedValue
        : b.estimatedValue - a.estimatedValue;
    }
    if (sortBy === 'registered') {
      const regA = a.createdAt || '1970-01-01';
      const regB = b.createdAt || '1970-01-01';
      return sortOrder === 'asc'
        ? regA.localeCompare(regB)
        : regB.localeCompare(regA);
    }
    // date
    const dateA = a.nextFollowUpDate || '9999-99-99';
    const dateB = b.nextFollowUpDate || '9999-99-99';
    return sortOrder === 'asc'
      ? dateA.localeCompare(dateB)
      : dateB.localeCompare(dateA);
  });

  const toggleSort = (field: 'name' | 'value' | 'date' | 'registered') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'registered' ? 'desc' : 'asc');
    }
  };

  const activeFiltersCount =
    (selectedSpecialty !== 'all' ? 1 : 0) +
    (selectedStage !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0) +
    (selectedSector !== 'all' ? 1 : 0) +
    (selectedService !== 'all' ? 1 : 0) +
    (selectedPaymentStatus !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedStage('all');
    setSelectedCity('all');
    setSelectedSector('all');
    setSelectedService('all');
    setSelectedPaymentStatus('all');
  };

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === sorted.length && sorted.length > 0) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(sorted.map((l) => l.id));
    }
  };

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteConfirm = () => {
    selectedLeadIds.forEach((id) => onDeleteLead(id));
    setSelectedLeadIds([]);
    setIsConfirmingBulkDelete(false);
  };

  const isAllSelected = sorted.length > 0 && selectedLeadIds.length === sorted.length;

  return (
    <div className="p-3 sm:p-6 w-full space-y-4 pb-20 md:pb-6">
      
      {/* Search Bar & Filters Tray */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-2xs space-y-2.5 transition-colors duration-200">
        
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por médico, sector (Jocay, Centro...), clínica o teléfono..."
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-900 dark:text-slate-100"
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
              id="btn-filter-overdue-table"
              onClick={() => setOnlyOverdue48h(!onlyOverdue48h)}
              title={
                onlyOverdue48h 
                  ? 'Quitar filtro de inactividad' 
                  : 'Filtrar médicos con más de 48h sin contacto'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                onlyOverdue48h
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : overdueCount > 0
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${onlyOverdue48h ? 'text-white' : overdueCount > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden xs:inline">Sin contacto (+48h)</span>
              <span className="xs:hidden">+48h</span>
              {overdueCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  onlyOverdue48h ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
                }`}>
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeFiltersCount > 0 || isFilterTrayOpen
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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

            <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <span><strong className="text-slate-800 dark:text-slate-200 font-bold">{sorted.length}</strong> de {leads.length} médicos</span>
            </div>
          </div>

        </div>

        {/* Quick Sector Locación Segment Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Locación:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedSector('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedSector === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
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
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <span>{sec}</span>
            </button>
          ))}

          {/* Quick Service Filter Pills */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Plan:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedService(selectedService === '99' ? 'all' : '99')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedService === '99'
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50'
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
                  : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50'
              }`}
            >
              2 años ($150)
            </button>
          </div>
        </div>

        {/* Collapsible Filter Tray */}
        {isFilterTrayOpen && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-100">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              
              {/* Specialty */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Especialidad Médica
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todas las Especialidades ({getAllSpecialties().length})</option>
                  {getAllSpecialties().map((spec) => (
                    <option key={spec.name} value={spec.name}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Etapa del Embudo
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todas las Etapas</option>
                  {STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Sector / Locación
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todos los Sectores</option>
                  {ECUADOR_SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Estado de Pago
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="pagado">Pagado Total</option>
                  <option value="parcial">Con Anticipo (Parcial)</option>
                  <option value="pendiente">Pendiente de Pago</option>
                  <option value="no_aplica">No Aplica</option>
                </select>
              </div>

            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Limpiar todos los filtros</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MOBILE RESPONSIVE CARD LIST VIEW (< md) */}
      <div className="md:hidden space-y-3">
        {/* Mobile Batch Selection Quick Switcher */}
        {sorted.length > 0 && (
          <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-teal-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{isAllSelected ? 'Desmarcar todos' : `Seleccionar todos (${sorted.length})`}</span>
            </button>
            {selectedLeadIds.length > 0 && (
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {selectedLeadIds.length} seleccionados
              </span>
            )}
          </div>
        )}

        {sorted.map((lead) => {
          const spec = getSpecialtyMeta(lead.specialty);
          const overdue = getLeadOverdueInfo(lead, 48);
          const isSelected = selectedLeadIds.includes(lead.id);

          return (
            <div
              key={lead.id}
              className={`bg-white dark:bg-slate-850 rounded-xl border p-4 shadow-2xs space-y-3 transition-all ${
                isSelected ? 'ring-2 ring-teal-500 border-teal-400 bg-teal-50/20 dark:bg-teal-950/30' : ''
              } ${
                overdue.isOverdue && !isSelected ? 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-200 dark:ring-rose-900/40' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Overdue alert header on card */}
              {overdue.isOverdue && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-pulse" />
                    <span>Inactivo: +{overdue.hoursElapsed}h sin contacto ({overdue.daysElapsed}d)</span>
                  </span>
                  <span className="uppercase text-[9px] text-rose-600 dark:text-rose-400">Alerta 48h</span>
                </div>
              )}

              {/* Top row: Checkbox + Doctor name + Specialty */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSelectLead(lead.id)}
                    className="mt-0.5 text-slate-400 hover:text-teal-600 cursor-pointer shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{lead.doctorName}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{lead.clinicOrHospital}</span>
                    </div>
                    
                    {/* Sector & City tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {lead.sector && (
                        <span className="inline-flex items-center text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded">
                          📍 {lead.sector}
                        </span>
                      )}
                      {lead.city && (
                        <span className="inline-block text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-transparent dark:border-slate-700">
                          🇪🇨 {lead.city}
                        </span>
                      )}
                      <span 
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded"
                        title={`Registrado en plataforma el ${getLeadRegistrationInfo(lead).formattedFull}`}
                      >
                        <Calendar className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                        <span>Reg: {getLeadRegistrationInfo(lead).formattedCompact}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${spec.bgLight} dark:bg-opacity-20 ${spec.color} ${spec.borderLight} dark:border-opacity-30 shrink-0`}>
                  {lead.specialty}
                </span>
              </div>

              {/* Service & Financials info */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Servicio / Plan</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {lead.serviceName || (lead.estimatedValue === 99 ? 'Perfil 1 año' : lead.estimatedValue === 150 ? 'Perfil 2 años' : 'Personalizado')}
                  </div>
                  <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                    {formatCurrency(lead.estimatedValue)}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Estado Cobro</span>
                  <div className="mt-0.5">
                    {lead.paymentStatus === 'pagado' && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 inline-block">
                        Pagado ({formatCurrency(lead.paidAmount)})
                      </span>
                    )}
                    {lead.paymentStatus === 'parcial' && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 inline-block">
                        Anticipo: {formatCurrency(lead.paidAmount)}
                      </span>
                    )}
                    {lead.paymentStatus === 'pendiente' && (
                      <span className="text-[10px] font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 inline-block">
                        Pendiente
                      </span>
                    )}
                    {lead.paymentStatus === 'no_aplica' && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage selector */}
              <div>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Etapa del Proceso</span>
                <select
                  value={lead.stage}
                  onChange={(e) => onStageChange(lead.id, e.target.value as StageId)}
                  className="w-full mt-0.5 text-xs font-semibold rounded-lg px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Next follow up info */}
              {lead.nextFollowUpDate && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Seguimiento: <strong className="text-slate-700 dark:text-slate-300">{lead.nextFollowUpDate}</strong> {lead.nextFollowUpTime || ''}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onOpenWhatsApp(lead)}
                  className="col-span-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>WA</span>
                </button>

                {onOpenReceipt && (
                  <button
                    onClick={() => onOpenReceipt(lead)}
                    className="col-span-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800 cursor-pointer"
                    title="Emitir Recibo Oficial Digital"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Recibo</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenEdit(lead)}
                  className="col-span-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer border border-transparent dark:border-slate-700"
                  title="Ver Ficha"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadToDelete(lead)}
                  className="col-span-1 inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 active:bg-rose-200 text-rose-600 dark:text-rose-400 text-[11px] font-semibold cursor-pointer border border-rose-200/60 dark:border-rose-800"
                  title="Eliminar especialista"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Borrar</span>
                </button>
              </div>

            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 py-12 px-4 text-center text-slate-400 dark:text-slate-500 text-xs">
            No se encontraron médicos con los filtros aplicados.
          </div>
        )}
      </div>

      {/* DESKTOP DATA TABLE (Visible on md and up) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/90 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-3.5 w-10 text-center select-none">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-teal-600 cursor-pointer flex items-center justify-center"
                    title={isAllSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>

                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Médico & Locación</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">Especialidad</th>
                <th className="py-3 px-4 font-bold">Etapa Embudo</th>
                <th
                  onClick={() => toggleSort('value')}
                  className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Servicio / Plan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">Estado Pago</th>
                <th className="py-3 px-4 font-bold">Método Pago</th>
                <th
                  onClick={() => toggleSort('registered')}
                  className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Fecha Registro</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Próx. Seguimiento</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sorted.map((lead) => {
                const spec = getSpecialtyMeta(lead.specialty);
                const overdue = getLeadOverdueInfo(lead, 48);
                const regInfo = getLeadRegistrationInfo(lead);
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    id={`table-row-${lead.id}`}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-teal-50/40 dark:bg-teal-950/30 font-medium' : ''
                    } ${overdue.isOverdue && !isSelected ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''}`}
                  >
                    {/* Row Checkbox */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectLead(lead.id)}
                        className="text-slate-400 hover:text-teal-600 cursor-pointer flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Doctor, Clinic & Sector */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{lead.doctorName}</span>
                        {overdue.isOverdue && (
                          <span 
                            title={`Sin contacto hace ${overdue.hoursElapsed} horas`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[9px] font-black border border-rose-200 dark:border-rose-800 animate-pulse"
                          >
                            <Clock className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                            <span>+{overdue.hoursElapsed}h sin contacto</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{lead.clinicOrHospital}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        {lead.sector && (
                          <span className="font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded text-[9px]">
                            📍 {lead.sector}
                          </span>
                        )}
                        {lead.city && (
                          <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[9px]">
                            🇪🇨 {lead.city}
                          </span>
                        )}
                        <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">{lead.phone}</span>
                      </div>
                    </td>

                    {/* Specialty */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${spec.bgLight} dark:bg-opacity-20 ${spec.color} ${spec.borderLight} dark:border-opacity-30`}
                      >
                        {lead.specialty}
                      </span>
                    </td>

                    {/* Stage Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={lead.stage}
                        onChange={(e) => onStageChange(lead.id, e.target.value as StageId)}
                        className="text-[11px] font-medium rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                      >
                        {STAGES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Service / Value */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(lead.estimatedValue)}
                      </div>
                      <div className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold truncate max-w-[140px]">
                        {lead.serviceName || (lead.estimatedValue === 99 ? 'Perfil 1 año ($99)' : lead.estimatedValue === 150 ? 'Perfil 2 años ($150)' : 'Personalizado')}
                      </div>
                    </td>

                    {/* Payment status */}
                    <td className="py-3 px-4">
                      {lead.paymentStatus === 'pagado' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Pagado ({formatCurrency(lead.paidAmount)})
                        </span>
                      )}
                      {lead.paymentStatus === 'parcial' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Anticipo: {formatCurrency(lead.paidAmount)}
                        </span>
                      )}
                      {lead.paymentStatus === 'pendiente' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Pendiente
                        </span>
                      )}
                      {lead.paymentStatus === 'no_aplica' && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">N/A</span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                      {lead.paymentMethod || '—'}
                    </td>

                    {/* Registration Date on Platform */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                        <Calendar className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{regInfo.formattedCompact}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        {regInfo.relative ? regInfo.relative : regInfo.formattedFull}
                      </div>
                    </td>

                    {/* Next Follow Up */}
                    <td className="py-3 px-4">
                      {lead.nextFollowUpDate ? (
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold">{lead.nextFollowUpDate}</span>
                          {lead.nextFollowUpTime && (
                            <span className="text-slate-400 text-[10px]">({lead.nextFollowUpTime})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Sin agendar</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenWhatsApp(lead)}
                          title="Enviar mensaje WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                        </button>

                        {onOpenReceipt && (
                          <button
                            onClick={() => onOpenReceipt(lead)}
                            title="Generar Recibo Oficial de Pago"
                            className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          </button>
                        )}

                        <button
                          onClick={() => onOpenEdit(lead)}
                          title="Editar ficha del médico"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer border border-transparent dark:border-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setLeadToDelete(lead)}
                          title="Eliminar especialista"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 sm:gap-6 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-xs font-black">
              {selectedLeadIds.length}
            </span>
            <span className="hidden sm:inline">especialistas seleccionados</span>
            <span className="sm:hidden">elegidos</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedLeadIds([])}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
            >
              Desmarcar
            </button>

            <button
              type="button"
              id="btn-bulk-delete"
              onClick={() => setIsConfirmingBulkDelete(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Selección ({selectedLeadIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Single Doctor Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={() => {
          if (leadToDelete) {
            onDeleteLead(leadToDelete.id);
            setSelectedLeadIds((prev) => prev.filter((id) => id !== leadToDelete.id));
          }
        }}
        lead={leadToDelete}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isConfirmingBulkDelete}
        onClose={() => setIsConfirmingBulkDelete(false)}
        onConfirm={handleBulkDeleteConfirm}
        selectedCount={selectedLeadIds.length}
      />

    </div>
  );
};
