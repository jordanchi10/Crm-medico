import { MedicalService } from '../types';

export const BASE_SERVICES: MedicalService[] = [
  {
    id: 'srv-base-1ano',
    name: 'Perfil Médico 1 año',
    price: 99,
    durationYears: 1,
    description: 'Perfil médico profesional por 12 meses: posicionamiento SEO local, ficha de contacto, botón WhatsApp directo y presencia médica verificada.',
    isBase: true
  },
  {
    id: 'srv-base-2anos',
    name: 'Perfil Médico 2 años',
    price: 150,
    durationYears: 2,
    description: 'Plan preferencial bianual por 24 meses (ahorro del 25%): posicionamiento prioritario en buscadores médicos, soporte continuo y actualización de consultorios.',
    isBase: true
  }
];

const SERVICES_STORAGE_KEY = 'medcrm_services_v1';

export function loadServices(): MedicalService[] {
  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) {
      saveServices(BASE_SERVICES);
      return BASE_SERVICES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveServices(BASE_SERVICES);
      return BASE_SERVICES;
    }

    // Ensure base services are always present
    const baseIds = new Set(BASE_SERVICES.map(b => b.id));
    const merged = [...parsed];
    for (const baseSrv of BASE_SERVICES) {
      if (!merged.some(s => s.id === baseSrv.id || s.name.toLowerCase() === baseSrv.name.toLowerCase())) {
        merged.unshift(baseSrv);
      }
    }
    return merged;
  } catch (e) {
    console.error('Error loading services from localStorage', e);
    return BASE_SERVICES;
  }
}

export function saveServices(services: MedicalService[]): void {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error('Error saving services to localStorage', e);
  }
}

export function resetServicesToDefault(): MedicalService[] {
  saveServices(BASE_SERVICES);
  return BASE_SERVICES;
}
