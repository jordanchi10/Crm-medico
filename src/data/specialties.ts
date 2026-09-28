import { MedicalSpecialty } from '../types';

export interface SpecialtyMeta {
  name: MedicalSpecialty;
  color: string;
  bgLight: string;
  borderLight: string;
  category: 'Clínica' | 'Quirúrgica' | 'Diagnóstica' | 'Especializada' | 'Personalizada';
  isCustom?: boolean;
}

const CUSTOM_SPECIALTIES_KEY = 'medcrm_custom_specialties_v1';

// 25+ Top Most Requested Medical Specialties in Ecuador
export const BASE_SPECIALTIES_LIST: SpecialtyMeta[] = [
  {
    name: 'Cardiología',
    color: 'text-red-700',
    bgLight: 'bg-red-50',
    borderLight: 'border-red-200',
    category: 'Clínica'
  },
  {
    name: 'Pediatría',
    color: 'text-teal-700',
    bgLight: 'bg-teal-50',
    borderLight: 'border-teal-200',
    category: 'Clínica'
  },
  {
    name: 'Ginecología y Obstetricia',
    color: 'text-fuchsia-700',
    bgLight: 'bg-fuchsia-50',
    borderLight: 'border-fuchsia-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Traumatología y Ortopedia',
    color: 'text-orange-700',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Dermatología',
    color: 'text-pink-700',
    bgLight: 'bg-pink-50',
    borderLight: 'border-pink-200',
    category: 'Clínica'
  },
  {
    name: 'Odontología / Ortodoncia',
    color: 'text-cyan-700',
    bgLight: 'bg-cyan-50',
    borderLight: 'border-cyan-200',
    category: 'Especializada'
  },
  {
    name: 'Medicina General / Familiar',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    category: 'Clínica'
  },
  {
    name: 'Cirugía General',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Neurología',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    category: 'Clínica'
  },
  {
    name: 'Oftalmología',
    color: 'text-sky-700',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Otorrinolaringología',
    color: 'text-teal-800',
    bgLight: 'bg-teal-50',
    borderLight: 'border-teal-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Gastroenterología',
    color: 'text-amber-800',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    category: 'Clínica'
  },
  {
    name: 'Endocrinología',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    category: 'Clínica'
  },
  {
    name: 'Urología',
    color: 'text-yellow-800',
    bgLight: 'bg-yellow-50',
    borderLight: 'border-yellow-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Psiquiatría',
    color: 'text-violet-700',
    bgLight: 'bg-violet-50',
    borderLight: 'border-violet-200',
    category: 'Clínica'
  },
  {
    name: 'Neumología',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    category: 'Clínica'
  },
  {
    name: 'Oncología',
    color: 'text-red-800',
    bgLight: 'bg-red-50',
    borderLight: 'border-red-200',
    category: 'Especializada'
  },
  {
    name: 'Reumatología',
    color: 'text-orange-800',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    category: 'Clínica'
  },
  {
    name: 'Nutrición y Dietética',
    color: 'text-lime-800',
    bgLight: 'bg-lime-50',
    borderLight: 'border-lime-200',
    category: 'Especializada'
  },
  {
    name: 'Psicología Clínica',
    color: 'text-indigo-800',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    category: 'Especializada'
  },
  {
    name: 'Nefrología',
    color: 'text-cyan-800',
    bgLight: 'bg-cyan-50',
    borderLight: 'border-cyan-200',
    category: 'Clínica'
  },
  {
    name: 'Medicina Interna',
    color: 'text-blue-800',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    category: 'Clínica'
  },
  {
    name: 'Cirugía Plástica y Estética',
    color: 'text-fuchsia-800',
    bgLight: 'bg-fuchsia-50',
    borderLight: 'border-fuchsia-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Fisioterapia y Rehabilitación',
    color: 'text-emerald-800',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    category: 'Especializada'
  },
  {
    name: 'Alergología e Inmunología',
    color: 'text-purple-800',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    category: 'Clínica'
  },
  {
    name: 'Geriatría',
    color: 'text-stone-700',
    bgLight: 'bg-stone-50',
    borderLight: 'border-stone-200',
    category: 'Clínica'
  },
  {
    name: 'Infectología',
    color: 'text-rose-800',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    category: 'Clínica'
  },
  {
    name: 'Cirugía Vascular',
    color: 'text-red-900',
    bgLight: 'bg-red-50',
    borderLight: 'border-red-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Hematología',
    color: 'text-rose-900',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    category: 'Clínica'
  },
  {
    name: 'Medicina Estética',
    color: 'text-pink-800',
    bgLight: 'bg-pink-50',
    borderLight: 'border-pink-200',
    category: 'Especializada'
  },
  {
    name: 'Neurocirugía',
    color: 'text-violet-900',
    bgLight: 'bg-violet-50',
    borderLight: 'border-violet-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Radiología e Imagenología',
    color: 'text-slate-800',
    bgLight: 'bg-slate-100',
    borderLight: 'border-slate-300',
    category: 'Diagnóstica'
  },
  {
    name: 'Anestesiología',
    color: 'text-zinc-700',
    bgLight: 'bg-zinc-100',
    borderLight: 'border-zinc-300',
    category: 'Especializada'
  },
  {
    name: 'Otra Especialidad',
    color: 'text-gray-700',
    bgLight: 'bg-gray-100',
    borderLight: 'border-gray-200',
    category: 'Especializada'
  }
];

export let SPECIALTIES_LIST: SpecialtyMeta[] = [...BASE_SPECIALTIES_LIST];

const PALETTE_POOL = [
  { color: 'text-teal-700', bgLight: 'bg-teal-50', borderLight: 'border-teal-200' },
  { color: 'text-cyan-700', bgLight: 'bg-cyan-50', borderLight: 'border-cyan-200' },
  { color: 'text-indigo-700', bgLight: 'bg-indigo-50', borderLight: 'border-indigo-200' },
  { color: 'text-purple-700', bgLight: 'bg-purple-50', borderLight: 'border-purple-200' },
  { color: 'text-rose-700', bgLight: 'bg-rose-50', borderLight: 'border-rose-200' },
  { color: 'text-amber-700', bgLight: 'bg-amber-50', borderLight: 'border-amber-200' },
  { color: 'text-emerald-700', bgLight: 'bg-emerald-50', borderLight: 'border-emerald-200' },
  { color: 'text-blue-700', bgLight: 'bg-blue-50', borderLight: 'border-blue-200' }
];

export function loadCustomSpecialties(): SpecialtyMeta[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SPECIALTIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading custom specialties', e);
    return [];
  }
}

export function saveCustomSpecialties(list: SpecialtyMeta[]) {
  try {
    localStorage.setItem(CUSTOM_SPECIALTIES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving custom specialties', e);
  }
}

export function getAllSpecialties(): SpecialtyMeta[] {
  const custom = loadCustomSpecialties();
  const map = new Map<string, SpecialtyMeta>();

  BASE_SPECIALTIES_LIST.forEach((s) => map.set(s.name.toLowerCase().trim(), s));
  custom.forEach((s) => map.set(s.name.toLowerCase().trim(), s));

  const merged = Array.from(map.values());
  SPECIALTIES_LIST = merged;
  return merged;
}

export function registerNewSpecialty(
  name: string,
  category: 'Clínica' | 'Quirúrgica' | 'Diagnóstica' | 'Especializada' | 'Personalizada' = 'Personalizada'
): SpecialtyMeta {
  const cleanName = name.trim();
  if (!cleanName) {
    return BASE_SPECIALTIES_LIST[0];
  }

  const existing = getAllSpecialties().find(
    (s) => s.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (existing) {
    return existing;
  }

  const customList = loadCustomSpecialties();
  const paletteIndex = customList.length % PALETTE_POOL.length;
  const palette = PALETTE_POOL[paletteIndex];

  const newSpec: SpecialtyMeta = {
    name: cleanName,
    color: palette.color,
    bgLight: palette.bgLight,
    borderLight: palette.borderLight,
    category,
    isCustom: true
  };

  customList.push(newSpec);
  saveCustomSpecialties(customList);
  SPECIALTIES_LIST = getAllSpecialties();

  return newSpec;
}

export const getSpecialtyMeta = (name: string): SpecialtyMeta => {
  if (!name) {
    return BASE_SPECIALTIES_LIST[0];
  }
  const all = getAllSpecialties();
  const match = all.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (match) return match;

  const charCode = name.charCodeAt(0) || 0;
  const palette = PALETTE_POOL[charCode % PALETTE_POOL.length];
  return {
    name,
    color: palette.color,
    bgLight: palette.bgLight,
    borderLight: palette.borderLight,
    category: 'Especializada'
  };
};

// Initial load
getAllSpecialties();
