import React, { useState } from 'react';
import {
  X,
  Upload,
  Users,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Building2,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  HelpCircle
} from 'lucide-react';
import { MedicalLead, MedicalService, StageId, MedicalSpecialty } from '../types';
import { STAGES } from '../data/stages';
import { getAllSpecialties } from '../data/specialties';
import { ECUADOR_CITIES, ECUADOR_SECTORS } from '../data/ecuadorData';
import { BASE_SERVICES } from '../data/servicesData';
import {
  BulkDoctorRow,
  BulkParseOptions,
  parseBulkDoctorsText,
  convertBulkRowsToLeads
} from '../utils/rawInfoParser';

interface BulkLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  services?: MedicalService[];
  onImportBulkLeads: (leads: MedicalLead[]) => void;
}

const SAMPLE_BULK_DATA = `Dr. Roberto Mendoza Zambrano, Cardiología, 0998765432, Torre Médica Montecristi Cons 302, Barbasquillo, Manta
Dra. Valeria Macías Arteaga, Dermatología, 0984561234, Clínica del Sol Cons 104, Jocay, Manta
Dr. Santiago Vera Loor, Pediatría, +593 97 654 3210, Hospital Rodríguez Zambrano, Tarqui, Manta
Dra. Diana Briones Delgado, Ginecología y Obstetricia, 0991234567, Centro Médico del Puerto, Centro, Manta
Dr. Gabriel Intriago Pazmiño, Traumatología y Ortopedia, 0987654320, Clínica Los Esteros, Los Esteros, Manta`;

export const BulkLeadsModal: React.FC<BulkLeadsModalProps> = ({
  isOpen,
  onClose,
  services = BASE_SERVICES,
  onImportBulkLeads
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<BulkDoctorRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  // Defaults
  const [defaultStage, setDefaultStage] = useState<StageId>('prospecto');
  const [selectedServiceId, setSelectedServiceId] = useState('srv-base-1ano');
  const [defaultCity, setDefaultCity] = useState('Manta');
  const [defaultSector, setDefaultSector] = useState('Centro');

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || BASE_SERVICES[0];

  const handleParse = (textToParse = rawText) => {
    if (!textToParse.trim()) return;

    const options: BulkParseOptions = {
      defaultStage,
      defaultServiceId: currentService.id,
      defaultServiceName: `${currentService.name} ($${currentService.price})`,
      defaultPrice: currentService.price,
      defaultCity,
      defaultSector
    };

    const rows = parseBulkDoctorsText(textToParse, options);
    setParsedRows(rows);
    setHasParsed(true);
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_BULK_DATA);
    handleParse(SAMPLE_BULK_DATA);
  };

  const handleToggleRow = (id: string) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleToggleAll = (select: boolean) => {
    setParsedRows((prev) => prev.map((r) => ({ ...r, selected: select })));
  };

  const handleUpdateRowField = (id: string, field: keyof BulkDoctorRow, value: any) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleConfirmImport = () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) return;

    const options: BulkParseOptions = {
      defaultStage,
      defaultServiceId: currentService.id,
      defaultServiceName: `${currentService.name} ($${currentService.price})`,
      defaultPrice: currentService.price,
      defaultCity,
      defaultSector
    };

    const newLeads = convertBulkRowsToLeads(selectedRows, options);
    onImportBulkLeads(newLeads);
    onClose();
  };

  const selectedCount = parsedRows.filter((r) => r.selected).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 dark:bg-slate-950 px-5 py-4 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Carga Masiva de Médicos Especialistas
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black border border-teal-500/30">
                  Importador CRM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pega listas desde Excel, Google Sheets, CSV o texto para registrar múltiples médicos con fecha y sector
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Settings Ribbon */}
        <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 px-5 py-3 shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Default Stage */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Etapa Inicial</span>
            </label>
            <select
              value={defaultStage}
              onChange={(e) => setDefaultStage(e.target.value as StageId)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Default Service */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Servicio Asignado</span>
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} (${srv.price})
                </option>
              ))}
            </select>
          </div>

          {/* Default Sector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Sector por Defecto</span>
            </label>
            <select
              value={defaultSector}
              onChange={(e) => setDefaultSector(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ECUADOR_SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white dark:bg-slate-900">
          
          {/* Step 1: Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Pega los registros (Nombre, Especialidad, Teléfono, Clínica, Sector):</span>
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cargar ejemplo de prueba</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Dr. Roberto Mendoza, Cardiología, 0998765432, Torre Médica Montecristi, Barbasquillo&#10;Dra. Valeria Macías, Dermatología, 0984561234, Clínica del Sol, Jocay..."
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
            />

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Acepta formato copiado desde Excel (columnas tabuladas) o texto separado por comas o líneas.
              </p>
              <button
                type="button"
                onClick={() => handleParse()}
                disabled={!rawText.trim()}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Procesar y Ordenar Médicos</span>
              </button>
            </div>
          </div>

          {/* Step 2: Parsed Table Review */}
          {hasParsed && (
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Previsualización de Médicos Detectados</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      {selectedCount} de {parsedRows.length} seleccionados
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Revisa los datos antes de guardarlos. Se asignará la fecha de registro de hoy automáticamente.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleAll(true)}
                    className="text-teal-700 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    Marcar todos
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAll(false)}
                    className="text-slate-500 dark:text-slate-400 font-bold hover:underline cursor-pointer"
                  >
                    Desmarcar todos
                  </button>
                </div>
              </div>

              {parsedRows.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                  No se detectaron registros válidos en el texto. Asegúrate de incluir al menos el nombre y la especialidad o teléfono.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-[320px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase sticky top-0 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">Sel.</th>
                          <th className="py-2.5 px-3">Médico / Especialista</th>
                          <th className="py-2.5 px-3">Especialidad</th>
                          <th className="py-2.5 px-3">Teléfono WhatsApp</th>
                          <th className="py-2.5 px-3">Clínica / Consultorio</th>
                          <th className="py-2.5 px-3">Sector</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedRows.map((row) => (
                          <tr
                            key={row.id}
                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors ${
                              row.selected ? 'bg-white dark:bg-slate-850' : 'bg-slate-50/50 dark:bg-slate-900/50 opacity-60'
                            }`}
                          >
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.selected}
                                onChange={() => handleToggleRow(row.id)}
                                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.doctorName}
                                onChange={(e) => handleUpdateRowField(row.id, 'doctorName', e.target.value)}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={row.specialty}
                                onChange={(e) => handleUpdateRowField(row.id, 'specialty', e.target.value)}
                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
                              >
                                {getAllSpecialties().map((s) => (
                                  <option key={s.name} value={s.name}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={row.phone}
                                  onChange={(e) => handleUpdateRowField(row.id, 'phone', e.target.value)}
                                  className="w-32 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-500"
                                />
                                {row.phoneValid ? (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Teléfono válido" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Revisar formato" />
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.clinicOrHospital}
                                onChange={(e) => handleUpdateRowField(row.id, 'clinicOrHospital', e.target.value)}
                                className="w-40 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-500"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={row.sector}
                                onChange={(e) => handleUpdateRowField(row.id, 'sector', e.target.value)}
                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200"
                              >
                                {ECUADOR_SECTORS.map((sec) => (
                                  <option key={sec} value={sec}>
                                    {sec}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {hasParsed && (
              <span>
                Se registrarán <strong>{selectedCount}</strong> médicos con fecha de hoy y servicio{' '}
                <strong>{currentService.name} (${currentService.price})</strong>.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={selectedCount === 0}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Importar {selectedCount} Médicos al CRM</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
