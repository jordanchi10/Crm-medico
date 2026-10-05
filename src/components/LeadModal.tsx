import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  History, 
  Plus, 
  Send,
  MessageCircle,
  Stethoscope,
  MapPin,
  Briefcase,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  Users,
  Check,
  Globe,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldCheck,
  Tag,
  AlertCircle,
  StickyNote,
  Trash2
} from 'lucide-react';
import { 
  MedicalLead, 
  MedicalSpecialty, 
  StageId, 
  PaymentStatus, 
  PaymentMethod, 
  ActivityLog,
  MedicalService,
  LeadPriority
} from '../types';
import { STAGES, PAYMENT_METHODS } from '../data/stages';
import { getAllSpecialties, registerNewSpecialty, SpecialtyMeta, getSpecialtyMeta } from '../data/specialties';
import { 
  ECUADOR_CITIES, 
  ECUADOR_CLINICS_SUGGESTIONS, 
  ECUADOR_SECTORS,
  formatEcuadorPhoneForWhatsApp 
} from '../data/ecuadorData';
import { BASE_SERVICES } from '../data/servicesData';
import { formatCurrency, generateActivityId } from '../utils/storage';
import { parseRawDoctorInfo } from '../utils/rawInfoParser';
import { getLeadRegistrationInfo, formatRegistrationDate, formatNoteTimestamp } from '../utils/dateUtils';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface LeadModalProps {
  isOpen: boolean;
  leadToEdit: MedicalLead | null;
  defaultStage?: StageId;
  services?: MedicalService[];
  onClose: () => void;
  onSaveLead: (lead: MedicalLead) => void;
  onDeleteLead?: (leadId: string) => void;
  onOpenWhatsApp?: (lead: MedicalLead) => void;
  onOpenReceipt?: (lead: MedicalLead) => void;
  onOpenServicesModal?: () => void;
  onOpenBulkModal?: () => void;
}

type ModalTab = 'general' | 'sales' | 'finances' | 'notes';

const TAB_INDEX_MAP: Record<ModalTab, number> = {
  general: 1,
  sales: 2,
  finances: 3,
  notes: 4
};

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  leadToEdit,
  defaultStage = 'prospecto',
  services = BASE_SERVICES,
  onClose,
  onSaveLead,
  onDeleteLead,
  onOpenWhatsApp,
  onOpenReceipt,
  onOpenServicesModal,
  onOpenBulkModal
}) => {
  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<ModalTab>('general');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Form Fields State
  const [doctorName, setDoctorName] = useState('');
  const [clinicOrHospital, setClinicOrHospital] = useState('');
  const [specialty, setSpecialty] = useState<MedicalSpecialty>('Cardiología');
  const [phone, setPhone] = useState('+593 9');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Manta');
  const [sector, setSector] = useState('Centro');
  const [serviceId, setServiceId] = useState('srv-base-1ano');
  const [serviceName, setServiceName] = useState('Perfil Médico 1 año ($99)');
  const [stage, setStage] = useState<StageId>(defaultStage);
  const [priority, setPriority] = useState<LeadPriority>('media');
  const [estimatedValue, setEstimatedValue] = useState<number>(99);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pendiente');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia Banco Pichincha');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('11:00');
  const [expectedClosingDate, setExpectedClosingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [quickNoteText, setQuickNoteText] = useState('');
  const [quickNoteSavedToast, setQuickNoteSavedToast] = useState(false);

  // Platform Registration Date
  const [registrationDate, setRegistrationDate] = useState('');

  // Dynamic Specialties List and Creation State
  const [specialtiesList, setSpecialtiesList] = useState<SpecialtyMeta[]>(() => getAllSpecialties());
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
  const [newSpecialtyName, setNewSpecialtyName] = useState('');
  const [newSpecialtyCategory, setNewSpecialtyCategory] = useState<'Clínica' | 'Quirúrgica' | 'Diagnóstica' | 'Especializada'>('Clínica');

  // Smart Extractor from Google Maps or Web links
  const [rawInputText, setRawInputText] = useState('');
  const [isSmartExtractorOpen, setIsSmartExtractorOpen] = useState(false);
  const [extractorSuccess, setExtractorSuccess] = useState<string | null>(null);

  // Available services fallback to base
  const availableServices = services && services.length > 0 ? services : BASE_SERVICES;

  // Refresh specialties list when modal opens
  useEffect(() => {
    if (isOpen) {
      setSpecialtiesList(getAllSpecialties());
    }
  }, [isOpen]);

  const handleCreateNewSpecialty = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSpecialtyName.trim()) return;
    const created = registerNewSpecialty(newSpecialtyName.trim(), newSpecialtyCategory);
    setSpecialtiesList(getAllSpecialties());
    setSpecialty(created.name);
    setNewSpecialtyName('');
    setIsAddingSpecialty(false);
  };

  // Synchronize state when leadToEdit changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (leadToEdit) {
      setDoctorName(leadToEdit.doctorName);
      setClinicOrHospital(leadToEdit.clinicOrHospital);
      setSpecialty(leadToEdit.specialty);
      setPhone(leadToEdit.phone);
      setEmail(leadToEdit.email);
      setCity(leadToEdit.city || 'Manta');
      setSector(leadToEdit.sector || 'Centro');
      setServiceId(leadToEdit.serviceId || 'srv-base-1ano');
      setServiceName(leadToEdit.serviceName || (leadToEdit.estimatedValue === 150 ? 'Perfil Médico 2 años ($150)' : 'Perfil Médico 1 año ($99)'));
      setStage(leadToEdit.stage);
      setPriority(leadToEdit.priority || 'media');
      setEstimatedValue(leadToEdit.estimatedValue);
      setPaidAmount(leadToEdit.paidAmount);
      setPaymentStatus(leadToEdit.paymentStatus);
      setPaymentMethod(leadToEdit.paymentMethod);
      setNextFollowUpDate(leadToEdit.nextFollowUpDate || '');
      setNextFollowUpTime(leadToEdit.nextFollowUpTime || '11:00');
      setExpectedClosingDate(leadToEdit.expectedClosingDate || '');
      setNotes(leadToEdit.notes);
      setHistory(leadToEdit.history || []);
      setRegistrationDate(leadToEdit.createdAt || today);
      setIsSmartExtractorOpen(false);
      setExtractorSuccess(null);
      setQuickNoteText('');
      setQuickNoteSavedToast(false);
      setActiveTab('general');
    } else {
      // New lead defaults for Ecuador
      setDoctorName('');
      setClinicOrHospital('');
      setSpecialty('Cardiología');
      setPhone('+593 9');
      setEmail('');
      setCity('Manta');
      setSector('Centro');
      setServiceId('srv-base-1ano');
      setServiceName('Perfil Médico 1 año ($99)');
      setStage(defaultStage);
      setPriority('media');
      setEstimatedValue(99);
      setPaidAmount(0);
      setPaymentStatus('no_aplica');
      setPaymentMethod('Transferencia Banco Pichincha');
      setRegistrationDate(today);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNextFollowUpDate(tomorrow.toISOString().split('T')[0]);
      setNextFollowUpTime('11:00');
      setExpectedClosingDate('');
      setNotes('');
      setHistory([]);
      setIsSmartExtractorOpen(false);
      setExtractorSuccess(null);
      setQuickNoteText('');
      setQuickNoteSavedToast(false);
      setActiveTab('general');
    }
  }, [leadToEdit, defaultStage, isOpen]);

  const handleApplySmartExtractor = () => {
    if (!rawInputText.trim()) return;

    const parsed = parseRawDoctorInfo(rawInputText);
    const applied: string[] = [];

    if (parsed.doctorName) {
      setDoctorName(parsed.doctorName);
      applied.push('Nombre');
    }
    if (parsed.specialty) {
      setSpecialty(parsed.specialty);
      applied.push('Especialidad');
    }
    if (parsed.phone && parsed.phone !== '+593 9') {
      setPhone(parsed.phone);
      applied.push('WhatsApp');
    }
    if (parsed.clinicOrHospital && parsed.clinicOrHospital !== 'Consultorio Privado') {
      setClinicOrHospital(parsed.clinicOrHospital);
      applied.push('Clínica');
    }
    if (parsed.sector) {
      setSector(parsed.sector);
      applied.push('Sector');
    }
    if (parsed.city) {
      setCity(parsed.city);
      applied.push('Ciudad');
    }
    if (parsed.email) {
      setEmail(parsed.email);
      applied.push('Email');
    }
    if (parsed.notes) {
      const extraNotes = parsed.notes;
      setNotes((prev) => (prev ? `${prev}\n${extraNotes}` : extraNotes));
      applied.push('Notas/Ubicación');
    }

    if (applied.length > 0) {
      setExtractorSuccess(`¡Listo! Se completaron: ${applied.join(', ')}`);
    } else {
      setExtractorSuccess('Se procesó la información. Verifica los datos en los campos.');
    }
  };

  if (!isOpen) return null;

  const handleAddQuickNote = (customText?: string) => {
    const textToAdd = (customText !== undefined ? customText : quickNoteText).trim();
    if (!textToAdd) return;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
    const todayStr = now.toISOString().split('T')[0];
    const newLog: ActivityLog = {
      id: generateActivityId('act-note'),
      date: dateStr,
      type: 'nota',
      description: textToAdd
    };
    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    setQuickNoteText('');
    setNewNoteText('');

    if (leadToEdit) {
      onSaveLead({
        ...leadToEdit,
        history: updatedHistory,
        lastContactDate: todayStr
      });
      setQuickNoteSavedToast(true);
      setTimeout(() => setQuickNoteSavedToast(false), 2600);
    }
  };

  const handleDeleteHistoryNote = (noteId: string) => {
    const updatedHistory = history.filter((h) => h.id !== noteId);
    setHistory(updatedHistory);
    if (leadToEdit) {
      onSaveLead({
        ...leadToEdit,
        history: updatedHistory
      });
    }
  };

  const handleAddManualNote = () => {
    handleAddQuickNote(newNoteText);
  };

  const handleSelectService = (srv: MedicalService) => {
    setServiceId(srv.id);
    setServiceName(`${srv.name} ($${srv.price})`);
    setEstimatedValue(srv.price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
    const todayStr = now.toISOString().split('T')[0];

    let updatedHistory = [...history];

    if (!leadToEdit) {
      updatedHistory.push({
        id: generateActivityId('act-creacion'),
        date: dateStr,
        type: 'creacion',
        description: `Prospecto creado para ${serviceName} en ${city} (${sector}). Etapa: ${STAGES.find((s) => s.id === stage)?.name}`
      });
    } else if (leadToEdit.stage !== stage) {
      updatedHistory.unshift({
        id: generateActivityId('act-etapa'),
        date: dateStr,
        type: 'etapa',
        description: `Etapa cambiada a: ${STAGES.find((s) => s.id === stage)?.name}`
      });
    }

    if (leadToEdit && leadToEdit.paidAmount !== paidAmount && paidAmount > 0) {
      updatedHistory.unshift({
        id: generateActivityId('act-pago'),
        date: dateStr,
        type: 'pago',
        description: `Pago registrado de ${formatCurrency(paidAmount)} vía ${paymentMethod}`
      });
    }

    // Format and sanitize Ecuador phone (+593 9X XXX XXXX)
    const { displayPhone } = formatEcuadorPhoneForWhatsApp(phone.trim());
    const finalPhone = displayPhone && displayPhone !== '+593' ? displayPhone : (phone.trim().startsWith('+593') ? phone.trim() : `+593 ${phone.trim().replace(/^\+?593\s?/, '')}`);

    const savedLead: MedicalLead = {
      id: leadToEdit ? leadToEdit.id : `lead-${Date.now()}`,
      doctorName: doctorName.trim() || 'Dr. Médico Especialista',
      clinicOrHospital: clinicOrHospital.trim() || 'Consultorio Privado',
      specialty,
      phone: finalPhone,
      email: email.trim(),
      city: city.trim(),
      sector: sector.trim() || 'Centro',
      serviceId,
      serviceName,
      stage,
      priority,
      order: leadToEdit?.order ?? 0,
      estimatedValue: Number(estimatedValue) || 99,
      paidAmount: Number(paidAmount) || 0,
      paymentStatus,
      paymentMethod,
      lastContactDate: todayStr,
      nextFollowUpDate,
      nextFollowUpTime,
      expectedClosingDate,
      createdAt: registrationDate || (leadToEdit ? leadToEdit.createdAt : todayStr),
      notes: notes.trim(),
      tags: leadToEdit?.tags || [sector, 'Especialista'],
      history: updatedHistory
    };

    onSaveLead(savedLead);
    onClose();
  };

  const regInfo = leadToEdit ? getLeadRegistrationInfo(leadToEdit) : null;
  const currentStageMeta = STAGES.find(s => s.id === stage);

  const currentStepNum = TAB_INDEX_MAP[activeTab];
  const progressPercent = (currentStepNum / 4) * 100;

  // Retrieve the last 3 notes/observations for immediate context
  const noteTypeLogs = history.filter((h) => h.type === 'nota');
  const last3Notes = noteTypeLogs.length > 0 ? noteTypeLogs.slice(0, 3) : history.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 sm:rounded-2xl max-w-4xl w-full shadow-2xl border-0 sm:border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[94vh] transition-all">
        
        {/* Mobile & Desktop Header Bar */}
        <div className="bg-slate-900 dark:bg-slate-950 px-4 sm:px-7 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
                  {leadToEdit ? leadToEdit.doctorName : 'Registrar Especialista'}
                </h3>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-teal-950 text-teal-300 border border-teal-700/60 shrink-0">
                  {specialty}
                </span>
                {leadToEdit && currentStageMeta && (
                  <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold hidden xs:inline shrink-0 ${currentStageMeta.badgeBg} ${currentStageMeta.badgeText}`}>
                    {currentStageMeta.name}
                  </span>
                )}
                {noteTypeLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 hover:bg-amber-500/30 transition-colors cursor-pointer"
                    title="Ver notas rápidas del especialista"
                  >
                    <StickyNote className="w-3 h-3 text-amber-400" />
                    <span>{noteTypeLogs.length} {noteTypeLogs.length === 1 ? 'nota' : 'notas'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="hidden sm:inline">Directorio Médico Ecuador ·</span>
                <span className="text-teal-300 font-semibold truncate">{city} ({sector})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {leadToEdit && onDeleteLead && (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 active:bg-rose-500/40 flex items-center justify-center text-rose-300 hover:text-rose-100 transition-colors cursor-pointer border border-rose-500/30"
                title="Eliminar especialista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {leadToEdit && onOpenWhatsApp && (
              <button
                type="button"
                onClick={() => {
                  onOpenWhatsApp(leadToEdit);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Abrir WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden md:inline">WhatsApp</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Step Progress Line */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 shrink-0 sm:hidden">
          <div 
            className="bg-teal-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Navigation Tabs Bar with touch scroll support */}
        <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-7 flex items-center justify-between overflow-x-auto gap-1.5 sm:gap-2 py-2 shrink-0 scrollbar-none touch-pan-x">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation min-h-[38px] ${
                activeTab === 'general'
                  ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs border border-teal-200 dark:border-teal-700 ring-2 ring-teal-500/10'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <User className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'general' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>1. Datos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation min-h-[38px] ${
                activeTab === 'sales'
                  ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs border border-teal-200 dark:border-teal-700 ring-2 ring-teal-500/10'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'sales' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>2. Embudo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finances')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation min-h-[38px] ${
                activeTab === 'finances'
                  ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs border border-teal-200 dark:border-teal-700 ring-2 ring-teal-500/10'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'finances' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>3. Pagos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation min-h-[38px] ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs border border-teal-200 dark:border-teal-700 ring-2 ring-teal-500/10'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'notes' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>4. Notas</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-slate-200 dark:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick AI Extractor Pill Trigger */}
          <button
            type="button"
            onClick={() => setIsSmartExtractorOpen(!isSmartExtractorOpen)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ml-1 touch-manipulation ${
              isSmartExtractorOpen
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Maps</span>
          </button>
        </div>

        {/* Modal Form with Scrollable Content & Mobile Safe Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-6 overscroll-contain">

            {/* Smart Google Maps & Web Data Extractor Dropdown Card */}
            {isSmartExtractorOpen && (
              <div className="rounded-2xl border border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50/95 to-slate-50 dark:from-slate-850 dark:to-slate-900 p-3.5 sm:p-4 space-y-3 shadow-xs animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>Auto-completar con Google Maps / Web</span>
                        <span className="px-1.5 py-0.2 bg-teal-600 text-white text-[9px] font-black rounded-full uppercase">
                          AI
                        </span>
                      </h5>
                      <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">
                        Pega una URL o ficha médica copiada para extraer los datos al instante.
                      </p>
                    </div>
                  </div>

                  {onOpenBulkModal && (
                    <button
                      type="button"
                      onClick={onOpenBulkModal}
                      className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Carga Masiva</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={rawInputText}
                    onChange={(e) => {
                      setRawInputText(e.target.value);
                      setExtractorSuccess(null);
                    }}
                    placeholder="Pega enlace de Google Maps (https://maps.app.goo.gl/...), web o datos del doctor..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleApplySmartExtractor}
                        disabled={!rawInputText.trim()}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extraer y Completar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const sample = `Dr. Carlos Mendoza Zambrano\nCardiólogo en Manta\nTorre Médica Montecristi, Barbasquillo, Manta\nTeléfono: 0998765432\nEmail: dr.carlos@cardiomanta.ec\nHorario: Lun - Vie 09:00 - 18:00`;
                          setRawInputText(sample);
                        }}
                        className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium hover:underline cursor-pointer py-1 px-2"
                      >
                        Ejemplo
                      </button>
                    </div>
                  </div>

                  {extractorSuccess && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{extractorSuccess}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: DATOS DEL MÉDICO Y UBICACIÓN */}
            {activeTab === 'general' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
                
                {/* Registration Date Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-teal-50/80 to-slate-50 dark:from-slate-850 dark:to-slate-900 border border-teal-200/70 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Fecha de Registro:</span>{' '}
                      <span className="text-teal-900 dark:text-teal-300 font-semibold">
                        {leadToEdit && regInfo
                           ? `${regInfo.formattedFull} (${regInfo.relative})`
                          : formatRegistrationDate(registrationDate, 'full')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Alta:
                    </label>
                    <input
                      type="date"
                      value={registrationDate}
                      onChange={(e) => setRegistrationDate(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section Group: Identidad Profesional */}
                <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <User className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Identidad Profesional y Especialidad
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Nombre del Médico */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nombre Completo del Médico <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej. Dr. Alejandro Morales"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full text-xs sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-medium bg-white dark:bg-slate-800"
                      />
                    </div>

                    {/* Especialidad Médica con selector dinámico y opción de registrar nueva especialidad */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Especialidad Médica <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsAddingSpecialty(!isAddingSpecialty)}
                          className="text-[11px] text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-bold hover:underline flex items-center gap-1 cursor-pointer py-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isAddingSpecialty ? 'Cancelar' : '+ Nueva'}</span>
                        </button>
                      </div>

                      {!isAddingSpecialty ? (
                        <select
                          value={specialty}
                          onChange={(e) => {
                            if (e.target.value === '__add_new__') {
                              setIsAddingSpecialty(true);
                            } else {
                              setSpecialty(e.target.value as MedicalSpecialty);
                            }
                          }}
                          className="w-full text-xs sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-semibold bg-white dark:bg-slate-800"
                        >
                          {specialtiesList.map((spec) => (
                            <option key={spec.name} value={spec.name}>
                              {spec.name} ({spec.category}) {spec.isCustom ? '★ Guardada' : ''}
                            </option>
                          ))}
                          <option value="__add_new__" className="font-bold text-teal-700 dark:text-teal-400">
                            ➕ Registrar nueva especialidad médica...
                          </option>
                        </select>
                      ) : (
                        <div className="p-3 bg-teal-50 border border-teal-300 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                          <div className="text-[11px] font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Registrar y Guardar Nueva Especialidad</span>
                          </div>
                          <input
                            type="text"
                            autoFocus
                            placeholder="ej. Medicina Estética y Láser"
                            value={newSpecialtyName}
                            onChange={(e) => setNewSpecialtyName(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-teal-300 dark:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
                          />
                          <div className="flex items-center gap-2">
                            <select
                              value={newSpecialtyCategory}
                              onChange={(e: any) => setNewSpecialtyCategory(e.target.value)}
                              className="text-[11px] px-2.5 py-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
                            >
                              <option value="Clínica">Clínica</option>
                              <option value="Quirúrgica">Quirúrgica</option>
                              <option value="Diagnóstica">Diagnóstica</option>
                              <option value="Especializada">Especializada</option>
                            </select>

                            <button
                              type="button"
                              onClick={handleCreateNewSpecialty}
                              disabled={!newSpecialtyName.trim()}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-[11px] font-bold transition-colors cursor-pointer text-center shadow-xs"
                            >
                              Guardar y Usar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Clínica o Centro Médico */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Clínica, Hospital o Consultorio <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        list="clinics-ec-suggestions"
                        placeholder="ej. Hospital Metropolitano, Torre II"
                        value={clinicOrHospital}
                        onChange={(e) => setClinicOrHospital(e.target.value)}
                        className="w-full text-xs sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-medium bg-white dark:bg-slate-800"
                      />
                      <datalist id="clinics-ec-suggestions">
                        {ECUADOR_CLINICS_SUGGESTIONS.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    {/* WhatsApp Celular Ecuador */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span>WhatsApp Ecuador 🇪🇨</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">Prefijo +593</span>
                      </div>
                      <input
                        type="text"
                        inputMode="tel"
                        required
                        placeholder="+593 99 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => {
                          const { displayPhone } = formatEcuadorPhoneForWhatsApp(phone);
                          if (displayPhone && displayPhone !== '+593') {
                            setPhone(displayPhone);
                          }
                        }}
                        className="w-full text-xs sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono text-slate-900 dark:text-slate-100 font-bold bg-white dark:bg-slate-800"
                      />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                        Formato: +593 9X XXX XXXX (9 dígitos móviles de Ecuador)
                      </span>
                    </div>

                    {/* Correo Electrónico */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Correo Electrónico del Consultorio
                      </label>
                      <input
                        type="email"
                        placeholder="doctor@hospital.ec"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-medium bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Group: Ubicación en Ecuador */}
                <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Ubicación y Cobertura Territorial
                    </h4>
                  </div>

                  {/* Ciudad de Ecuador con autocompletado y catálogo nacional completo */}
                  <div className="space-y-2 bg-slate-50/80 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Ciudad de Ecuador <span className="text-rose-500">*</span></span>
                      </label>
                      {(() => {
                        const matchCity = ECUADOR_CITIES.find(
                          (c) => c.name.toLowerCase() === city.toLowerCase() || city.toLowerCase().includes(c.name.toLowerCase())
                        );
                        return matchCity ? (
                          <span className="text-[10px] bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 truncate max-w-[140px]">
                            {matchCity.province} · {matchCity.region}
                          </span>
                        ) : null;
                      })()}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="cities-ec-suggestions"
                        placeholder="Escribe ciudad o cantón (Manta, Portoviejo, Guayaquil, Quito...)"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-bold bg-white dark:bg-slate-800"
                      />
                      <datalist id="cities-ec-suggestions">
                        {ECUADOR_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.province} - {c.region})
                          </option>
                        ))}
                      </datalist>
                    </div>

                    {/* Quick chips for main cities */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Accesos rápidos:</span>
                      {[
                        'Manta', 
                        'Portoviejo', 
                        'Guayaquil', 
                        'Quito', 
                        'Cuenca', 
                        'Santo Domingo', 
                        'Machala', 
                        'Ambato', 
                        'Quevedo', 
                        'Loja', 
                        'Riobamba'
                      ].map((cityName) => (
                        <button
                          key={cityName}
                          type="button"
                          onClick={() => setCity(cityName)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer touch-manipulation ${
                            city.toLowerCase() === cityName.toLowerCase()
                              ? 'bg-teal-600 text-white font-bold border-teal-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 font-medium'
                          }`}
                        >
                          {cityName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sector / Locación Segmentación */}
                  <div className="space-y-2 bg-slate-50/80 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Sector / Barrio <span className="text-rose-500">*</span></span>
                      </label>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        ej. Centro, Barbasquillo
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      list="sectors-ec-suggestions"
                      placeholder="ej. Centro, Jocay, La Pradera, Los Esteros, Tarqui, Barbasquillo..."
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full text-xs sm:text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-bold bg-white dark:bg-slate-800"
                    />
                    <datalist id="sectors-ec-suggestions">
                      {ECUADOR_SECTORS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sectores:</span>
                      {['Centro', 'Barbasquillo', 'Jocay', 'La Pradera', 'Los Esteros', 'Tarqui', 'Umiña / Murciélago'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setSector(chip)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer touch-manipulation ${
                            sector.toLowerCase() === chip.toLowerCase()
                              ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          📍 {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Section Group: Quick Notes / Notas Rápidas y Observaciones Recientes (Últimas 3) */}
                <div className="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 dark:from-slate-850 dark:via-slate-850 dark:to-amber-950/20 p-4 sm:p-5 rounded-2xl border border-amber-200/90 dark:border-amber-900/60 space-y-3.5 sm:space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/60 dark:border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-400 flex items-center justify-center border border-amber-300/60 dark:border-amber-800 shrink-0 shadow-2xs">
                        <StickyNote className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                            Notas Rápidas y Observaciones
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono">
                            Últimas 3
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Añade observaciones con fecha y hora sin necesidad de abrir la bitácora completa
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {history.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('notes')}
                          className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer py-1"
                        >
                          <span>Historial completo ({history.length})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Note Input Box with Enter Support */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe una observación rápida (ej. Secretaria dice que opera por las mañanas)..."
                        value={quickNoteText}
                        onChange={(e) => setQuickNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddQuickNote();
                          }
                        }}
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-amber-300/80 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddQuickNote()}
                        disabled={!quickNoteText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer touch-manipulation shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Añadir Nota</span>
                        <span className="sm:hidden">Añadir</span>
                      </button>
                    </div>

                    {/* Quick Preset Observation Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold text-amber-900/70 dark:text-amber-400 uppercase tracking-wider">
                        Plantillas:
                      </span>
                      {[
                        '📞 No contestó llamada',
                        '💬 Mensaje WhatsApp enviado',
                        '🏥 Visita presencial realizada',
                        '🗓️ Pide llamar en la tarde',
                        '⭐ Interesado en plan $99/año',
                        '💎 Interesado en plan $150/2 años'
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAddQuickNote(chip)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-50/90 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border border-amber-200/90 dark:border-slate-700 font-medium transition-colors cursor-pointer touch-manipulation"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {quickNoteSavedToast && (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold animate-in fade-in">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>¡Observación registrada con fecha y hora exitosamente!</span>
                      </div>
                    )}
                  </div>

                  {/* Last 3 Notes Cards */}
                  <div className="space-y-2 pt-1">
                    {last3Notes.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-amber-200 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800/40 text-center text-slate-400 dark:text-slate-500 text-xs">
                        <StickyNote className="w-6 h-6 mx-auto mb-1 text-amber-400/80 stroke-1" />
                        <p className="font-semibold text-slate-600 dark:text-slate-400">Aún no hay observaciones para este médico.</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Escribe arriba una nota rápida o pulsa una plantilla para registrar contexto inmediato.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {last3Notes.map((note, idx) => {
                          const ts = formatNoteTimestamp(note.date);
                          const isNoteType = note.type === 'nota';

                          return (
                            <div
                              key={`${note.id || 'quick-note'}-${idx}`}
                              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 shadow-2xs hover:border-amber-300 dark:hover:border-amber-600 transition-colors flex items-start justify-between gap-3 group"
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                  <StickyNote className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-md font-mono">
                                      {ts.full}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                      {note.type === 'nota' ? 'Observación rápida' : note.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-1 leading-relaxed break-words">
                                    {note.description}
                                  </p>
                                </div>
                              </div>

                              {isNoteType && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHistoryNote(note.id)}
                                  className="text-slate-300 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100"
                                  title="Eliminar observación"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sales')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer touch-manipulation"
                  >
                    <span>Siguiente: Embudo y Cita</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: SERVICIO, EMBUDO & CITAS */}
            {activeTab === 'sales' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
                
                {/* Section Group: Servicio Médico Ofertado */}
                <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Plan o Servicio Médico Ofertado
                      </h4>
                    </div>
                    {onOpenServicesModal && (
                      <button
                        type="button"
                        onClick={onOpenServicesModal}
                        className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 underline cursor-pointer"
                      >
                        + Catálogo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {availableServices.map((srv) => {
                      const isSelected = serviceId === srv.id || serviceName.toLowerCase().includes(srv.name.toLowerCase());
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => handleSelectService(srv)}
                          className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between group touch-manipulation ${
                            isSelected
                              ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-800 shadow-sm shadow-teal-700/20'
                              : 'bg-white dark:bg-slate-800 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                          }`}
                        >
                          <div className="flex-1 pr-3">
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{srv.name}</span>
                              {srv.isBase && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300'
                                }`}>
                                  Base
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] mt-0.5 line-clamp-2 ${isSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {srv.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-base sm:text-lg font-black ${isSelected ? 'text-white' : 'text-teal-700 dark:text-teal-400'}`}>
                              ${srv.price}
                            </span>
                            <span className={`block text-[9px] sm:text-[10px] font-medium ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                              USD
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Group: Etapa de Ventas y Prioridad */}
                <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Etapa del Embudo (Kanban) y Cita
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Etapa Kanban */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Etapa en el Embudo de Ventas <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={stage}
                        onChange={(e) => setStage(e.target.value as StageId)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-bold bg-white dark:bg-slate-800"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Prioridad */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Prioridad Comercial
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => setPriority('alta')}
                          className={`py-2 text-xs font-extrabold rounded-xl border flex items-center justify-center transition-all cursor-pointer touch-manipulation ${
                            priority === 'alta'
                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-500/30'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 hover:bg-rose-100'
                          }`}
                        >
                          Alta 🔥
                        </button>
                        <button
                          type="button"
                          onClick={() => setPriority('media')}
                          className={`py-2 text-xs font-extrabold rounded-xl border flex items-center justify-center transition-all cursor-pointer touch-manipulation ${
                            priority === 'media'
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/30'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-100'
                          }`}
                        >
                          Media ⚡
                        </button>
                        <button
                          type="button"
                          onClick={() => setPriority('baja')}
                          className={`py-2 text-xs font-extrabold rounded-xl border flex items-center justify-center transition-all cursor-pointer touch-manipulation ${
                            priority === 'baja'
                              ? 'bg-slate-700 dark:bg-slate-600 text-white border-slate-800 shadow-xs ring-2 ring-slate-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Baja ☕
                        </button>
                      </div>
                    </div>

                    {/* Próxima Fecha de Seguimiento */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Próxima Fecha de Seguimiento / Cita
                      </label>
                      <input
                        type="date"
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-semibold bg-white dark:bg-slate-800"
                      />
                    </div>

                    {/* Hora de Cita */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hora Sugerida de Cita / Llamada
                      </label>
                      <input
                        type="time"
                        value={nextFollowUpTime}
                        onChange={(e) => setNextFollowUpTime(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-semibold bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('finances')}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer touch-manipulation"
                  >
                    <span>Siguiente: Pagos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 3: PAGOS & COBRANZA EN ECUADOR */}
            {activeTab === 'finances' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
                
                <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Control Financiero, Pagos y Cobranza
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Valor Propuesta */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Valor Total del Plan Ofertado ($ USD) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="1"
                          value={estimatedValue}
                          onChange={(e) => setEstimatedValue(Number(e.target.value))}
                          className="w-full text-xs pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    {/* Monto Cobrado / Pagado */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Monto Cobrado / Pagado ($ USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="1"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(Number(e.target.value))}
                          className="w-full text-xs pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    {/* Estado de Pago */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Estado Actual de Pago
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                      >
                        <option value="pagado">🟢 Pagado Completo ($99 / $150)</option>
                        <option value="parcial">🟡 Pago Parcial / Anticipo</option>
                        <option value="pendiente">🟠 Pendiente de Pago</option>
                        <option value="no_aplica">⚪ No Aplica (Etapa prospecto)</option>
                      </select>
                    </div>

                    {/* Método de Pago */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Método / Canal Bancario
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 font-medium bg-white dark:bg-slate-800"
                      >
                        {PAYMENT_METHODS.map((pm) => (
                          <option key={pm} value={pm}>
                            {pm}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-[11px] sm:text-xs">Balance comercial registrado para reportes.</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Saldo Pendiente:</span>
                      <span className={`font-black text-sm ${estimatedValue - paidAmount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        ${Math.max(0, estimatedValue - paidAmount)} USD
                      </span>
                    </div>
                  </div>

                  {/* Official Digital Receipt Action */}
                  {leadToEdit && onOpenReceipt && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(leadToEdit)}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Generar / Ver Recibo Oficial Digital de Pago</span>
                      </button>
                    </div>
                  )}

                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sales')}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notes')}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer touch-manipulation"
                  >
                    <span>Siguiente: Notas</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 4: BITÁCORA, NOTAS & HISTORIAL */}
            {activeTab === 'notes' && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
                
                {/* Section Group: Notas del Especialista */}
                <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Notas Clínicas y Comerciales
                    </h4>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Anotaciones: secretaria a cargo, mejor horario para contactar, solicitudes del médico..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-3 sm:p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 leading-relaxed resize-y"
                  />

                  {/* Quick Note Adder */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Nueva nota al historial:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ej. Llamó para confirmar cita el viernes..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualNote();
                          }
                        }}
                        className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualNote}
                        disabled={!newNoteText.trim()}
                        className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:bg-black disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer touch-manipulation shrink-0 border border-transparent dark:border-slate-700"
                      >
                        Añadir
                      </button>
                    </div>

                    {/* Quick Preset Buttons in Tab 4 */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Plantillas:
                      </span>
                      {[
                        '📞 No contestó llamada',
                        '💬 Mensaje WhatsApp enviado',
                        '🏥 Visita presencial realizada',
                        '🗓️ Pide llamar en la tarde',
                        '⭐ Interesado en plan $99/año',
                        '💎 Interesado en plan $150/2 años'
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAddQuickNote(chip)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer touch-manipulation"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section Group: Historial Cronológico */}
                <div className="bg-white dark:bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Historial de Interacciones ({history.length})
                      </h4>
                    </div>
                  </div>

                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center italic">
                      Aún no hay interacciones registradas.
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {history.map((act, idx) => (
                        <div key={`${act.id || 'act'}-${idx}`} className="text-xs p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2.5 group">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-mono font-bold bg-teal-100/70 dark:bg-teal-950/70 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                              {act.date.slice(5, 16)}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200 font-medium break-words">
                              {act.description}
                            </span>
                          </div>
                          {act.type === 'nota' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryNote(act.id)}
                              className="text-slate-300 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100"
                              title="Eliminar observación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('finances')}
                    className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Sticky Modal Action Footer with Safe Area Support */}
          <div className="p-3.5 sm:px-7 sm:py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 shadow-lg" style={{ paddingBottom: 'max(0.85rem, env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex items-center justify-between sm:justify-start gap-2">
              {leadToEdit && onDeleteLead ? (
                <button
                  type="button"
                  id="btn-delete-lead-modal"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 active:bg-rose-200 text-rose-700 dark:text-rose-300 hover:text-rose-800 border border-rose-200/90 dark:border-rose-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer touch-manipulation shadow-2xs"
                  title="Eliminar este especialista"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Eliminar Especialista</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  Completando alta de nuevo médico en Ecuador
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 active:bg-slate-100 text-xs font-bold transition-colors cursor-pointer touch-manipulation"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                id="btn-save-lead"
                className="flex-1 sm:flex-none px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 touch-manipulation"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>{leadToEdit ? 'Guardar Cambios' : 'Registrar Médico'}</span>
              </button>
            </div>
          </div>

        </form>

        {/* Delete Specialist Confirmation Modal */}
        {leadToEdit && (
          <DeleteConfirmationModal
            isOpen={isConfirmingDelete}
            onClose={() => setIsConfirmingDelete(false)}
            onConfirm={() => {
              if (leadToEdit && onDeleteLead) {
                onDeleteLead(leadToEdit.id);
                onClose();
              }
            }}
            lead={leadToEdit}
          />
        )}

      </div>
    </div>
  );
};
