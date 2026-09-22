import { LeadPriority } from '../types';

export interface PriorityMeta {
  id: LeadPriority;
  label: string;
  bgLight: string;
  color: string;
  borderLight: string;
  badgeBg: string;
  dotColor: string;
  orderWeight: number;
}

export const PRIORITIES_CONFIG: Record<LeadPriority, PriorityMeta> = {
  alta: {
    id: 'alta',
    label: 'Alta',
    bgLight: 'bg-rose-50',
    color: 'text-rose-700',
    borderLight: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    dotColor: 'bg-rose-500',
    orderWeight: 3
  },
  media: {
    id: 'media',
    label: 'Media',
    bgLight: 'bg-amber-50',
    color: 'text-amber-700',
    borderLight: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    dotColor: 'bg-amber-500',
    orderWeight: 2
  },
  baja: {
    id: 'baja',
    label: 'Baja',
    bgLight: 'bg-slate-50',
    color: 'text-slate-600',
    borderLight: 'border-slate-200',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-400',
    orderWeight: 1
  }
};

export const getPriorityMeta = (priority?: LeadPriority): PriorityMeta => {
  if (!priority || !PRIORITIES_CONFIG[priority]) {
    return PRIORITIES_CONFIG.media;
  }
  return PRIORITIES_CONFIG[priority];
};
