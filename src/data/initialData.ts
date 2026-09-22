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
  },
  {
    id: 'lead-ec-3',
    doctorName: 'Dr. Javier Beltrán Sodi',
    clinicOrHospital: 'Torre Médica Centro, Av. 2 y Calle 13',
    specialty: 'Cirugía Plástica y Estética',
    phone: '+593 99 112 2334',
    email: 'contacto@drjavierbeltran.ec',
    city: 'Manta',
    sector: 'Centro',
    serviceId: 'srv-base-1ano',
    serviceName: 'Perfil Médico 1 año ($99)',
    stage: 'ganado',
    estimatedValue: 99,
    paidAmount: 99,
    paymentStatus: 'pagado',
    paymentMethod: 'Deuna! / PayPhone',
    lastContactDate: '2026-09-19',
    nextFollowUpDate: '2026-09-26',
    nextFollowUpTime: '12:00',
    expectedClosingDate: '2026-09-19',
    createdAt: '2026-09-05',
    notes: 'Adquirió Perfil Médico 1 año ($99) pagado al instante con Deuna! en su clínica del Centro.',
    tags: ['Pagado Deuna', 'Centro'],
    history: [
      {
        id: 'act-3-1',
        date: '2026-09-05 12:00',
        type: 'creacion',
        description: 'Contacto captado en sector Centro.'
      },
      {
        id: 'act-3-2',
        date: '2026-09-19 15:30',
        type: 'pago',
        description: 'Pago de $99 USD confirmado por Deuna! / PayPhone.'
      }
    ]
  },
  {
    id: 'lead-ec-4',
    doctorName: 'Dra. Sofía Hinojosa Cordero',
    clinicOrHospital: 'Policlínico La Pradera, Av. 113',
    specialty: 'Pediatría',
    phone: '+593 98 776 6554',
    email: 'dra.hinojosa@praderamed.ec',
    city: 'Manta',
    sector: 'La Pradera',
    serviceId: 'srv-base-1ano',
    serviceName: 'Perfil Médico 1 año ($99)',
    stage: 'propuesta_enviada',
    estimatedValue: 99,
    paidAmount: 0,
    paymentStatus: 'pendiente',
    paymentMethod: 'Transferencia Produbanco',
    lastContactDate: '2026-09-21',
    nextFollowUpDate: '2026-09-25',
    nextFollowUpTime: '17:30',
    expectedClosingDate: '2026-09-28',
    createdAt: '2026-09-10',
    notes: 'Propuesta de Perfil Médico 1 año ($99) enviada para su consultorio pediátrico en La Pradera. Muy receptiva.',
    tags: ['La Pradera', 'En Evaluación'],
    history: [
      {
        id: 'act-4-1',
        date: '2026-09-10 14:10',
        type: 'creacion',
        description: 'Prospecto pediátrico registrado en La Pradera.'
      },
      {
        id: 'act-4-2',
        date: '2026-09-21 16:00',
        type: 'whatsapp',
        description: 'WhatsApp con propuesta económica $99 enviado al +593 98 776 6554.'
      }
    ]
  },
  {
    id: 'lead-ec-5',
    doctorName: 'Dr. Roberto Guajardo Viteri',
    clinicOrHospital: 'Clínica San Gregorio, Sector Tarqui',
    specialty: 'Ginecología y Obstetricia',
    phone: '+593 99 776 6554',
    email: 'dr.guajardo.gyn@sangregorio.ec',
    city: 'Manta',
    sector: 'Tarqui',
    serviceId: 'srv-base-2anos',
    serviceName: 'Perfil Médico 2 años ($150)',
    stage: 'contactado',
    estimatedValue: 150,
    paidAmount: 0,
    paymentStatus: 'no_aplica',
    paymentMethod: 'No Definido',
    lastContactDate: '2026-09-18',
    nextFollowUpDate: '2026-09-23',
    nextFollowUpTime: '15:00',
    expectedClosingDate: '2026-10-05',
    createdAt: '2026-09-18',
    notes: 'Respondió positivamente por WhatsApp solicitando información del plan de 2 años ($150) para su consulta obstétrica en Tarqui.',
    tags: ['Tarqui', 'Interesado'],
    history: [
      {
        id: 'act-5-1',
        date: '2026-09-18 10:00',
        type: 'creacion',
        description: 'Prospecto captado en Tarqui.'
      },
      {
        id: 'act-5-2',
        date: '2026-09-18 11:15',
        type: 'whatsapp',
        description: 'Respuesta cordial por WhatsApp confirmando recepción de información.'
      }
    ]
  },
  {
    id: 'lead-ec-6',
    doctorName: 'Dr. Esteban Morales Ponce',
    clinicOrHospital: 'Torre Médica Barbasquillo, Cons. 302',
    specialty: 'Traumatología y Ortopedia',
    phone: '+593 99 555 4433',
    email: 'dr.morales@traumabarbasquillo.ec',
    city: 'Manta',
    sector: 'Barbasquillo',
    serviceId: 'srv-base-2anos',
    serviceName: 'Perfil Médico 2 años ($150)',
    stage: 'prospecto',
    estimatedValue: 150,
    paidAmount: 0,
    paymentStatus: 'no_aplica',
    paymentMethod: 'No Definido',
    lastContactDate: '2026-09-22',
    nextFollowUpDate: '2026-09-23',
    nextFollowUpTime: '10:00',
    expectedClosingDate: '2026-10-10',
    createdAt: '2026-09-22',
    notes: 'Traumatólogo referente en sector Barbasquillo. Pendiente envío de primer mensaje de presentación.',
    tags: ['Nuevo', 'Barbasquillo'],
    history: [
      {
        id: 'act-6-1',
        date: '2026-09-22 09:30',
        type: 'creacion',
        description: 'Prospecto registrado desde directorio médico de Barbasquillo.'
      }
    ]
  },
  {
    id: 'lead-ec-7',
    doctorName: 'Dra. Marcela Cevallos Andrade',
    clinicOrHospital: 'Centro Médico La Pradera, Consultorio 12',
    specialty: 'Odontología / Ortodoncia',
    phone: '+593 98 333 2211',
    email: 'dra.marcela@ortopraderamanta.ec',
    city: 'Manta',
    sector: 'La Pradera',
    serviceId: 'srv-base-1ano',
    serviceName: 'Perfil Médico 1 año ($99)',
    stage: 'ganado',
    estimatedValue: 99,
    paidAmount: 99,
    paymentStatus: 'pagado',
    paymentMethod: 'Transferencia Banco Pichincha',
    lastContactDate: '2026-09-20',
    nextFollowUpDate: '2026-10-20',
    nextFollowUpTime: '11:30',
    expectedClosingDate: '2026-09-20',
    createdAt: '2026-09-08',
    notes: 'Odontóloga en La Pradera. Contrató Perfil 1 año ($99). Pagado vía Banco Pichincha.',
    tags: ['Cliente Activo', 'La Pradera'],
    history: [
      {
        id: 'act-7-1',
        date: '2026-09-08 11:00',
        type: 'creacion',
        description: 'Prospecto registrado en La Pradera.'
      },
      {
        id: 'act-7-2',
        date: '2026-09-20 16:45',
        type: 'pago',
        description: 'Pago recibido de $99 USD por transferencia Pichincha.'
      }
    ]
  },
  {
    id: 'lead-ec-8',
    doctorName: 'Dr. Fernando Zambrano Intriago',
    clinicOrHospital: 'Clínica Los Esteros, Sala de Urgencias y Consulta Externa',
    specialty: 'Medicina Interna',
    phone: '+593 99 888 7766',
    email: 'dr.zambrano@internaesteros.ec',
    city: 'Manta',
    sector: 'Los Esteros',
    serviceId: 'srv-base-1ano',
    serviceName: 'Perfil Médico 1 año ($99)',
    stage: 'contactado',
    estimatedValue: 99,
    paidAmount: 0,
    paymentStatus: 'no_aplica',
    paymentMethod: 'No Definido',
    lastContactDate: '2026-09-22',
    nextFollowUpDate: '2026-09-24',
    nextFollowUpTime: '14:30',
    expectedClosingDate: '2026-10-02',
    createdAt: '2026-09-21',
    notes: 'Internista en Los Esteros. Mostró interés en aparecer en directorio de médicos locales con WhatsApp.',
    tags: ['Los Esteros', 'Contacto Inicial'],
    history: [
      {
        id: 'act-8-1',
        date: '2026-09-21 14:00',
        type: 'creacion',
        description: 'Registro de doctor en Los Esteros.'
      }
    ]
  }
];
