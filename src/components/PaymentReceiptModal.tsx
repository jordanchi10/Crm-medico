import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  MessageCircle, 
  Download, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Stethoscope, 
  Building2, 
  QrCode,
  CheckCircle2,
  FileText,
  Phone
} from 'lucide-react';
import { MedicalLead } from '../types';
import { buildPaymentReceiptData, buildReceiptWhatsAppText } from '../utils/receiptUtils';
import { formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';
import confetti from 'canvas-confetti';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  lead: MedicalLead | null;
  onClose: () => void;
  onLogActivity?: (leadId: string, description: string) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  lead,
  onClose,
  onLogActivity
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !lead) return null;

  const receipt = buildPaymentReceiptData(lead);
  const whatsappText = buildReceiptWhatsAppText(receipt);
  const { cleanWhatsAppNumber } = formatEcuadorPhoneForWhatsApp(lead.phone);

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText);
    setIsCopied(true);
    if (onLogActivity) {
      onLogActivity(lead.id, `Comprobante de pago ${receipt.receiptNumber} copiado para WhatsApp.`);
    }
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenWhatsAppDirect = () => {
    if (cleanWhatsAppNumber) {
      const url = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(whatsappText)}`;
      window.open(url, '_blank');
      if (onLogActivity) {
        onLogActivity(lead.id, `Comprobante de pago ${receipt.receiptNumber} enviado por WhatsApp directo.`);
      }
    } else {
      handleCopyWhatsApp();
    }
  };

  const handlePrint = () => {
    window.print();
    if (onLogActivity) {
      onLogActivity(lead.id, `Comprobante de pago ${receipt.receiptNumber} impreso / descargado en PDF.`);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([whatsappText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo_${receipt.receiptNumber}_${lead.doctorName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 sm:rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Header Bar */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Comprobante Oficial de Pago</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {receipt.receiptNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Directorio Médico Ecuador · Documento de Cobranza Digital
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Top Quick Actions) */}
        <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? '¡Copiado para WhatsApp!' : 'Copiar para WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsAppDirect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors cursor-pointer"
              title="Abrir chat en WhatsApp Web o móvil"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Enviar Directo</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Imprimir o guardar PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Descargar copia de texto"
            >
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/70">
          
          {/* Printable Voucher Paper */}
          <div 
            ref={receiptRef}
            className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-5 print:border-none print:shadow-none print:p-0 print:bg-white text-slate-900 dark:text-slate-100"
          >
            {/* Voucher Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    Directorio Médico Ecuador
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {receipt.issuerCompany} · RUC: {receipt.rucCompany}
                  </p>
                  <p className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">
                    Plataforma Oficial de Búsqueda de Especialistas
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Comprobante Oficial
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {receipt.receiptNumber}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Fecha: {receipt.issueDate}
                </div>
              </div>
            </div>

            {/* Doctor / Client Information Box */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Datos del Profesional Médico
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Especialista Adscrito:</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-sm">{receipt.doctorName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Especialidad Médica:</span>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                    {receipt.specialty}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Consultorio / Clínica:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{receipt.clinicOrHospital}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Ciudad y Sector:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">📍 {receipt.city} ({receipt.sector})</span>
                </div>
              </div>
            </div>

            {/* Service & Membership Details */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 text-left">
                  <tr>
                    <th className="py-2.5 px-3.5">Concepto / Plan</th>
                    <th className="py-2.5 px-3.5 text-center">Vigencia</th>
                    <th className="py-2.5 px-3.5 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{receipt.planName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Inclusión destacada en el directorio médico, enlace directo a WhatsApp y posicionamiento local.
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                      {receipt.validFrom} <br />
                      <span className="text-slate-400 text-[10px]">hasta</span> <br />
                      <strong>{receipt.validUntil}</strong>
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-slate-900 dark:text-white text-sm">
                      ${receipt.paidAmount}.00 USD
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total & Method Strip */}
              <div className="bg-teal-50/60 dark:bg-teal-950/40 p-3.5 border-t border-teal-100 dark:border-teal-900/50 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Método de Pago:</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{receipt.paymentMethod}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Total Cancelado:</span>
                  <div className="text-lg font-black text-teal-800 dark:text-teal-300">
                    ${receipt.paidAmount}.00 USD
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Stamp & QR Code */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>{receipt.statusLabel}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                    {receipt.authorizationCode}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Documento digital con validez de activación en la red médica de Ecuador.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <div className="text-[10px] text-slate-400 font-mono text-right hidden sm:block">
                  SOPORTE:<br />
                  {receipt.supportPhone}
                </div>
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-700 p-1 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-800 dark:text-slate-200" />
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Este recibo certifica la suscripción del médico especialista en el Directorio Médico Ecuador. 
              Conserve este comprobante o su número de autorización para soporte técnico o renovación anual.
            </p>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Doctor: <strong className="text-slate-800 dark:text-slate-200">{lead.doctorName}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-transparent dark:border-slate-700"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
