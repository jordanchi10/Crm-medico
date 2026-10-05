import React from 'react';
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  MessageCircle, 
  ArrowRight,
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Briefcase,
  Clock,
  Trash2
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { getSpecialtyMeta } from '../data/specialties';
import { STAGES } from '../data/stages';
import { formatCurrency } from '../utils/storage';
import { getLeadOverdueInfo } from '../utils/notificationService';
import { getLeadRegistrationInfo } from '../utils/dateUtils';

interface KanbanCardProps {
  lead: MedicalLead;
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onStageChange: (leadId: string, newStage: StageId) => void;
  onDeleteLead?: (lead: MedicalLead) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  lead,
  onOpenEdit,
  onOpenWhatsApp,
  onStageChange,
  onDeleteLead
}) => {
  const specialtyMeta = getSpecialtyMeta(lead.specialty);
  const overdueInfo = getLeadOverdueInfo(lead, 48);
  const regInfo = getLeadRegistrationInfo(lead);

  // Compute next stage in sequence
  const currentStageIndex = STAGES.findIndex((s) => s.id === lead.stage);
  const nextStage = currentStageIndex < STAGES.length - 2 ? STAGES[currentStageIndex + 1] : null;

  // Follow-up status check
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = lead.nextFollowUpDate && lead.nextFollowUpDate < todayStr && lead.stage !== 'ganado' && lead.stage !== 'perdido';
  const isToday = lead.nextFollowUpDate === todayStr;

  return (
    <div
      id={`kanban-card-${lead.id}`}
      className={`group bg-white dark:bg-slate-850 rounded-2xl border transition-all duration-150 p-4 flex flex-col gap-3 relative cursor-pointer active:scale-[0.99] shadow-xs ${
        overdueInfo.isOverdue 
          ? 'border-rose-300 dark:border-rose-800/80 shadow-xs hover:border-rose-500 hover:shadow-md' 
          : 'border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md'
      }`}
      onClick={() => onOpenEdit(lead)}
    >
      {/* Top Header: Specialty Tag & Actions */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-lg border ${specialtyMeta.bgLight} dark:bg-opacity-25 ${specialtyMeta.color} ${specialtyMeta.borderLight} dark:border-opacity-40 tracking-tight`}
        >
          {lead.specialty}
        </span>

        {/* Action buttons (WhatsApp + Delete) */}
        <div className="flex items-center gap-1.5">
          {/* WhatsApp fast launcher button */}
          <button
            id={`btn-wa-${lead.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenWhatsApp(lead);
            }}
            title="Enviar WhatsApp automático con plantilla"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
            <span>WhatsApp</span>
          </button>

          {/* Quick Delete action */}
          {onDeleteLead && (
            <button
              type="button"
              id={`btn-delete-card-${lead.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteLead(lead);
              }}
              title="Eliminar especialista manualmente"
              className="w-7 h-7 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 48h Stale Inactivity Alert Badge if exceeded */}
      {overdueInfo.isOverdue && (
        <div 
          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold shadow-2xs"
          title={`Inactivo: ${overdueInfo.hoursElapsed} horas sin actualización de contacto`}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse shrink-0" />
            <span>+{overdueInfo.hoursElapsed}h sin contacto</span>
          </span>
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Alerta CRM
          </span>
        </div>
      )}

      {/* Doctor Name, Clinic & Sector/Locación */}
      <div className="space-y-1">
        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
          {lead.doctorName}
        </h4>
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mt-1 gap-2 font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{lead.clinicOrHospital}</span>
          </div>

          {/* Sector / Locación badge */}
          {lead.sector && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 shrink-0 shadow-2xs">
              <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{lead.sector}</span>
            </span>
          )}
        </div>
      </div>

      {/* Contracted / Offered Service Pill */}
      {lead.serviceName && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-200/80 dark:border-teal-800/60">
          <Briefcase className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="truncate">{lead.serviceName}</span>
        </div>
      )}

      {/* Financials & Payment Details */}
      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
        <div className="flex items-center gap-1 font-extrabold text-slate-900 dark:text-white">
          <DollarSign className="w-4 h-4 text-slate-500" />
          <span>{formatCurrency(lead.estimatedValue)}</span>
        </div>

        {/* Payment badge */}
        {lead.paymentStatus === 'pagado' && (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Pagado
          </span>
        )}
        {lead.paymentStatus === 'parcial' && (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Anticipo: {formatCurrency(lead.paidAmount)}
          </span>
        )}
        {lead.paymentStatus === 'pendiente' && lead.stage === 'ganado' && (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Cobro Pendiente
          </span>
        )}
        {lead.paymentStatus === 'pendiente' && lead.stage !== 'ganado' && (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Pendiente
          </span>
        )}
      </div>

      {/* Payment Method preview if defined */}
      {lead.paymentMethod && lead.paymentMethod !== 'No Definido' && (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
          <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{lead.paymentMethod}</span>
        </div>
      )}

      {/* Dates: Next Follow Up & Quick Stage Mover */}
      <div className="flex items-center justify-between text-xs pt-1">
        {lead.nextFollowUpDate ? (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
              isOverdue
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                : isToday
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Próximo seguimiento"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {lead.nextFollowUpDate.slice(5)} {lead.nextFollowUpTime ? `· ${lead.nextFollowUpTime}` : ''}
            </span>
          </div>
        ) : (
          <div className="text-slate-500 dark:text-slate-400 text-xs">Sin fecha prox.</div>
        )}

        {/* Quick move to next stage button */}
        {nextStage && (
          <button
            id={`btn-next-stage-${lead.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onStageChange(lead.id, nextStage.id);
            }}
            title={`Avanzar a ${nextStage.name}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Avanzar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card Footer: Platform Registration Date */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 -mx-4 -mb-4 px-4 py-2 rounded-b-2xl">
        <span 
          className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 truncate w-full justify-between font-medium"
          title={`Registrado en la plataforma el ${regInfo.formattedFull}`}
        >
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Alta:</span>
          </span>
          <strong className="font-bold text-slate-800 dark:text-slate-200">{regInfo.formattedCompact}</strong>
        </span>
      </div>
    </div>
  );
};
