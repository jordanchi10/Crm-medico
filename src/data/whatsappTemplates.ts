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
  clinic: 'Centro Médico San Ángel (Manta)',
  price: '$99.00 USD'
});
const sampleVoiceNoteUri = generateSampleVoiceNoteDataUri(4);

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-primer-contacto',
    stageId: 'contactado',
    title: 'Primer Contacto - Especialistas Médicos',
    description: 'Presentación formal destacando el valor para su especialidad médica con infografía y audio.',
    messageText: `Estimado/a [Doctor], un cordial saludo.

Me pongo en contacto con usted sabiendo de su destacada trayectoria en [Especialidad] en [Clinica].

Ayudamos a especialistas en [Especialidad] a optimizar su captación de pacientes calificados y digitalizar la gestión de sus consultas privadas, reduciendo el ausentismo y aumentando ingresos.

¿Tendría 10 minutos esta semana para una breve llamada o demo rápida en un horario que no interrumpa sus consultas?

Quedo a su disposición.
Saludos cordiales.`,
    attachments: [
      {
        id: 'att-infografia-1',
        type: 'image',
        title: 'Infografía Perfil Médico Ecuador',
        fileName: 'infografia_perfil_medico_ecuador.png',
        fileSize: '620 KB',
        url: SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI,
        caption: `📊 Estimado/a [Doctor], le comparto una breve infografía visual de cómo posicionamos su consulta de [Especialidad] en Google y WhatsApp para captar pacientes privados.`,
        description: 'Muestra visual del impacto en Google y WhatsApp para el médico'
      },
      {
        id: 'att-audio-intro',
        type: 'audio',
        title: 'Nota de Voz - Saludo y Propuesta de Valor',
        fileName: 'saludo_propuesta_especialista.mp3',
        fileSize: '480 KB',
        duration: '0:35',
        url: sampleVoiceNoteUri,
        caption: `🎙️ Estimado/a [Doctor], le comparto esta breve nota de voz de 30 segundos resumiendo cómo los colegas de [Especialidad] en [Clinica] están automatizando sus citas.`,
        description: 'Audio explicativo cálido y profesional'
      }
    ]
  },
  {
    id: 'tpl-demo-agendada',
    stageId: 'demo_agendada',
    title: 'Confirmación y Recordatorio de Demo',
    description: 'Envía los detalles de la videollamada o cita presencial al médico.',
    messageText: `Hola [Doctor], excelente día.

Le escribo para confirmarle nuestra sesión de demostración programada para el día [Fecha] a las [Hora].

Veremos puntualmente cómo resolver las principales necesidades de su consulta de [Especialidad] en [Clinica].

Si requiere reprogramar debido a una cirugía o emergencia médica, solo avíseme por este medio.

¡Nos vemos pronto!`,
    attachments: [
      {
        id: 'att-guia-demo',
        type: 'pdf',
        title: 'Guía Rápida de la Demostración',
        fileName: 'guia_demostracion_medcrm.pdf',
        fileSize: '1.1 MB',
        url: samplePdf.dataUri,
        caption: `📄 [Doctor], le comparto el temario de 3 puntos clave que revisaremos en la sesión de 15 minutos para [Especialidad].`,
        description: 'Documento PDF con los puntos a revisar'
      }
    ]
  },
  {
    id: 'tpl-propuesta-enviada',
    stageId: 'propuesta_enviada',
    title: 'Envío de Propuesta y Honorarios',
    description: 'Resumen de cotización de servicio con PDF oficial, infografía y audio explicativo.',
    messageText: `Estimado/a [Doctor], un gusto saludarle.

Conforme a lo conversado, le he remitido la propuesta personalizada para su práctica de [Especialidad].

📋 Inversión estimada: [Monto]
🏥 Implementación en: [Clinica]

Incluye soporte dedicado adaptado al flujo de trabajo médico. ¿Pudo revisar el documento o prefiere que aclaremos dudas puntuales por aquí?`,
    attachments: [
      {
        id: 'att-propuesta-pdf',
        type: 'pdf',
        title: 'Propuesta Formal Perfil Médico 2026',
        fileName: 'propuesta_formal_perfil_medico.pdf',
        fileSize: '1.4 MB',
        url: samplePdf.dataUri,
        caption: `📑 Estimado/a [Doctor], adjunto le remito el documento formal de propuesta y cotización por [Monto] para [Especialidad] en [Clinica].`,
        description: 'Dossier formal en PDF con alcance y garantía'
      },
      {
        id: 'att-infografia-planes',
        type: 'image',
        title: 'Comparativa de Cobertura y Alcance',
        fileName: 'comparativa_cobertura_google_redes.png',
        fileSize: '740 KB',
        url: SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI,
        caption: `📈 Resumen gráfico del retorno de inversión y visibilidad esperada para su consulta privada.`,
        description: 'Infografía complementaria del plan'
      },
      {
        id: 'att-audio-propuesta',
        type: 'audio',
        title: 'Nota de Voz - Explicación de Honorarios y Facturación SRI',
        fileName: 'audio_explicacion_honorarios.mp3',
        fileSize: '510 KB',
        duration: '0:42',
        url: sampleVoiceNoteUri,
        caption: `🎧 Le dejo un breve audio aclaratorio sobre las facilidades de pago ([MetodoPago]) y la emisión de factura autorizada por el SRI.`,
        description: 'Audio aclaratorio para acelerar el cierre'
      }
    ]
  },
  {
    id: 'tpl-seguimiento-amigable',
    stageId: 'propuesta_enviada',
    title: 'Seguimiento Amigable de Propuesta',
    description: 'Reactiva conversaciones respetando el tiempo ocupado del doctor.',
    messageText: `Hola [Doctor], espero que se encuentre excelente.

Entiendo que su agenda médica en [Clinica] suele ser muy demandante. Quería consultar brevemente si tuvo oportunidad de evaluar la propuesta o si desea ajustar algún punto antes del cierre de mes.

Quedo muy atento a su disponibilidad.`,
    attachments: [
      {
        id: 'att-audio-seguimiento',
        type: 'audio',
        title: 'Nota de Voz - Saludo de Seguimiento',
        fileName: 'saludo_breve_seguimiento.mp3',
        fileSize: '320 KB',
        duration: '0:22',
        url: sampleVoiceNoteUri,
        caption: `🎙️ Hola [Doctor], le dejo un mensaje de voz muy breve por si le resulta más cómodo escucharlo entre consultas.`,
        description: 'Audio breve y no invasivo'
      }
    ]
  },
  {
    id: 'tpl-pago-confirmado',
    stageId: 'ganado',
    title: 'Confirmación de Pago y Bienvenida (Ecuador)',
    description: 'Agradecimiento formal, confirmación de método de pago y emisión de factura SRI.',
    messageText: `¡Excelente noticia [Doctor]!

Confirmamos con éxito la recepción de su pago por [Monto] mediante [MetodoPago].

Hemos procedido a emitir su factura electrónica autorizada por el SRI al correo registrado. Es un honor comenzar a trabajar con usted y con todo su equipo de [Especialidad] en [Clinica].

En breve nuestro equipo le compartirá el plan de arranque y configuración. ¡Bienvenido!`,
    attachments: [
      {
        id: 'att-banner-bienvenida',
        type: 'image',
        title: 'Credencial Especialista Médico Verificado',
        fileName: 'credencial_especialista_verificado.png',
        fileSize: '580 KB',
        url: SAMPLE_WELCOME_BANNER_DATA_URI,
        caption: `🏅 ¡Bienvenido Dr./a [Doctor]! Le compartimos su credencial digital de Especialista Verificado en la Red Médica de Ecuador.`,
        description: 'Certificado de bienvenida'
      },
      {
        id: 'att-recibo-pdf',
        type: 'pdf',
        title: 'Constancia de Activación y Facturación SRI',
        fileName: 'constancia_activacion_sri.pdf',
        fileSize: '950 KB',
        url: samplePdf.dataUri,
        caption: `🧾 [Doctor], adjunto encuentra la constancia oficial de activación y el respaldo para su contabilidad y deducción tributaria.`,
        description: 'Constancia formal de pago y SRI'
      }
    ]
  },
  {
    id: 'tpl-recordatorio-pago',
    stageId: 'ganado',
    title: 'Datos de Pago / Saldo Pendiente (Ecuador)',
    description: 'Envío formal de cuentas bancarias (Pichincha, Guayaquil, Produbanco, Deuna!) o link.',
    messageText: `Estimado/a [Doctor], le comparto los datos para liquidar el valor pendiente de [Monto] acordado para su solución de [Especialidad].

Método seleccionado: [MetodoPago]
Fecha límite sugerida: [Fecha]

En cuanto efectúe la transferencia o pago, por favor remítanos el comprobante por este chat de WhatsApp para remitirle de inmediato la factura electrónica SRI. ¡Muchas gracias!`,
    attachments: [
      {
        id: 'att-cuentas-bancarias',
        type: 'image',
        title: 'Infografía Datos Bancarios Ecuador',
        fileName: 'datos_bancarios_ecuador_pichincha_guayaquil.png',
        fileSize: '490 KB',
        url: SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI,
        caption: `🏦 Datos bancarios para transferencia directa (Banco Pichincha, Banco Guayaquil, Produbanco, Deuna!).`,
        description: 'Cuentas bancarias de Ecuador'
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

