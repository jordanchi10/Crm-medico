import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calendar, 
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
  Clock,
  FileText,
  CheckSquare,
  Square,
  LayoutList,
  LayoutGrid,
  ChevronDown,
  Phone,
  Sparkles,
  Users,
  CreditCard,
  CalendarClock
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';
import { getAllSpecialties, getSpecialtyMeta } from '../data/specialties';
import { ECUADOR_SECTORS } from '../data/ecuadorData';
import { formatCurrency } from '../utils/storage';
import { getLeadOverdueInfo } from '../utils/notificationService';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface LeadsTableViewProps {
  leads: MedicalLead[];
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onDeleteLead: (leadId: string) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onOpenReceipt?: (lead: MedicalLead) => void;
}

type ViewMode = 'table' | 'cards';

function getDoctorInitials(name: string): string {
  const clean = name.replace(/^(Dr\.|Dra\.|Lic\.|Msc\.)\s*/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 0) return 'MD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function sanitizeCityName(city?: string): string {
  if (!city) return 'Manta';
  if (city.toLowerCase().includes('méxico') || city.toLowerCase().includes('mexico')) {
    return 'Manta';
  }
  return city;
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
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [onlyOverdue48h, setOnlyOverdue48h] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'appointments' | 'pending_payment' | 'paid'>('all');
  
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date' | 'registered'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // View Mode: Table (spacious & comfortable) vs Cards (spacious directory profiles)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('medcrm_directory_view_mode');
      if (saved === 'cards') return 'cards';
      return 'table';
    } catch {
      return 'table';
    }
  });

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('medcrm_directory_view_mode', mode);
    } catch {}
  };

  // Selection and Deletion State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadToDelete, setLeadToDelete] = useState<MedicalLead | null>(null);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);

  // UI filter tray state
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState(false);

  // Metric computations for the spacious Directory Header
  const metrics = useMemo(() => {
    let overdueCount = 0;
    let appointmentCount = 0;
    let pendingPaymentCount = 0;
    let totalRevenue = 0;

    leads.forEach((l) => {
      if (getLeadOverdueInfo(l, 48).isOverdue) overdueCount++;
      if (l.nextFollowUpDate) appointmentCount++;
      if (l.paymentStatus === 'pendiente' || l.paymentStatus === 'parcial') pendingPaymentCount++;
      totalRevenue += l.paidAmount || (l.paymentStatus === 'pagado' ? l.estimatedValue : 0);
    });

    return {
      total: leads.length,
      overdueCount,
      appointmentCount,
      pendingPaymentCount,
      totalRevenue
    };
  }, [leads]);

  // Filter logic
  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (onlyOverdue48h) {
        const overdue = getLeadOverdueInfo(lead, 48);
        if (!overdue.isOverdue) return false;
      }

      if (quickFilter === 'appointments' && !lead.nextFollowUpDate) {
        return false;
      }
      if (quickFilter === 'pending_payment' && lead.paymentStatus !== 'pendiente' && lead.paymentStatus !== 'parcial') {
        return false;
      }
      if (quickFilter === 'paid' && lead.paymentStatus !== 'pagado') {
        return false;
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

      const matchesSector =
        selectedSector === 'all' || (lead.sector && lead.sector.toLowerCase() === selectedSector.toLowerCase());

      const matchesService =
        selectedService === 'all' ||
        (selectedService === '99' && (lead.estimatedValue === 99 || (lead.serviceName && lead.serviceName.includes('99')))) ||
        (selectedService === '150' && (lead.estimatedValue === 150 || (lead.serviceName && lead.serviceName.includes('150'))));

      return matchesSearch && matchesSpecialty && matchesStage && matchesPayment && matchesSector && matchesService;
    });
  }, [leads, onlyOverdue48h, quickFilter, searchTerm, selectedSpecialty, selectedStage, selectedPaymentStatus, selectedSector, selectedService]);

  // Sort logic
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
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
  }, [filtered, sortBy, sortOrder]);

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
    (selectedSector !== 'all' ? 1 : 0) +
    (selectedService !== 'all' ? 1 : 0) +
    (selectedPaymentStatus !== 'all' ? 1 : 0) +
    (quickFilter !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedStage('all');
    setSelectedSector('all');
    setSelectedService('all');
    setSelectedPaymentStatus('all');
    setOnlyOverdue48h(false);
    setQuickFilter('all');
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
    <div className="p-3 sm:p-6 lg:p-8 w-full space-y-4 sm:space-y-6 pb-28 md:pb-12 max-w-7xl mx-auto">
      
      {/* 1. Spacious Directory Overview & Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Doctors */}
        <div 
          onClick={() => { setQuickFilter('all'); setOnlyOverdue48h(false); }}
          className={`p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs hover:shadow-md touch-manipulation ${
            quickFilter === 'all' && !onlyOverdue48h 
              ? 'border-teal-500 ring-2 ring-teal-500/20' 
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">Directorio Total</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.total}</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">médicos</span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium truncate">Especialistas adscritos</div>
        </div>

        {/* Appointments / Demos */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'appointments' ? 'all' : 'appointments')}
          className={`p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs hover:shadow-md touch-manipulation ${
            quickFilter === 'appointments' 
              ? 'border-sky-500 ring-2 ring-sky-500/20' 
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">Citas & Demos</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0">
              <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.appointmentCount}</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">agendadas</span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium truncate">Con fecha de seguimiento</div>
        </div>

        {/* Pending Payments */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'pending_payment' ? 'all' : 'pending_payment')}
          className={`p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs hover:shadow-md touch-manipulation ${
            quickFilter === 'pending_payment' 
              ? 'border-amber-500 ring-2 ring-amber-500/20' 
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">Por Cobrar</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.pendingPaymentCount}</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">pendientes</span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium truncate">Anticipos y saldos por cobrar</div>
        </div>

        {/* Overdue Alerts */}
        <div 
          onClick={() => setOnlyOverdue48h(!onlyOverdue48h)}
          className={`p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-xs hover:shadow-md touch-manipulation ${
            onlyOverdue48h 
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20' 
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">Inactivos (+48h)</span>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
              metrics.overdueCount > 0 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.overdueCount}</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">alertas</span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium truncate">Sin contacto comercial reciente</div>
        </div>
      </div>

      {/* 2. Spacious Search, Filter & View Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
        
        {/* Main Search & Actions Row */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between">
          
          {/* Prominent Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por médico, especialidad, sector (Jocay, Centro...), clínica o WhatsApp..."
              className="w-full text-xs sm:text-sm pl-11 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-850 border border-slate-300/80 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium text-slate-900 dark:text-white shadow-2xs min-h-[44px]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 cursor-pointer touch-manipulation"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Selectors & View Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Quick Sector Dropdown */}
            <div className="relative flex-1 sm:flex-none min-w-[135px] sm:min-w-[170px]">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full text-xs sm:text-sm appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300/80 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs min-h-[42px]"
              >
                <option value="all">📍 Sectores</option>
                {ECUADOR_SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Specialty Dropdown */}
            <div className="relative flex-1 sm:flex-none min-w-[145px] sm:min-w-[190px]">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full text-xs sm:text-sm appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300/80 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2.5 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs min-h-[42px]"
              >
                <option value="all">🩺 Especialidad ({getAllSpecialties().length})</option>
                {getAllSpecialties().map((spec) => (
                  <option key={spec.name} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-2xs min-h-[42px] touch-manipulation ${
                activeFiltersCount > 0 || isFilterTrayOpen
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border-slate-300/80 dark:border-slate-700'
              }`}
              title="Más filtros (Plan, Etapa, Estado de Pago)"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Switcher (Spacious Table vs Directory Profile Cards) */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSetViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[34px] touch-manipulation ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Vista de Tabla Espaciosa"
              >
                <LayoutList className="w-4 h-4" />
                <span>Tabla</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetViewMode('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[34px] touch-manipulation ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Vista de Fichas de Directorio"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Fichas</span>
              </button>
            </div>

          </div>

        </div>

        {/* Counter and Active Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 flex-wrap font-medium">
            <span>
              Mostrando <strong className="text-slate-900 dark:text-white font-extrabold">{sorted.length}</strong> de {leads.length} médicos especialistas
            </span>
            {onlyOverdue48h && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                Filtrado por inactividad (+48h)
              </span>
            )}
            {quickFilter === 'appointments' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                Con Cita Agendada
              </span>
            )}
            {quickFilter === 'pending_payment' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                Pendientes de Pago
              </span>
            )}
          </div>

          {(activeFiltersCount > 0 || searchTerm || onlyOverdue48h) && (
            <button
              onClick={clearAllFilters}
              className="text-xs sm:text-sm text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Restablecer filtros</span>
            </button>
          )}
        </div>

        {/* Collapsible Advanced Filters Tray */}
        {isFilterTrayOpen && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Stage Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Etapa del Embudo
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">Todas las Etapas</option>
                  {STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Plan Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Plan de Suscripción
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">Todos los Planes</option>
                  <option value="99">Perfil 1 año ($99 USD)</option>
                  <option value="150">Perfil 2 años ($150 USD)</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Estado de Pago
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="pagado">Pagado Total</option>
                  <option value="parcial">Con Anticipo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="no_aplica">No Aplica</option>
                </select>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 3. SPACIOUS TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          {/* Mobile swipe helper strip */}
          <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-850/90 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span>👉 Desliza la tabla hacia los lados</span>
            </span>
            <button
              type="button"
              onClick={() => handleSetViewMode('cards')}
              className="text-teal-700 dark:text-teal-300 font-bold hover:underline cursor-pointer"
            >
              Ver en Fichas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-100 min-w-[1000px]">
              
              {/* Table Header */}
              <thead className="bg-slate-50/95 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs font-bold">
                <tr>
                  {/* Select All */}
                  <th className="py-4 px-5 w-14 text-center select-none">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer flex items-center justify-center mx-auto"
                      title={isAllSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>
                  </th>

                  {/* Doctor & Clinic */}
                  <th
                    onClick={() => toggleSort('name')}
                    className="py-4 px-5 font-bold cursor-pointer hover:text-teal-700 dark:hover:text-teal-300 select-none min-w-[320px]"
                  >
                    <div className="flex items-center gap-2">
                      <span>Médico Especialista</span>
                      <ArrowUpDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </th>

                  {/* Specialty */}
                  <th className="py-4 px-5 font-bold min-w-[170px]">
                    Especialidad
                  </th>

                  {/* Pipeline Stage */}
                  <th className="py-4 px-5 font-bold min-w-[200px]">
                    Etapa en Embudo
                  </th>

                  {/* Plan & Payment */}
                  <th
                    onClick={() => toggleSort('value')}
                    className="py-4 px-5 font-bold cursor-pointer hover:text-teal-700 dark:hover:text-teal-300 select-none min-w-[180px]"
                  >
                    <div className="flex items-center gap-2">
                      <span>Plan & Cobranza</span>
                      <ArrowUpDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </th>

                  {/* Next Appointment / Follow Up */}
                  <th
                    onClick={() => toggleSort('date')}
                    className="py-4 px-5 font-bold cursor-pointer hover:text-teal-700 dark:hover:text-teal-300 select-none min-w-[170px]"
                  >
                    <div className="flex items-center gap-2">
                      <span>Próx. Seguimiento</span>
                      <ArrowUpDown className="w-4 h-4 text-slate-500" />
                    </div>
                  </th>

                  {/* Actions */}
                  <th className="py-4 px-5 font-bold text-right min-w-[160px] sticky right-0 bg-slate-50/95 dark:bg-slate-800/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]">
                    Acciones
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sorted.map((lead, idx) => {
                  const spec = getSpecialtyMeta(lead.specialty);
                  const overdue = getLeadOverdueInfo(lead, 48);
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const initials = getDoctorInitials(lead.doctorName);
                  const city = sanitizeCityName(lead.city);

                  return (
                    <tr
                      key={`${lead.id || 'lead-row'}-${idx}`}
                      id={`table-row-${lead.id}`}
                      className={`hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors ${
                        isSelected ? 'bg-teal-50/40 dark:bg-teal-950/30' : ''
                      } ${overdue.isOverdue && !isSelected ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-5 px-5 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectLead(lead.id)}
                          className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer flex items-center justify-center mx-auto"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                          )}
                        </button>
                      </td>

                      {/* Doctor Column (Avatar + Info with generous spacing) */}
                      <td className="py-5 px-5 align-middle">
                        <div className="flex items-center gap-3.5">
                          {/* Doctor Avatar */}
                          <div 
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs ${spec.bgLight} ${spec.color} border ${spec.borderLight} dark:bg-opacity-25 dark:border-opacity-40`}
                          >
                            {initials}
                          </div>

                          <div className="min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                onClick={() => onOpenEdit(lead)}
                                className="font-bold text-base text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                              >
                                {lead.doctorName}
                              </span>
                              
                              {/* Overdue alert badge */}
                              {overdue.isOverdue && (
                                <span 
                                  title={`Sin contacto hace ${overdue.hoursElapsed} horas`}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800"
                                >
                                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                                  <span>+{overdue.hoursElapsed}h inactivo</span>
                                </span>
                              )}
                            </div>

                            {/* Clinic / Consultorio */}
                            {lead.clinicOrHospital && (
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="truncate max-w-[280px]">{lead.clinicOrHospital}</span>
                              </div>
                            )}

                            {/* Location & Phone */}
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                              {lead.sector && <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.sector}</span>}
                              {lead.sector && <span aria-hidden="true" className="text-slate-400">·</span>}
                              <span>{city}</span>
                              <span aria-hidden="true" className="text-slate-400">·</span>
                              <span className="font-mono text-slate-700 dark:text-slate-200">{lead.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specialty Column */}
                      <td className="py-5 px-5 align-middle">
                        <div>
                          <span className={`inline-block font-bold text-xs px-3 py-1.5 rounded-xl border ${spec.bgLight} ${spec.color} ${spec.borderLight} dark:bg-opacity-25 dark:border-opacity-40`}>
                            {lead.specialty}
                          </span>
                        </div>
                      </td>

                      {/* Pipeline Stage Column */}
                      <td className="py-5 px-5 align-middle">
                        <select
                          value={lead.stage}
                          onChange={(e) => onStageChange(lead.id, e.target.value as StageId)}
                          className="text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-750"
                        >
                          {STAGES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Plan & Payment Column */}
                      <td className="py-5 px-5 align-middle">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 dark:text-white text-base">
                            {formatCurrency(lead.estimatedValue)}
                          </div>
                          
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {lead.serviceName || (lead.estimatedValue === 99 ? 'Perfil 1 año ($99)' : 'Perfil 2 años ($150)')}
                          </div>

                          {/* Payment status badge */}
                          <div className="pt-0.5 text-xs">
                            {lead.paymentStatus === 'pagado' ? (
                              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span>Pagado Total</span>
                              </span>
                            ) : lead.paymentStatus === 'parcial' ? (
                              <span className="inline-flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                <span>Anticipo {formatCurrency(lead.paidAmount)}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span>Pendiente</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Next Appointment / Date */}
                      <td className="py-5 px-5 align-middle">
                        {lead.nextFollowUpDate ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              <span>{lead.nextFollowUpDate}</span>
                            </div>
                            {lead.nextFollowUpTime && (
                              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-5.5">
                                {lead.nextFollowUpTime} hs
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Sin agendar</span>
                        )}
                      </td>

                      {/* Action Buttons (Sticky Right) */}
                      <td className="py-5 px-5 text-right align-middle sticky right-0 bg-white/95 dark:bg-slate-900/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-end gap-2">
                          {/* WhatsApp Button */}
                          <button
                            onClick={() => onOpenWhatsApp(lead)}
                            title="Conversar por WhatsApp"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>

                          {/* Digital Receipt */}
                          {onOpenReceipt && (
                            <button
                              onClick={() => onOpenReceipt(lead)}
                              title="Emitir Recibo Digital de Pago"
                              className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            </button>
                          )}

                          {/* Edit Full Sheet */}
                          <button
                            onClick={() => onOpenEdit(lead)}
                            title="Editar ficha completa del médico"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Lead */}
                          <button
                            type="button"
                            onClick={() => setLeadToDelete(lead)}
                            title="Eliminar especialista"
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sorted.length === 0 && (
            <div className="py-20 px-6 text-center space-y-4 bg-white dark:bg-slate-900">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No se encontraron especialistas médicos
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                No hay resultados para los filtros seleccionados. Intenta restablecer o buscar con otros términos.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. SPACIOUS DIRECTORY PROFILE CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((lead, idx) => {
              const spec = getSpecialtyMeta(lead.specialty);
              const overdue = getLeadOverdueInfo(lead, 48);
              const isSelected = selectedLeadIds.includes(lead.id);
              const initials = getDoctorInitials(lead.doctorName);
              const city = sanitizeCityName(lead.city);

              return (
                <div
                  key={`${lead.id || 'lead-card'}-${idx}`}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 ${
                    isSelected ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50/20 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Card Header & Profile */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 shadow-2xs ${spec.bgLight} ${spec.color} border ${spec.borderLight} dark:bg-opacity-25 dark:border-opacity-40`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 
                            onClick={() => onOpenEdit(lead)}
                            className="font-bold text-base text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer truncate"
                          >
                            {lead.doctorName}
                          </h4>
                          <span className={`inline-block text-xs font-bold mt-1 px-2.5 py-0.5 rounded-lg border ${spec.bgLight} ${spec.color} ${spec.borderLight} dark:bg-opacity-25 dark:border-opacity-40`}>
                            {lead.specialty}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSelectLead(lead.id)}
                        className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer shrink-0 mt-1"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>
                    </div>

                    {/* Overdue Inactivity Alert if applicable */}
                    {overdue.isOverdue && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold">
                        <Clock className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                        <span>+{overdue.hoursElapsed}h sin contacto comercial ({overdue.daysElapsed}d)</span>
                      </div>
                    )}

                    {/* Clinic, Location & Phone */}
                    <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-1">
                      {lead.clinicOrHospital && (
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="truncate font-medium">{lead.clinicOrHospital}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.sector ? `${lead.sector}, ${city}` : city}</span>
                      </div>

                      <div className="flex items-center gap-2.5 font-mono text-slate-800 dark:text-slate-200">
                        <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    </div>

                    {/* Plan, Pricing & Payment */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs sm:text-sm">
                      <div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider block font-bold">Plan Suscripción</span>
                        <strong className="text-slate-900 dark:text-white text-base font-extrabold">{formatCurrency(lead.estimatedValue)}</strong>
                        <span className="text-xs text-slate-700 dark:text-slate-300 block font-medium">{lead.estimatedValue === 99 ? '1 año' : '2 años'}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase tracking-wider block font-bold">Estado Cobro</span>
                        {lead.paymentStatus === 'pagado' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Pagado
                          </span>
                        ) : lead.paymentStatus === 'parcial' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Anticipo ({formatCurrency(lead.paidAmount)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Etapa en Embudo
                      </label>
                      <select
                        value={lead.stage}
                        onChange={(e) => onStageChange(lead.id, e.target.value as StageId)}
                        className="w-full text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-750"
                      >
                        {STAGES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenWhatsApp(lead)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer min-h-[44px] touch-manipulation"
                    >
                      <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                      <span>WhatsApp</span>
                    </button>

                    {onOpenReceipt && (
                      <button
                        onClick={() => onOpenReceipt(lead)}
                        title="Recibo Oficial"
                        className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer flex items-center justify-center shrink-0 touch-manipulation"
                      >
                        <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenEdit(lead)}
                      title="Ficha Completa"
                      className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-300/80 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0 touch-manipulation"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeadToDelete(lead)}
                      title="Eliminar"
                      className="w-11 h-11 rounded-xl text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0 touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {sorted.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-20 px-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No se encontraron especialistas médicos
              </h3>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Floating Bulk Action Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 dark:bg-slate-800 text-white px-5 sm:px-7 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 sm:gap-6 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <span className="w-6 h-6 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center text-xs font-black">
              {selectedLeadIds.length}
            </span>
            <span>especialistas seleccionados</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedLeadIds([])}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
            >
              Desmarcar
            </button>

            <button
              type="button"
              id="btn-bulk-delete"
              onClick={() => setIsConfirmingBulkDelete(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar ({selectedLeadIds.length})</span>
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
