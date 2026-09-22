import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  Calendar, 
  DollarSign, 
  User,
  Info,
  Layers,
  FileText
} from 'lucide-react';
import { MedicalLead, WhatsAppTemplate } from '../types';
import { getSpecialtyMeta } from '../data/specialties';
import { replaceTemplatePlaceholders } from '../data/whatsappTemplates';
import { formatCurrency } from '../utils/storage';
import { formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';
import { WhatsAppSequenceAssistant } from './WhatsAppSequenceAssistant';

interface WhatsAppModalProps {
  isOpen: boolean;
  lead: MedicalLead | null;
  templates: WhatsAppTemplate[];
  onClose: () => void;
  onLogActivity: (leadId: string, activityDescription: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  lead,
  templates,
  onClose,
  onLogActivity
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'sequential' | 'simple'>('sequential');

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const hasAttachments = Boolean(selectedTemplate?.attachments && selectedTemplate.attachments.length > 0);

  // When modal opens or lead changes, select the best matching template for lead's stage
  useEffect(() => {
    if (lead) {
      const stageTemplates = templates.filter((t) => t.stageId === lead.stage);
      const initialTemplate = stageTemplates.length > 0 ? stageTemplates[0] : templates[0];
      if (initialTemplate) {
        setSelectedTemplateId(initialTemplate.id);
        const replaced = replaceTemplatePlaceholders(initialTemplate.messageText, {
          doctorName: lead.doctorName,
          specialty: lead.specialty,
          clinicOrHospital: lead.clinicOrHospital,
          amount: formatCurrency(lead.estimatedValue),
          date: lead.nextFollowUpDate || 'esta semana',
          time: lead.nextFollowUpTime || '11:00 AM',
          paymentMethod: lead.paymentMethod || 'Transferencia Bancaria'
        });
        setMessageContent(replaced);
        // Default to sequential view if template has attachments
        if (initialTemplate.attachments && initialTemplate.attachments.length > 0) {
          setViewMode('sequential');
        } else {
          setViewMode('simple');
        }
      }
    }
  }, [lead, templates]);

  if (!isOpen || !lead) return null;

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      const replaced = replaceTemplatePlaceholders(tpl.messageText, {
        doctorName: lead.doctorName,
        specialty: lead.specialty,
        clinicOrHospital: lead.clinicOrHospital,
        amount: formatCurrency(lead.estimatedValue),
        date: lead.nextFollowUpDate || 'esta semana',
        time: lead.nextFollowUpTime || '11:00 AM',
        paymentMethod: lead.paymentMethod || 'Transferencia Bancaria'
      });
      setMessageContent(replaced);
      if (tpl.attachments && tpl.attachments.length > 0) {
        setViewMode('sequential');
      }
    }
  };

  const handleSendWhatsApp = () => {
    // Format Ecuadorian phone: ensure +593 format and remove spaces/symbols
    const { cleanWhatsAppNumber } = formatEcuadorPhoneForWhatsApp(lead.phone);
    const targetPhone = cleanWhatsAppNumber || lead.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(messageContent);
    const waUrl = `https://wa.me/${targetPhone}?text=${encoded}`;

    // Open WhatsApp
    window.open(waUrl, '_blank');

    // Automatically log this activity in the lead's history
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    const templateTitle = tpl ? tpl.title : 'Mensaje Personalizado';
    onLogActivity(lead.id, `Mensaje de WhatsApp enviado (${templateTitle}) al ${lead.phone} (+593 Ecuador)`);

    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const specMeta = getSpecialtyMeta(lead.specialty);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white sm:rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-emerald-600 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">Enviar WhatsApp a Médico</h3>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                Plantilla automática personalizada con secuencia multimedia para especialistas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Summary Strip */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs sm:text-sm">{lead.doctorName}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${specMeta.bgLight} ${specMeta.color} ${specMeta.borderLight}`}>
              {lead.specialty}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-slate-500">
            <div className="font-mono text-slate-700 font-semibold text-xs">
              {lead.phone}
            </div>
            <span>•</span>
            <div className="flex items-center gap-0.5 font-bold text-emerald-700 text-xs">
              <span>{formatCurrency(lead.estimatedValue)}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Template Selector & Mode Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Plantilla Seleccionada
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {templates.map((tpl) => {
                  const mediaCount = tpl.attachments?.length || 0;
                  return (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title} {mediaCount > 0 ? `(${mediaCount} archivos multimedia)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Mode switch pills */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl self-start sm:self-end">
              <button
                type="button"
                onClick={() => setViewMode('sequential')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'sequential'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secuencia Multimedia</span>
                {hasAttachments && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode('simple')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'simple'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Solo Texto</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Sequential Media Pipeline */}
          {viewMode === 'sequential' && selectedTemplate && (
            <WhatsAppSequenceAssistant
              lead={lead}
              template={selectedTemplate}
              onClose={onClose}
              onLogActivity={onLogActivity}
            />
          )}

          {/* VIEW MODE 2: Single Text Fast Dispatch */}
          {viewMode === 'simple' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mensaje de Texto Directo (Editable)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">¡Copiado!</span>
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
                  rows={9}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full text-xs leading-relaxed font-sans p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800"
                  placeholder="Escribe el mensaje..."
                />
              </div>

              {/* Quick placeholder reminder */}
              <div className="flex items-start gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 leading-snug">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Al dar clic en <strong>"Abrir en WhatsApp"</strong> se abrirá el chat con el doctor y se registrará automáticamente en la bitácora de seguimiento del prospecto.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions (Only for Simple Mode since Sequential has its own step actions) */}
        {viewMode === 'simple' && (
          <div className="p-3.5 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Abrir en WhatsApp</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

