import { MedicalSpecialty, MedicalLead, StageId } from '../types';
import { getAllSpecialties } from '../data/specialties';
import { ECUADOR_CITIES, ECUADOR_SECTORS, formatEcuadorPhoneForWhatsApp } from '../data/ecuadorData';

export interface ParsedDoctorResult {
  doctorName?: string;
  specialty?: MedicalSpecialty;
  phone?: string;
  email?: string;
  clinicOrHospital?: string;
  city?: string;
  sector?: string;
  notes?: string;
  sourceType: 'google_maps_url' | 'web_url' | 'raw_text';
  detectedFields: string[];
  rawSummary: string;
}

export interface BulkDoctorRow {
  id: string;
  selected: boolean;
  doctorName: string;
  specialty: MedicalSpecialty;
  phone: string;
  phoneValid: boolean;
  clinicOrHospital: string;
  sector: string;
  city: string;
  notes: string;
  status: 'valid' | 'warning' | 'error';
  statusMessage?: string;
}

export interface BulkParseOptions {
  defaultStage: StageId;
  defaultServiceId: string;
  defaultServiceName: string;
  defaultPrice: number;
  defaultCity: string;
  defaultSector: string;
}

/**
 * Normalizes text by removing accents for flexible search
 */
function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Clean stars, ratings, review counts like:
 * "4.8 ★★★★★ (38 reseñas)" or "4.9 (120) · Médico"
 */
function cleanRatingsAndNoise(text: string): string {
  return text
    .replace(/\b\d+(\.\d+)?\s*(★|estrellas?|\*+)/gi, '')
    .replace(/\(\d+\s*(reseñas?|opiniones?|votos?)?\)/gi, '')
    .replace(/[★☆]+/g, '')
    .trim();
}

/**
 * Match a raw text segment against known medical specialties
 */
export function matchSpecialty(text: string): MedicalSpecialty | undefined {
  const norm = normalizeStr(text);

  // Direct map keywords to our MedicalSpecialty enum
  const specialtyRules: Array<{ keywords: string[]; specialty: MedicalSpecialty }> = [
    { keywords: ['cardio', 'cardiolog', 'corazon'], specialty: 'Cardiología' },
    { keywords: ['derma', 'dermatolog', 'piel', 'cutane'], specialty: 'Dermatología' },
    { keywords: ['pediatr', 'ninos', 'infantil'], specialty: 'Pediatría' },
    { keywords: ['ginec', 'obstetr', 'embarazo', 'parto', 'materno'], specialty: 'Ginecología y Obstetricia' },
    { keywords: ['odont', 'dentist', 'diente', 'ortodonc', 'sonrisa', 'implante dental'], specialty: 'Odontología / Ortodoncia' },
    { keywords: ['traumat', 'ortoped', 'hueso', 'articulac', 'columna'], specialty: 'Traumatología y Ortopedia' },
    { keywords: ['oftalm', 'oculist', 'ojo', 'vision', 'retina'], specialty: 'Oftalmología' },
    { keywords: ['cirugia plastic', 'estetic', 'rinoplast', 'lipo', 'cirujano plastic'], specialty: 'Cirugía Plástica y Estética' },
    { keywords: ['neurolog', 'cerebro'], specialty: 'Neurología' },
    { keywords: ['gastro', 'endoscop', 'colon', 'digestivo', 'estomago', 'higado'], specialty: 'Gastroenterología' },
    { keywords: ['endocrino', 'diabetes', 'tiroides', 'metabolismo'], specialty: 'Endocrinología' },
    { keywords: ['neumol', 'pulmon', 'respirat', 'asma'], specialty: 'Neumología' },
    { keywords: ['reumat', 'artritis', 'lupus'], specialty: 'Reumatología' },
    { keywords: ['nutric', 'diet', 'peso', 'alimentac'], specialty: 'Nutrición y Dietética' },
    { keywords: ['psicol', 'terapia psic', 'salud emocional'], specialty: 'Psicología Clínica' },
    { keywords: ['nefrol', 'rinon', 'dialisis'], specialty: 'Nefrología' },
    { keywords: ['cirugia general', 'cirujano general'], specialty: 'Cirugía General' },
    { keywords: ['fisioterap', 'rehabilitac', 'kinesiol'], specialty: 'Fisioterapia y Rehabilitación' },
    { keywords: ['alerg', 'inmunol'], specialty: 'Alergología e Inmunología' },
    { keywords: ['geriatr', 'adulto mayor'], specialty: 'Geriatría' },
    { keywords: ['infectol', 'infecc'], specialty: 'Infectología' },
    { keywords: ['vascular', 'varices', 'flebol'], specialty: 'Cirugía Vascular' },
    { keywords: ['hematol', 'sangre', 'anemia'], specialty: 'Hematología' },
    { keywords: ['estetica', 'botox', 'armonizacion'], specialty: 'Medicina Estética' },
    { keywords: ['neurocirug'], specialty: 'Neurocirugía' },
    { keywords: ['radiolog', 'imagenolog', 'ecograf', 'rayos x', 'tomograf'], specialty: 'Radiología e Imagenología' },
    { keywords: ['anestesi'], specialty: 'Anestesiología' },
    { keywords: ['general', 'familiar', 'cabecera'], specialty: 'Medicina General / Familiar' },
    { keywords: ['interna', 'internista', 'clinico'], specialty: 'Medicina Interna' },
    { keywords: ['urolog', 'prostata', 'urinari'], specialty: 'Urología' },
    { keywords: ['otorrino', 'garganta', 'oido', 'nariz'], specialty: 'Otorrinolaringología' },
    { keywords: ['psiquiat', 'salud mental'], specialty: 'Psiquiatría' },
    { keywords: ['oncol', 'cancer', 'quimio'], specialty: 'Oncología' }
  ];

  for (const rule of specialtyRules) {
    if (rule.keywords.some((kw) => norm.includes(kw))) {
      return rule.specialty;
    }
  }

  // Exact matching against dynamic specialty list
  const allSpecs = getAllSpecialties();
  for (const spec of allSpecs) {
    if (norm.includes(normalizeStr(spec.name))) {
      return spec.name;
    }
  }

  return undefined;
}

/**
 * Match a sector in Ecuador (focusing on Manta and common sectors)
 */
export function matchSector(text: string): string | undefined {
  const norm = normalizeStr(text);
  for (const sec of ECUADOR_SECTORS) {
    if (norm.includes(normalizeStr(sec))) {
      return sec;
    }
  }
  return undefined;
}

/**
 * Match a city in Ecuador
 */
export function matchCity(text: string): string | undefined {
  const norm = normalizeStr(text);
  for (const c of ECUADOR_CITIES) {
    if (norm.includes(normalizeStr(c.name))) {
      return c.name;
    }
  }
  return undefined;
}

/**
 * Extracts and standardizes an Ecuadorian phone number
 */
export function extractPhone(text: string): string | undefined {
  // Matches +593 9X XXX XXXX, 09XXXXXXXX, +5939XXXXXXXX, or chunks of 9 digits starting with 09 or 9
  const phoneRegexes = [
    /(?:\+?593[\s.-]?)?(?:0?9\d{1})[\s.-]?\d{3}[\s.-]?\d{4}/g,
    /\b09\d{8}\b/g,
    /\+593\s?9\d{8}/g,
    /\b9\d{8}\b/g
  ];

  for (const rx of phoneRegexes) {
    const match = text.match(rx);
    if (match && match[0]) {
      const cleaned = match[0].replace(/[^\d+]/g, '');
      const formatted = formatEcuadorPhoneForWhatsApp(cleaned);
      if (formatted && formatted.displayPhone && formatted.cleanWhatsAppNumber.length >= 10) {
        return formatted.displayPhone;
      }
    }
  }

  return undefined;
}

/**
 * Extracts email address
 */
export function extractEmail(text: string): string | undefined {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0].toLowerCase() : undefined;
}

/**
 * Parse single input: Google Maps URL or copied Raw Info Text
 */
export function parseRawDoctorInfo(input: string): ParsedDoctorResult {
  const trimmed = input.trim();
  const detectedFields: string[] = [];
  let doctorName: string | undefined;
  let specialty: MedicalSpecialty | undefined;
  let phone: string | undefined;
  let email: string | undefined;
  let clinicOrHospital: string | undefined;
  let city: string | undefined;
  let sector: string | undefined;
  let notes: string | undefined;
  let sourceType: 'google_maps_url' | 'web_url' | 'raw_text' = 'raw_text';

  // 1. Check if input is a URL
  const isUrl = /^https?:\/\//i.test(trimmed);
  if (isUrl) {
    if (trimmed.includes('google.com/maps') || trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
      sourceType = 'google_maps_url';
      notes = `Ficha de Google Maps: ${trimmed}`;

      // Try extracting title from /place/Title/@... URL
      const placeMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/);
      if (placeMatch && placeMatch[1]) {
        try {
          const decoded = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          const cleaned = cleanRatingsAndNoise(decoded);

          // Check if specialty is in title: e.g. "Dr. Carlos Mendoza - Cardiología"
          if (cleaned.includes('-') || cleaned.includes(':') || cleaned.includes('|')) {
            const parts = cleaned.split(/[-:|]/).map((p) => p.trim());
            doctorName = parts[0];
            const foundSpec = matchSpecialty(parts.slice(1).join(' '));
            if (foundSpec) specialty = foundSpec;
          } else {
            doctorName = cleaned;
          }
        } catch (e) {
          // Fallback if URI decode fails
        }
      }
    } else {
      sourceType = 'web_url';
      notes = `Enlace web de origen: ${trimmed}`;

      // Check Doctoralia or medical directory URL
      if (trimmed.includes('doctoralia')) {
        const parts = trimmed.split('/').filter(Boolean);
        const namePart = parts.find((p) => p.includes('-') && !['medico', 'profesionales', 'clinica'].includes(p));
        if (namePart) {
          const formatted = namePart
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          doctorName = `Dr. ${formatted}`;
        }
        specialty = matchSpecialty(trimmed);
        city = matchCity(trimmed);
      }
    }
  }

  // 2. Parse text content (either raw text or extra text after/around URL)
  const lines = trimmed
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Extract phone & email across the entire text
  phone = extractPhone(trimmed);
  email = extractEmail(trimmed);
  if (phone) detectedFields.push('Teléfono / WhatsApp');
  if (email) detectedFields.push('Correo electrónico');

  // Check city and sector
  city = matchCity(trimmed) || city || 'Manta';
  sector = matchSector(trimmed) || sector;
  if (city) detectedFields.push('Ciudad');
  if (sector) detectedFields.push('Sector');

  // Check specialty if not found yet
  if (!specialty) {
    specialty = matchSpecialty(trimmed);
    if (specialty) detectedFields.push('Especialidad');
  }

  // Look for doctor name if not parsed from URL
  if (!doctorName) {
    for (const line of lines) {
      const cleanLine = cleanRatingsAndNoise(line);
      // Look for Dr. / Dra. / Doctor / Doctora prefix
      const drMatch = cleanLine.match(/\b(dr|dra|doctor|doctora|méd|med|odont)\.?\s+([A-Za-zÁÉÍÓÚáéíóúñÑüÜ\s\.\-]{3,50})/i);
      if (drMatch) {
        doctorName = cleanLine
          .split(/[-|·,]/)[0]
          .replace(/[★☆]+/g, '')
          .trim();
        break;
      }
    }

    // If no Dr prefix found, use first line if it looks like a name or business title (not an address or phone)
    if (!doctorName && lines.length > 0) {
      const firstLine = cleanRatingsAndNoise(lines[0]);
      if (
        !firstLine.startsWith('http') &&
        !firstLine.toLowerCase().includes('dirección') &&
        !firstLine.toLowerCase().includes('horario') &&
        !firstLine.toLowerCase().includes('teléfono') &&
        firstLine.length < 60
      ) {
        const parts = firstLine.split(/[-|·]/).map((s) => s.trim());
        doctorName = parts[0];
        if (!specialty && parts[1]) {
          specialty = matchSpecialty(parts[1]);
        }
      }
    }
  }

  // Ensure "Dr." or "Dra." is prefix if clean name detected
  if (doctorName) {
    doctorName = cleanRatingsAndNoise(doctorName);
    if (!/^(dr|dra|doctor|doctora)\b/i.test(doctorName)) {
      doctorName = `Dr. ${doctorName}`;
    }
    detectedFields.push('Nombre del Médico');
  }

  // Look for clinic or hospital
  const clinicKeywords = ['clínica', 'clinica', 'hospital', 'torre médica', 'torre medica', 'centro médico', 'centro medico', 'consultorio', 'edificio', 'policlínica'];
  for (const line of lines) {
    const norm = normalizeStr(line);
    if (clinicKeywords.some((kw) => norm.includes(kw)) && !line.toLowerCase().startsWith('http')) {
      clinicOrHospital = line.replace(/^(dirección|ubicación|lugar):?\s*/i, '').trim();
      break;
    }
  }

  if (clinicOrHospital) {
    detectedFields.push('Clínica u Hospital');
  }

  // Address and notes accumulation
  const addressLines: string[] = [];
  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (
      lower.startsWith('dirección') ||
      lower.startsWith('direccion') ||
      lower.startsWith('horario') ||
      lower.includes('calle') ||
      lower.includes('av.') ||
      lower.includes('avenida')
    ) {
      addressLines.push(line);
    }
  });

  if (addressLines.length > 0) {
    const addressNotes = addressLines.join(' | ');
    notes = notes ? `${notes} | ${addressNotes}` : addressNotes;
  }

  return {
    doctorName: doctorName || '',
    specialty: specialty || 'Cardiología',
    phone: phone || '+593 9',
    email: email || '',
    clinicOrHospital: clinicOrHospital || 'Consultorio Privado',
    city: city || 'Manta',
    sector: sector || 'Centro',
    notes: notes || '',
    sourceType,
    detectedFields,
    rawSummary: `${detectedFields.length} campos detectados con éxito`
  };
}

/**
 * Parse bulk text (CSV, TSV, or multi-line list) into list of doctors
 */
export function parseBulkDoctorsText(
  bulkInput: string,
  options: BulkParseOptions
): BulkDoctorRow[] {
  const trimmed = bulkInput.trim();
  if (!trimmed) return [];

  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  const results: BulkDoctorRow[] = [];

  // Detect delimiter: comma, tab, semicolon or pipe
  const firstLine = lines[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';')) delimiter = ';';
  else if (firstLine.includes('|')) delimiter = '|';

  // Check if first line is a header row (e.g. "Nombre, Especialidad, Telefono...")
  const isHeader = (str: string) => {
    const norm = normalizeStr(str);
    return (
      norm.includes('nombre') ||
      norm.includes('doctor') ||
      norm.includes('especialidad') ||
      norm.includes('telefono') ||
      norm.includes('clinica')
    );
  };

  const startIndex = isHeader(firstLine) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Split by delimiter
    const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    let docName = '';
    let spec: MedicalSpecialty = 'Cardiología';
    let rawPhone = '';
    let clinic = 'Consultorio Privado';
    let sector = options.defaultSector || 'Centro';
    let city = options.defaultCity || 'Manta';
    let rowNotes = '';

    if (cols.length >= 2) {
      // Column 0: Doctor name
      docName = cleanRatingsAndNoise(cols[0]);
      if (docName && !/^(dr|dra|doctor|doctora)\b/i.test(docName)) {
        docName = `Dr. ${docName}`;
      }

      // Column 1: Specialty
      const foundSpec = matchSpecialty(cols[1]);
      if (foundSpec) spec = foundSpec;

      // Column 2: Phone
      if (cols[2]) {
        rawPhone = cols[2];
      }

      // Column 3: Clinic
      if (cols[3]) {
        clinic = cols[3];
      }

      // Column 4: Sector
      if (cols[4]) {
        const foundSector = matchSector(cols[4]);
        sector = foundSector || cols[4];
      }

      // Column 5: City
      if (cols[5]) {
        const foundCity = matchCity(cols[5]);
        city = foundCity || cols[5];
      }

      // Column 6: Notes
      if (cols[6]) {
        rowNotes = cols[6];
      }
    } else {
      // Single freeform text line: use parseRawDoctorInfo
      const parsed = parseRawDoctorInfo(line);
      docName = parsed.doctorName || `Dr. Médico ${i + 1}`;
      spec = parsed.specialty || 'Cardiología';
      rawPhone = parsed.phone || '';
      clinic = parsed.clinicOrHospital || 'Consultorio Privado';
      sector = parsed.sector || options.defaultSector || 'Centro';
      city = parsed.city || options.defaultCity || 'Manta';
      rowNotes = parsed.notes || '';
    }

    const formattedPhone = extractPhone(rawPhone) || rawPhone || '+593 9';
    const phoneValid = formattedPhone.replace(/\D/g, '').length >= 10;

    results.push({
      id: `bulk-row-${Date.now()}-${i}`,
      selected: true,
      doctorName: docName || `Dr. Médico ${i + 1}`,
      specialty: spec,
      phone: formattedPhone,
      phoneValid,
      clinicOrHospital: clinic,
      sector,
      city,
      notes: rowNotes,
      status: phoneValid ? 'valid' : 'warning',
      statusMessage: phoneValid ? 'Listo' : 'Revisar teléfono'
    });
  }

  return results;
}

/**
 * Converts validated BulkDoctorRows into standard MedicalLead objects
 */
export function convertBulkRowsToLeads(
  rows: BulkDoctorRow[],
  options: BulkParseOptions
): MedicalLead[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

  return rows
    .filter((r) => r.selected && r.doctorName.trim().length > 0)
    .map((row, idx) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      return {
        id: `lead-bulk-${Date.now()}-${idx}`,
        doctorName: row.doctorName.trim(),
        clinicOrHospital: row.clinicOrHospital.trim() || 'Consultorio Privado',
        specialty: row.specialty,
        phone: row.phone.trim() || '+593 9',
        email: '',
        city: row.city || options.defaultCity || 'Manta',
        sector: row.sector || options.defaultSector || 'Centro',
        serviceId: options.defaultServiceId,
        serviceName: options.defaultServiceName,
        stage: options.defaultStage || 'prospecto',
        estimatedValue: options.defaultPrice || 99,
        paidAmount: 0,
        paymentStatus: 'no_aplica',
        paymentMethod: 'Transferencia Banco Pichincha',
        lastContactDate: todayStr,
        nextFollowUpDate: tomorrow.toISOString().split('T')[0],
        nextFollowUpTime: '11:00',
        createdAt: todayStr,
        notes: row.notes ? `Carga masiva: ${row.notes}` : 'Importado mediante registro masivo al CRM.',
        tags: [row.sector, 'Carga Masiva'],
        history: [
          {
            id: `act-bulk-${Date.now()}-${idx}`,
            date: dateStr,
            type: 'creacion',
            description: `Médico registrado masivamente en la plataforma para ${options.defaultServiceName} en sector ${row.sector}.`
          }
        ]
      };
    });
}
