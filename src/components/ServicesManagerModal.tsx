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
      alert('Los 2 servicios de base (1 año en $99 y 2 años en $150) no se pueden eliminar.');
      return;
    }
    if (window.confirm(`¿Deseas eliminar el servicio "${srv?.name}"?`)) {
      const updatedList = services.filter(s => s.id !== serviceId);
      saveServices(updatedList);
      onUpdateServices(updatedList);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('¿Restablecer el catálogo a los 2 servicios de base ($99 y $150)?')) {
      const reset = resetServicesToDefault();
      onUpdateServices(reset);
    }
  };

  // Count leads per service
  const getLeadsCountForService = (service: MedicalService) => {
    return leads.filter(l => 
      l.serviceId === service.id || 
      (l.serviceName && l.serviceName.toLowerCase().includes(service.name.toLowerCase()))
    ).length;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white sm:rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
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
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Servicios disponibles:</span>
            <strong className="text-slate-900 font-bold">{services.length}</strong>
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
          
          {/* Create or Edit Form */}
          {isCreating && (
            <form onSubmit={handleSave} className="bg-teal-50/50 border-2 border-teal-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>{editingServiceId ? 'Editar Servicio Médico' : 'Crear Nuevo Servicio'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Perfil Médico 3 años VIP"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duración (Años)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descripción / Beneficios para el Doctor
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Posicionamiento en Google, botón de citas WhatsApp..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white"
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
                      ? 'bg-gradient-to-br from-white to-teal-50/30 border-teal-200 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {service.name}
                        </h4>
                        {service.isBase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                            <ShieldCheck className="w-3 h-3" />
                            Servicio Base
                          </span>
                        )}
                        {service.durationYears && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            <Clock className="w-3 h-3" />
                            {service.durationYears} {service.durationYears === 1 ? 'año' : 'años'}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{leadsCount} médicos interesados/contratados</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {formatCurrency(service.price)}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">USD / {service.durationYears || 1} {service.durationYears === 1 ? 'año' : 'años'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(service)}
                          title="Editar precio o descripción"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!service.isBase && (
                          <button
                            onClick={() => handleDelete(service.id)}
                            title="Eliminar servicio"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
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
          <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
            <span>2 servicios de base garantizados: 1 año ($99) y 2 años ($150).</span>
            <button
              onClick={handleResetToDefaults}
              className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
            >
              Restablecer valores iniciales
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Todos los servicios se guardan de forma 100% local en tu navegador / hosting.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Cerrar Catálogo
          </button>
        </div>

      </div>
    </div>
  );
};
