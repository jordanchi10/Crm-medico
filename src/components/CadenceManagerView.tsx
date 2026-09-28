import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  ArrowRight, 
  Clock, 
  User, 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  Filter,
  Info,
  ChevronDown,
  ChevronUp,
  Phone
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { CADENCE_STEPS, CadenceStep, getDoctorCadenceStatus, DoctorCadenceStatus } from '../utils/cadenceUtils';
import { getSpecialtyMeta } from '../data/specialties';
import { formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';
import { ThreeDCadenceIcon } from './ThreeDIcons';
import confetti from 'canvas-confetti';

interface CadenceManagerViewProps {
  leads: MedicalLead[];
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onOpenEdit: (lead: MedicalLead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onLogActivity: (leadId: string, description: string) => void;
}

export const CadenceManagerView: React.FC<CadenceManagerViewProps> = ({
  leads,
  onOpenWhatsApp,
  onOpenEdit,
  onStageChange,
  onLogActivity
}) => {
  const [selectedStepId, setSelectedStepId] = useState<number>(1);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState<string>('all');
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [quickLeadId, setQuickLeadId] = useState<string>(leads[0]?.id || '');

  // Only consider active prospects that have not yet closed or been discarded
  const activeProspects = leads.filter(l => l.stage !== 'ganado' && l.stage !== 'perdido');

  // Compute status for all prospects
  const prospectStatuses: DoctorCadenceStatus[] = activeProspects.map(l => getDoctorCadenceStatus(l));

  // Filter by selected city
  const filteredStatuses = prospectStatuses.filter(s => {
    if (filterCity === 'all') return true;
    return (s.lead.city || '').toLowerCase() === filterCity.toLowerCase();
  });

  // Group by current step
  const stepGroups = CADENCE_STEPS.map(step => {
    const list = filteredStatuses.filter(s => s.currentStep.id === step.id);
    return {
      step,
      count: list.length,
      doctors: list
    };
  });

  const activeGroup = stepGroups.find(g => g.step.id === selectedStepId) || stepGroups[0];
  const selectedStep = activeGroup.step;

  // Selected doctor for quick dispatch
  const quickLead = leads.find(l => l.id === quickLeadId) || leads[0] || null;

  // Unique cities list for filter
  const cities = Array.from(new Set(activeProspects.map(l => l.city || 'Manta'))).filter(Boolean);

  const handleCopyMessage = (lead: MedicalLead, message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedLeadId(lead.id);
    onLogActivity(lead.id, `Mensaje de cadencia (${selectedStep.badge}) copiado para WhatsApp.`);
    setTimeout(() => setCopiedLeadId(null), 2000);
  };

  const handleSendWhatsAppDirect = (lead: MedicalLead, message: string) => {
    const { cleanWhatsAppNumber } = formatEcuadorPhoneForWhatsApp(lead.phone);
    const targetPhone = cleanWhatsAppNumber || lead.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onLogActivity(lead.id, `Secuencia ${selectedStep.title} enviada por WhatsApp.`);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleAdvanceCadence = (lead: MedicalLead) => {
    const nextStage: StageId = selectedStep.id >= 3 ? 'propuesta_enviada' : 'contactado';
    onStageChange(lead.id, nextStage);
    onLogActivity(lead.id, `Avanzó cadencia a ${selectedStep.title}. Estado actualizado.`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/60 shrink-0">
            <ThreeDCadenceIcon size={28} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Cadencia de Seguimiento por WhatsApp</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {activeProspects.length} prospectos activos
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Secuencia paso a paso de 6 mensajes comerciales para presentar, convencer y cerrar doctores en Ecuador.
            </p>
          </div>
        </div>

        {/* City Filter & Guide Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showGuide ? 'Ocultar Explicación' : '¿Cómo funciona?'}</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400">Ciudad:</span>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">Todas ({activeProspects.length})</option>
              {cities.map(c => (
                <option key={c} value={c}>
                  {c} ({activeProspects.filter(l => (l.city || 'Manta').toLowerCase() === c.toLowerCase()).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL GUIDE CARD: Super Clear Explanation */}
      {showGuide && (
        <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-4 border border-purple-700/50 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-purple-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                ¿Qué es la Cadencia de Seguimiento y cómo usarla?
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-800/80 text-purple-200 border border-purple-700">
              Guía Comercial Médica
            </span>
          </div>

          <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
            La <strong>Cadencia de Seguimiento</strong> es una guía de <strong>6 mensajes estratégicos de WhatsApp</strong> probados para vender la membresía del Directorio Médico ($99 / 1 año o $150 / 2 años) a especialistas. Cada paso tiene un objetivo específico para no ser invasivo y aumentar el cierre de ventas:
          </p>

          {/* 6 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300">1️⃣ Toque 1 (Día 1)</span>
                <span className="text-[10px] text-purple-300 font-semibold">Primer Contacto</span>
              </div>
              <p className="text-[11px] text-purple-100">
                Saludo cordial y presentación formal del Directorio Médico del Ecuador en su ciudad.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-300">2️⃣ Toque 2 (Día 3)</span>
                <span className="text-[10px] text-purple-300 font-semibold">Beneficios & Google</span>
              </div>
              <p className="text-[11px] text-purple-100">
                Cómo posicionar su consultorio para captar pacientes privados desde búsquedas en Google.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal-300">3️⃣ Toque 3 (Día 5)</span>
                <span className="text-[10px] text-purple-300 font-semibold">Demo de Perfil</span>
              </div>
              <p className="text-[11px] text-purple-100">
                Muestra interactiva de su perfil médico digital con botón directo a su WhatsApp.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300">4️⃣ Toque 4 (Día 8)</span>
                <span className="text-[10px] text-purple-300 font-semibold">Caso de Éxito</span>
              </div>
              <p className="text-[11px] text-purple-100">
                Testimonio y confianza de otros médicos especialistas que ya usan la plataforma.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300">5️⃣ Toque 5 (Día 12)</span>
                <span className="text-[10px] text-purple-300 font-semibold">Oferta de Cierre</span>
              </div>
              <p className="text-[11px] text-purple-100">
                Propuesta comercial clara: $99/año o $150/2 años para activar su suscripción médica.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-200">6️⃣ Toque 6 (Día 18)</span>
                <span className="text-[10px] text-purple-300 font-semibold">Reactivación</span>
              </div>
              <p className="text-[11px] text-purple-100">
                Último contacto respetuoso para recuperar al doctor antes de archivar el contacto.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-200">
            <span className="font-semibold text-amber-300">
              💡 Cómo usarla: 1. Selecciona el toque arriba ➜ 2. Clic en "Enviar por WhatsApp" ➜ 3. Clic en "Avanzar Paso" cuando responda.
            </span>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-purple-300 hover:text-white underline cursor-pointer text-[11px] self-end sm:self-auto"
            >
              Entendido, ocultar guía
            </button>
          </div>
        </div>
      )}

      {/* Cadence Step Pipeline Bar (Touch-friendly step cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {stepGroups.map(({ step, count }) => {
          const isSelected = selectedStepId === step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setSelectedStepId(step.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-900 dark:bg-purple-950 text-white border-purple-900 dark:border-purple-600 shadow-md ring-2 ring-purple-500/30'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-purple-800 text-purple-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {step.badge}
                  </span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white text-purple-900 font-black' : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                  }`}>
                    {count}
                  </span>
                </div>
                <h4 className="text-xs font-bold mt-2 line-clamp-1">
                  {step.title.split(':')[1] || step.title}
                </h4>
              </div>

              <div className={`text-[10px] mt-2 font-medium ${isSelected ? 'text-purple-300' : 'text-slate-400 dark:text-slate-500'}`}>
                {step.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Explanation Banner + Quick Send to Any Doctor */}
      <div className="bg-gradient-to-r from-purple-50 via-slate-50 to-teal-50/40 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-900 rounded-2xl border border-purple-200/90 dark:border-purple-800/60 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-full">
              Objetivo del {selectedStep.badge}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              ({selectedStep.dayTarget === 1 ? 'Día 1 de contacto' : `Recomendado: Día ${selectedStep.dayTarget}`})
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
            {selectedStep.objective}
          </h3>
        </div>

        {/* Quick Send to Any Doctor Picker */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-white dark:bg-slate-850 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
            Enviar este paso a:
          </span>
          <select
            value={quickLead?.id || ''}
            onChange={(e) => setQuickLeadId(e.target.value)}
            className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer max-w-[200px] truncate"
          >
            {leads.map(l => (
              <option key={l.id} value={l.id}>
                {l.doctorName} ({l.specialty})
              </option>
            ))}
          </select>
          {quickLead && (
            <button
              type="button"
              onClick={() => handleSendWhatsAppDirect(quickLead, selectedStep.generateMessage(quickLead))}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>Enviar</span>
            </button>
          )}
        </div>
      </div>

      {/* Doctors in this Cadence Step */}
      <div className="space-y-4">
        {activeGroup.doctors.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 space-y-2 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto stroke-1" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No hay médicos pendientes en este paso de la cadencia.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              Puedes seleccionar otro paso en la barra superior o usar el selector "Enviar este paso a" arriba para enviar a cualquier médico.
            </p>
          </div>
        ) : (
          activeGroup.doctors.map((item) => {
            const lead = item.lead;
            const message = selectedStep.generateMessage(lead);
            const specMeta = getSpecialtyMeta(lead.specialty);
            const isCopied = copiedLeadId === lead.id;

            return (
              <div 
                key={lead.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all space-y-3.5"
              >
                {/* Doctor Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold border border-teal-100 dark:border-teal-900/60 shrink-0">
                      {lead.doctorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {lead.doctorName}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${specMeta.bgLight} ${specMeta.color}`}>
                          {lead.specialty}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-purple-50 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {item.statusText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>🏥 {lead.clinicOrHospital}</span>
                        <span>📍 {lead.city || 'Manta'} ({lead.sector || 'Centro'})</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">📱 {lead.phone} (+593)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(lead)}
                      className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>

                {/* Instant WhatsApp Template Preview */}
                <div className="bg-slate-50 dark:bg-slate-850 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span>Mensaje Personalizado Sugerido:</span>
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">
                      Listo para enviar con 1 clic por WhatsApp (+593)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line font-sans leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {message}
                  </p>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppDirect(lead, message)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Enviar por WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyMessage(lead, message)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{isCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onStageChange(lead.id, 'demo_agendada');
                        onLogActivity(lead.id, `Cita o demo agendada tras cadencia.`);
                        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      🗓️ Agendar Demo
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAdvanceCadence(lead)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-colors cursor-pointer"
                      title="Registrar contacto y avanzar etapa"
                    >
                      <span>Avanzar Paso</span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

