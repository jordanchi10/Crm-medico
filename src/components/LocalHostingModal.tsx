import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Server, 
  ShieldCheck, 
  Copy, 
  Check, 
  Save,
  Calendar,
  Clock,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Settings2,
  Timer,
  BellRing
} from 'lucide-react';
import { MedicalLead, WhatsAppTemplate } from '../types';
import { 
  downloadBackupJSON, 
  parseBackupJSON, 
  exportAllLeadsCSV, 
  getLocalStorageUsage,
  getDailySnapshots,
  loadPlatformConfig,
  savePlatformConfig,
  performDailyAutoBackup,
  PlatformConfig,
  DailySnapshot
} from '../utils/storage';

interface LocalHostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: MedicalLead[];
  templates: WhatsAppTemplate[];
  onImportBackup: (importedLeads: MedicalLead[], importedTemplates?: WhatsAppTemplate[], config?: PlatformConfig) => void;
  onManualSave: () => void;
}

export const LocalHostingModal: React.FC<LocalHostingModalProps> = ({
  isOpen,
  onClose,
  leads,
  templates,
  onImportBackup,
  onManualSave
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [configSavedMsg, setConfigSavedMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Platform schedule configuration states
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(true);
  const [backupFrequency, setBackupFrequency] = useState<'interval' | 'daily_time'>('interval');
  const [intervalHours, setIntervalHours] = useState<number>(4);
  const [scheduledTime, setScheduledTime] = useState<string>('18:00');
  const [maxSnapshots, setMaxSnapshots] = useState<number>(30);

  // Load current config on mount or open
  useEffect(() => {
    if (isOpen) {
      const cfg = loadPlatformConfig();
      setAutoBackupEnabled(cfg.dailyAutoBackupEnabled ?? true);
      setBackupFrequency(cfg.backupFrequency || 'interval');
      setIntervalHours(cfg.backupIntervalHours || 4);
      setScheduledTime(cfg.backupScheduledTime || '18:00');
      setMaxSnapshots(cfg.maxStoredSnapshots || 30);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const storageUsage = getLocalStorageUsage();
  const platformConfig = loadPlatformConfig();
  const dailySnapshots = getDailySnapshots();

  const handleDownloadJSON = () => {
    downloadBackupJSON(leads, templates, platformConfig);
  };

  const handleExportCSV = () => {
    exportAllLeadsCSV(leads);
  };

  const handleManualSaveClick = () => {
    onManualSave();
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleSaveScheduleConfig = () => {
    const updated: PlatformConfig = {
      ...platformConfig,
      dailyAutoBackupEnabled: autoBackupEnabled,
      backupFrequency,
      backupIntervalHours: Number(intervalHours),
      backupScheduledTime: scheduledTime,
      maxStoredSnapshots: Number(maxSnapshots)
    };
    savePlatformConfig(updated);
    setConfigSavedMsg(true);
    setTimeout(() => setConfigSavedMsg(false), 2500);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { leads: importedLeads, templates: importedTemplates, config: importedConfig } = parseBackupJSON(content);
        onImportBackup(importedLeads, importedTemplates, importedConfig);
        setImportStatus(`¡Respaldo importado con éxito! Se restauraron ${importedLeads.length} especialistas médicos y la configuración.`);
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestoreSnapshot = (snapshot: DailySnapshot) => {
    if (window.confirm(`¿Deseas restaurar la copia del día ${snapshot.date} (${snapshot.leadsCount} médicos)?`)) {
      onImportBackup(snapshot.data.leads, snapshot.data.templates, snapshot.data.config);
      setImportStatus(`¡Copia del día ${snapshot.date} restaurada con éxito!`);
    }
  };

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  // Next backup calculation preview string
  const getNextBackupPreview = () => {
    if (!autoBackupEnabled) return 'Desactivado';
    if (backupFrequency === 'interval') {
      return `Automático cada ${intervalHours} ${intervalHours === 1 ? 'hora' : 'horas'} en segundo plano`;
    }
    return `Automático todos los días a las ${scheduledTime} hs`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Centro de Respaldos & Configuración de Guardado</span>
                  <span className="text-sm">🇪🇨</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ecuador (+593)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Almacenamiento 100% local, respaldo periódico programable y compatibilidad con cPanel.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Manual Save & Status Banner */}
          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${autoBackupEnabled ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span className="font-bold text-sm">
                  {autoBackupEnabled ? 'Respaldos Automáticos: ACTIVOS' : 'Respaldos Automáticos: PAUSADOS'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Frecuencia: <strong className="text-teal-300">{getNextBackupPreview()}</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Último respaldo registrado: {platformConfig.lastBackupTimestamp ? new Date(platformConfig.lastBackupTimestamp).toLocaleString('es-EC') : 'Hoy'}
              </p>
            </div>

            <button
              id="btn-modal-manual-save"
              onClick={handleManualSaveClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccessMsg ? '¡Respaldo Manual Creado!' : 'Crear Respaldo Manual Ahora'}</span>
            </button>
          </div>

          {/* SCHEDULE CONFIGURATION FORM (NEW FEATURE REQUEST) */}
          <div className="bg-gradient-to-br from-teal-50/70 via-white to-slate-50 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 border-2 border-teal-200 dark:border-teal-800/80 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-teal-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Programar Intervalo de Respaldos Automáticos
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define cada cuánto tiempo el sistema debe guardar una copia de seguridad automática de tus médicos y finanzas.
                  </p>
                </div>
              </div>

              {/* Master toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBackupEnabled}
                  onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {autoBackupEnabled && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                
                {/* Frequency Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Modalidad de Programación:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBackupFrequency('interval')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        backupFrequency === 'interval'
                          ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/20 text-slate-900 dark:text-white font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Timer className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Por Intervalo de Horas</div>
                        <div className="text-[11px] text-slate-400 font-normal">Cada 1h, 2h, 4h, 6h, 12h o 24h</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBackupFrequency('daily_time')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        backupFrequency === 'daily_time'
                          ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/20 text-slate-900 dark:text-white font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">A una Hora Fija del Día</div>
                        <div className="text-[11px] text-slate-400 font-normal">ej. Todos los días a las 18:00 hs</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Specific Settings Grid based on mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  {backupFrequency === 'interval' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Intervalo de Frecuencia:
                      </label>
                      <select
                        value={intervalHours}
                        onChange={(e) => setIntervalHours(Number(e.target.value))}
                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value={1}>Cada 1 hora (Alta frecuencia)</option>
                        <option value={2}>Cada 2 horas</option>
                        <option value={4}>Cada 4 horas (Recomendado)</option>
                        <option value={6}>Cada 6 horas</option>
                        <option value={12}>Cada 12 horas (2 veces al día)</option>
                        <option value={24}>Cada 24 horas (1 vez al día)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        El CRM guardará automáticamente una copia en segundo plano transcurrido este tiempo.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Hora Diaria del Respaldo (Hora Ecuador):
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Ideal al final de la jornada laboral (ej. 18:00 o 20:00).
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Retención de Copias Históricas:
                    </label>
                    <select
                      value={maxSnapshots}
                      onChange={(e) => setMaxSnapshots(Number(e.target.value))}
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value={7}>Conservar últimos 7 respaldos</option>
                      <option value={15}>Conservar últimos 15 respaldos</option>
                      <option value={30}>Conservar últimos 30 respaldos (Estándar)</option>
                      <option value={60}>Conservar últimos 60 respaldos</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Las copias más antiguas se rotan de forma automática para no saturar memoria.
                    </p>
                  </div>
                </div>

                {/* Save schedule settings button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Los respaldos se almacenan de forma segura e instantánea en tu equipo.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveScheduleConfig}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {configSavedMsg ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{configSavedMsg ? '¡Programación Guardada!' : 'Guardar Programación'}</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Privacy & Guarantee Card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
              <strong className="font-bold block text-sm mb-0.5">
                Código Puro y Privacidad Absoluta para Médicos en Ecuador
              </strong>
              Esta plataforma es 100% independiente. <strong>No depende de Firebase, Supabase, MySQL remoto ni servidores cloud extranjeros.</strong> Todos los contactos médicos, citas, cobros y configuraciones quedan en tu computadora o en tu hosting propio.
            </div>
          </div>

          {/* Backup and Local Data Management Tools */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Exportar e Importar Datos y Configuración</span>
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Almacenamiento: <strong>{storageUsage.kb} KB</strong> ({storageUsage.leadsCount} registros)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Download JSON Backup */}
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-teal-50/50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Exportar Todo (JSON)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Descarga médicos, etapas, cobros en USD y plantillas de WhatsApp.
                  </div>
                </div>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 group-hover:underline">
                  Descargar respaldo .json →
                </span>
              </button>

              {/* Import JSON Backup */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-blue-50/50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Importar Datos y Configuración</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Restaura una copia previa en tu navegador o nuevo hosting cPanel.
                  </div>
                </div>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    className="hidden"
                    id="input-file-backup"
                  />
                  <label
                    htmlFor="input-file-backup"
                    className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer block"
                  >
                    Seleccionar archivo .json →
                  </label>
                </div>
              </div>

              {/* Export to CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-emerald-50/50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Exportar a Excel / CSV</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Hoja de cálculo compatible con Excel y facturación de Ecuador.
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                  Descargar archivo .csv →
                </span>
              </button>
            </div>

            {/* Feedback messages */}
            {importStatus && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{importStatus}</span>
              </div>
            )}
            {importError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-semibold">
                {importError}
              </div>
            )}
          </div>

          {/* Daily Snapshots History */}
          {dailySnapshots.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Historial de Respaldos Automáticos y Manuales</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  {dailySnapshots.length} copias en memoria local
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {dailySnapshots.map((snap) => (
                  <div key={snap.timestamp || snap.date} className="p-3 bg-slate-50/70 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">
                        {snap.date.split('-')[2]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <span>Respaldo del {snap.date}</span>
                          {snap.triggerType && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                              {snap.triggerType === 'manual' ? 'Manual' : snap.triggerType === 'daily_scheduled' ? 'Hora fija' : 'Intervalo'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{snap.leadsCount} médicos registrados</span>
                          <span>•</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">${snap.totalRevenue} USD</span>
                          <span>•</span>
                          <span>{new Date(snap.timestamp).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 hover:text-teal-900 border border-slate-200 dark:border-slate-700 hover:border-teal-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* cPanel Deployment Guide */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Cómo Alojar en tu cPanel de Ecuador o Hosting Compartido</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    1. Generar los archivos estáticos de producción
                  </span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'step1')}
                    className="text-[11px] text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedStep === 'step1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === 'step1' ? 'Copiado' : 'Copiar comando'}</span>
                  </button>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  En la consola de tu proyecto ejecuta: <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">npm run build</code>. Esto compilará todo el código a la carpeta <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">/dist</code> configurada con rutas relativas para Ecuador.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">
                  2. Entrar a tu cPanel &gt; Administrador de Archivos (File Manager)
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Inicia sesión en tu cPanel y abre el <strong>Administrador de Archivos</strong>. Navega hasta <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">public_html</code> (o una subcarpeta como <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">public_html/crm</code>).
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">
                  3. Subir y descomprimir el contenido de /dist
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Comprime la carpeta <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">dist</code> en un archivo <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">dist.zip</code>, súbelo a través de cPanel y dale a <strong>Extraer (Extract)</strong>.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Respaldos automáticos programados y rutas relativas compatibles con cPanel</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
