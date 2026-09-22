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
  Globe
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
import { SPECIALTIES_LIST } from '../data/specialties';
import { 
  ECUADOR_CITIES, 
  ECUADOR_CLINICS_SUGGESTIONS, 
  ECUADOR_SECTORS,
  formatEcuadorPhoneForWhatsApp 
} from '../data/ecuadorData';
import { BASE_SERVICES } from '../data/servicesData';
import { formatCurrency } from '../utils/storage';
import { parseRawDoctorInfo } from '../utils/rawInfoParser';
import { getLeadRegistrationInfo, formatRegistrationDate } from '../utils/dateUtils';

interface LeadModalProps {
  isOpen: boolean;
  leadToEdit: MedicalLead | null;
  defaultStage?: StageId;
  services?: MedicalService[];
  onClose: () => void;
  onSaveLead: (lead: MedicalLead) => void;
  onOpenWhatsApp?: (lead: MedicalLead) => void;
  onOpenServicesModal?: () => void;
  onOpenBulkModal?: () => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  leadToEdit,
  defaultStage = 'prospecto',
  services = BASE_SERVICES,
  onClose,
  onSaveLead,
  onOpenWhatsApp,
  onOpenServicesModal,
  onOpenBulkModal
}) => {
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

  // Platform Registration Date (Date when doctor was registered into the CRM platform)
  const [registrationDate, setRegistrationDate] = useState('');

  // Smart Extractor from Google Maps or Web links
  const [rawInputText, setRawInputText] = useState('');
  const [isSmartExtractorOpen, setIsSmartExtractorOpen] = useState(false);
  const [extractorSuccess, setExtractorSuccess] = useState<string | null>(null);

  // Available services fallback to base
  const availableServices = services && services.length > 0 ? services : BASE_SERVICES;

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
      // Set default follow up to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setNextFollowUpDate(tomorrow.toISOString().split('T')[0]);
      setNextFollowUpTime('11:00');
      setExpectedClosingDate('');
      setNotes('');
      setHistory([]);
      setIsSmartExtractorOpen(true); // Open by default for new doctor registration
      setExtractorSuccess(null);
    }
  }, [leadToEdit, defaultStage]);

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
      setExtractorSuccess(`¡Listo! Se ordenaron y completaron: ${applied.join(', ')}`);
    } else {
      setExtractorSuccess('Se procesó la información. Verifica los datos en los campos.');
    }
  };

  if (!isOpen) return null;

  const handleAddManualNote = () => {
    if (!newNoteText.trim()) return;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      date: dateStr,
      type: 'nota',
      description: newNoteText.trim()
    };
    setHistory([newLog, ...history]);
    setNewNoteText('');
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

    // If new lead, add creation log
    if (!leadToEdit) {
      updatedHistory.push({
        id: `act-${Date.now()}`,
        date: dateStr,
        type: 'creacion',
        description: `Prospecto creado para ${serviceName} en sector ${sector}. Etapa: ${STAGES.find((s) => s.id === stage)?.name}`
      });
    } else if (leadToEdit.stage !== stage) {
      // Log stage change
      updatedHistory.unshift({
        id: `act-${Date.now()}`,
        date: dateStr,
        type: 'etapa',
        description: `Etapa cambiada a: ${STAGES.find((s) => s.id === stage)?.name}`
      });
    }

    // If payment amount changed or marked paid
    if (leadToEdit && leadToEdit.paidAmount !== paidAmount && paidAmount > 0) {
      updatedHistory.unshift({
        id: `act-${Date.now()}-pay`,
        date: dateStr,
        type: 'pago',
        description: `Pago registrado de ${formatCurrency(paidAmount)} vía ${paymentMethod}`
      });
    }

    const savedLead: MedicalLead = {
      id: leadToEdit ? leadToEdit.id : `lead-${Date.now()}`,
      doctorName: doctorName.trim() || 'Dr. Médico Especialista',
      clinicOrHospital: clinicOrHospital.trim() || 'Consultorio Privado',
      specialty,
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      sector: sector.trim() || 'Centro',
      serviceId,
      serviceName,
      stage,
      priority,
      order: leadToEdit?.order ?? 0,
      estimatedValue: Number(estimatedValue) || 0,
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white sm:rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {leadToEdit ? `Ficha Médica: ${leadToEdit.doctorName}` : 'Registrar Nuevo Especialista'}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Venta de Perfiles Médicos en Ecuador</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span className="text-teal-300 font-semibold">{sector}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {leadToEdit && onOpenWhatsApp && (
              <button
                type="button"
                onClick={() => {
                  onOpenWhatsApp(leadToEdit);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form with Sticky Action Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">

            {/* Fecha de Registro en Plataforma Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-slate-50 border border-teal-200/80 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Fecha de Registro en Plataforma:</span>{' '}
                  <span className="text-slate-700 font-semibold">
                    {leadToEdit && regInfo
                      ? `${regInfo.formattedFull} (${regInfo.relative})`
                      : formatRegistrationDate(registrationDate, 'full')}
                  </span>
                  {leadToEdit && regInfo?.exactDateTime && regInfo.exactDateTime.includes(':') && (
                    <span className="text-slate-500 text-[11px] block sm:inline sm:ml-2">
                      · Registrado a las {regInfo.exactDateTime.slice(11, 16)}
                    </span>
                  )}
                </div>
              </div>

              {/* Editable date picker for manual adjustments */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <label className="text-[11px] font-semibold text-slate-500">
                  {leadToEdit ? 'Modificar fecha:' : 'Fecha de alta:'}
                </label>
                <input
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Smart Google Maps / Web Link / Raw Data Extractor */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Auto-completar desde Google Maps o Enlace Web</span>
                      <span className="px-1.5 py-0.2 bg-teal-600 text-white text-[9px] font-black rounded-full">
                        Inteligente
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-600">
                      Pega un enlace de Google Maps, URL web o datos copiados para ordenar y rellenar los campos automáticamente.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenBulkModal && (
                    <button
                      type="button"
                      onClick={onOpenBulkModal}
                      className="text-xs text-teal-800 hover:text-teal-950 font-bold hover:underline hidden sm:flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Carga Masiva</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsSmartExtractorOpen(!isSmartExtractorOpen)}
                    className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    {isSmartExtractorOpen ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              {isSmartExtractorOpen && (
                <div className="space-y-2 pt-1 border-t border-teal-200/60">
                  <textarea
                    rows={2}
                    value={rawInputText}
                    onChange={(e) => {
                      setRawInputText(e.target.value);
                      setExtractorSuccess(null);
                    }}
                    placeholder="Pega aquí el enlace de Google Maps (https://maps.app.goo.gl/...), enlace web, o texto copiado con teléfono, clínica y especialidad..."
                    className="w-full px-3 py-2 text-xs bg-white border border-teal-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleApplySmartExtractor}
                        disabled={!rawInputText.trim()}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ordenar Datos y Completar Campos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const sample = `Dr. Carlos Mendoza Zambrano\nCardiólogo en Manta\nTorre Médica Montecristi, Barbasquillo, Manta\nTeléfono: 0998765432\nEmail: dr.carlos@cardiomanta.ec\nHorario: Lun - Vie 09:00 - 18:00`;
                          setRawInputText(sample);
                        }}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold hover:underline cursor-pointer"
                      >
                        Pegar ejemplo
                      </button>
                    </div>

                    {onOpenBulkModal && (
                      <button
                        type="button"
                        onClick={onOpenBulkModal}
                        className="text-xs text-teal-800 hover:text-teal-950 font-bold hover:underline sm:hidden flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>¿Varios médicos? Carga Masiva</span>
                      </button>
                    )}
                  </div>

                  {extractorSuccess && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{extractorSuccess}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          
            {/* Section 1: Datos del Médico y Clínica */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Información del Especialista</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo del Médico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Dr. Alejandro Morales"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Especialidad Médica *
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value as MedicalSpecialty)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-semibold"
                >
                  {SPECIALTIES_LIST.map((spec) => (
                    <option key={spec.name} value={spec.name}>
                      {spec.name} ({spec.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clínica, Hospital o Consultorio *
                </label>
                <input
                  type="text"
                  required
                  list="clinics-ec-suggestions"
                  placeholder="ej. Hospital Metropolitano, Torre II"
                  value={clinicOrHospital}
                  onChange={(e) => setClinicOrHospital(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                <datalist id="clinics-ec-suggestions">
                  {ECUADOR_CLINICS_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>WhatsApp / Celular Ecuador</span>
                    <span className="text-xs">🇪🇨</span>
                  </span>
                  <span className="text-[10px] text-teal-700 font-normal">Prefijo +593</span>
                </label>
                <div className="relative">
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
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-slate-800 font-semibold"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Formato: +593 9X XXX XXXX (9 dígitos móviles de Ecuador)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="doctor@hospital.ec"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Ciudad de Ecuador *</span>
                  <span className="text-[10px] text-slate-400">Cantón / Provincia</span>
                </label>
                <input
                  type="text"
                  required
                  list="cities-ec-suggestions"
                  placeholder="ej. Manta, Portoviejo, Guayaquil, Quito..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                />
                <datalist id="cities-ec-suggestions">
                  {ECUADOR_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.province} - {c.region})
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Sector / Locación Segmentación */}
              <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Segmentación por Locación / Sector *</span>
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    Centro, Jocay, Pradera, Los Esteros, etc.
                  </span>
                </label>
                
                <input
                  type="text"
                  required
                  list="sectors-ec-suggestions"
                  placeholder="ej. Centro, Jocay, La Pradera, Los Esteros, Tarqui, Barbasquillo..."
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 font-bold bg-white"
                />
                <datalist id="sectors-ec-suggestions">
                  {ECUADOR_SECTORS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>

                {/* Quick sector selection pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-medium">Sectores frecuentes:</span>
                  {['Centro', 'Jocay', 'La Pradera', 'Los Esteros', 'Tarqui', 'Barbasquillo'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setSector(chip)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        sector.toLowerCase() === chip.toLowerCase()
                          ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      📍 {chip}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Servicio Médico Ofertado (2 Servicios de Base $99 / $150 + Extras) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-teal-100 pb-1.5">
              <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Servicio Médico Ofertado</span>
              </h4>
              {onOpenServicesModal && (
                <button
                  type="button"
                  onClick={onOpenServicesModal}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                >
                  + Administrar Catálogo
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableServices.map((srv) => {
                const isSelected = serviceId === srv.id || serviceName.toLowerCase().includes(srv.name.toLowerCase());
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleSelectService(srv)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-800 shadow-sm shadow-teal-700/20'
                        : 'bg-white hover:bg-teal-50/50 text-slate-800 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{srv.name}</span>
                        {srv.isBase && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
                          }`}>
                            Base
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                        {srv.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-teal-700'}`}>
                        ${srv.price}
                      </span>
                      <span className={`block text-[9px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                        USD
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Etapa de Ventas & Fechas de Seguimiento */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Etapa de Ventas y Próxima Cita</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Etapa del Embudo (Kanban) *
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as StageId)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-bold"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prioridad del Médico *
                </label>
                <div className="grid grid-cols-3 gap-1.5 h-[34px]">
                  <button
                    type="button"
                    onClick={() => setPriority('alta')}
                    className={`text-[11px] font-extrabold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      priority === 'alta'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-500/40'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Alta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('media')}
                    className={`text-[11px] font-extrabold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      priority === 'media'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Media
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('baja')}
                    className={`text-[11px] font-extrabold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      priority === 'baja'
                        ? 'bg-slate-600 text-white border-slate-700 shadow-xs ring-2 ring-slate-500/40'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Baja
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Próxima Fecha de Seguimiento
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hora de Cita / Llamada
                </label>
                <input
                  type="time"
                  value={nextFollowUpTime}
                  onChange={(e) => setNextFollowUpTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pagos, Honorarios & Método de Pago */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Finanzas, Pagos y Cobranza en Ecuador</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor Propuesta / Plan ($)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monto Cobrado / Pagado ($)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado de Pago
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
                >
                  <option value="pagado">Pagado Completo</option>
                  <option value="parcial">Pago Parcial / Anticipo</option>
                  <option value="pendiente">Pendiente de Pago</option>
                  <option value="no_aplica">No Aplica (Etapa temprana)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Notas & Bitácora */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2 border-b border-teal-100 pb-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Notas Clínicas y Comerciales</span>
            </h4>

            <textarea
              rows={2}
              placeholder="Anotaciones sobre el médico, requisitos de su consultorio, comentarios sobre la oferta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 resize-none"
            />

            {/* Manual note adder */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+ Agregar nota rápida al historial (ej. Llamó para confirmar cita)..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualNote();
                  }
                }}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddManualNote}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Section 6: Historial de Actividades */}
          {history.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                <span>Historial de Seguimientos ({history.length})</span>
              </h4>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {history.map((act) => (
                  <div key={act.id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 mt-0.5">
                      {act.date}
                    </span>
                    <span className="text-slate-700 font-medium">
                      {act.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>

          {/* Sticky Modal Action Footer */}
          <div className="p-3 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 shadow-xs" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              * Campos obligatorios para seguimiento médico en Ecuador
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-lead"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{leadToEdit ? 'Guardar Cambios' : 'Registrar Médico'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
