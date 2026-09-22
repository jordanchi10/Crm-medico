import { MedicalLead } from '../types';

/**
 * Format registration date for display in Spanish
 * e.g. "22 de septiembre de 2026", "22 Sep 2026"
 */
export function formatRegistrationDate(
  dateStr?: string,
  style: 'full' | 'short' | 'compact' | 'with-time' = 'short'
): string {
  if (!dateStr) return 'Sin fecha';

  try {
    // Handle both 'YYYY-MM-DD' and 'YYYY-MM-DD HH:mm' or ISO strings
    const parts = dateStr.split(/[-T :]/);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      const hour = parts[3] ? parseInt(parts[3], 10) : 0;
      const min = parts[4] ? parseInt(parts[4], 10) : 0;

      const dateObj = new Date(year, month, day, hour, min);
      if (isNaN(dateObj.getTime())) return dateStr;

      const monthsShort = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      const monthsFull = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];

      if (style === 'compact') {
        const yy = year.toString().slice(-2);
        const dd = day.toString().padStart(2, '0');
        const mm = (month + 1).toString().padStart(2, '0');
        return `${dd}/${mm}/${yy}`;
      }

      if (style === 'full') {
        return `${day} de ${monthsFull[month]} de ${year}`;
      }

      if (style === 'with-time') {
        const timeStr = parts.length >= 5 
          ? ` a las ${parts[3].padStart(2, '0')}:${parts[4].padStart(2, '0')}`
          : '';
        return `${day} de ${monthsShort[month]}, ${year}${timeStr}`;
      }

      // Default 'short'
      return `${day} ${monthsShort[month]} ${year}`;
    }

    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Returns humanized relative time since registration
 * e.g. "Hoy", "Ayer", "Hace 3 días", "Hace 2 semanas"
 */
export function getRelativeRegistrationTime(dateStr?: string): string {
  if (!dateStr) return '';

  try {
    const rawDate = dateStr.includes('T') ? dateStr : `${dateStr.split(' ')[0]}T00:00:00`;
    const target = new Date(rawDate);
    const now = new Date();

    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} sem${weeks > 1 ? 's' : ''}`;
    }
    const months = Math.floor(diffDays / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  } catch (e) {
    return '';
  }
}

/**
 * Get registration date and time information from lead
 */
export function getLeadRegistrationInfo(lead: MedicalLead): {
  date: string;
  formattedShort: string;
  formattedFull: string;
  formattedCompact: string;
  relative: string;
  exactDateTime?: string;
} {
  // Check if lead has a creation log in history with exact time
  const creationLog = lead.history?.find((h) => h.type === 'creacion');
  const exactDateTime = creationLog?.date || lead.createdAt;
  const rawDate = lead.createdAt || exactDateTime?.split(' ')[0] || new Date().toISOString().split('T')[0];

  return {
    date: rawDate,
    formattedShort: formatRegistrationDate(rawDate, 'short'),
    formattedFull: formatRegistrationDate(rawDate, 'full'),
    formattedCompact: formatRegistrationDate(rawDate, 'compact'),
    relative: getRelativeRegistrationTime(rawDate),
    exactDateTime
  };
}
