export interface EcuadorCity {
  name: string;
  province: string;
  region: 'Sierra' | 'Costa' | 'Oriente' | 'Insular';
}

export const ECUADOR_CITIES: EcuadorCity[] = [
  // Pichincha
  { name: 'Quito', province: 'Pichincha', region: 'Sierra' },
  { name: 'Cumbayá / Tumbaco', province: 'Pichincha', region: 'Sierra' },
  { name: 'Rumiñahui (Sangolquí)', province: 'Pichincha', region: 'Sierra' },

  // Guayas
  { name: 'Guayaquil', province: 'Guayas', region: 'Costa' },
  { name: 'Samborondón', province: 'Guayas', region: 'Costa' },
  { name: 'Daule (La Aurora)', province: 'Guayas', region: 'Costa' },
  { name: 'Durán', province: 'Guayas', region: 'Costa' },
  { name: 'Milagro', province: 'Guayas', region: 'Costa' },

  // Azuay
  { name: 'Cuenca', province: 'Azuay', region: 'Sierra' },
  { name: 'Gualaceo', province: 'Azuay', region: 'Sierra' },

  // Manabí
  { name: 'Manta', province: 'Manabí', region: 'Costa' },
  { name: 'Portoviejo', province: 'Manabí', region: 'Costa' },
  { name: 'Chone', province: 'Manabí', region: 'Costa' },

  // El Oro
  { name: 'Machala', province: 'El Oro', region: 'Costa' },
  { name: 'Pasaje', province: 'El Oro', region: 'Costa' },
  { name: 'Santa Rosa', province: 'El Oro', region: 'Costa' },

  // Tungurahua
  { name: 'Ambato', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Baños de Agua Santa', province: 'Tungurahua', region: 'Sierra' },

  // Loja
  { name: 'Loja', province: 'Loja', region: 'Sierra' },

  // Santo Domingo de los Tsáchilas
  { name: 'Santo Domingo', province: 'Santo Domingo de los Tsáchilas', region: 'Sierra' },

  // Chimborazo
  { name: 'Riobamba', province: 'Chimborazo', region: 'Sierra' },

  // Imbabura
  { name: 'Ibarra', province: 'Imbabura', region: 'Sierra' },
  { name: 'Otavalo', province: 'Imbabura', region: 'Sierra' },

  // Los Ríos
  { name: 'Quevedo', province: 'Los Ríos', region: 'Costa' },
  { name: 'Babahoyo', province: 'Los Ríos', region: 'Costa' },

  // Esmeraldas
  { name: 'Esmeraldas', province: 'Esmeraldas', region: 'Costa' },
  { name: 'Atacames', province: 'Esmeraldas', region: 'Costa' },

  // Cotopaxi
  { name: 'Latacunga', province: 'Cotopaxi', region: 'Sierra' },

  // Santa Elena
  { name: 'Salinas', province: 'Santa Elena', region: 'Costa' },
  { name: 'La Libertad', province: 'Santa Elena', region: 'Costa' },
  { name: 'Santa Elena', province: 'Santa Elena', region: 'Costa' },

  // Carchi
  { name: 'Tulcán', province: 'Carchi', region: 'Sierra' },

  // Cañar
  { name: 'Azogues', province: 'Cañar', region: 'Sierra' },

  // Pastaza / Napo / Sucumbíos / Morona Santiago / Zamora Chinchipe / Orellana (Oriente)
  { name: 'Puyo', province: 'Pastaza', region: 'Oriente' },
  { name: 'Tena', province: 'Napo', region: 'Oriente' },
  { name: 'Nueva Loja (Lago Agrio)', province: 'Sucumbíos', region: 'Oriente' },
  { name: 'El Coca (Pto. Francisco de Orellana)', province: 'Orellana', region: 'Oriente' },
  { name: 'Macas', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Zamora', province: 'Zamora Chinchipe', region: 'Oriente' },

  // Galápagos
  { name: 'Puerto Ayora (Santa Cruz)', province: 'Galápagos', region: 'Insular' },
  { name: 'Puerto Baquerizo Moreno (San Cristóbal)', province: 'Galápagos', region: 'Insular' }
];

export const ECUADOR_PAYMENT_METHODS = [
  'Transferencia Banco Pichincha',
  'Transferencia Banco Guayaquil',
  'Transferencia Produbanco',
  'Transferencia Interbancaria (BCE / SPI)',
  'Deuna! / PayPhone',
  'Tarjeta de Crédito / Débito (Datafast / Medianet)',
  'Efectivo en Consultorio',
  'Suscripción Recurrente',
  'No Definido'
] as const;

export const ECUADOR_CLINICS_SUGGESTIONS = [
  'Hospital Metropolitano (Quito)',
  'Hospital Vozandes (Quito)',
  'Novaclínica Santa Cecilia (Quito)',
  'Hospital de Especialidades Eugenio Espejo (Quito)',
  'Hospital Clínica San Francisco (Quito)',
  'Hospital Clínica Kennedy (Guayaquil)',
  'Omni Hospital (Guayaquil)',
  'Hospital Luis Vernaza (Guayaquil)',
  'Torre Médica Solaris (Samborondón)',
  'Hospital Clínica Panamericana (Guayaquil)',
  'Hospital Santa Inés (Cuenca)',
  'Hospital Monte Sinaí (Cuenca)',
  'Clínica Latino (Cuenca)',
  'Hospital Clínica Manta (Manta)',
  'Clínica San Gregorio (Portoviejo)',
  'Hospital Durán (Machala)',
  'Clínica San José (Ambato)',
  'Clínica San Agustín (Loja)'
];

/**
 * Normaliza y formatea un número de celular de Ecuador para WhatsApp.
 * Código de país: +593
 * Los números celulares en Ecuador tienen 9 dígitos e inician con 9 (ej. 0991234567 -> 593991234567).
 */
export function formatEcuadorPhoneForWhatsApp(inputPhone: string): { displayPhone: string; cleanWhatsAppNumber: string } {
  if (!inputPhone) return { displayPhone: '+593 ', cleanWhatsAppNumber: '' };

  // Eliminar todo lo que no sea dígito
  let digits = inputPhone.replace(/\D/g, '');

  // Si comienza con 593, remover prefijo para evaluar los dígitos locales
  if (digits.startsWith('593')) {
    digits = digits.substring(3);
  }

  // Si comienza con 0 (ej. 0991234567), quitar el 0 inicial
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // Si no tiene el 9 al inicio y tiene 8 dígitos, agregar el 9
  // Generalmente los celulares en Ecuador son 9XXXXXXXX
  const cleanNumber = '593' + digits;

  // Formato visual amigable: +593 9X XXX XXXX
  let display = '+593 ';
  if (digits.length > 0) {
    display += digits.substring(0, 2);
  }
  if (digits.length > 2) {
    display += ' ' + digits.substring(2, 5);
  }
  if (digits.length > 5) {
    display += ' ' + digits.substring(5, 9);
  }

  return {
    displayPhone: display.trim(),
    cleanWhatsAppNumber: cleanNumber
  };
}

/**
 * Sectores y parroquias urbanas populares en Ecuador (incluye sectores destacados como Centro, Jocay, Pradera, Los Esteros)
 */
export const ECUADOR_SECTORS: string[] = [
  'Centro',
  'Jocay',
  'La Pradera',
  'Los Esteros',
  'Tarqui',
  'Barbasquillo',
  'Umiña',
  'Ciudad del Sol',
  'El Palmar',
  'Santa Marianita',
  'San Patricio / Bellavista',
  'Manta 2000',
  'San Mateo',
  'El Murciélago',
  'La Puntilla / Entre Ríos',
  'La Floresta / Mariscal',
  'Cumbayá',
  'Iñaquito / La Carolina',
  'González Suárez',
  'El Batán',
  'Samborondón',
  'Urdesa',
  'Puerto Santa Ana',
  'Kennedy Norte',
  'Ceibos',
  'El Vergel',
  'Huayna Cápac',
  'Norte',
  'Sur'
];

