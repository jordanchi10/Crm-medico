import React from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { MedicalLead } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lead?: MedicalLead | null;
  selectedCount?: number;
  title?: string;
  description?: string;
  warningText?: string;
  confirmLabel?: string;
  icon?: 'trash' | 'reset';
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lead,
  selectedCount,
  title,
  description,
  warningText,
  confirmLabel,
  icon = 'trash'
}) => {
  if (!isOpen) return null;

  const isMultiple = selectedCount && selectedCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Accent */}
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50 p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              {icon === 'reset' ? <RotateCcw className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title || (isMultiple ? '¿Eliminar Especialistas Seleccionados?' : '¿Eliminar Médico Especialista?')}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium mt-0.5">
                {description || 'Esta acción no se puede deshacer en el almacenamiento local.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {lead && !isMultiple && (
            <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-750 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {lead.doctorName}
              </div>
              <div className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span className="font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200/60 dark:border-teal-800/60">
                  {lead.specialty}
                </span>
                {lead.clinicOrHospital && (
                  <span className="text-slate-500 dark:text-slate-400 truncate">
                    {lead.clinicOrHospital}
                  </span>
                )}
              </div>
              {lead.phone && (
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                  WhatsApp: {lead.phone}
                </div>
              )}
            </div>
          )}

          {!lead && isMultiple && (
            <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 rounded-xl p-3.5 text-xs text-rose-900 dark:text-rose-300">
              Estás a punto de eliminar <strong>{selectedCount} médicos especialistas</strong> de forma simultánea de tu base de datos y embudo de ventas.
            </div>
          )}

          <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {warningText || 'Se eliminarán todos los registros de seguimiento, citas agendadas, cobros e historial de notas asociadas guardados en tu cPanel/navegador.'}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 active:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-delete-lead"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {icon === 'reset' ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel || (isMultiple ? `Sí, Eliminar (${selectedCount})` : 'Sí, Eliminar Especialista')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
