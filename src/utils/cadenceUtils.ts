import { MedicalLead } from '../types';
import { formatCurrency } from './storage';

export interface CadenceStep {
  id: number;
  dayTarget: number;
  title: string;
  tagline: string;
  badge: string;
  color: string;
  objective: string;
  generateMessage: (lead: MedicalLead) => string;
}

export const CADENCE_STEPS: CadenceStep[] = [
  {
    id: 1,
    dayTarget: 1,
    title: 'Paso 1: Consultorio Digital & Búsquedas con IA',
    tagline: 'Día 1 · Primer contacto',
    badge: 'Día 1',
    color: 'teal',
    objective: 'Presentar el consultorio digital vinculado a Google, Gemini y ChatGPT para su especialidad.',
    generateMessage: (lead) => {
      const city = lead.city || 'su ciudad';
      const sector = lead.sector ? ` en ${lead.sector}` : '';
      return (
        `Estimado(a) *${lead.doctorName}*, un cordial saludo.\n\n` +
        `Le contactamos de *Médico EC* 🇪🇨 conociendo su labor en *${lead.specialty}* en ${lead.clinicOrHospital}${sector} (${city}).\n\n` +
        `Hoy los pacientes buscan especialistas mediante *Google y motores de IA (Gemini y ChatGPT)*. Creamos su *Consultorio Digital (Landing Page Médica)* para posicionar su consulta con citas online, certificación SENESCYT y redes.\n\n` +
        `Planes accesibles de $99/año o $150/2 años. ¿Le puedo enviar un enlace de muestra de 1 minuto?`
      );
    }
  },
  {
    id: 2,
    dayTarget: 3,
    title: 'Paso 2: Certificación SENESCYT & Sociedades',
    tagline: 'Día 3 · Autoridad médica',
    badge: 'Día 3',
    color: 'sky',
    objective: 'Explicar la acreditación con código SENESCYT y sociedades ante Google para destacar sobre otros médicos.',
    generateMessage: (lead) => {
      const city = lead.city || 'Ecuador';
      return (
        `Dr(a). *${lead.doctorName}*, buenos días de *Médico EC*.\n\n` +
        `En su consultorio digital registramos su *código de especialista SENESCYT* y sociedades médicas para que Google y la IA certifiquen su autoridad médica y lo recomienden ante pacientes en ${city} que buscan *${lead.specialty}*.\n\n` +
        `También incluye fotos de casos, blog y videos de TikTok/Instagram. ¿Le gustaría ver un boceto rápido?`
      );
    }
  },
  {
    id: 3,
    dayTarget: 5,
    title: 'Paso 3: Demo de Automatización de Citas',
    tagline: 'Día 5 · Demostración rápida',
    badge: 'Día 5',
    color: 'indigo',
    objective: 'Mostrar el sistema donde el paciente escoge servicio, hora y llena datos para la pre-consulta.',
    generateMessage: (lead) => {
      return (
        `Estimado(a) *${lead.doctorName}*, un gusto saludarle.\n\n` +
        `Le preparamos una demo rápida del sistema de *agenda de citas*: sus pacientes eligen servicio, horario y llenan datos de pre-consulta sin saturar a su secretaria.\n\n` +
        `Todo llega en tiempo real a su WhatsApp. ¿Le convendría hoy o mañana para enviarle el enlace?`
      );
    }
  },
  {
    id: 4,
    dayTarget: 7,
    title: 'Paso 4: Oferta Oficial - 1 Año ($99) o 2 Años ($150)',
    tagline: 'Día 7 · Cierre comercial',
    badge: 'Día 7',
    color: 'emerald',
    objective: 'Presentar los planes de 1 año ($99 USD) o 2 años ($150 USD) con todo incluido.',
    generateMessage: (lead) => {
      const city = lead.city || 'Manta';
      return (
        `Dr(a). *${lead.doctorName}*, un gusto saludarle de *Médico EC*.\n\n` +
        `Para su consulta en *${city}*, tenemos activos nuestros planes oficiales para *${lead.specialty}*:\n\n` +
        `⭐ *Plan 1 año: $99 USD*\n` +
        `🔥 *Plan 2 años: $150 USD* (Ahorro del 25%)\n\n` +
        `Incluye: Landing page médica con Google + IA, citas online, blog, redes y acreditación SENESCYT.\n` +
        `*(Nota: Si requiere factura legal digital SRI, aplica un 15% adicional).* \n\n` +
        `¿Cuál de los dos planes prefiere activar para su consultorio en ${lead.clinicOrHospital}?`
      );
    }
  },
  {
    id: 5,
    dayTarget: 12,
    title: 'Paso 5: Coordinación con Asistente / Secretaria',
    tagline: 'Día 12 · Re-conexión',
    badge: 'Día 12',
    color: 'amber',
    objective: 'Facilitar la puesta en marcha coordinando el material con su asistente o secretaria.',
    generateMessage: (lead) => {
      return (
        `Hola Dr(a). *${lead.doctorName}*, entendemos que sus consultas y cirugías toman casi todo su día.\n\n` +
        `Desde *Médico EC* podemos coordinar directamente con su asistente o secretaria la recopilación de fotos y títulos para no quitarle tiempo.\n\n` +
        `¿Nos podría facilitar su contacto para coordinar la activación de su consultorio digital?`
      );
    }
  },
  {
    id: 6,
    dayTarget: 20,
    title: 'Paso 6: Liberación de Cupo de Especialidad',
    tagline: 'Día 20 · Último aviso',
    badge: 'Día 20',
    color: 'rose',
    objective: 'Aviso final respetuoso para confirmar si desea activar el cupo de $99 o $150 antes de asignarlo.',
    generateMessage: (lead) => {
      const sector = lead.sector || 'su sector';
      return (
        `Estimado(a) *${lead.doctorName}*, un cordial saludo de *Médico EC*.\n\n` +
        `Le consultamos si aún desea activar su *Consultorio Digital* para *${lead.specialty}* en ${sector}.\n\n` +
        `Para mantener exclusividad en búsquedas por zona, liberamos los cupos este fin de semana si no se activan.\n\n` +
        `Si desea activarlo con su tarifa de $99 (1 año) o $150 (2 años), responda este mensaje y comenzamos hoy mismo.`
      );
    }
  }
];

export interface DoctorCadenceStatus {
  lead: MedicalLead;
  daysSinceLastContact: number;
  daysSinceCreated: number;
  currentStep: CadenceStep;
  nextStep: CadenceStep | null;
  isDueForAction: boolean;
  statusText: string;
}

/**
 * Calculates which cadence step a doctor should currently receive based on elapsed days.
 */
export function getDoctorCadenceStatus(lead: MedicalLead): DoctorCadenceStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const contactDate = lead.lastContactDate ? new Date(lead.lastContactDate + 'T00:00:00') : new Date(lead.createdAt + 'T00:00:00');
  const createdDate = new Date(lead.createdAt + 'T00:00:00');

  const diffContact = Math.max(0, Math.floor((today.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24)));
  const diffCreated = Math.max(0, Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Find step based on days passed since contact / registration
  let stepIndex = 0;
  if (diffCreated >= 18) {
    stepIndex = 5; // Step 6
  } else if (diffCreated >= 10) {
    stepIndex = 4; // Step 5
  } else if (diffCreated >= 6) {
    stepIndex = 3; // Step 4
  } else if (diffCreated >= 4) {
    stepIndex = 2; // Step 3
  } else if (diffCreated >= 2) {
    stepIndex = 1; // Step 2
  } else {
    stepIndex = 0; // Step 1
  }

  const currentStep = CADENCE_STEPS[stepIndex];
  const nextStep = stepIndex < CADENCE_STEPS.length - 1 ? CADENCE_STEPS[stepIndex + 1] : null;

  // Due if more than 2 days without touchpoint and not won/lost
  const isDueForAction = diffContact >= 2 && lead.stage !== 'ganado' && lead.stage !== 'perdido';
  
  let statusText = `${diffContact === 0 ? 'Contactado hoy' : `Hace ${diffContact} días`}`;
  if (isDueForAction) {
    statusText = `Toca enviar ${currentStep.badge}`;
  }

  return {
    lead,
    daysSinceLastContact: diffContact,
    daysSinceCreated: diffCreated,
    currentStep,
    nextStep,
    isDueForAction,
    statusText
  };
}
