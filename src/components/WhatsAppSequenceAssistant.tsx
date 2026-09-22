import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Volume2, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Clock, 
  Eye, 
  AlertCircle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { MedicalLead, TemplateMediaAttachment, WhatsAppTemplate } from '../types';
import { replaceTemplatePlaceholders } from '../data/whatsappTemplates';
import { formatCurrency } from '../utils/storage';
import { formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';
import { copyImageToClipboard, downloadMediaAttachment } from '../utils/mediaDemoAssets';
import confetti from 'canvas-confetti';

interface WhatsAppSequenceAssistantProps {
  lead: MedicalLead;
  template: WhatsAppTemplate;
  onClose: () => void;
  onLogActivity: (leadId: string, description: string) => void;
}

interface SequenceStep {
  id: string;
  type: 'text' | 'image' | 'pdf' | 'audio';
  title: string;
  subtitle?: string;
  content: string; // text or caption
  media?: TemplateMediaAttachment;
  status: 'pending' | 'active' | 'completed';
}

export const WhatsAppSequenceAssistant: React.FC<WhatsAppSequenceAssistantProps> = ({
  lead,
  template,
  onClose,
  onLogActivity
}) => {
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  const [isImageCopied, setIsImageCopied] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Normalizar datos de reemplazo
  const replacements = {
    doctorName: lead.doctorName,
    specialty: lead.specialty,
    clinicOrHospital: lead.clinicOrHospital,
    amount: formatCurrency(lead.estimatedValue),
    date: lead.nextFollowUpDate || 'esta semana',
    time: lead.nextFollowUpTime || '11:00 AM',
    paymentMethod: lead.paymentMethod || 'Transferencia Bancaria'
  };

  // Construir la secuencia completa: 1. Texto Inicial -> 2. Adjuntos (Imágenes, PDF, MP3)
  useEffect(() => {
    const list: SequenceStep[] = [
      {
        id: 'step-text',
        type: 'text',
        title: 'Paso 1: Mensaje de Presentación',
        subtitle: 'Texto personalizado con datos clínicos',
        content: replaceTemplatePlaceholders(template.messageText, replacements),
        status: 'active'
      }
    ];

    if (template.attachments && template.attachments.length > 0) {
      template.attachments.forEach((att, index) => {
        const stepNum = index + 2;
        const resolvedCaption = att.caption
          ? replaceTemplatePlaceholders(att.caption, replacements)
          : '';

        let typeLabel = 'Imagen';
        if (att.type === 'pdf') typeLabel = 'Documento PDF';
        if (att.type === 'audio') typeLabel = 'Nota de Voz / Audio MP3';

        list.push({
          id: `step-${att.id}`,
          type: att.type,
          title: `Paso ${stepNum}: ${typeLabel} (${att.title})`,
          subtitle: att.fileName || att.title,
          content: resolvedCaption,
          media: att,
          status: 'pending'
        });
      });
    }

    setSteps(list);
    setCurrentStepIndex(0);
  }, [template, lead]);

  const targetPhone = (() => {
    const { cleanWhatsAppNumber } = formatEcuadorPhoneForWhatsApp(lead.phone);
    return cleanWhatsAppNumber || lead.phone.replace(/[^0-9]/g, '');
  })();

  const currentStep = steps[currentStepIndex] || steps[0];

  // Helper para abrir WhatsApp con un texto
  const openWhatsAppWithText = (text: string) => {
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${targetPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const markStepCompleted = (index: number) => {
    setSteps((prev) =>
      prev.map((s, idx) => {
        if (idx === index) return { ...s, status: 'completed' };
        if (idx === index + 1 && s.status === 'pending') return { ...s, status: 'active' };
        return s;
      })
    );
  };

  const handleSendCurrentStep = async () => {
    if (!currentStep) return;

    if (currentStep.type === 'text') {
      openWhatsAppWithText(currentStep.content);
      markStepCompleted(currentStepIndex);
    } else if (currentStep.type === 'image' && currentStep.media) {
      // Intentar copiar la imagen al portapapeles y abrir WhatsApp con el pie de foto
      const copiedOk = await copyImageToClipboard(currentStep.media);
      if (copiedOk) {
        setIsImageCopied(true);
        setTimeout(() => setIsImageCopied(false), 3500);
      }
      if (currentStep.content) {
        openWhatsAppWithText(currentStep.content);
      } else {
        window.open(`https://wa.me/${targetPhone}`, '_blank');
      }
      markStepCompleted(currentStepIndex);
    } else if (currentStep.type === 'pdf' && currentStep.media) {
      // Descargar PDF para que el usuario lo arrastre a WhatsApp y abrir el chat con el mensaje explicativo
      downloadMediaAttachment(currentStep.media, lead.doctorName);
      if (currentStep.content) {
        openWhatsAppWithText(currentStep.content);
      } else {
        window.open(`https://wa.me/${targetPhone}`, '_blank');
      }
      markStepCompleted(currentStepIndex);
    } else if (currentStep.type === 'audio' && currentStep.media) {
      // Descargar audio MP3 y abrir WhatsApp
      downloadMediaAttachment(currentStep.media, lead.doctorName);
      if (currentStep.content) {
        openWhatsAppWithText(currentStep.content);
      } else {
        window.open(`https://wa.me/${targetPhone}`, '_blank');
      }
      markStepCompleted(currentStepIndex);
    }

    // Si no es el último paso, avanzar
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Fin de la secuencia
      triggerSequenceFinished();
    }
  };

  const triggerSequenceFinished = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const summary = `Secuencia WhatsApp completada (${template.title}): Texto + ${
      template.attachments?.length || 0
    } archivos multimedia enviados al Dr. ${lead.doctorName}.`;
    onLogActivity(lead.id, summary);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const togglePlayAudio = (url: string, id: string) => {
    if (playingAudioId === id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
      } else {
        audioRef.current.src = url;
      }
      audioRef.current.play();
      setPlayingAudioId(id);
      audioRef.current.onended = () => setPlayingAudioId(null);
    }
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (steps.length || 1)) * 100);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-4 rounded-2xl text-white shadow-md border border-teal-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
                Envío Secuencial Inteligente
              </span>
              <span className="text-xs text-slate-300">
                {steps.length} elementos en cola
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black mt-1">
              Secuencia Automatizada: {template.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Envía el texto, las imágenes, los documentos PDF y audios MP3 en el orden exacto para maximizar la tasa de respuesta del médico.
            </p>
          </div>

          {/* Progress widget */}
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-300">
              {progressPercent}%
            </div>
            <div className="text-xs">
              <div className="font-bold text-white">
                {completedCount} de {steps.length} enviados
              </div>
              <div className="text-[11px] text-teal-200">
                {completedCount === steps.length ? '¡Secuencia Completa!' : 'En progreso'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mt-3.5 border border-white/10">
          <div 
            className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Tabs / Timeline Nav */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {steps.map((step, idx) => {
          const isSelected = idx === currentStepIndex;
          const isDone = step.status === 'completed';

          return (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-teal-50 text-teal-900 border-teal-300 shadow-xs'
                  : isDone
                  ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : step.type === 'text' ? (
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
              ) : step.type === 'image' ? (
                <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
              ) : step.type === 'pdf' ? (
                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-purple-600 shrink-0" />
              )}
              <span>Paso {idx + 1}</span>
              <span className="text-[10px] font-normal text-slate-400 capitalize">({step.type})</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Workspace Card */}
      {currentStep && (
        <div className="bg-white rounded-2xl border-2 border-teal-200 shadow-sm p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
                currentStep.type === 'text' ? 'bg-teal-600' :
                currentStep.type === 'image' ? 'bg-blue-600' :
                currentStep.type === 'pdf' ? 'bg-rose-600' : 'bg-purple-600'
              }`}>
                {currentStep.type === 'text' && <FileText className="w-5 h-5" />}
                {currentStep.type === 'image' && <ImageIcon className="w-5 h-5" />}
                {currentStep.type === 'pdf' && <FileText className="w-5 h-5" />}
                {currentStep.type === 'audio' && <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900">{currentStep.title}</h5>
                <p className="text-xs text-slate-500">{currentStep.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {currentStep.status === 'completed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>Enviado</span>
                </span>
              )}
            </div>
          </div>

          {/* Media Previews & Contextual Controls */}
          {currentStep.type === 'image' && currentStep.media && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group w-full sm:w-48 h-32 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                  <img
                    src={currentStep.media.url}
                    alt={currentStep.media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <a
                      href={currentStep.media.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white text-xs bg-black/60 px-2 py-1 rounded-md flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver imagen</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-2 flex-1 text-xs">
                  <div className="font-bold text-slate-800 text-sm">{currentStep.media.title}</div>
                  <p className="text-slate-500 text-xs">{currentStep.media.description || 'Infografía lista para enviar al médico.'}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        if (currentStep.media) {
                          const ok = await copyImageToClipboard(currentStep.media);
                          if (ok) {
                            setIsImageCopied(true);
                            setTimeout(() => setIsImageCopied(false), 3000);
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors cursor-pointer"
                    >
                      {isImageCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isImageCopied ? '¡Imagen copiada! (Pega con Ctrl+V)' : 'Copiar Imagen al Portapapeles'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => currentStep.media && downloadMediaAttachment(currentStep.media, lead.doctorName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar ({currentStep.media.fileSize || 'PNG'})</span>
                    </button>
                  </div>
                </div>
              </div>

              {isImageCopied && (
                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ¡Imagen en el portapapeles! Ve a la ventana de WhatsApp Web y presiona <strong>Ctrl + V</strong> (o Pegar) en el chat con el Dr. {lead.doctorName}.
                  </span>
                </div>
              )}
            </div>
          )}

          {currentStep.type === 'pdf' && currentStep.media && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0 border border-rose-200">
                    PDF
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{currentStep.media.title}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono">{currentStep.media.fileName}</span>
                      <span>•</span>
                      <span className="text-rose-600 font-semibold">{currentStep.media.fileSize || '1.4 MB'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => currentStep.media && downloadMediaAttachment(currentStep.media, lead.doctorName)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>

                  <a
                    href={currentStep.media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Tip de envío de PDF:</strong> Haz clic en <em>"Descargar PDF"</em> y arrastra el archivo descargado directamente a la ventana de WhatsApp del médico.
                </span>
              </div>
            </div>
          )}

          {currentStep.type === 'audio' && currentStep.media && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{currentStep.media.title}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Nota de voz para WhatsApp</span>
                      <span>•</span>
                      <span className="font-semibold text-purple-700">{currentStep.media.duration || '0:35'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => currentStep.media && togglePlayAudio(currentStep.media.url, currentStep.id)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    {playingAudioId === currentStep.id ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Escuchar ({currentStep.media.duration || '0:35'})</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => currentStep.media && downloadMediaAttachment(currentStep.media, lead.doctorName)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar MP3</span>
                  </button>
                </div>
              </div>

              {/* Fake waveform / sound visualizer */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-1.5 h-10 overflow-hidden">
                {[12, 28, 16, 32, 20, 36, 14, 26, 34, 18, 22, 38, 15, 30, 24, 18, 32, 22, 14, 28, 36, 20, 16, 24, 30, 18, 26, 34, 16, 22].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all duration-200 ${
                      playingAudioId === currentStep.id
                        ? 'bg-purple-500 animate-pulse'
                        : 'bg-slate-200'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text Message Content / Caption */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {currentStep.type === 'text' ? 'Texto del Mensaje' : 'Pie de Foto / Mensaje de WhatsApp'}
              </label>
              <button
                type="button"
                onClick={() => handleCopyText(currentStep.content, currentStep.id)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
              >
                {isCopied[currentStep.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={currentStep.type === 'text' ? 6 : 3}
              value={currentStep.content}
              onChange={(e) => {
                const val = e.target.value;
                setSteps((prev) =>
                  prev.map((s, idx) => (idx === currentStepIndex ? { ...s, content: val } : s))
                );
              }}
              className="w-full text-xs leading-relaxed font-sans p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-800"
            />
          </div>

          {/* Step Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Al pulsar enviar, se abrirá WhatsApp con los datos listos para el Dr. {lead.doctorName}.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  markStepCompleted(currentStepIndex);
                  if (currentStepIndex < steps.length - 1) {
                    setCurrentStepIndex(currentStepIndex + 1);
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Omitir / Marcar Hecho
              </button>

              <button
                type="button"
                onClick={handleSendCurrentStep}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>
                  {currentStepIndex === steps.length - 1
                    ? 'Enviar y Finalizar Secuencia'
                    : `Enviar ${currentStep.title} y Siguiente`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion congratulations card */}
      {completedCount === steps.length && (
        <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-3 animate-in zoom-in-95">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-950">¡Secuencia Completa Enviada con Éxito!</div>
              <div className="text-xs text-emerald-800">
                Se enviaron el texto y todos los archivos adjuntos (Imágenes, PDF, Audios) al Dr. {lead.doctorName}.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Cerrar Asistente
          </button>
        </div>
      )}
    </div>
  );
};
