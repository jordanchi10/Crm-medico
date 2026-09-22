import React, { useState, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { MedicalLead, WhatsAppTemplate } from '../types';
import { 
  downloadBackupJSON, 
  parseBackupJSON, 
  exportAllLeadsCSV, 
  getLocalStorageUsage,
  getDailySnapshots,
  loadPlatformConfig,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Centro de Respaldos Diarios & Configuración</span>
                  <span className="text-sm">🇪🇨</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ecuador (+593)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Almacenamiento 100% local, respaldo automático cada día y compatibilidad con cPanel.
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
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-sm">Respaldo Automático Diario: ACTIVO</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Último respaldo automático: <strong>{platformConfig.lastDailyBackupDate || 'Hoy'}</strong>. Puedes forzar guardado inmediato en cualquier momento.
              </p>
            </div>

            <button
              id="btn-modal-manual-save"
              onClick={handleManualSaveClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccessMsg ? '¡Información Guardada!' : 'Guardar Información Ahora'}</span>
            </button>
          </div>

          {/* Privacy & Guarantee Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <strong className="font-bold block text-sm mb-0.5">
                Código Puro y Privacidad Absoluta para Médicos en Ecuador
              </strong>
              Esta plataforma es 100% independiente. <strong>No depende de Firebase, Supabase, MySQL remoto ni servidores cloud extranjeros.</strong> Todos los contactos médicos, citas, cobros y configuraciones quedan en tu computadora o en tu hosting propio.
            </div>
          </div>

          {/* Backup and Local Data Management Tools */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-teal-600" />
                <span>Exportar e Importar Datos y Configuración</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Almacenamiento: <strong>{storageUsage.kb} KB</strong> ({storageUsage.leadsCount} registros)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Download JSON Backup */}
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Exportar Todo (JSON)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Descarga médicos, etapas, cobros en USD y plantillas de WhatsApp.
                  </div>
                </div>
                <span className="text-[11px] font-bold text-teal-700 group-hover:underline">
                  Descargar respaldo .json →
                </span>
              </button>

              {/* Import JSON Backup */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Importar Datos y Configuración</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
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
                    className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer block"
                  >
                    Seleccionar archivo .json →
                  </label>
                </div>
              </div>

              {/* Export to CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 text-left transition-all flex flex-col justify-between gap-3 group cursor-pointer"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Exportar a Excel / CSV</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Hoja de cálculo compatible con Excel y facturación de Ecuador.
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">
                  Descargar archivo .csv →
                </span>
              </button>
            </div>

            {/* Feedback messages */}
            {importStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{importStatus}</span>
              </div>
            )}
            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
                {importError}
              </div>
            )}
          </div>

          {/* Daily Snapshots History */}
          {dailySnapshots.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Historial de Respaldos Diarios Guardados</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  {dailySnapshots.length} copias diarias en memoria local
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {dailySnapshots.map((snap) => (
                  <div key={snap.date} className="p-3 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[10px]">
                        {snap.date.split('-')[2]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          Respaldo del {snap.date}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{snap.leadsCount} médicos registrados</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">${snap.totalRevenue} USD facturados</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="px-2.5 py-1 rounded bg-white hover:bg-teal-50 text-teal-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurar este día</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* cPanel Deployment Guide */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600" />
              <span>Cómo Alojar en tu cPanel de Ecuador o Hosting Compartido</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-700">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    1. Generar los archivos estáticos de producción
                  </span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'step1')}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedStep === 'step1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === 'step1' ? 'Copiado' : 'Copiar comando'}</span>
                  </button>
                </div>
                <p className="text-slate-500 mt-1">
                  En la consola de tu proyecto ejecuta: <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">npm run build</code>. Esto compilará todo el código a la carpeta <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">/dist</code> configurada con rutas relativas para Ecuador.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  2. Entrar a tu cPanel &gt; Administrador de Archivos (File Manager)
                </div>
                <p className="text-slate-500 mt-1">
                  Inicia sesión en tu cPanel y abre el <strong>Administrador de Archivos</strong>. Navega hasta <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">public_html</code> (o una subcarpeta como <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">public_html/crm</code>).
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  3. Subir y descomprimir el contenido de /dist
                </div>
                <p className="text-slate-500 mt-1">
                  Comprime la carpeta <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">dist</code> en un archivo <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">dist.zip</code>, súbelo a través de cPanel y dale a <strong>Extraer (Extract)</strong>.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Respaldos automáticos diarios y rutas relativas compatibles con cPanel</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
