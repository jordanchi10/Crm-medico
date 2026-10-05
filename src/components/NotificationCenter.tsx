import React, { useState, useEffect } from 'react';
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
  Send,
  Layers,
  Flame,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { MedicalLead } from '../types';
import { STAGES } from '../data/stages';
import { getSpecialtyMeta } from '../data/specialties';
import { 
  OverdueLeadInfo, 
  ImmediateAttentionLeadInfo,
  LeadStageChangeRecord,
  NotificationPreferences,
  getNotificationPermission, 
  requestNotificationPermission, 
  sendBrowserNotification,
  playNotificationSound,
  notifyStaleLeadsBrowserAlert,
  notifyImmediateAttentionLeads,
  notifyLeadStageChange,
  getRecentStageChanges,
  clearRecentStageChanges
} from '../utils/notificationService';
import { formatCurrency } from '../utils/storage';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  overdueLeads: OverdueLeadInfo[];
  immediateAttentionLeads: ImmediateAttentionLeadInfo[];
  allLeads: MedicalLead[];
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onOpenEditLead: (lead: MedicalLead) => void;
  onQuickMarkContacted: (leadId: string) => void;
  onFilterOverdueInView?: () => void;
  thresholdHours: number;
  onThresholdChange: (hours: number) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  preferences?: NotificationPreferences;
  onUpdatePreferences?: (prefs: Partial<NotificationPreferences>) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  overdueLeads,
  immediateAttentionLeads,
  allLeads,
  onOpenWhatsApp,
  onOpenEditLead,
  onQuickMarkContacted,
  onFilterOverdueInView,
  thresholdHours,
  onThresholdChange,
  isSoundEnabled,
  onToggleSound,
  preferences,
  onUpdatePreferences
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'urgent' | 'overdue' | 'stage_changes'>('urgent');
  const [stageChanges, setStageChanges] = useState<LeadStageChangeRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
      setStageChanges(getRecentStageChanges());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsRequesting(false);

    if (result === 'granted') {
      if (isSoundEnabled) playNotificationSound('default');
      sendBrowserNotification('MedCRM: ¡Notificaciones Push Activadas! 🔔', {
        body: 'Recibirás alertas nativas al cambiar de etapa y cuando un lead requiera atención comercial urgente.'
      });
      setTestSuccessMessage('¡Permiso concedido! Las notificaciones nativas del navegador están activas.');
      setTimeout(() => setTestSuccessMessage(null), 4000);
    } else if (result === 'denied') {
      setTestSuccessMessage('El navegador tiene bloqueadas las notificaciones. Habilítalas en los ajustes del sitio.');
      setTimeout(() => setTestSuccessMessage(null), 5000);
    }
  };

  // Test stage change notification
  const handleTestStageChangeNotification = () => {
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }

    const testLead = allLeads[0] || {
      id: 'test-doc',
      doctorName: 'Dr. Alejandro Morales',
      specialty: 'Cardiología',
      clinicOrHospital: 'Clínica San Gregorio',
      stage: 'demo_agendada',
      estimatedValue: 150
    };

    notifyLeadStageChange(
      testLead as MedicalLead,
      'contactado',
      'demo_agendada',
      (l) => onOpenEditLead(l)
    );

    setStageChanges(getRecentStageChanges());
    setTestSuccessMessage('✅ Notificación push de Cambio de Etapa enviada.');
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  // Test immediate attention notification
  const handleTestImmediateAttentionNotification = () => {
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }

    const sampleLead = immediateAttentionLeads[0]?.lead || allLeads[0] || {
      id: 'urgent-test',
      doctorName: 'Dra. Gabriela Castro',
      specialty: 'Dermatología',
      clinicOrHospital: 'Hospital de Especialidades',
      stage: 'demo_agendada',
      nextFollowUpDate: new Date().toISOString().split('T')[0],
      nextFollowUpTime: '15:30',
      estimatedValue: 99
    };

    const mockUrgentList: ImmediateAttentionLeadInfo[] = [
      {
        lead: sampleLead as MedicalLead,
        type: 'today_appointment',
        title: 'Demostración Agendada para HOY',
        description: `${sampleLead.doctorName} tiene demo programada para hoy a las 15:30.`,
        badgeLabel: 'Cita Hoy 15:30',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        urgency: 'critical',
        hoursElapsed: 12
      }
    ];

    notifyImmediateAttentionLeads(mockUrgentList, true, (lead) => onOpenWhatsApp(lead));
    setTestSuccessMessage('✅ Notificación push de Atención Inmediata enviada.');
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  const handleClearHistory = () => {
    clearRecentStageChanges();
    setStageChanges([]);
    setTestSuccessMessage('Historial de cambios de etapa vaciado.');
    setTimeout(() => setTestSuccessMessage(null), 3000);
  };

  const totalUrgentCount = immediateAttentionLeads.length;
  const totalOverdueCount = overdueLeads.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
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
                  Centro de Notificaciones Push
                </h2>
                {totalUrgentCount > 0 && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                    {totalUrgentCount} Urgentes
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alertas automáticas al cambiar de etapa y cuando un lead requiera atención comercial
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
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
                      ? 'Las notificaciones están restringidas en este navegador. Habilítalas en los permisos de sitio.'
                      : 'Activa los permisos para recibir alertas al cambiar de etapa y cuando haya citas pendientes hoy.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleTestStageChangeNotification}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      title="Probar notificación de cambio de etapa"
                    >
                      <Layers className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      <span>Probar Etapa</span>
                    </button>
                    <button
                      onClick={handleTestImmediateAttentionNotification}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      title="Probar notificación de atención inmediata"
                    >
                      <Flame className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                      <span>Probar Urgente</span>
                    </button>
                  </div>
                )}

                {/* Sound chime toggle */}
                <button
                  onClick={onToggleSound}
                  title={isSoundEnabled ? 'Sonidos activados' : 'Sonidos silenciados'}
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

            {/* Notification triggers toggles strip */}
            {onUpdatePreferences && (
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={preferences?.notifyStageChange ?? true}
                    onChange={(e) => onUpdatePreferences({ notifyStageChange: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                  />
                  <span className="font-semibold text-[11px]">Avisar al cambiar de etapa</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={preferences?.notifyImmediateAttention ?? true}
                    onChange={(e) => onUpdatePreferences({ notifyImmediateAttention: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                  />
                  <span className="font-semibold text-[11px]">Citas y atención inmediata</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={preferences?.notifyOverdueLeads ?? true}
                    onChange={(e) => onUpdatePreferences({ notifyOverdueLeads: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
                  />
                  <span className="font-semibold text-[11px]">Inactividad (+{thresholdHours}h)</span>
                </label>
              </div>
            )}
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-750">
            {/* 1. Atención Inmediata */}
            <button
              type="button"
              onClick={() => setActiveTab('urgent')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] touch-manipulation ${
                activeTab === 'urgent'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="hidden sm:inline">Atención Inmediata</span>
              <span className="sm:hidden">Urgentes</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                totalUrgentCount > 0 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}>
                {totalUrgentCount}
              </span>
            </button>

            {/* 2. Inactividad */}
            <button
              type="button"
              onClick={() => setActiveTab('overdue')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] touch-manipulation ${
                activeTab === 'overdue'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Sin Contacto (+{thresholdHours}h)</span>
              <span className="sm:hidden">Inactivos</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold">
                {totalOverdueCount}
              </span>
            </button>

            {/* 3. Cambios de Etapa Recientes */}
            <button
              type="button"
              onClick={() => setActiveTab('stage_changes')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] touch-manipulation ${
                activeTab === 'stage_changes'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="hidden sm:inline">Cambios de Etapa</span>
              <span className="sm:hidden">Etapas</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold">
                {stageChanges.length}
              </span>
            </button>
          </div>

          {/* Subheader / Threshold selector for overdue tab */}
          {activeTab === 'overdue' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Límite de inactividad:</span>
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
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>

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
          )}

          {/* TAB 1: ATENCIÓN INMEDIATA */}
          {activeTab === 'urgent' && (
            <div className="space-y-3">
              {immediateAttentionLeads.map((item, idx) => {
                const { lead, title, description, badgeLabel, badgeColor, urgency } = item;
                const spec = getSpecialtyMeta(lead.specialty);
                const stageMeta = STAGES.find((s) => s.id === lead.stage);

                return (
                  <div
                    key={`${lead.id}-${item.type}-${idx}`}
                    className={`rounded-2xl border p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      urgency === 'critical'
                        ? 'border-amber-300/90 dark:border-amber-700/80 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-850 dark:to-slate-850'
                        : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    {/* Lead Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border shadow-2xs ${badgeColor}`}>
                          {badgeLabel}
                        </span>
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

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                        {lead.clinicOrHospital && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{lead.clinicOrHospital}</span>
                          </span>
                        )}
                        {lead.sector && (
                          <span className="font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded text-[10px]">
                            📍 {lead.sector}
                          </span>
                        )}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(lead.estimatedValue)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
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

                      <button
                        onClick={() => onQuickMarkContacted(lead.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-300 dark:border-slate-700 border text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                        title="Marcar como atendido/contactado hoy"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span className="hidden sm:inline">Contactado</span>
                      </button>

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

              {immediateAttentionLeads.length === 0 && (
                <div className="py-12 px-4 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      ¡Sin citas pendientes ni urgencias hoy!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      No hay prospectos médicos que requieran atención comercial inmediata o citas atrasadas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIN CONTACTO (+48H) */}
          {activeTab === 'overdue' && (
            <div className="space-y-3">
              {overdueLeads.map(({ lead, hoursElapsed, daysElapsed, lastContactText }, idx) => {
                const spec = getSpecialtyMeta(lead.specialty);
                const stageMeta = STAGES.find((s) => s.id === lead.stage);

                return (
                  <div
                    key={`${lead.id || 'overdue-lead'}-${idx}`}
                    className="bg-white dark:bg-slate-850 rounded-2xl border border-rose-200/90 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-700 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-rose-50/20 via-white to-white dark:from-rose-950/20 dark:via-slate-850 dark:to-slate-850"
                  >
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
                        {lead.clinicOrHospital && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{lead.clinicOrHospital}</span>
                          </span>
                        )}
                        {lead.sector && (
                          <span className="font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded text-[10px]">
                            📍 {lead.sector}
                          </span>
                        )}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(lead.estimatedValue)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-2xs">
                          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>{hoursElapsed} horas sin actualización ({daysElapsed} días)</span>
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {lastContactText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
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

                      <button
                        onClick={() => onQuickMarkContacted(lead.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-300 dark:border-slate-700 border text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                        title="Marcar como contactado hoy y quitar alerta de 48h"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span className="hidden sm:inline">Contactado</span>
                      </button>

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
          )}

          {/* TAB 3: HISTORIAL DE CAMBIOS DE ETAPA */}
          {activeTab === 'stage_changes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Registros automáticos enviados como notificación push</span>
                {stageChanges.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Historial</span>
                  </button>
                )}
              </div>

              {stageChanges.map((change, idx) => {
                const targetLead = allLeads.find((l) => l.id === change.leadId);
                const fromMeta = STAGES.find((s) => s.id === change.fromStageId);
                const toMeta = STAGES.find((s) => s.id === change.toStageId);

                return (
                  <div
                    key={`${change.id || 'sc'}-${idx}`}
                    className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {change.doctorName}
                        </span>
                        <span className="text-[10px] text-teal-800 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/50 px-2 py-0.2 rounded border border-teal-200 dark:border-teal-800">
                          {change.specialty}
                        </span>
                        {change.isWon && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            🎉 Venta Ganada
                          </span>
                        )}
                      </div>

                      {/* Transition Path */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${fromMeta?.badgeBg || 'bg-slate-100'} ${fromMeta?.badgeText || 'text-slate-700'}`}>
                          {change.fromStageName}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${toMeta?.badgeBg || 'bg-slate-100'} ${toMeta?.badgeText || 'text-slate-700'}`}>
                          {change.toStageName}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {change.formattedTime}
                      </div>
                    </div>

                    {targetLead && (
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            onOpenWhatsApp(targetLead);
                            onClose();
                          }}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onOpenEditLead(targetLead);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Ver Lead</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {stageChanges.length === 0 && (
                <div className="py-12 px-4 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Sin cambios de etapa recientes
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Cuando arrastres un lead en el tablero Kanban o cambies su etapa, se enviará una notificación push y quedará registrado aquí.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            Notificaciones sincronizadas con el navegador y almacenamiento local
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {permission === 'granted' && (
              <button
                onClick={() => {
                  if (activeTab === 'urgent') {
                    notifyImmediateAttentionLeads(immediateAttentionLeads, true, (lead) => onOpenWhatsApp(lead));
                  } else {
                    notifyStaleLeadsBrowserAlert(overdueLeads, true, (lead) => onOpenWhatsApp(lead));
                  }
                  setTestSuccessMessage('Alerta push re-enviada al navegador.');
                  setTimeout(() => setTestSuccessMessage(null), 3000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Re-enviar Push</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer shadow-sm"
            >
              Listo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
