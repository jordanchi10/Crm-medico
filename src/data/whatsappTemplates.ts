import { WhatsAppTemplate } from '../types';
import { 
  SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI, 
  SAMPLE_WELCOME_BANNER_DATA_URI, 
  generateSampleMedicalProposalPdfBlob, 
  generateSampleVoiceNoteDataUri 
} from '../utils/mediaDemoAssets';

// Generar PDF y audio de muestra precargados
const samplePdf = generateSampleMedicalProposalPdfBlob({
  doctorName: 'Dr. Alejandro Morales',
  specialty: 'Cardiología',
  clinic: 'Clínica San Antonio (Manta)',
  price: '$99.00 USD'
});
const sampleVoiceNoteUri = generateSampleVoiceNoteDataUri(4);

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-primer-contacto-ia',
    stageId: 'contactado',
    title: 'Primer Contacto - Consultorio Digital & IA',
    description: 'Mensaje conciso presentando el consultorio digital vinculado a Google, Gemini y ChatGPT.',
    messageText: `👋 Estimado/a [Doctor], un cordial saludo.

Le escribo de *Médico EC* 🇪🇨 conociendo su labor en [Especialidad] en [Clinica].

Hoy los pacientes buscan especialistas mediante *Google y motores de IA (Gemini y ChatGPT)*. En *Médico EC* creamos su *Consultorio Digital (Landing Page Médica)* para posicionar su práctica en estas nuevas tecnologías:

✔ Indexación en Google y búsquedas con IA
✔ Citas en línea automatizadas con datos previos
✔ Certificación con su código SENESCYT y sociedades
✔ Fotos de casos, blog y videos de TikTok/Instagram

Planes accesibles: *$99 (1 año)* o *$150 (2 años)*.

⏱️ ¿Le puedo enviar un enlace de muestra de 1 minuto para su especialidad?`,
    attachments: [
      {
        id: 'att-infografia-consultorio',
        type: 'image',
        title: 'Infografía Consultorio Digital & IA Google',
        fileName: 'consultorio_digital_medico_ec.png',
        fileSize: '620 KB',
        url: SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI,
        caption: `📊 [Doctor], le comparto esta infografía visual de cómo conectamos su consultorio de [Especialidad] con Google, Gemini y ChatGPT. 📈`,
        description: 'Muestra visual del consultorio digital conectado a IA y Google'
      },
      {
        id: 'att-audio-intro',
        type: 'audio',
        title: 'Nota de Voz - Presentación Rápida',
        fileName: 'audio_presentacion_medico_ec.mp3',
        fileSize: '480 KB',
        duration: '0:25',
        url: sampleVoiceNoteUri,
        caption: `🎙️ Estimado/a [Doctor], le comparto una breve nota de voz de 25 segundos explicando el consultorio digital para [Especialidad]. 🎧`,
        description: 'Audio explicativo breve y profesional'
      }
    ]
  },
  {
    id: 'tpl-acreditacion-senescyt',
    stageId: 'contactado',
    title: 'Certificación Google, SENESCYT & Sociedades',
    description: 'Enfoca la autoridad médica, registro SENESCYT y acreditación ante Google como especialista certificado.',
    messageText: `Dr(a). [Doctor], un gusto saludarle.

Desde *Médico EC* estructuramos su consultorio digital para que Google y la IA certifiquen su autoridad médica ante los pacientes:

1️⃣ Validamos su código de especialista *SENESCYT*.
2️⃣ Registramos sus membresías en sociedades médicas nacionales o internacionales.
3️⃣ Integramos su galería de casos, blog y videos de TikTok e Instagram.

Así, cuando un paciente busque [Especialidad] en [Clinica], su perfil aparece como la referencia médica verificada.

💡 ¿Le gustaría ver un boceto de su perfil sin compromiso?`,
    attachments: [
      {
        id: 'att-infografia-autoridad',
        type: 'image',
        title: 'Certificación Médica en Google & Redes',
        fileName: 'certificacion_medico_ec.png',
        fileSize: '540 KB',
        url: SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI,
        caption: `🛡️ [Doctor], esquema de cómo Google y la IA validan su código SENESCYT y sociedades para certificarlo en internet. ✨`,
        description: 'Explicación gráfica de la certificación online'
      }
    ]
  },
  {
    id: 'tpl-demo-agendada',
    stageId: 'demo_agendada',
    title: 'Confirmación de Demo - Citas y Consultorio Digital',
    description: 'Confirma la sesión rápida para revisar el sistema de agenda en línea y pre-consulta.',
    messageText: `👋 Dr(a). [Doctor], un cordial saludo.

Le confirmo nuestra demostración de 5 minutos de su *Consultorio Digital* con *Médico EC*:
🗓️ Fecha: [Fecha]
⏰ Hora: [Hora]
🩺 Especialidad: [Especialidad] · [Clinica]

Revisaremos puntualmente cómo sus pacientes seleccionan servicio, horario y datos de pre-consulta directo a su WhatsApp.

(Si requiere reprogramar por alguna cirugía, solo avíseme por este medio). ¡Saludos!`,
    attachments: [
      {
        id: 'att-guia-demo',
        type: 'pdf',
        title: 'Boceto de Landing Médica y Citas Online',
        fileName: 'boceto_consultorio_digital_medico_ec.pdf',
        fileSize: '1.1 MB',
        url: samplePdf.dataUri,
        caption: `📄 [Doctor], boceto del flujo de citas online para su consultorio de [Especialidad]. 📑`,
        description: 'Documento PDF con las pantallas del consultorio digital'
      }
    ]
  },
  {
    id: 'tpl-propuesta-planes',
    stageId: 'propuesta_enviada',
    title: 'Propuesta de Planes - 1 Año ($99) y 2 Años ($150)',
    description: 'Detalle directo de los planes comerciales y la aclaración del 15% adicional por factura legal SRI.',
    messageText: `Estimado(a) [Doctor], le comparto los planes oficiales de *Médico EC* para su consultorio digital:

⭐ *Plan 1 Año:* $99 USD
🔥 *Plan 2 Años:* $150 USD *(Ahorro del 25%)*

Ambos incluyen:
• Landing page médica completa para [Especialidad]
• Indexación en Google y motores de IA (Gemini/ChatGPT)
• Agenda de citas en línea con datos de pre-consulta
• Fotos de casos, blog y videos de TikTok/Instagram
• Acreditación con código SENESCYT y sociedades
• Hosting de alta velocidad y soporte todo el año

💵 *Inversión:* [Monto]
🧾 *(Nota: Si desea emisión de factura digital legalmente con validez SRI, aplica un 15% adicional).*

¿Cuál de los dos planes prefiere activar para comenzar? 🩺`,
    attachments: [
      {
        id: 'att-propuesta-pdf',
        type: 'pdf',
        title: 'Propuesta Oficial Médico EC',
        fileName: 'propuesta_planes_medico_ec.pdf',
        fileSize: '1.4 MB',
        url: samplePdf.dataUri,
        caption: `📑 Estimado/a [Doctor], adjunto encuentra el documento oficial con el desglose de los planes de $99 y $150 USD. 📄`,
        description: 'Dossier formal en PDF con planes y garantía'
      },
      {
        id: 'att-audio-propuesta',
        type: 'audio',
        title: 'Nota de Voz - Resumen de Planes',
        fileName: 'audio_planes_medico_ec.mp3',
        fileSize: '510 KB',
        duration: '0:30',
        url: sampleVoiceNoteUri,
        caption: `🎧 Breve audio de 30 segundos resumiendo los planes de 1 y 2 años de Médico EC. 🎙️`,
        description: 'Audio explicativo de los planes de inversión'
      }
    ]
  },
  {
    id: 'tpl-seguimiento-valor',
    stageId: 'propuesta_enviada',
    title: 'Seguimiento Amigable - Coordinación con Asistente',
    description: 'Reactivación concisa respetando el tiempo del médico y ofreciendo coordinar con su asistente.',
    messageText: `Dr(a). [Doctor], un saludo cordial de *Médico EC*.

Sé que su agenda médica en [Clinica] es muy demandante.

¿Pudo revisar la propuesta de su consultorio digital? Si lo desea, podemos coordinar fotos y datos directamente con su asistente o secretaria para no quitarle tiempo.

Quedo atento si desea reservar su cupo en [Especialidad]. ¡Excelente jornada! ✨`,
    attachments: [
      {
        id: 'att-audio-seguimiento',
        type: 'audio',
        title: 'Nota de Voz - Saludo de Seguimiento',
        fileName: 'seguimiento_medico_ec.mp3',
        fileSize: '320 KB',
        duration: '0:18',
        url: sampleVoiceNoteUri,
        caption: `🎙️ Hola [Doctor], le dejo este saludo breve de 18 segundos. 🎧`,
        description: 'Audio breve y respetuoso del tiempo médico'
      }
    ]
  },
  {
    id: 'tpl-cuentas-bancarias',
    stageId: 'ganado',
    title: 'Cuentas Bancarias para Activación (Ecuador)',
    description: 'Cuentas bancarias de Médico EC con aclaración del 15% adicional por factura legal SRI.',
    messageText: `Estimado(a) [Doctor], le comparto los datos de *Médico EC* para la activación:

📌 *Resumen:*
• Plan: [Especialidad] en [Clinica]
• Inversión: [Monto]
• *(Si requiere factura digital legalmente con el SRI, aplica un 15% adicional)*

🏦 *Cuentas Bancarias (Ecuador):*
• *Banco Pichincha* (Cta. Corriente): 2100894523
• *Banco Guayaquil* (Cta. Corriente): 14589230
• *Deuna! / Celular:* 099 876 5432
• Titular: Médico EC

📲 Por favor envíenos el comprobante por este chat para iniciar el diseño de inmediato. ¡Muchas gracias!`,
    attachments: [
      {
        id: 'att-datos-banco-img',
        type: 'image',
        title: 'Cuentas Bancarias Médico EC',
        fileName: 'cuentas_bancarias_medico_ec.png',
        fileSize: '490 KB',
        url: SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI,
        caption: `🏦 Cuentas bancarias autorizadas de Médico EC (Pichincha, Guayaquil, Deuna!). 💵`,
        description: 'Tarjeta gráfica con los datos bancarios'
      }
    ]
  },
  {
    id: 'tpl-pago-confirmado-bienvenida',
    stageId: 'ganado',
    title: 'Confirmación de Pago y Arranque de Diseño',
    description: 'Bienvenida formal y solicitud de materiales para la landing page médica.',
    messageText: `🎉 ¡Excelente noticia Dr(a). [Doctor]!

Confirmamos su pago de *[Monto]* por [MetodoPago]. ¡Bienvenido(a) a *Médico EC*!

🚀 *Siguientes pasos:*
1. Recopilaremos con usted o su asistente sus fotos, casos y código SENESCYT.
2. Configuraremos su agenda de citas y videos de redes (TikTok/Instagram).
3. Publicaremos e indexaremos su consultorio en Google y motores de IA.

*(Si solicitó factura digital legalmente con el 15% adicional, se remitirá a su correo).* ¡Un verdadero honor trabajar con usted en [Clinica]! 🩺✨`,
    attachments: [
      {
        id: 'att-banner-bienvenida',
        type: 'image',
        title: 'Certificado de Especialista Verificado Médico EC',
        fileName: 'certificado_especialista_medico_ec.png',
        fileSize: '580 KB',
        url: SAMPLE_WELCOME_BANNER_DATA_URI,
        caption: `🏅 ¡Bienvenido Dr./a [Doctor]! Le compartimos su distintivo digital de Especialista Verificado en Médico EC. ✨`,
        description: 'Certificado de bienvenida'
      },
      {
        id: 'att-recibo-pdf',
        type: 'pdf',
        title: 'Comprobante Oficial Médico EC',
        fileName: 'comprobante_activacion_medico_ec.pdf',
        fileSize: '950 KB',
        url: samplePdf.dataUri,
        caption: `🧾 [Doctor], adjunto encuentra el comprobante oficial de su activación. 📄`,
        description: 'Comprobante formal de pago'
      }
    ]
  }
];

export function replaceTemplatePlaceholders(
  templateText: string,
  data: {
    doctorName: string;
    specialty: string;
    clinicOrHospital: string;
    amount: string;
    date: string;
    time: string;
    paymentMethod: string;
  }
): string {
  if (!templateText) return '';
  return templateText
    .replace(/\[Doctor\]/g, data.doctorName || 'Doctor/a')
    .replace(/\[Especialidad\]/g, data.specialty || 'su especialidad')
    .replace(/\[Clinica\]/g, data.clinicOrHospital || 'su consultorio')
    .replace(/\[Monto\]/g, data.amount || '$0')
    .replace(/\[Fecha\]/g, data.date || 'próxima fecha')
    .replace(/\[Hora\]/g, data.time || 'horario acordado')
    .replace(/\[MetodoPago\]/g, data.paymentMethod || 'Transferencia');
}
