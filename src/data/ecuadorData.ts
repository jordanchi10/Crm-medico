export interface EcuadorCity {
  name: string;
  province: string;
  region: 'Sierra' | 'Costa' | 'Oriente' | 'Insular';
}

export const ECUADOR_CITIES: EcuadorCity[] = [
  // Manabí (Costa)
  { name: 'Manta', province: 'Manabí', region: 'Costa' },
  { name: 'Portoviejo', province: 'Manabí', region: 'Costa' },
  { name: 'Chone', province: 'Manabí', region: 'Costa' },
  { name: 'Montecristi', province: 'Manabí', region: 'Costa' },
  { name: 'Jipijapa', province: 'Manabí', region: 'Costa' },
  { name: 'Bahía de Caráquez (Sucre)', province: 'Manabí', region: 'Costa' },
  { name: 'El Carmen', province: 'Manabí', region: 'Costa' },
  { name: 'Calceta (Bolívar)', province: 'Manabí', region: 'Costa' },
  { name: 'Pedernales', province: 'Manabí', region: 'Costa' },
  { name: 'Tosagua', province: 'Manabí', region: 'Costa' },
  { name: 'Rocafuerte', province: 'Manabí', region: 'Costa' },
  { name: 'Santa Ana', province: 'Manabí', region: 'Costa' },
  { name: 'Junín', province: 'Manabí', region: 'Costa' },
  { name: 'Paján', province: 'Manabí', region: 'Costa' },
  { name: 'Puerto López', province: 'Manabí', region: 'Costa' },
  { name: 'San Vicente', province: 'Manabí', region: 'Costa' },
  { name: 'Jama', province: 'Manabí', region: 'Costa' },
  { name: 'Flavio Alfaro', province: 'Manabí', region: 'Costa' },
  { name: 'Olmedo (Manabí)', province: 'Manabí', region: 'Costa' },
  { name: 'Pichincha (Manabí)', province: 'Manabí', region: 'Costa' },
  { name: '24 de Mayo (Sucre)', province: 'Manabí', region: 'Costa' },
  { name: 'Jaramijó', province: 'Manabí', region: 'Costa' },

  // Guayas (Costa)
  { name: 'Guayaquil', province: 'Guayas', region: 'Costa' },
  { name: 'Samborondón', province: 'Guayas', region: 'Costa' },
  { name: 'Daule (La Aurora)', province: 'Guayas', region: 'Costa' },
  { name: 'Durán', province: 'Guayas', region: 'Costa' },
  { name: 'Milagro', province: 'Guayas', region: 'Costa' },
  { name: 'Playas (General Villamil)', province: 'Guayas', region: 'Costa' },
  { name: 'Naranjal', province: 'Guayas', region: 'Costa' },
  { name: 'Balzar', province: 'Guayas', region: 'Costa' },
  { name: 'El Triunfo', province: 'Guayas', region: 'Costa' },
  { name: 'Yaguachi (San Jacinto)', province: 'Guayas', region: 'Costa' },
  { name: 'Pedro Carbo', province: 'Guayas', region: 'Costa' },
  { name: 'Santa Lucía', province: 'Guayas', region: 'Costa' },
  { name: 'Salitre (Urbina Jado)', province: 'Guayas', region: 'Costa' },
  { name: 'El Empalme', province: 'Guayas', region: 'Costa' },
  { name: 'Naranjito', province: 'Guayas', region: 'Costa' },
  { name: 'Bucay (Gral. Antonio Elizalde)', province: 'Guayas', region: 'Costa' },
  { name: 'Colimes', province: 'Guayas', region: 'Costa' },
  { name: 'Palestina', province: 'Guayas', region: 'Costa' },
  { name: 'Simón Bolívar', province: 'Guayas', region: 'Costa' },
  { name: 'Coronel Marcelino Maridueña', province: 'Guayas', region: 'Costa' },
  { name: 'Lomas de Sargentillo', province: 'Guayas', region: 'Costa' },
  { name: 'Nobol (Narcisa de Jesús)', province: 'Guayas', region: 'Costa' },
  { name: 'Jujan (Alfredo Baquerizo Moreno)', province: 'Guayas', region: 'Costa' },
  { name: 'Isidro Ayora', province: 'Guayas', region: 'Costa' },
  { name: 'Balao', province: 'Guayas', region: 'Costa' },

  // Pichincha (Sierra)
  { name: 'Quito', province: 'Pichincha', region: 'Sierra' },
  { name: 'Cumbayá / Tumbaco', province: 'Pichincha', region: 'Sierra' },
  { name: 'Rumiñahui (Sangolquí)', province: 'Pichincha', region: 'Sierra' },
  { name: 'Cayambe', province: 'Pichincha', region: 'Sierra' },
  { name: 'Machachi (Mejía)', province: 'Pichincha', region: 'Sierra' },
  { name: 'Tabacundo (Pedro Moncayo)', province: 'Pichincha', region: 'Sierra' },
  { name: 'San Miguel de Los Bancos', province: 'Pichincha', region: 'Sierra' },
  { name: 'Puerto Quito', province: 'Pichincha', region: 'Sierra' },
  { name: 'Pedro Vicente Maldonado', province: 'Pichincha', region: 'Sierra' },

  // Azuay (Sierra)
  { name: 'Cuenca', province: 'Azuay', region: 'Sierra' },
  { name: 'Gualaceo', province: 'Azuay', region: 'Sierra' },
  { name: 'Paute', province: 'Azuay', region: 'Sierra' },
  { name: 'Chordeleg', province: 'Azuay', region: 'Sierra' },
  { name: 'Santa Isabel', province: 'Azuay', region: 'Sierra' },
  { name: 'Camilo Ponce Enríquez', province: 'Azuay', region: 'Sierra' },
  { name: 'Sígsig', province: 'Azuay', region: 'Sierra' },
  { name: 'Girón', province: 'Azuay', region: 'Sierra' },
  { name: 'San Fernando', province: 'Azuay', region: 'Sierra' },
  { name: 'Nabón', province: 'Azuay', region: 'Sierra' },
  { name: 'Oña', province: 'Azuay', region: 'Sierra' },
  { name: 'Pucará', province: 'Azuay', region: 'Sierra' },
  { name: 'Sevilla de Oro', province: 'Azuay', region: 'Sierra' },
  { name: 'Guachapala', province: 'Azuay', region: 'Sierra' },
  { name: 'El Pan', province: 'Azuay', region: 'Sierra' },

  // El Oro (Costa)
  { name: 'Machala', province: 'El Oro', region: 'Costa' },
  { name: 'Pasaje', province: 'El Oro', region: 'Costa' },
  { name: 'Santa Rosa', province: 'El Oro', region: 'Costa' },
  { name: 'Huaquillas', province: 'El Oro', region: 'Costa' },
  { name: 'Arenillas', province: 'El Oro', region: 'Costa' },
  { name: 'Piñas', province: 'El Oro', region: 'Costa' },
  { name: 'Zaruma', province: 'El Oro', region: 'Costa' },
  { name: 'Portovelo', province: 'El Oro', region: 'Costa' },
  { name: 'El Guabo', province: 'El Oro', region: 'Costa' },
  { name: 'Balsas', province: 'El Oro', region: 'Costa' },
  { name: 'Marcabelí', province: 'El Oro', region: 'Costa' },
  { name: 'Chilla', province: 'El Oro', region: 'Costa' },
  { name: 'Atahualpa (Paccha)', province: 'El Oro', region: 'Costa' },
  { name: 'Las Lajas (La Victoria)', province: 'El Oro', region: 'Costa' },

  // Tungurahua (Sierra)
  { name: 'Ambato', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Baños de Agua Santa', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Pelileo', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Píllaro', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Cevallos', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Tisaleo', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Mocha', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Quero', province: 'Tungurahua', region: 'Sierra' },
  { name: 'Patate', province: 'Tungurahua', region: 'Sierra' },

  // Loja (Sierra)
  { name: 'Loja', province: 'Loja', region: 'Sierra' },
  { name: 'Catamayo', province: 'Loja', region: 'Sierra' },
  { name: 'Cariamanga (Calvas)', province: 'Loja', region: 'Sierra' },
  { name: 'Macará', province: 'Loja', region: 'Sierra' },
  { name: 'Alamor (Puyango)', province: 'Loja', region: 'Sierra' },
  { name: 'Catacocha (Paltas)', province: 'Loja', region: 'Sierra' },
  { name: 'Celica', province: 'Loja', region: 'Sierra' },
  { name: 'Zapotillo', province: 'Loja', region: 'Sierra' },
  { name: 'Amaluza (Espíndola)', province: 'Loja', region: 'Sierra' },
  { name: 'Gonzanamá', province: 'Loja', region: 'Sierra' },
  { name: 'Chaguarpamba', province: 'Loja', region: 'Sierra' },
  { name: 'Saraguro', province: 'Loja', region: 'Sierra' },
  { name: 'Pindal', province: 'Loja', region: 'Sierra' },
  { name: 'Quilanga', province: 'Loja', region: 'Sierra' },
  { name: 'Sozoranga', province: 'Loja', region: 'Sierra' },
  { name: 'Olmedo (Loja)', province: 'Loja', region: 'Sierra' },

  // Santo Domingo de los Tsáchilas (Sierra/Costa)
  { name: 'Santo Domingo', province: 'Santo Domingo de los Tsáchilas', region: 'Sierra' },
  { name: 'La Concordia', province: 'Santo Domingo de los Tsáchilas', region: 'Costa' },

  // Chimborazo (Sierra)
  { name: 'Riobamba', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Alausí', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Guano', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Chambo', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Colta (Villa La Unión)', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Cumandá', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Guamote', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Pallatanga', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Penipe', province: 'Chimborazo', region: 'Sierra' },
  { name: 'Chunchi', province: 'Chimborazo', region: 'Sierra' },

  // Imbabura (Sierra)
  { name: 'Ibarra', province: 'Imbabura', region: 'Sierra' },
  { name: 'Otavalo', province: 'Imbabura', region: 'Sierra' },
  { name: 'Cotacachi', province: 'Imbabura', region: 'Sierra' },
  { name: 'Antonio Ante (Atuntaqui)', province: 'Imbabura', region: 'Sierra' },
  { name: 'Pimampiro', province: 'Imbabura', region: 'Sierra' },
  { name: 'Urcuquí (San Miguel de Urcuquí)', province: 'Imbabura', region: 'Sierra' },

  // Los Ríos (Costa)
  { name: 'Quevedo', province: 'Los Ríos', region: 'Costa' },
  { name: 'Babahoyo', province: 'Los Ríos', region: 'Costa' },
  { name: 'Buena Fe', province: 'Los Ríos', region: 'Costa' },
  { name: 'Ventanas', province: 'Los Ríos', region: 'Costa' },
  { name: 'Vinces', province: 'Los Ríos', region: 'Costa' },
  { name: 'Valencia', province: 'Los Ríos', region: 'Costa' },
  { name: 'Montalvo', province: 'Los Ríos', region: 'Costa' },
  { name: 'Mocache', province: 'Los Ríos', region: 'Costa' },
  { name: 'Puebloviejo', province: 'Los Ríos', region: 'Costa' },
  { name: 'Urdaneta (Catarama)', province: 'Los Ríos', region: 'Costa' },
  { name: 'Palenque', province: 'Los Ríos', region: 'Costa' },
  { name: 'Quinsaloma', province: 'Los Ríos', region: 'Costa' },
  { name: 'Baba', province: 'Los Ríos', region: 'Costa' },

  // Esmeraldas (Costa)
  { name: 'Esmeraldas', province: 'Esmeraldas', region: 'Costa' },
  { name: 'Atacames', province: 'Esmeraldas', region: 'Costa' },
  { name: 'Quinindé (Rosa Zárate)', province: 'Esmeraldas', region: 'Costa' },
  { name: 'San Lorenzo', province: 'Esmeraldas', region: 'Costa' },
  { name: 'Rioverde', province: 'Esmeraldas', region: 'Costa' },
  { name: 'Muisne', province: 'Esmeraldas', region: 'Costa' },
  { name: 'Eloy Alfaro (Valdez)', province: 'Esmeraldas', region: 'Costa' },

  // Cotopaxi (Sierra)
  { name: 'Latacunga', province: 'Cotopaxi', region: 'Sierra' },
  { name: 'Salcedo (San Miguel)', province: 'Cotopaxi', region: 'Sierra' },
  { name: 'La Maná', province: 'Cotopaxi', region: 'Costa' },
  { name: 'Pujilí', province: 'Cotopaxi', region: 'Sierra' },
  { name: 'Saquisilí', province: 'Cotopaxi', region: 'Sierra' },
  { name: 'Sigchos', province: 'Cotopaxi', region: 'Sierra' },
  { name: 'Pangua (El Corazón)', province: 'Cotopaxi', region: 'Sierra' },

  // Santa Elena (Costa)
  { name: 'Salinas', province: 'Santa Elena', region: 'Costa' },
  { name: 'La Libertad', province: 'Santa Elena', region: 'Costa' },
  { name: 'Santa Elena', province: 'Santa Elena', region: 'Costa' },
  { name: 'Montañita', province: 'Santa Elena', region: 'Costa' },
  { name: 'Ballenita', province: 'Santa Elena', region: 'Costa' },
  { name: 'Manglaralto', province: 'Santa Elena', region: 'Costa' },

  // Carchi (Sierra)
  { name: 'Tulcán', province: 'Carchi', region: 'Sierra' },
  { name: 'San Gabriel (Montúfar)', province: 'Carchi', region: 'Sierra' },
  { name: 'El Ángel (Espejo)', province: 'Carchi', region: 'Sierra' },
  { name: 'Mira', province: 'Carchi', region: 'Sierra' },
  { name: 'Bolívar (Carchi)', province: 'Carchi', region: 'Sierra' },
  { name: 'Huaca (San Pedro de Huaca)', province: 'Carchi', region: 'Sierra' },

  // Cañar (Sierra)
  { name: 'Azogues', province: 'Cañar', region: 'Sierra' },
  { name: 'La Troncal', province: 'Cañar', region: 'Costa' },
  { name: 'Cañar', province: 'Cañar', region: 'Sierra' },
  { name: 'Biblián', province: 'Cañar', region: 'Sierra' },
  { name: 'El Tambo', province: 'Cañar', region: 'Sierra' },
  { name: 'Déleg', province: 'Cañar', region: 'Sierra' },
  { name: 'Suscal', province: 'Cañar', region: 'Sierra' },

  // Bolívar (Sierra)
  { name: 'Guaranda', province: 'Bolívar', region: 'Sierra' },
  { name: 'San Miguel (Bolívar)', province: 'Bolívar', region: 'Sierra' },
  { name: 'Chimbo', province: 'Bolívar', region: 'Sierra' },
  { name: 'Caluma', province: 'Bolívar', region: 'Sierra' },
  { name: 'Chillanes', province: 'Bolívar', region: 'Sierra' },
  { name: 'Echeandía', province: 'Bolívar', region: 'Sierra' },
  { name: 'Las Naves', province: 'Bolívar', region: 'Sierra' },

  // Pastaza (Oriente)
  { name: 'Puyo (Pastaza)', province: 'Pastaza', region: 'Oriente' },
  { name: 'Mera', province: 'Pastaza', region: 'Oriente' },
  { name: 'Santa Clara', province: 'Pastaza', region: 'Oriente' },
  { name: 'Arajuno', province: 'Pastaza', region: 'Oriente' },

  // Napo (Oriente)
  { name: 'Tena', province: 'Napo', region: 'Oriente' },
  { name: 'Archidona', province: 'Napo', region: 'Oriente' },
  { name: 'El Chaco', province: 'Napo', region: 'Oriente' },
  { name: 'Baeza (Quijos)', province: 'Napo', region: 'Oriente' },
  { name: 'Carlos Julio Arosemena Tola', province: 'Napo', region: 'Oriente' },

  // Sucumbíos (Oriente)
  { name: 'Nueva Loja (Lago Agrio)', province: 'Sucumbíos', region: 'Oriente' },
  { name: 'Shushufindi', province: 'Sucumbíos', region: 'Oriente' },
  { name: 'Cáscales (El Dorado de Cáscales)', province: 'Sucumbíos', region: 'Oriente' },
  { name: 'Cuyabeno (Tarapoa)', province: 'Sucumbíos', region: 'Oriente' },
  { name: 'Gonzalo Pizarro (Lumbaquí)', province: 'Sucumbíos', region: 'Oriente' },
  { name: 'Putumayo (Puerto El Carmen)', province: 'Sucumbíos', region: 'Oriente' },
  { name: 'Sucumbíos (La Bonita)', province: 'Sucumbíos', region: 'Oriente' },

  // Orellana (Oriente)
  { name: 'El Coca (Pto. Francisco de Orellana)', province: 'Orellana', region: 'Oriente' },
  { name: 'La Joya de los Sachas', province: 'Orellana', region: 'Oriente' },
  { name: 'Loreto', province: 'Orellana', region: 'Oriente' },
  { name: 'Aguarico (Tiputini / Nuevo Rocafuerte)', province: 'Orellana', region: 'Oriente' },

  // Morona Santiago (Oriente)
  { name: 'Macas (Morona)', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Gualaquiza', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Sucúa', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Limón Indanza (Gral. Leonidas Plaza)', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Palora (Metzera)', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Santiago de Méndez', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Logroño', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Pablo Sexto', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Tiwintza (Santiago)', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'San Juan Bosco', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Huamboya', province: 'Morona Santiago', region: 'Oriente' },
  { name: 'Taisha', province: 'Morona Santiago', region: 'Oriente' },

  // Zamora Chinchipe (Oriente)
  { name: 'Zamora', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'Yantzaza', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'El Pangui', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'Centinela del Cóndor (Zumbi)', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'Chinchipe (Zumba)', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'Nangaritza (Guayzimi)', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'Palanda', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'Paquisha', province: 'Zamora Chinchipe', region: 'Oriente' },
  { name: 'Yacuambi (28 de Mayo)', province: 'Zamora Chinchipe', region: 'Oriente' },

  // Galápagos (Insular)
  { name: 'Puerto Ayora (Santa Cruz)', province: 'Galápagos', region: 'Insular' },
  { name: 'Puerto Baquerizo Moreno (San Cristóbal)', province: 'Galápagos', region: 'Insular' },
  { name: 'Puerto Villamil (Isabela)', province: 'Galápagos', region: 'Insular' },
  { name: 'Puerto Velasco Ibarra (Floreana)', province: 'Galápagos', region: 'Insular' }
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
  'Hospital de los Valles (Cumbayá)',
  'Clínica San Gabriel (Quito)',
  'Hospital Kennedy (Guayaquil - Samborondón)',
  'Clínica Guayaquil (Guayaquil)',
  'Hospital Alcívar (Guayaquil)',
  'Clínica Panamericana (Guayaquil)',
  'Hospital Monte Sinaí (Cuenca)',
  'Clínica Santa Inés (Cuenca)',
  'Hospital Santa Margarita (Cuenca)',
  'Clínica San Antonio (Manta)',
  'Hospital General Rodríguez Zambrano (Manta)',
  'Clínica Los Esteros (Manta)',
  'Torre Médica Montecristi (Manta)',
  'Centro Médico del Pacífico (Manta)',
  'Clínica San Gregorio (Portoviejo)',
  'Hospital de Especialidades Portoviejo',
  'Clínica La Cigüeña (Machala)',
  'Hospital Traumatológico (Machala)',
  'Clínica San José (Ambato)',
  'Hospital Durán (Ambato)',
  'Hospital Humanitario (Riobamba)',
  'Clínica San Juan (Riobamba)',
  'Hospital San Agustín (Loja)',
  'Clínica Mogrovejo (Loja)',
  'Clínica Cuba Center (Santo Domingo)',
  'Hospital Bermúdez (Santo Domingo)',
  'Hospital Básico Quevedo',
  'Clínica Ibarra (Ibarra)',
  'Consultorio Médico Privado'
];

export const ECUADOR_SECTORS = [
  'Centro',
  'Jocay',
  'La Pradera',
  'Los Esteros',
  'Tarqui',
  'Barbasquillo',
  'Umiña / Murciélago',
  'San Mateo',
  'El Palmar',
  'Santa Martha',
  'Montecristi Golf / Vía Manta',
  'Norte / Vía Puerto-Aeropuerto',
  'Sur / Costa Azul',
  'Vía a San Juan',
  'Vía Circunvalación',
  'Otro Sector'
];

/**
 * Format raw numbers into standard Ecuador phone representation: +593 9X XXX XXXX
 */
export function formatEcuadorPhoneForWhatsApp(input: string): {
  cleanPhone: string;
  cleanWhatsAppNumber: string;
  displayPhone: string;
  isValidEcuadorMobile: boolean;
} {
  let cleaned = input.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('09')) {
    cleaned = '+593' + cleaned.substring(1);
  } else if (cleaned.startsWith('593')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('9') && cleaned.length === 9) {
    cleaned = '+593' + cleaned;
  } else if (!cleaned.startsWith('+593') && cleaned.length > 0 && !cleaned.startsWith('+')) {
    cleaned = '+593' + cleaned;
  }

  const digits = cleaned.replace(/\D/g, '');
  const isValidEcuadorMobile = digits.startsWith('5939') && digits.length === 12;

  let display = cleaned;
  if (digits.startsWith('593') && digits.length >= 4) {
    const partCountry = '+593';
    const partMobile = digits.slice(3, 5); // ej. 99
    const partMiddle = digits.slice(5, 8); // ej. 123
    const partEnd = digits.slice(8, 12); // ej. 4567

    display = `${partCountry} ${partMobile}`;
    if (partMiddle) display += ` ${partMiddle}`;
    if (partEnd) display += ` ${partEnd}`;
  }

  return {
    cleanPhone: cleaned,
    cleanWhatsAppNumber: digits,
    displayPhone: display,
    isValidEcuadorMobile
  };
}

/**
 * Build standard WhatsApp direct URL
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encodedText}`;
}
