import { StageConfig } from '../types';

export const STAGES: StageConfig[] = [
  {
    id: 'prospecto',
    name: 'Nuevo Prospecto',
    description: 'Médicos identificados, aún sin contactar',
    color: 'slate',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-300'
  },
  {
    id: 'contactado',
    name: 'Primer Contacto',
    description: 'Mensaje de WhatsApp o llamada inicial realizada',
    color: 'blue',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-400'
  },
  {
    id: 'demo_agendada',
    name: 'Demo / Cita Agendada',
    description: 'Reunión o demostración clínica confirmada',
    color: 'amber',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    borderColor: 'border-amber-400'
  },
  {
    id: 'propuesta_enviada',
    name: 'Propuesta Enviada',
    description: 'Cotización u oferta de servicio bajo evaluación',
    color: 'purple',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-400'
  },
  {
    id: 'ganado',
    name: 'Cierre Ganado (Cliente)',
    description: 'Contrato firmado, pago recibido o en proceso',
    color: 'emerald',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderColor: 'border-emerald-500'
  },
  {
    id: 'perdido',
    name: 'Pospuesto / Perdido',
    description: 'Sin presupuesto o postergado para el futuro',
    color: 'rose',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-400'
  }
];

export const PAYMENT_METHODS = [
  'Transferencia Banco Pichincha',
  'Transferencia Banco Guayaquil',
  'Transferencia Produbanco',
  'Transferencia Interbancaria (BCE / SPI)',
  'Deuna! / PayPhone',
  'Tarjeta de Crédito / Débito (Datafast / Medianet)',
  'Efectivo en Consultorio',
  'Suscripción Recurrente',
  'Transferencia Bancaria (SPEI / IBAN)',
  'Tarjeta de Crédito / Débito',
  'Link de Pago (MercadoPago / Stripe)',
  'No Definido'
] as const;
