import { MedicalLead } from '../types';

export const INITIAL_LEADS: MedicalLead[] = [
  {
    id: 'lead-ec-1',
    doctorName: 'Dr. Rodrigo Cruz Carrera',
    clinicOrHospital: 'Clínica Los Esteros, Consultorio 204',
    specialty: 'Cardiología',
    phone: '+593 99 412 3890',
    email: 'dr.cruz.cardiologia@med.ec',
    city: 'Manta',
    sector: 'Los Esteros',
    serviceId: 'srv-base-2anos',
    serviceName: 'Perfil Médico 2 años ($150)',
    stage: 'demo_agendada',
    estimatedValue: 150,
    paidAmount: 0,
    paymentStatus: 'pendiente',
    paymentMethod: 'Transferencia Banco Pichincha',
    lastContactDate: '2026-09-19',
    nextFollowUpDate: '2026-09-24',
    nextFollowUpTime: '11:00',
    expectedClosingDate: '2026-09-30',
    createdAt: '2026-09-12',
    notes: 'Interesado en suscripción bienal de perfil médico con botón directo de WhatsApp para pacientes de cardiología en Los Esteros.',
    tags: ['Alta Prioridad', 'Manabí'],
    history: [
      {
        id: 'act-1-1',
        date: '2026-09-12 10:15',
        type: 'creacion',
        description: 'Prospecto médico captado en sector Los Esteros, Manta.'
      },
      {
        id: 'act-1-2',
        date: '2026-09-15 16:30',
        type: 'whatsapp',
        description: 'WhatsApp con propuesta de Perfil Médico 2 años ($150) enviado.'
      },
      {
        id: 'act-1-3',
        date: '2026-09-19 10:00',
        type: 'etapa',
        description: 'Avanzado a Demo Agendada para el 24 de septiembre.'
      }
    ]
  },
  {
    id: 'lead-ec-2',
    doctorName: 'Dra. Mariana Valenzuela Pazmiño',
    clinicOrHospital: 'Centro Médico Jocay, Torre Médica, Cons. 105',
    specialty: 'Dermatología',
    phone: '+593 98 901 2345',
    email: 'dra.valenzuela@dermasolaris.ec',
    city: 'Manta',
    sector: 'Jocay',
    serviceId: 'srv-base-2anos',
    serviceName: 'Perfil Médico 2 años ($150)',
    stage: 'ganado',
    estimatedValue: 150,
    paidAmount: 150,
    paymentStatus: 'pagado',
    paymentMethod: 'Transferencia Banco Guayaquil',
    lastContactDate: '2026-09-21',
    nextFollowUpDate: '2026-10-15',
    nextFollowUpTime: '16:00',
    expectedClosingDate: '2026-09-21',
    createdAt: '2026-09-02',
    notes: 'Contrató Perfil Médico 2 años ($150) para su consultorio dermatológico en Jocay. Pagó completo vía Banco Guayaquil.',
    tags: ['Cliente VIP', 'Jocay'],
    history: [
      {
        id: 'act-2-1',
        date: '2026-09-02 09:00',
        type: 'creacion',
        description: 'Prospecto creado en sector Jocay, Manta.'
      },
      {
        id: 'act-2-2',
        date: '2026-09-10 11:30',
        type: 'cita',
        description: 'Reunión presencial en su consultorio de Jocay.'
      },
      {
        id: 'act-2-3',
        date: '2026-09-21 10:20',
        type: 'pago',
        description: 'Pago total recibido de $150 USD vía Banco Guayaquil. Perfil médico 2 años activado.'
      }
    ]
  }
];
