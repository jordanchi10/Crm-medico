import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  X, 
  Clock, 
  MessageCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Building2, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  Send
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';
import { getSpecialtyMeta } from '../data/specialties';
import { 
  OverdueLeadInfo, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendBrowserNotification,
  playNotificationSound,
  notifyStaleLeadsBrowserAlert,
  isNotificationSupported
} from '../utils/notificationService';
import { formatCurrency } from '../utils/storage';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  overdueLeads: OverdueLeadInfo[];
  allLeads: MedicalLead[];
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onOpenEditLead: (lead: MedicalLead) => void;
  onQuickMarkContacted: (leadId: string) => void;
  onFilterOverdueInView?: () => void;
  thresholdHours: number;
  onThresholdChange: (hours: number) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  overdueLeads,
  allLeads,
  onOpenWhatsApp,
  onOpenEditLead,
  onQuickMarkContacted,
  onFilterOverdueInView,
  thresholdHours,
  onThresholdChange,
  isSoundEnabled,
  onToggleSound
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsRequesting(false);

    if (result === 'granted') {
      if (isSoundEnabled) playNotificationSound();
      sendBrowserNotification('MedCRM: ¡Notificaciones Activadas! 🔔', {
        body: 'Recibirás alertas automáticas cuando un prospecto médico pase más de 48 horas sin contacto.'
      });
      setTestSuccessMessage('¡Permiso concedido! Las notificaciones nativas están activas.');
      setTimeout(() => setTestSuccessMessage(null), 4000);
    } else if (result === 'denied') {
      setTestSuccessMessage('El navegador tiene bloqueadas las notificaciones. Habilítalas en los ajustes del sitio.');
      setTimeout(() => setTestSuccessMessage(null), 5000);
    }
  };

  const handleSendTestNotification = () => {
    if (isSoundEnabled) playNotificationSound();
    
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }

    const testLead = overdueLeads.length > 0 ? overdueLeads[0].lead : allLeads[0];
    const docName = testLead ? testLead.doctorName : 'Dr. Médico Especialista';
    const spec = testLead ? testLead.specialty : 'Cardiología';

    const sent = sendBrowserNotification(`⚠️ Alerta CRM: ${docName}`, {
      body: `El especialista en ${spec} lleva más de ${thresholdHours}h sin contacto registrado. Haz clic para contactarlo vía WhatsApp.`,
      tag: 'test-medcrm-alert',
      requireInteraction: true,
      onClick: () => {
        if (testLead) onOpenWhatsApp(testLead);
      }
    });

    if (sent) {
      setTestSuccessMessage('✅ Notificación de prueba enviada al sistema operativo/navegador.');
    } else {
      setTestSuccessMessage('⚠️ No se pudo disparar la alerta nativa. Verifica los permisos de tu navegador o iframe.');
    }
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  const handleNotifyAllOverdueNow = () => {
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }
    notifyStaleLeadsBrowserAlert(overdueLeads, true, (lead) => onOpenWhatsApp(lead));
    setTestSuccessMessage(`Alerta enviada para los ${overdueLeads.length} prospectos pendientes.`);
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-teal-50/30 to-emerald-50/20 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  Alertas de Contacto & Notificaciones
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Regla 48h
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supervisión automática de médicos sin actualización comercial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar panel de notificaciones"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Browser Notification Status Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {permission === 'granted' ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                ) : permission === 'denied' ? (
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <BellOff className="w-4.5 h-4.5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Notificaciones del Navegador:
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      permission === 'granted' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : permission === 'denied'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {permission === 'granted' ? 'Habilitadas' : permission === 'denied' ? 'Bloqueadas' : 'Pendiente de Activar'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {permission === 'granted'
                      ? 'Recibirás avisos nativos en tu pantalla aunque tengas la pestaña en segundo plano.'
                      : permission === 'denied'
                      ? 'Las notificaciones están restringidas en este navegador o ventana.'
                      : 'Activa el permiso para recibir alertas de escritorio cuando un médico supere 48 horas.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {permission !== 'granted' ? (
                  <button
                    onClick={handleRequestPermission}
                    disabled={isRequesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>{isRequesting ? 'Activando...' : 'Activar en Navegador'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSendTestNotification}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Probar Alerta</span>
                  </button>
                )}

                {/* Sound chime toggle */}
                <button
                  onClick={onToggleSound}
                  title={isSoundEnabled ? 'Sonido de campana activado' : 'Sonido silenciado'}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isSoundEnabled 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {testSuccessMessage && (
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{testSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Threshold & Summary Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Tiempo límite de inactividad:</span>
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {[24, 48, 72].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => onThresholdChange(hours)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      thresholdHours === hours
                        ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {hours} horas
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">{overdueLeads.length}</strong> de {allLeads.length} requieren atención
              </span>
              {overdueLeads.length > 0 && onFilterOverdueInView && (
                <button
                  onClick={() => {
                    onFilterOverdueInView();
                    onClose();
                  }}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Filtrar en Tablero</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Overdue Leads */}
          <div className="space-y-3">
            {overdueLeads.map(({ lead, hoursElapsed, daysElapsed, lastContactText }) => {
              const spec = getSpecialtyMeta(lead.specialty);
              const stageMeta = STAGES.find((s) => s.id === lead.stage);

              return (
                <div
                  key={lead.id}
                  className="bg-white dark:bg-slate-850 rounded-2xl border border-rose-200/90 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-700 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-rose-50/20 via-white to-white dark:from-rose-950/20 dark:via-slate-850 dark:to-slate-850"
                >
                  {/* Lead Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {lead.doctorName}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${spec.bgLight} dark:bg-opacity-20 ${spec.color} ${spec.borderLight} dark:border-opacity-30`}>
                        {lead.specialty}
                      </span>
                      {stageMeta && (
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                          {stageMeta.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 truncate max-w-[220px]">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{lead.clinicOrHospital}</span>
                      </span>
                      {lead.sector && (
                        <span className="font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded text-[10px]">
                          📍 {lead.sector}
                        </span>
                      )}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(lead.estimatedValue)}
                      </span>
                    </div>

                    {/* Inactivity Badge & Last Contact */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-2xs">
                        <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        <span>{hoursElapsed} horas sin actualización ({daysElapsed} días)</span>
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Último contacto: {lead.lastContactDate || 'Sin registro'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    
                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        onOpenWhatsApp(lead);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      title="Enviar mensaje por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Quick mark contacted today */}
                    <button
                      onClick={() => onQuickMarkContacted(lead.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-teal-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                      title="Marcar como contactado hoy y quitar alerta de 48h"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="hidden sm:inline">Contactado Hoy</span>
                    </button>

                    {/* Edit Lead */}
                    <button
                      onClick={() => {
                        onOpenEditLead(lead);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Ver ficha completa"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              );
            })}

            {/* Empty State */}
            {overdueLeads.length === 0 && (
              <div className="py-12 px-4 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    ¡Todo al día con tus prospectos!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    No tienes prospectos médicos que superen las {thresholdHours} horas sin contacto en el CRM.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Regla: Notificar médicos activos tras <strong>{thresholdHours}h</strong> de inactividad
          </span>
          <div className="flex items-center gap-2">
            {overdueLeads.length > 0 && permission === 'granted' && (
              <button
                onClick={handleNotifyAllOverdueNow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Re-enviar Notificación Navegador</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
