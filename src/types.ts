export type MedicalSpecialty =
  | 'Cardiología'
  | 'Dermatología'
  | 'Pediatría'
  | 'Ginecología y Obstetricia'
  | 'Odontología / Ortodoncia'
  | 'Traumatología y Ortopedia'
  | 'Oftalmología'
  | 'Cirugía Plástica y Estética'
  | 'Neurología'
  | 'Medicina Interna'
  | 'Urología'
  | 'Otorrinolaringología'
  | 'Psiquiatría'
  | 'Oncología'
  | 'Otra Especialidad';

export type StageId =
  | 'prospecto'
  | 'contactado'
  | 'demo_agendada'
  | 'propuesta_enviada'
  | 'ganado'
  | 'perdido';

export interface StageConfig {
  id: StageId;
  name: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export type PaymentStatus = 'pagado' | 'pendiente' | 'parcial' | 'no_aplica';

export type PaymentMethod =
  | 'Transferencia Banco Pichincha'
  | 'Transferencia Banco Guayaquil'
  | 'Transferencia Produbanco'
  | 'Transferencia Interbancaria (BCE / SPI)'
  | 'Deuna! / PayPhone'
  | 'Tarjeta de Crédito / Débito (Datafast / Medianet)'
  | 'Efectivo en Consultorio'
  | 'Suscripción Recurrente'
  | 'Transferencia Bancaria (SPEI / IBAN)'
  | 'Tarjeta de Crédito / Débito'
  | 'Link de Pago (MercadoPago / Stripe)'
  | 'No Definido';

export interface MedicalService {
  id: string;
  name: string; // ej. Perfil Médico 1 año, Perfil Médico 2 años
  price: number; // 99, 150
  durationYears?: number;
  description: string;
  isBase?: boolean;
}

export interface ActivityLog {
  id: string;
  date: string;
  type: 'creacion' | 'etapa' | 'whatsapp' | 'pago' | 'nota' | 'cita';
  description: string;
  user?: string;
}

export interface MedicalLead {
  id: string;
  doctorName: string; // ej. Dr. Carlos Mendoza
  clinicOrHospital: string; // ej. Hospital Ángeles del Pedregal, Consultorio 312
  specialty: MedicalSpecialty;
  phone: string; // WhatsApp phone con código de país
  email: string;
  city?: string;
  sector?: string; // ej. Centro, Jocay, Pradera, Los Esteros, Tarqui, Barbasquillo, etc.
  serviceId?: string; // id del servicio contratado
  serviceName?: string; // ej. Perfil Médico 1 año ($99) o Perfil Médico 2 años ($150)
  stage: StageId;
  estimatedValue: number; // Monto estimado o pactado en $
  paidAmount: number; // Monto efectivamente pagado
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  lastContactDate: string; // YYYY-MM-DD
  nextFollowUpDate: string; // YYYY-MM-DD
  nextFollowUpTime?: string; // HH:mm
  expectedClosingDate?: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
  notes: string;
  tags?: string[];
  history: ActivityLog[];
}

export type MediaAttachmentType = 'image' | 'pdf' | 'audio';

export interface TemplateMediaAttachment {
  id: string;
  type: MediaAttachmentType;
  title: string;             // Nombre descriptivo, ej. "Infografía Perfil Médico", "Dossier Comercial 2026"
  fileName: string;          // Nombre del archivo, ej. "infografia-servicios.png", "propuesta.pdf", "audio-presentacion.mp3"
  fileSize?: string;         // Tamaño aproximado, ej. "1.2 MB", "450 KB"
  url: string;               // URL web o data URL base64 del archivo
  caption?: string;          // Mensaje de texto que acompaña o contextualiza el archivo en WhatsApp
  duration?: string;         // Duración para archivos MP3 ej. "0:35"
  description?: string;      // Objetivo o instrucción de envío
}

export interface WhatsAppTemplate {
  id: string;
  stageId: StageId;
  title: string;
  description: string;
  messageText: string; // text with placeholders: [Doctor], [Especialidad], [Clinica], [Monto], [Fecha], [MetodoPago]
  attachments?: TemplateMediaAttachment[]; // Secuencia ordenada de archivos a enviar (Imágenes, PDFs, MP3)
}

export interface SpecialtyConversionMetric {
  specialty: MedicalSpecialty;
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  inProgressLeads: number;
  conversionRate: number; // percentage (0 - 100)
  totalRevenue: number;
  averageTicket: number;
}
