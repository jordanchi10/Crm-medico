import { MedicalSpecialty } from '../types';

export interface SpecialtyMeta {
  name: MedicalSpecialty;
  color: string;
  bgLight: string;
  borderLight: string;
  category: 'Clínica' | 'Quirúrgica' | 'Diagnóstica' | 'Especializada';
}

export const SPECIALTIES_LIST: SpecialtyMeta[] = [
  {
    name: 'Cardiología',
    color: 'text-red-700',
    bgLight: 'bg-red-50',
    borderLight: 'border-red-200',
    category: 'Clínica'
  },
  {
    name: 'Dermatología',
    color: 'text-pink-700',
    bgLight: 'bg-pink-50',
    borderLight: 'border-pink-200',
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
    name: 'Odontología / Ortodoncia',
    color: 'text-cyan-700',
    bgLight: 'bg-cyan-50',
    borderLight: 'border-cyan-200',
    category: 'Especializada'
  },
  {
    name: 'Traumatología y Ortopedia',
    color: 'text-orange-700',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Oftalmología',
    color: 'text-sky-700',
    bgLight: 'bg-sky-50',
    borderLight: 'border-sky-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Cirugía Plástica y Estética',
    color: 'text-violet-700',
    bgLight: 'bg-violet-50',
    borderLight: 'border-violet-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Neurología',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-200',
    category: 'Clínica'
  },
  {
    name: 'Medicina Interna',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    category: 'Clínica'
  },
  {
    name: 'Urología',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Otorrinolaringología',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    category: 'Quirúrgica'
  },
  {
    name: 'Psiquiatría',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200',
    category: 'Clínica'
  },
  {
    name: 'Oncología',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
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

export const getSpecialtyMeta = (name: MedicalSpecialty): SpecialtyMeta => {
  return (
    SPECIALTIES_LIST.find((s) => s.name === name) || {
      name,
      color: 'text-gray-700',
      bgLight: 'bg-gray-100',
      borderLight: 'border-gray-200',
      category: 'Especializada'
    }
  );
};
