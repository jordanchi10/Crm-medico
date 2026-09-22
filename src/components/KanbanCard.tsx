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
  Clock
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
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  lead,
  onOpenEdit,
  onOpenWhatsApp,
  onStageChange
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
      className={`group bg-white rounded-xl border transition-all duration-150 p-3.5 flex flex-col gap-2.5 relative cursor-pointer active:scale-[0.99] ${
        overdueInfo.isOverdue 
          ? 'border-rose-300 shadow-xs hover:border-rose-400 hover:shadow-md' 
          : 'border-slate-200/90 hover:border-teal-500 hover:shadow-md'
      }`}
      onClick={() => onOpenEdit(lead)}
    >
      {/* Top Header: Specialty Tag & WhatsApp Quick CTA */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${specialtyMeta.bgLight} ${specialtyMeta.color} ${specialtyMeta.borderLight} tracking-tight`}
        >
          {lead.specialty}
        </span>

        {/* WhatsApp fast launcher button (Thumb friendly touch target) */}
        <button
          id={`btn-wa-${lead.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenWhatsApp(lead);
          }}
          title="Enviar WhatsApp automático con plantilla"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* 48h Stale Inactivity Alert Badge if exceeded */}
      {overdueInfo.isOverdue && (
        <div 
          className="flex items-center justify-between px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold shadow-2xs"
          title={`Inactivo: ${overdueInfo.hoursElapsed} horas sin actualización de contacto`}
        >
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-rose-600 animate-pulse shrink-0" />
            <span>+{overdueInfo.hoursElapsed}h sin contacto</span>
          </span>
          <span className="text-[9px] font-semibold text-rose-600 uppercase tracking-wider">
            Alerta CRM
          </span>
        </div>
      )}

      {/* Doctor Name, Clinic & Sector/Locación */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
          {lead.doctorName}
        </h4>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-1 gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{lead.clinicOrHospital}</span>
          </div>

          {/* Sector / Locación badge */}
          {lead.sector && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0 shadow-2xs">
              <MapPin className="w-2.5 h-2.5 text-amber-600" />
              <span>{lead.sector}</span>
            </span>
          )}
        </div>
      </div>

      {/* Contracted / Offered Service Pill */}
      {lead.serviceName && (
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-teal-800 bg-teal-50/80 px-2 py-1 rounded-lg border border-teal-200/70">
          <Briefcase className="w-3 h-3 text-teal-600 shrink-0" />
          <span className="truncate">{lead.serviceName}</span>
        </div>
      )}

      {/* Financials & Payment Details */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1 font-bold text-slate-800">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatCurrency(lead.estimatedValue)}</span>
        </div>

        {/* Payment badge */}
        {lead.paymentStatus === 'pagado' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Pagado
          </span>
        )}
        {lead.paymentStatus === 'parcial' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Anticipo: {formatCurrency(lead.paidAmount)}
          </span>
        )}
        {lead.paymentStatus === 'pendiente' && lead.stage === 'ganado' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Cobro Pendiente
          </span>
        )}
        {lead.paymentStatus === 'pendiente' && lead.stage !== 'ganado' && (
          <span className="text-[10px] font-medium text-slate-400">
            Pendiente
          </span>
        )}
      </div>

      {/* Payment Method preview if defined */}
      {lead.paymentMethod && lead.paymentMethod !== 'No Definido' && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{lead.paymentMethod}</span>
        </div>
      )}

      {/* Dates: Next Follow Up & Quick Stage Mover */}
      <div className="flex items-center justify-between text-[11px] pt-1">
        {lead.nextFollowUpDate ? (
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
              isOverdue
                ? 'bg-red-50 text-red-700 font-semibold'
                : isToday
                ? 'bg-amber-50 text-amber-800 font-semibold'
                : 'text-slate-500'
            }`}
            title="Próximo seguimiento"
          >
            <Calendar className="w-3 h-3" />
            <span>
              {lead.nextFollowUpDate.slice(5)} {lead.nextFollowUpTime ? `· ${lead.nextFollowUpTime}` : ''}
            </span>
          </div>
        ) : (
          <div className="text-slate-400 text-[10px] italic">Sin fecha prox.</div>
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
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <span>Avanzar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Card Footer: Platform Registration Date */}
      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 bg-slate-50/70 -mx-3.5 -mb-2.5 px-3.5 py-1.5 rounded-b-xl">
        <span 
          className="flex items-center gap-1 text-[10px] text-slate-400 truncate w-full justify-between"
          title={`Registrado en la plataforma el ${regInfo.formattedFull}`}
        >
          <span className="flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-teal-600 shrink-0" />
            <span>Alta:</span>
          </span>
          <strong className="font-semibold text-slate-600">{regInfo.formattedCompact}</strong>
        </span>
      </div>
    </div>
  );
};
