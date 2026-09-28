import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Plus, 
  RotateCcw, 
  Save, 
  Trash2, 
  Eye, 
  Sparkles, 
  HelpCircle,
  Check,
  Send,
  Image as ImageIcon,
  FileText,
  Volume2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Play,
  Pause,
  Download,
  Layers,
  Paperclip,
  User,
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  Search
} from 'lucide-react';
import { WhatsAppTemplate, StageId, TemplateMediaAttachment, MedicalLead } from '../types';
import { STAGES } from '../data/stages';
import { replaceTemplatePlaceholders } from '../data/whatsappTemplates';
import { AttachmentEditorModal } from './AttachmentEditorModal';
import { downloadMediaAttachment } from '../utils/mediaDemoAssets';
import { formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';
import { getSpecialtyMeta } from '../data/specialties';
import { formatCurrency } from '../utils/storage';
import confetti from 'canvas-confetti';

interface TemplatesManagerProps {
  templates: WhatsAppTemplate[];
  leads?: MedicalLead[];
  onOpenWhatsApp?: (lead: MedicalLead) => void;
  onSaveTemplates: (templates: WhatsAppTemplate[]) => void;
  onResetTemplates: () => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  templates,
  leads = [],
  onOpenWhatsApp,
  onSaveTemplates,
  onResetTemplates
}) => {
  const [editingTemplates, setEditingTemplates] = useState<WhatsAppTemplate[]>(templates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<TemplateMediaAttachment | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPreviewRef = React.useRef<HTMLAudioElement | null>(null);

  const selectedTemplate =
    editingTemplates.find((t) => t.id === selectedTemplateId) || editingTemplates[0];

  // Selected lead or fallback sample
  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0] || null;

  const handleUpdateCurrent = (field: keyof WhatsAppTemplate, value: any) => {
    if (!selectedTemplate) return;
    const updated = editingTemplates.map((t) =>
      t.id === selectedTemplate.id ? { ...t, [field]: value } : t
    );
    setEditingTemplates(updated);
  };

  const handleSaveAll = () => {
    onSaveTemplates(editingTemplates);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleCreateNewTemplate = () => {
    const newId = `tpl-${Date.now()}`;
    const newTpl: WhatsAppTemplate = {
      id: newId,
      stageId: 'contactado',
      title: 'Nueva Plantilla Médica',
      description: 'Mensaje personalizado para especialistas',
      messageText: `Estimado/a [Doctor], le escribo con respecto a su consulta de [Especialidad] en [Clinica]...`,
      attachments: []
    };
    const next = [...editingTemplates, newTpl];
    setEditingTemplates(next);
    setSelectedTemplateId(newId);
  };

  const handleDeleteTemplate = (id: string) => {
    if (editingTemplates.length <= 1) {
      alert('Debes mantener al menos una plantilla en el CRM.');
      return;
    }
    const next = editingTemplates.filter((t) => t.id !== id);
    setEditingTemplates(next);
    if (selectedTemplateId === id) {
      setSelectedTemplateId(next[0].id);
    }
  };

  // Reordenar adjuntos dentro de la secuencia
  const handleMoveAttachment = (index: number, direction: 'up' | 'down') => {
    if (!selectedTemplate) return;
    const list = [...(selectedTemplate.attachments || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    handleUpdateCurrent('attachments', list);
  };

  // Eliminar adjunto
  const handleDeleteAttachment = (attId: string) => {
    if (!selectedTemplate) return;
    const list = (selectedTemplate.attachments || []).filter((a) => a.id !== attId);
    handleUpdateCurrent('attachments', list);
  };

  // Guardar adjunto (nuevo o editado)
  const handleSaveAttachment = (attachment: TemplateMediaAttachment) => {
    if (!selectedTemplate) return;
    const list = [...(selectedTemplate.attachments || [])];
    const existingIndex = list.findIndex((a) => a.id === attachment.id);
    if (existingIndex >= 0) {
      list[existingIndex] = attachment;
    } else {
      list.push(attachment);
    }
    handleUpdateCurrent('attachments', list);
  };

  const togglePlayAudioPreview = (url: string, id: string) => {
    if (playingAudioId === id) {
      audioPreviewRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio(url);
      } else {
        audioPreviewRef.current.src = url;
      }
      audioPreviewRef.current.play();
      setPlayingAudioId(id);
      audioPreviewRef.current.onended = () => setPlayingAudioId(null);
    }
  };

  // Data for replacing placeholders
  const activeDoctorData = selectedLead ? {
    doctorName: selectedLead.doctorName,
    specialty: selectedLead.specialty,
    clinicOrHospital: selectedLead.clinicOrHospital,
    amount: formatCurrency(selectedLead.paidAmount > 0 ? selectedLead.paidAmount : (selectedLead.estimatedValue || 99)),
    date: selectedLead.nextFollowUpDate || 'esta semana',
    time: selectedLead.nextFollowUpTime || '11:00 AM',
    paymentMethod: selectedLead.paymentMethod || 'Transferencia Banco Pichincha'
  } : {
    doctorName: 'Dr. Alejandro Morales',
    specialty: 'Cardiología',
    clinicOrHospital: 'Clínica San Antonio (Manta)',
    amount: '$99 USD (Plan Anual)',
    date: '25 de Octubre',
    time: '11:00 AM',
    paymentMethod: 'Transferencia Banco Pichincha'
  };

  const previewText = selectedTemplate
    ? replaceTemplatePlaceholders(selectedTemplate.messageText, activeDoctorData)
    : '';

  const attachments = selectedTemplate?.attachments || [];

  // Direct WhatsApp sender to selected doctor
  const handleDirectSendToSelectedDoctor = () => {
    if (!selectedLead) {
      alert('Por favor selecciona un médico de la lista.');
      return;
    }

    const { cleanWhatsAppNumber } = formatEcuadorPhoneForWhatsApp(selectedLead.phone);
    const targetPhone = cleanWhatsAppNumber || selectedLead.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(previewText);
    const url = `https://wa.me/${targetPhone}?text=${encoded}`;
    window.open(url, '_blank');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(previewText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Filtered leads for search
  const filteredLeads = leads.filter((l) => {
    if (!doctorSearch.trim()) return true;
    const q = doctorSearch.toLowerCase();
    return (
      l.doctorName.toLowerCase().includes(q) ||
      l.specialty.toLowerCase().includes(q) ||
      l.clinicOrHospital.toLowerCase().includes(q) ||
      (l.city || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/60 shrink-0">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Plantillas y Envío a Médicos por WhatsApp
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Elige cualquier médico de tu base, previsualiza el mensaje personalizado con sus datos y envíalo con 1 clic.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onResetTemplates}
            title="Restaurar plantillas recomendadas"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNewTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Plantilla</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {savedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Template List + Editor + Live Doctor Dispatch Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Template selector */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Plantillas Disponibles ({editingTemplates.length})</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[620px] overflow-y-auto">
            {editingTemplates.map((tpl) => {
              const stageConfig = STAGES.find((s) => s.id === tpl.stageId);
              const isSelected = tpl.id === selectedTemplate?.id;
              const attCount = tpl.attachments?.length || 0;

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border-l-4 border-l-teal-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {tpl.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {stageConfig?.name || tpl.stageId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {tpl.description}
                  </p>
                  
                  {/* Sequence media indicator pill */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      <span>{attCount} archivos en secuencia</span>
                    </span>
                    {tpl.attachments?.some((a) => a.type === 'image') && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded font-bold">IMG</span>
                    )}
                    {tpl.attachments?.some((a) => a.type === 'pdf') && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded font-bold">PDF</span>
                    )}
                    {tpl.attachments?.some((a) => a.type === 'audio') && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded font-bold">MP3</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive Doctor Selector + WhatsApp Dispatch + Editor */}
        {selectedTemplate && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* DIRECT DOCTOR DISPATCH SELECTOR BOX */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/30 p-4 sm:p-5 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-200/60 dark:border-emerald-800/40">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Elegir Especialista para Enviar esta Plantilla
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Selecciona un médico de tu CRM para sustituir automáticamente sus datos y contactarlo por WhatsApp.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full self-start sm:self-auto border border-emerald-200 dark:border-emerald-800">
                  {leads.length} médicos en base
                </span>
              </div>

              {/* Selector and Search */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seleccionar Médico:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLead?.id || ''}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                    >
                      {leads.length === 0 ? (
                        <option value="">No hay médicos registrados aún</option>
                      ) : (
                        leads.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.doctorName} • {l.specialty} ({l.clinicOrHospital} - {l.city || 'Ecuador'})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Filtrar por nombre / ciudad:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar Dr., Manta, Pediatría..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Details Bar */}
              {selectedLead && (
                <div className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedLead.doctorName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {selectedLead.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{selectedLead.clinicOrHospital}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{selectedLead.city || 'Manta'}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        <Phone className="w-3 h-3" />
                        <span>{selectedLead.phone} (+593 Ecuador)</span>
                      </span>
                    </div>
                  </div>

                  {/* Primary Dispatch Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDirectSendToSelectedDoctor}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Enviar a {selectedLead.doctorName.split(' ')[0]} {selectedLead.doctorName.split(' ')[1] || ''}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSuccess ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>

                    {onOpenWhatsApp && (
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(selectedLead)}
                        className="px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Abrir asistente completo con secuencia multimedia"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Asistente Secuencial</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
            
            {/* Editor card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Editar Contenido de la Plantilla: {selectedTemplate.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  title="Eliminar plantilla"
                  className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Título de la Plantilla
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.title}
                    onChange={(e) => handleUpdateCurrent('title', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Etapa del Embudo Asociada
                  </label>
                  <select
                    value={selectedTemplate.stageId}
                    onChange={(e) => handleUpdateCurrent('stageId', e.target.value as StageId)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción / Objetivo
                </label>
                <input
                  type="text"
                  value={selectedTemplate.description}
                  onChange={(e) => handleUpdateCurrent('description', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Tag variables helper chip bar */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Variables dinámicas disponibles (haz clic para insertar en el texto):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['[Doctor]', '[Especialidad]', '[Clinica]', '[Monto]', '[Fecha]', '[Hora]', '[MetodoPago]'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        handleUpdateCurrent('messageText', selectedTemplate.messageText + ' ' + tag);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensaje de texto base */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Paso 1: Mensaje de Texto Principal (WhatsApp)</span>
                  <span className="text-[11px] font-normal text-slate-400">Se envía primero al médico</span>
                </label>
                <textarea
                  rows={6}
                  value={selectedTemplate.messageText}
                  onChange={(e) => handleUpdateCurrent('messageText', e.target.value)}
                  className="w-full text-xs font-sans p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* SECUENCIA MULTIMEDIA (IMÁGENES, PDF Y MP3) */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Secuencia de Envío Multimedia (Imágenes, PDF y Audios MP3)
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Los archivos se enviarán secuencialmente después del texto principal. Puedes reordenarlos libremente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAttachment(null);
                      setIsAttachmentModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Archivo a la Secuencia</span>
                  </button>
                </div>

                {attachments.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Esta plantilla no tiene archivos en la secuencia.</p>
                    <p className="text-[11px] text-slate-400">
                      Haz clic en "Agregar Archivo a la Secuencia" para adjuntar infografías, propuestas en PDF o notas de voz en MP3.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {attachments.map((att, index) => {
                      const stepNumber = index + 2;

                      return (
                        <div
                          key={att.id}
                          className="p-3 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {/* Step index badge */}
                            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                              #{stepNumber}
                            </div>

                            {/* Type icon */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs ${
                              att.type === 'image' ? 'bg-blue-600' :
                              att.type === 'pdf' ? 'bg-rose-600' : 'bg-purple-600'
                            }`}>
                              {att.type === 'image' && <ImageIcon className="w-4 h-4" />}
                              {att.type === 'pdf' && <FileText className="w-4 h-4" />}
                              {att.type === 'audio' && <Volume2 className="w-4 h-4" />}
                            </div>

                            {/* Details */}
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                  {att.title}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  att.type === 'image' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                                  att.type === 'pdf' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                }`}>
                                  {att.type === 'audio' ? `MP3 (${att.duration || '0:35'})` : att.type.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                <span className="font-mono">{att.fileName}</span>
                                {att.fileSize && <span> · {att.fileSize}</span>}
                              </div>
                              {att.caption && (
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 italic truncate mt-0.5">
                                  "{att.caption}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {att.type === 'audio' && (
                              <button
                                type="button"
                                onClick={() => togglePlayAudioPreview(att.url, att.id)}
                                title="Escuchar audio"
                                className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {playingAudioId === att.id ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Play className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* Reorder buttons */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveAttachment(index, 'up')}
                              title="Subir en la secuencia"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={index === attachments.length - 1}
                              onClick={() => handleMoveAttachment(index, 'down')}
                              title="Bajar en la secuencia"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAttachment(att);
                                setIsAttachmentModalOpen(true);
                              }}
                              title="Editar archivo"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(att.id)}
                              title="Eliminar de la secuencia"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Live Preview in WhatsApp Card - Entire Sequential Flow */}
            <div className="bg-[#EFEAE2] dark:bg-slate-950 rounded-2xl border border-[#D1D7DB] dark:border-slate-800 p-4 shadow-sm relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D1D7DB]/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                  <span className="text-xs font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                    Simulación de Chat WhatsApp para: {activeDoctorData.doctorName}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-900 dark:text-emerald-300 bg-white/80 dark:bg-slate-900 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                  {1 + attachments.length} mensajes secuenciales
                </span>
              </div>

              {/* Chat bubble 1: Main Text Message */}
              <div className="max-w-md bg-white dark:bg-slate-850 rounded-2xl p-3.5 shadow-xs border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                <div className="text-[10px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>Mensaje 1 de {1 + attachments.length} (Texto Personalizado)</span>
                </div>
                {previewText}
                <div className="text-right text-[10px] text-slate-400 mt-2 font-mono flex items-center justify-end gap-1">
                  <span>11:42 AM</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">✓✓</span>
                </div>
              </div>

              {/* Sequential Media Bubbles */}
              {attachments.map((att, i) => {
                const bubbleNum = i + 2;
                const resolvedCaption = att.caption
                  ? replaceTemplatePlaceholders(att.caption, activeDoctorData)
                  : '';

                if (att.type === 'image') {
                  return (
                    <div key={att.id} className="max-w-md bg-white dark:bg-slate-850 rounded-2xl p-2 shadow-xs border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider px-1 pt-1">
                        Mensaje {bubbleNum} de {1 + attachments.length} (Imagen: {att.title})
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56 bg-slate-900">
                        <img src={att.url} alt={att.title} className="w-full object-cover" />
                      </div>
                      {resolvedCaption && (
                        <p className="px-1 text-xs text-slate-800 dark:text-slate-200 leading-snug">{resolvedCaption}</p>
                      )}
                      <div className="text-right text-[10px] text-slate-400 px-1 font-mono flex items-center justify-end gap-1">
                        <span>11:43 AM</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">✓✓</span>
                      </div>
                    </div>
                  );
                }

                if (att.type === 'pdf') {
                  return (
                    <div key={att.id} className="max-w-md bg-white dark:bg-slate-850 rounded-2xl p-3 shadow-xs border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                        Mensaje {bubbleNum} de {1 + attachments.length} (Documento PDF)
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-[#F0F2F5] dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          PDF
                        </div>
                        <div className="truncate flex-1">
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{att.fileName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{att.fileSize || '1.4 MB'} · Documento PDF</div>
                        </div>
                      </div>
                      {resolvedCaption && (
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{resolvedCaption}</p>
                      )}
                      <div className="text-right text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                        <span>11:44 AM</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">✓✓</span>
                      </div>
                    </div>
                  );
                }

                if (att.type === 'audio') {
                  return (
                    <div key={att.id} className="max-w-md bg-white dark:bg-slate-850 rounded-2xl p-3 shadow-xs border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wider">
                        Mensaje {bubbleNum} de {1 + attachments.length} (Nota de Voz MP3)
                      </div>
                      
                      {/* WhatsApp style audio player card */}
                      <div className="flex items-center gap-3 p-2 bg-[#F0F2F5] dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => togglePlayAudioPreview(att.url, att.id)}
                          className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-transform hover:scale-105"
                        >
                          {playingAudioId === att.id ? (
                            <Pause className="w-5 h-5 fill-white" />
                          ) : (
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          {/* Mini waveform bars */}
                          <div className="flex items-center gap-0.5 h-6">
                            {[10, 16, 22, 14, 26, 18, 12, 24, 28, 16, 20, 14, 22, 26, 18, 12, 16, 24, 20, 14].map((h, idx) => (
                              <div
                                key={idx}
                                className={`w-1 rounded-full ${
                                  playingAudioId === att.id ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                                }`}
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <span>0:00</span>
                            <span>{att.duration || '0:35'}</span>
                          </div>
                        </div>
                      </div>

                      {resolvedCaption && (
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{resolvedCaption}</p>
                      )}
                      <div className="text-right text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                        <span>11:45 AM</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">✓✓</span>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

          </div>
        )}
      </div>

      {/* Attachment Editor / Creator Modal */}
      <AttachmentEditorModal
        isOpen={isAttachmentModalOpen}
        initialAttachment={editingAttachment}
        onSave={handleSaveAttachment}
        onClose={() => {
          setIsAttachmentModalOpen(false);
          setEditingAttachment(null);
        }}
      />

    </div>
  );
};


