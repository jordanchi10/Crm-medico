import React, { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  FileText, 
  Volume2, 
  Upload, 
  Check, 
  Sparkles, 
  Play, 
  Pause,
  HelpCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import { MediaAttachmentType, TemplateMediaAttachment } from '../types';
import { 
  SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI, 
  SAMPLE_WELCOME_BANNER_DATA_URI, 
  generateSampleMedicalProposalPdfBlob, 
  generateSampleVoiceNoteDataUri, 
  fileToDataUrl, 
  formatBytes 
} from '../utils/mediaDemoAssets';

interface AttachmentEditorModalProps {
  isOpen: boolean;
  initialAttachment?: TemplateMediaAttachment | null;
  onSave: (attachment: TemplateMediaAttachment) => void;
  onClose: () => void;
}

export const AttachmentEditorModal: React.FC<AttachmentEditorModalProps> = ({
  isOpen,
  initialAttachment,
  onSave,
  onClose
}) => {
  const [type, setType] = useState<MediaAttachmentType>(initialAttachment?.type || 'image');
  const [title, setTitle] = useState(initialAttachment?.title || '');
  const [fileName, setFileName] = useState(initialAttachment?.fileName || '');
  const [fileSize, setFileSize] = useState(initialAttachment?.fileSize || '');
  const [url, setUrl] = useState(initialAttachment?.url || '');
  const [caption, setCaption] = useState(initialAttachment?.caption || '');
  const [duration, setDuration] = useState(initialAttachment?.duration || '0:30');
  const [description, setDescription] = useState(initialAttachment?.description || '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    setUrl(dataUrl);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Si es audio, medir duración estimada
    if (file.type.startsWith('audio/')) {
      const tempAudio = new Audio(dataUrl);
      tempAudio.onloadedmetadata = () => {
        const mins = Math.floor(tempAudio.duration / 60);
        const secs = Math.floor(tempAudio.duration % 60);
        setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      };
    }
  };

  const handleApplyPreset = (presetType: 'infographic' | 'credential' | 'pdf' | 'audio') => {
    if (presetType === 'infographic') {
      setType('image');
      setTitle('Infografía Perfil Médico Ecuador');
      setFileName('infografia_perfil_medico_ecuador.png');
      setFileSize('620 KB');
      setUrl(SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI);
      setCaption('📊 Estimado/a [Doctor], le comparto una breve infografía visual de cómo posicionamos su consulta de [Especialidad] en Google y WhatsApp para captar pacientes privados.');
      setDescription('Infografía con métricas y beneficios');
    } else if (presetType === 'credential') {
      setType('image');
      setTitle('Credencial Especialista Médico Verificado');
      setFileName('credencial_especialista_verificado.png');
      setFileSize('580 KB');
      setUrl(SAMPLE_WELCOME_BANNER_DATA_URI);
      setCaption('🏅 ¡Bienvenido Dr./a [Doctor]! Le compartimos su credencial digital de Especialista Verificado en la Red Médica de Ecuador.');
      setDescription('Banner de bienvenida y verificación');
    } else if (presetType === 'pdf') {
      const sample = generateSampleMedicalProposalPdfBlob({});
      setType('pdf');
      setTitle('Propuesta Formal Perfil Médico 2026');
      setFileName(sample.fileName);
      setFileSize('1.4 MB');
      setUrl(sample.dataUri);
      setCaption('📑 Estimado/a [Doctor], adjunto le remito el documento formal de propuesta y cotización por [Monto] para [Especialidad] en [Clinica].');
      setDescription('Documento oficial en PDF con alcance');
    } else if (presetType === 'audio') {
      const audioUri = generateSampleVoiceNoteDataUri(4);
      setType('audio');
      setTitle('Nota de Voz - Presentación Médica');
      setFileName('audio_presentacion_especialista.mp3');
      setFileSize('480 KB');
      setUrl(audioUri);
      setDuration('0:35');
      setCaption('🎙️ Estimado/a [Doctor], le comparto esta breve nota de voz de 30 segundos resumiendo cómo los colegas de [Especialidad] en [Clinica] están automatizando sus citas.');
      setDescription('Audio explicativo profesional');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor indica un título para el archivo');
      return;
    }

    let finalUrl = url;
    let finalFileName = fileName;

    // Si el usuario no subió archivo, generar uno de demostración según el tipo
    if (!finalUrl) {
      if (type === 'image') {
        finalUrl = SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI;
        finalFileName = finalFileName || 'imagen_medica.png';
      } else if (type === 'pdf') {
        const p = generateSampleMedicalProposalPdfBlob({});
        finalUrl = p.dataUri;
        finalFileName = finalFileName || p.fileName;
      } else {
        finalUrl = generateSampleVoiceNoteDataUri(3);
        finalFileName = finalFileName || 'audio_nota_de_voz.mp3';
      }
    }

    const newAttachment: TemplateMediaAttachment = {
      id: initialAttachment?.id || `att-${Date.now()}`,
      type,
      title: title.trim(),
      fileName: finalFileName || `${title.toLowerCase().replace(/\s+/g, '_')}.${type === 'image' ? 'png' : type === 'pdf' ? 'pdf' : 'mp3'}`,
      fileSize: fileSize || '500 KB',
      url: finalUrl,
      caption: caption.trim(),
      duration: type === 'audio' ? duration : undefined,
      description: description.trim()
    };

    onSave(newAttachment);
    onClose();
  };

  const togglePlayAudio = () => {
    if (!url) return;
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
      } else {
        audioRef.current.src = url;
      }
      audioRef.current.play();
      setIsPlayingAudio(true);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/30">
              {type === 'image' ? 'IMG' : type === 'pdf' ? 'PDF' : 'MP3'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {initialAttachment ? 'Editar Archivo de Secuencia' : 'Agregar Archivo a la Secuencia'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Imágenes, documentos PDF y audios MP3 enviados en orden al médico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Tipo de archivo selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              1. Selecciona el Tipo de Archivo Multimedia
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('image')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  type === 'image'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className={`w-5 h-5 mb-1 ${type === 'image' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-xs">Imagen</span>
                <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
              </button>

              <button
                type="button"
                onClick={() => setType('pdf')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  type === 'pdf'
                    ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className={`w-5 h-5 mb-1 ${type === 'pdf' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs">Documento PDF</span>
                <span className="text-[10px] text-slate-400">Catálogo, Cotización</span>
              </button>

              <button
                type="button"
                onClick={() => setType('audio')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  type === 'audio'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Volume2 className={`w-5 h-5 mb-1 ${type === 'audio' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-xs">Audio MP3</span>
                <span className="text-[10px] text-slate-400">Nota de voz WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Plantillas y Presets Rápidos */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Plantillas Rápidas Listas para Usar:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset('infographic')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-400 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors cursor-pointer"
              >
                📊 Infografía Perfil Médico
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('pdf')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-400 text-slate-700 hover:text-rose-800 text-[11px] font-medium transition-colors cursor-pointer"
              >
                📑 Propuesta PDF 2026
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('audio')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-400 text-slate-700 hover:text-purple-800 text-[11px] font-medium transition-colors cursor-pointer"
              >
                🎙️ Nota de Voz MP3
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('credential')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-800 text-[11px] font-medium transition-colors cursor-pointer"
              >
                🏅 Credencial Verificada
              </button>
            </div>
          </div>

          {/* Subir archivo desde la computadora o arrastrar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Archivo a Enviar (Sube tu archivo o usa uno predeterminado)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white hover:bg-teal-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={type === 'image' ? 'image/*' : type === 'pdf' ? '.pdf,application/pdf' : 'audio/*,.mp3,.wav,.m4a'}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <div className="font-semibold text-slate-700">
                {fileName ? (
                  <span className="text-teal-700 font-bold flex items-center justify-center gap-1">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    {fileName} ({fileSize || 'Listo'})
                  </span>
                ) : (
                  <span>Haz clic aquí para seleccionar tu archivo {type.toUpperCase()}</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Archivos locales compatibles con WhatsApp Web y Móvil
              </p>
            </div>
          </div>

          {/* Mini preview si hay URL */}
          {url && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                {type === 'image' && (
                  <img src={url} alt="Vista previa" className="w-12 h-10 object-cover rounded border border-slate-300" />
                )}
                {type === 'pdf' && (
                  <div className="w-10 h-10 rounded bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs shrink-0">
                    PDF
                  </div>
                )}
                {type === 'audio' && (
                  <div className="w-10 h-10 rounded bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </div>
                )}
                <div className="truncate">
                  <div className="font-bold text-slate-800 truncate">{title || fileName || 'Archivo cargado'}</div>
                  <div className="text-[10px] text-slate-500">{fileSize || 'Listo para enviar'}</div>
                </div>
              </div>

              {type === 'audio' && (
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingAudio ? 'Pausar' : 'Probar'}</span>
                </button>
              )}
            </div>
          )}

          {/* Campos descriptivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Título del Archivo en la Secuencia
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Infografía de Resultados Google"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de Archivo en WhatsApp
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="catalogo-especialistas.pdf"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>

          {/* Pie de foto / Mensaje acompañante */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Pie de Foto / Mensaje Acompañante de WhatsApp
              </label>
              <span className="text-[10px] text-slate-400">Acepta [Doctor], [Especialidad], etc.</span>
            </div>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ej. Estimado [Doctor], le comparto este documento con la cotización de [Monto]..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en la Secuencia</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
