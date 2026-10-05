import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  X, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  Edit2, 
  Users,
  AlertCircle
} from 'lucide-react';
import { MedicalService, MedicalLead } from '../types';
import { BASE_SERVICES, saveServices, resetServicesToDefault } from '../data/servicesData';
import { formatCurrency } from '../utils/storage';

interface ServicesManagerModalProps {
  services: MedicalService[];
  leads: MedicalLead[];
  onUpdateServices: (updated: MedicalService[]) => void;
  onClose: () => void;
}

export const ServicesManagerModal: React.FC<ServicesManagerModalProps> = ({
  services,
  leads,
  onUpdateServices,
  onClose
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(99);
  const [durationYears, setDurationYears] = useState<number>(1);
  const [description, setDescription] = useState('');

  const startCreate = () => {
    setName('');
    setPrice(99);
    setDurationYears(1);
    setDescription('');
    setEditingServiceId(null);
    setIsCreating(true);
  };

  const startEdit = (service: MedicalService) => {
    setName(service.name);
    setPrice(service.price);
    setDurationYears(service.durationYears || 1);
    setDescription(service.description || '');
    setEditingServiceId(service.id);
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updatedList: MedicalService[];
    if (editingServiceId) {
      updatedList = services.map((s) => {
        if (s.id === editingServiceId) {
          return {
            ...s,
            name: name.trim(),
            price: Number(price),
            durationYears: Number(durationYears),
            description: description.trim()
          };
        }
        return s;
      });
    } else {
      const newService: MedicalService = {
        id: `srv-custom-${Date.now()}`,
        name: name.trim(),
        price: Number(price),
        durationYears: Number(durationYears),
        description: description.trim(),
        isBase: false
      };
      updatedList = [...services, newService];
    }

    saveServices(updatedList);
    onUpdateServices(updatedList);
    setIsCreating(false);
    setEditingServiceId(null);
  };

  const handleDelete = (serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (srv?.isBase) {
      setToastMessage('Los 2 servicios de base (1 año en $99 y 2 años en $150) no se pueden eliminar.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    setConfirmAction({
      title: '¿Eliminar Servicio?',
      message: `¿Deseas eliminar el servicio "${srv?.name || 'médico'}" del catálogo comercial?`,
      onConfirm: () => {
        const updatedList = services.filter(s => s.id !== serviceId);
        saveServices(updatedList);
        onUpdateServices(updatedList);
        setConfirmAction(null);
      }
    });
  };

  const handleResetToDefaults = () => {
    setConfirmAction({
      title: '¿Restablecer Servicios Base?',
      message: '¿Restablecer el catálogo a los 2 servicios oficiales de base ($99 y $150 USD)?',
      onConfirm: () => {
        const reset = resetServicesToDefault();
        onUpdateServices(reset);
        setConfirmAction(null);
      }
    });
  };

  // Count leads per service
  const getLeadsCountForService = (service: MedicalService) => {
    return leads.filter(l => 
      l.serviceId === service.id || 
      (l.serviceName && l.serviceName.toLowerCase().includes(service.name.toLowerCase()))
    ).length;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 sm:rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Catálogo de Servicios Médicos
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Base $99 / $150 USD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Planes y suscripciones para vender a médicos especialistas en Ecuador
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

        {/* Action strip */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span>Servicios disponibles:</span>
            <strong className="text-slate-900 dark:text-white font-bold">{services.length}</strong>
          </div>

          {!isCreating && (
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Agregar Nuevo Servicio</span>
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* In-Modal Confirmation Banner */}
          {confirmAction && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100">{confirmAction.title}</h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">{confirmAction.message}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmAction.onConfirm}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* Create or Edit Form */}
          {isCreating && (
            <form onSubmit={handleSave} className="bg-teal-50/50 dark:bg-teal-950/20 border-2 border-teal-200 dark:border-teal-800/80 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-teal-100 dark:border-teal-900/60 pb-2">
                <h4 className="text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{editingServiceId ? 'Editar Servicio Médico' : 'Crear Nuevo Servicio'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Perfil Médico 3 años VIP"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio ($ USD) *
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    required
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duración (Años)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descripción / Beneficios para el Doctor
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Posicionamiento en Google, botón de citas WhatsApp..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                >
                  {editingServiceId ? 'Actualizar Servicio' : 'Guardar Servicio'}
                </button>
              </div>
            </form>
          )}

          {/* List of Services Cards */}
          <div className="space-y-3">
            {services.map((service) => {
              const leadsCount = getLeadsCountForService(service);

              return (
                <div
                  key={service.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    service.isBase
                      ? 'bg-gradient-to-br from-white to-teal-50/40 dark:from-slate-850 dark:to-teal-950/20 border-teal-200 dark:border-teal-800/60 shadow-2xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {service.name}
                        </h4>
                        {service.isBase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            <ShieldCheck className="w-3 h-3" />
                            Servicio Base
                          </span>
                        )}
                        {service.durationYears && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <Clock className="w-3 h-3" />
                            {service.durationYears} {service.durationYears === 1 ? 'año' : 'años'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{leadsCount} médicos interesados/contratados</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {formatCurrency(service.price)}
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">USD / {service.durationYears || 1} {service.durationYears === 1 ? 'año' : 'años'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(service)}
                          title="Editar precio o descripción"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!service.isBase && (
                          <button
                            onClick={() => handleDelete(service.id)}
                            title="Eliminar servicio"
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reset to base services helper */}
          <div className="pt-2 flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
            <span>2 servicios de base garantizados: 1 año ($99) y 2 años ($150).</span>
            <button
              onClick={handleResetToDefaults}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] underline cursor-pointer"
            >
              Restablecer valores iniciales
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:px-6 sm:py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Todos los servicios se guardan de forma 100% local en tu navegador / hosting.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition-colors"
          >
            Cerrar Catálogo
          </button>
        </div>

      </div>
    </div>
  );
};
