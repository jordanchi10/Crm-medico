import { MedicalService } from '../types';

export const BASE_SERVICES: MedicalService[] = [
  {
    id: 'srv-base-1ano',
    name: 'Consultorio Digital (1 año - $99)',
    price: 99,
    durationYears: 1,
    description: 'Landing page médica por 12 meses: conectada a Google y búsquedas con IA (Gemini/ChatGPT), automatización de citas, fotos de casos, blog, redes (TikTok/IG) y código SENESCYT.',
    isBase: true
  },
  {
    id: 'srv-base-2anos',
    name: 'Consultorio Digital (2 años - $150)',
    price: 150,
    durationYears: 2,
    description: 'Plan preferencial bianual por 24 meses (ahorro del 25%): landing page médica completa, Google + IA, sistema de citas online con pre-consulta, blog, redes y acreditación médica.',
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

    // Filter out obsolete legacy services with old prices (e.g. 2100, 2800, 1200, > 300)
    const validCustom = parsed.filter(
      (s) => s && !s.isBase && typeof s.price === 'number' && s.price > 0 && s.price <= 300 && s.price !== 2100 && s.price !== 2800 && s.price !== 1200
    );

    const merged: MedicalService[] = [...BASE_SERVICES, ...validCustom];
    saveServices(merged);
    return merged;
  } catch (e) {
    console.error('Error loading services from localStorage', e);
    saveServices(BASE_SERVICES);
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
