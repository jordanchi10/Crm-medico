import { TemplateMediaAttachment } from '../types';

/**
 * Generador de data URI de audio WAV sintetizado para notas de voz médica.
 * Produce un archivo de audio WAV válido que cualquier navegador o WhatsApp reproduce perfectamente.
 */
export function generateSampleVoiceNoteDataUri(durationSeconds: number = 3): string {
  const sampleRate = 8000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = sampleRate * durationSeconds;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generar un tono armónico cálido tipo nota de voz / timbre de introducción médica
  let offset = 44;
  const baseFreq = 440; // La4
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Modulación suave de voz / campana de confirmación
    const envelope = Math.sin((Math.PI * t) / durationSeconds);
    const harmonic1 = Math.sin(2 * Math.PI * baseFreq * t);
    const harmonic2 = 0.4 * Math.sin(2 * Math.PI * (baseFreq * 1.5) * t);
    const sampleVal = (harmonic1 + harmonic2) * envelope * 0.4;
    const clamped = Math.max(-1, Math.min(1, sampleVal));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  // Convertir a base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Imagen SVG enriquecida: Infografía de Perfil Médico Digital Ecuador
 */
export const SAMPLE_INFOGRAPHIC_IMAGE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#134e4a" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bg)" />

  <!-- Grid decoration -->
  <circle cx="750" cy="50" r="180" fill="#14b8a6" opacity="0.1" filter="blur(40px)" />
  <circle cx="50" cy="550" r="140" fill="#065f46" opacity="0.15" filter="blur(40px)" />

  <!-- Top Header Badge -->
  <rect x="50" y="40" width="220" height="34" rx="17" fill="#14b8a6" fill-opacity="0.2" stroke="#2dd4bf" stroke-width="1.5" />
  <text x="70" y="62" fill="#5eead4" font-family="system-ui, sans-serif" font-weight="bold" font-size="13">
    🇪🇨 RED MÉDICA ECUADOR · +593
  </text>

  <!-- Main Title -->
  <text x="50" y="115" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="28">
    Perfil Médico Digital Especializado
  </text>
  <text x="50" y="145" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="15">
    Atracción directa de pacientes privados en Google, Redes y WhatsApp
  </text>

  <!-- 3 Main Pillars Cards -->
  <!-- Card 1 -->
  <rect x="50" y="180" width="215" height="230" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
  <circle cx="90" cy="220" r="22" fill="#0d9488" fill-opacity="0.3" />
  <text x="82" y="228" font-size="20">🔍</text>
  <text x="70" y="270" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="bold" font-size="16">
    Google 1er Lugar
  </text>
  <text x="70" y="300" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12" width="175">
    Posicionamiento en búsquedas locales por ciudad (Manta, Quito, Gye).
  </text>
  <rect x="70" y="360" width="120" height="24" rx="6" fill="#0f766e" />
  <text x="85" y="376" fill="#ccfbf1" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">
    +340% Clics
  </text>

  <!-- Card 2 -->
  <rect x="290" y="180" width="215" height="230" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
  <circle cx="330" cy="220" r="22" fill="#10b981" fill-opacity="0.3" />
  <text x="322" y="228" font-size="20">📲</text>
  <text x="310" y="270" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="bold" font-size="16">
    WhatsApp Directo
  </text>
  <text x="310" y="300" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12">
    Botón inteligente con mensaje predeterminado para agendar citas sin fricción.
  </text>
  <rect x="310" y="360" width="130" height="24" rx="6" fill="#047857" />
  <text x="325" y="376" fill="#d1fae5" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">
    Cero Comisiones
  </text>

  <!-- Card 3 -->
  <rect x="530" y="180" width="220" height="230" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
  <circle cx="570" cy="220" r="22" fill="#6366f1" fill-opacity="0.3" />
  <text x="562" y="228" font-size="20">⭐</text>
  <text x="550" y="270" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="bold" font-size="16">
    Reputación y Ficha
  </text>
  <text x="550" y="300" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12">
    Ficha curricular, casos clínicos, horarios, consultorios y mapa interactivo.
  </text>
  <rect x="550" y="360" width="140" height="24" rx="6" fill="#4338ca" />
  <text x="565" y="376" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">
    Perfil Verificado
  </text>

  <!-- Bottom Banner Plan -->
  <rect x="50" y="440" width="700" height="110" rx="16" fill="url(#accent)" />
  <text x="80" y="480" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="20">
    Planes Disponibles: $99 (1 Año) · $150 (2 Años)
  </text>
  <text x="80" y="508" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="13">
    Incluye dominio, hosting médico seguro, diseño adaptado a su especialidad y soporte continuo.
  </text>
  <text x="80" y="532" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="bold" font-size="12">
    ✓ Sin contratos forzosos  ✓ Facturación electrónica autorizada SRI Ecuador
  </text>
</svg>
`)}`;

/**
 * Segundo diseño: Credencial / Banner de Bienvenida y Verificación Médica
 */
export const SAMPLE_WELCOME_BANNER_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="wbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#042f2e" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#wbg)" />
  <circle cx="700" cy="100" r="160" fill="#0d9488" opacity="0.15" filter="blur(50px)" />
  <rect x="40" y="40" width="720" height="370" rx="20" fill="#ffffff" fill-opacity="0.05" stroke="#0d9488" stroke-width="2" />
  
  <circle cx="400" cy="130" r="45" fill="#0d9488" />
  <text x="382" y="145" font-size="40" fill="#ffffff">🩺</text>

  <text x="400" y="210" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="24" text-anchor="middle">
    ESPECIALISTA MÉDICO VERIFICADO
  </text>
  <text x="400" y="240" fill="#5eead4" font-family="system-ui, sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
    PLATAFORMA MÉDICA DIGITAL · REPÚBLICA DEL ECUADOR
  </text>

  <rect x="250" y="265" width="300" height="42" rx="10" fill="url(#gold)" />
  <text x="400" y="292" fill="#78350f" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">
    PERFIL ACTIVO Y CERTIFICADO
  </text>

  <text x="400" y="340" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">
    Garantía de servicio 365 días · Soporte prioritario WhatsApp 24/7 · Facturación SRI
  </text>
</svg>
`)}`;

/**
 * Genera un archivo PDF válido con codificación en memoria para propuestas médicas.
 * Retorna un Data URI 'data:application/pdf;base64,...'
 */
export function generateSampleMedicalProposalPdfBlob(data: {
  doctorName?: string;
  specialty?: string;
  clinic?: string;
  price?: string;
}): { dataUri: string; blob: Blob; fileName: string } {
  const docName = data.doctorName || 'Doctor Especialista';
  const spec = data.specialty || 'Especialidad Médica';
  const clinic = data.clinic || 'Consultorio Médico';
  const price = data.price || '$99.00 USD';

  // Creamos un PDF minimalista estructurado con especificación estándar PDF-1.4
  // con streams de texto renderizables
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 950 >>
stream
BT
/F1 22 Tf
50 780 Td
(PROPUESTA DE PERFIL MEDICO DIGITAL) Tj
/F1 13 Tf
0 -26 Td
(RED MEDICA ECUADOR - +593) Tj
/F2 10 Tf
0 -20 Td
(Documento formal de cotizacion y alcance de servicios digitales) Tj

/F1 14 Tf
0 -45 Td
(DATOS DEL ESPECIALISTA:) Tj
/F2 11 Tf
0 -20 Td
(Especialista: ${docName}) Tj
0 -18 Td
(Especialidad: ${spec}) Tj
0 -18 Td
(Clinica / Consultorio: ${clinic}) Tj

/F1 14 Tf
0 -40 Td
(ALCANCE DEL SERVICIO INCLUIDO:) Tj
/F2 10 Tf
0 -20 Td
(1. Dominio y Perfil Web de Alta Velocidad optimizado para dispositivos moviles) Tj
0 -18 Td
(2. Posicionamiento en Google Local para busquedas de pacientes en su ciudad) Tj
0 -18 Td
(3. Boton de contacto directo e interactivo hacia su WhatsApp personal o de citas) Tj
0 -18 Td
(4. Ficha de presentacion con servicios, seguros aceptados y direccion en mapa) Tj
0 -18 Td
(5. Factura electronica autorizada por el Servicio de Rentas Internas - SRI) Tj

/F1 14 Tf
0 -45 Td
(INVERSION ESTIMADA:) Tj
/F1 16 Tf
0 -24 Td
(TOTAL: ${price}) Tj
/F2 10 Tf
0 -18 Td
(Validez de la cotizacion: 15 dias a partir de la emision) Tj

/F1 12 Tf
0 -50 Td
(CONTACTO DIRECTO Y ACTIVACION:) Tj
/F2 10 Tf
0 -18 Td
(Escribanos directamente a traves de WhatsApp para confirmar el inicio de su perfil.) Tj
0 -16 Td
(Soporte Tecnico y Facturacion Ecuador: +593 99 000 0000) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000325 00000 n 
0000000401 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
1410
%%EOF`;

  const blob = new Blob([pdfString], { type: 'application/pdf' });
  const dataUri = `data:application/pdf;base64,${btoa(pdfString)}`;
  const cleanDoc = docName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Propuesta_Perfil_Medico_${cleanDoc}.pdf`;

  return { dataUri, blob, fileName };
}

/**
 * Descarga cualquier archivo adjunto en el navegador
 */
export function downloadMediaAttachment(attachment: TemplateMediaAttachment, doctorName?: string) {
  const fileName = attachment.fileName || `${attachment.title.replace(/\s+/g, '_')}`;
  
  if (attachment.url.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = attachment.url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // URL externa
  const a = document.createElement('a');
  a.href = attachment.url;
  a.download = fileName;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Copia la imagen al portapapeles del sistema para pegarla con Ctrl+V directamente en WhatsApp Web
 */
export async function copyImageToClipboard(attachment: TemplateMediaAttachment): Promise<boolean> {
  try {
    if (attachment.type !== 'image') return false;

    // Convertir la imagen a Blob PNG usando canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = attachment.url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );

    if (!blob) return false;

    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not copy image to clipboard automatically:', err);
    return false;
  }
}

/**
 * Convierte un File subido a Data URL (base64)
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Formatea el tamaño en bytes
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
