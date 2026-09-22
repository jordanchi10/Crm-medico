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
  Paperclip
} from 'lucide-react';
import { WhatsAppTemplate, StageId, TemplateMediaAttachment } from '../types';
import { STAGES } from '../data/stages';
import { replaceTemplatePlaceholders } from '../data/whatsappTemplates';
import { AttachmentEditorModal } from './AttachmentEditorModal';
import { downloadMediaAttachment } from '../utils/mediaDemoAssets';

interface TemplatesManagerProps {
  templates: WhatsAppTemplate[];
  onSaveTemplates: (templates: WhatsAppTemplate[]) => void;
  onResetTemplates: () => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  templates,
  onSaveTemplates,
  onResetTemplates
}) => {
  const [editingTemplates, setEditingTemplates] = useState<WhatsAppTemplate[]>(templates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<TemplateMediaAttachment | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPreviewRef = React.useRef<HTMLAudioElement | null>(null);

  const selectedTemplate =
    editingTemplates.find((t) => t.id === selectedTemplateId) || editingTemplates[0];

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

  // Preview simulation with sample doctor
  const sampleData = {
    doctorName: 'Dr. Alejandro Morales',
    specialty: 'Cardiología',
    clinicOrHospital: 'Centro Médico San Ángel',
    amount: '$1,800 USD',
    date: '25 de Septiembre',
    time: '11:00 AM',
    paymentMethod: 'Transferencia Bancaria (SPEI)'
  };

  const previewText = selectedTemplate
    ? replaceTemplatePlaceholders(selectedTemplate.messageText, sampleData)
    : '';

  const attachments = selectedTemplate?.attachments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Plantillas de Notificaciones Automáticas por WhatsApp
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura los mensajes predeterminados y la secuencia multimedia (Imágenes, PDF y Audios MP3) por etapa de ventas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetTemplates}
            title="Restaurar plantillas recomendadas"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Predeterminadas</span>
          </button>

          <button
            onClick={handleCreateNewTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Plantilla</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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

      {/* Main Grid: Template List + Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Template selector */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Plantillas Disponibles ({editingTemplates.length})</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
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
                      ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 leading-snug">
                      {tpl.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {stageConfig?.name || tpl.stageId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {tpl.description}
                  </p>
                  
                  {/* Sequence media indicator pill */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      <span>{attCount} archivos en secuencia</span>
                    </span>
                    {tpl.attachments?.some((a) => a.type === 'image') && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">IMG</span>
                    )}
                    {tpl.attachments?.some((a) => a.type === 'pdf') && (
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold">PDF</span>
                    )}
                    {tpl.attachments?.some((a) => a.type === 'audio') && (
                      <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-bold">MP3</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Editor & Preview */}
        {selectedTemplate && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Editor card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Editar Plantilla: {selectedTemplate.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  title="Eliminar plantilla"
                  className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Plantilla
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.title}
                    onChange={(e) => handleUpdateCurrent('title', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Etapa del Embudo Asociada
                  </label>
                  <select
                    value={selectedTemplate.stageId}
                    onChange={(e) => handleUpdateCurrent('stageId', e.target.value as StageId)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción / Objetivo
                </label>
                <input
                  type="text"
                  value={selectedTemplate.description}
                  onChange={(e) => handleUpdateCurrent('description', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tag variables helper chip bar */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Variables dinámicas disponibles (copia y pega en el texto):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['[Doctor]', '[Especialidad]', '[Clinica]', '[Monto]', '[Fecha]', '[Hora]', '[MetodoPago]'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        handleUpdateCurrent('messageText', selectedTemplate.messageText + ' ' + tag);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-[11px] text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensaje de texto base */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Paso 1: Mensaje de Texto Principal (WhatsApp)</span>
                  <span className="text-[11px] font-normal text-slate-400">Se envía primero al médico</span>
                </label>
                <textarea
                  rows={6}
                  value={selectedTemplate.messageText}
                  onChange={(e) => handleUpdateCurrent('messageText', e.target.value)}
                  className="w-full text-xs font-sans p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800 leading-relaxed"
                />
              </div>

              {/* SECUENCIA MULTIMEDIA (IMÁGENES, PDF Y MP3) */}
              <div className="pt-2 border-t border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Secuencia de Envío Multimedia (Imágenes, PDF y Audios MP3)
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Los archivos se enviarán secuencialmente después del texto principal. Puedes reordenarlos libremente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAttachment(null);
                      setIsAttachmentModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Archivo a la Secuencia</span>
                  </button>
                </div>

                {attachments.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500 text-xs space-y-2">
                    <p className="font-semibold text-slate-700">Esta plantilla no tiene archivos en la secuencia.</p>
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
                          className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {/* Step index badge */}
                            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
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
                                <span className="font-bold text-slate-800 text-xs truncate">
                                  {att.title}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  att.type === 'image' ? 'bg-blue-100 text-blue-800' :
                                  att.type === 'pdf' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {att.type === 'audio' ? `MP3 (${att.duration || '0:35'})` : att.type.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                <span className="font-mono">{att.fileName}</span>
                                {att.fileSize && <span> · {att.fileSize}</span>}
                              </div>
                              {att.caption && (
                                <p className="text-[10px] text-slate-600 italic truncate mt-0.5">
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
                                className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={index === attachments.length - 1}
                              onClick={() => handleMoveAttachment(index, 'down')}
                              title="Bajar en la secuencia"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
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
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(att.id)}
                              title="Eliminar de la secuencia"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
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
            <div className="bg-[#EFEAE2] rounded-xl border border-[#D1D7DB] p-4 shadow-sm relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D1D7DB]/60">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Simulación de Chat WhatsApp: Secuencia Completa en Orden
                  </span>
                </div>
                <span className="text-[10px] text-emerald-900 bg-white/70 px-2 py-0.5 rounded-full font-semibold">
                  {1 + attachments.length} mensajes secuenciales
                </span>
              </div>

              {/* Chat bubble 1: Main Text Message */}
              <div className="max-w-md bg-white rounded-lg p-3.5 shadow-xs border border-slate-200/60 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>Mensaje 1 de {1 + attachments.length} (Texto)</span>
                </div>
                {previewText}
                <div className="text-right text-[10px] text-slate-400 mt-2 font-mono flex items-center justify-end gap-1">
                  <span>11:42 AM</span>
                  <span className="text-teal-600 font-bold">✓✓</span>
                </div>
              </div>

              {/* Sequential Media Bubbles */}
              {attachments.map((att, i) => {
                const bubbleNum = i + 2;
                const resolvedCaption = att.caption
                  ? replaceTemplatePlaceholders(att.caption, sampleData)
                  : '';

                if (att.type === 'image') {
                  return (
                    <div key={att.id} className="max-w-md bg-white rounded-lg p-2 shadow-xs border border-slate-200/60 text-xs text-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider px-1 pt-1">
                        Mensaje {bubbleNum} de {1 + attachments.length} (Imagen: {att.title})
                      </div>
                      <div className="rounded-lg overflow-hidden border border-slate-200 max-h-56 bg-slate-900">
                        <img src={att.url} alt={att.title} className="w-full object-cover" />
                      </div>
                      {resolvedCaption && (
                        <p className="px-1 text-xs text-slate-800 leading-snug">{resolvedCaption}</p>
                      )}
                      <div className="text-right text-[10px] text-slate-400 px-1 font-mono flex items-center justify-end gap-1">
                        <span>11:43 AM</span>
                        <span className="text-teal-600 font-bold">✓✓</span>
                      </div>
                    </div>
                  );
                }

                if (att.type === 'pdf') {
                  return (
                    <div key={att.id} className="max-w-md bg-white rounded-lg p-3 shadow-xs border border-slate-200/60 text-xs text-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                        Mensaje {bubbleNum} de {1 + attachments.length} (Documento PDF)
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-[#F0F2F5] rounded-lg border border-slate-200">
                        <div className="w-9 h-9 rounded bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          PDF
                        </div>
                        <div className="truncate flex-1">
                          <div className="font-bold text-slate-800 text-xs truncate">{att.fileName}</div>
                          <div className="text-[10px] text-slate-500">{att.fileSize || '1.4 MB'} · Documento PDF</div>
                        </div>
                      </div>
                      {resolvedCaption && (
                        <p className="text-xs text-slate-800 leading-snug">{resolvedCaption}</p>
                      )}
                      <div className="text-right text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                        <span>11:44 AM</span>
                        <span className="text-teal-600 font-bold">✓✓</span>
                      </div>
                    </div>
                  );
                }

                if (att.type === 'audio') {
                  return (
                    <div key={att.id} className="max-w-md bg-white rounded-lg p-3 shadow-xs border border-slate-200/60 text-xs text-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                        Mensaje {bubbleNum} de {1 + attachments.length} (Nota de Voz MP3)
                      </div>
                      
                      {/* WhatsApp style audio player card */}
                      <div className="flex items-center gap-3 p-2 bg-[#F0F2F5] rounded-xl border border-slate-200">
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
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>0:00</span>
                            <span>{att.duration || '0:35'}</span>
                          </div>
                        </div>
                      </div>

                      {resolvedCaption && (
                        <p className="text-xs text-slate-800 leading-snug">{resolvedCaption}</p>
                      )}
                      <div className="text-right text-[10px] text-slate-400 font-mono flex items-center justify-end gap-1">
                        <span>11:45 AM</span>
                        <span className="text-teal-600 font-bold">✓✓</span>
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

