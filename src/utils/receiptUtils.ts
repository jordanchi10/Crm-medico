import { MedicalLead } from '../types';
import { formatCurrency } from './storage';

export interface PaymentReceiptData {
  receiptNumber: string;
  authorizationCode: string;
  issueDate: string; // YYYY-MM-DD
  doctorName: string;
  specialty: string;
  clinicOrHospital: string;
  city: string;
  sector: string;
  phone: string;
  email: string;
  planName: string;
  durationYears: number;
  validFrom: string;
  validUntil: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  statusLabel: string;
  issuerCompany: string;
  rucCompany: string;
  supportPhone: string;
}

/**
 * Builds payment receipt data object for a lead.
 */
export function buildPaymentReceiptData(lead: MedicalLead): PaymentReceiptData {
  const isTwoYears = lead.estimatedValue === 150 || (lead.serviceName && lead.serviceName.includes('2'));
  const durationYears = lead.renewalYears || (isTwoYears ? 2 : 1);
  const amount = lead.paidAmount > 0 ? lead.paidAmount : (lead.estimatedValue || (durationYears === 2 ? 150 : 99));
  
  // Format receipt number
  const uniqueCode = lead.id.replace(/[^0-9]/g, '').slice(-4).padStart(4, '8');
  const receiptNumber = lead.receiptNumber || `REC-2026-EC-${uniqueCode}`;

  const today = new Date().toISOString().split('T')[0];
  const validFrom = lead.createdAt || today;

  // Calculate validity end
  let validUntil = lead.renewalDate;
  if (!validUntil) {
    const parts = validFrom.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10) + durationYears;
      validUntil = `${y}-${parts[1]}-${parts[2]}`;
    } else {
      validUntil = `${new Date().getFullYear() + durationYears}-12-31`;
    }
  }

  // Generate deterministic hash for verification
  const hashSeed = `${receiptNumber}-${lead.doctorName}-${amount}`;
  let hashNum = 0;
  for (let i = 0; i < hashSeed.length; i++) {
    hashNum = (hashNum << 5) - hashNum + hashSeed.charCodeAt(i);
    hashNum |= 0;
  }
  const authorizationCode = `AUTH-${Math.abs(hashNum).toString(16).toUpperCase().padStart(8, '0')}`;

  return {
    receiptNumber,
    authorizationCode,
    issueDate: today,
    doctorName: lead.doctorName,
    specialty: lead.specialty,
    clinicOrHospital: lead.clinicOrHospital || 'Consultorio Médico Privado',
    city: lead.city || 'Manta',
    sector: lead.sector || 'Centro',
    phone: lead.phone,
    email: lead.email || 'No registrado',
    planName: lead.serviceName || (durationYears === 2 ? 'Perfil Médico Especialista 2 Años' : 'Perfil Médico Especialista 1 Año'),
    durationYears,
    validFrom,
    validUntil,
    totalAmount: lead.estimatedValue || amount,
    paidAmount: amount,
    paymentMethod: lead.paymentMethod || 'Transferencia Bancaria',
    paymentStatus: lead.paymentStatus || 'pagado',
    statusLabel: 'PAGADO Y VALIDADO',
    issuerCompany: 'MÉDICO EC S.A.S.',
    rucCompany: '1391789234001',
    supportPhone: '+593 99 876 5432'
  };
}

/**
 * Prepares clean, professional WhatsApp text receipt for sending to doctor or secretary.
 */
export function buildReceiptWhatsAppText(receipt: PaymentReceiptData): string {
  return (
    `📋 *COMPROBANTE OFICIAL DE PAGO - MÉDICO EC* 🇪🇨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🧾 *No. Recibo:* ${receipt.receiptNumber}\n` +
    `🔐 *Código Aut.:* ${receipt.authorizationCode}\n` +
    `📅 *Fecha de Emisión:* ${receipt.issueDate}\n\n` +
    `👨‍⚕️ *Especialista:* ${receipt.doctorName}\n` +
    `🩺 *Especialidad:* ${receipt.specialty}\n` +
    `🏥 *Centro/Consultorio:* ${receipt.clinicOrHospital}\n` +
    `📍 *Ubicación:* ${receipt.city} (${receipt.sector})\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *Servicio Adquirido:*\n` +
    `• ${receipt.planName}\n` +
    `• Vigencia: ${receipt.validFrom} al ${receipt.validUntil} (${receipt.durationYears} ${receipt.durationYears === 1 ? 'año' : 'años'})\n\n` +
    `💰 *Monto Cancelado:* $${receipt.paidAmount}.00 USD\n` +
    `💳 *Método de Pago:* ${receipt.paymentMethod}\n` +
    `✅ *Estado:* ${receipt.statusLabel}\n` +
    `*(Si solicitó factura digital legal SRI, aplica el 15% adicional emitido a su RUC)*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Su consultorio digital ya se encuentra en proceso de activación e indexación en Google y motores de IA.\n\n` +
    `¡Agradecemos su confianza en Médico EC!`
  );
}
