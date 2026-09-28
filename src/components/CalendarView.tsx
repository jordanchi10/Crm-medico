import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MessageCircle, 
  ExternalLink, 
  Plus, 
  Filter, 
  User, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  List
} from 'lucide-react';
import { MedicalLead, StageId } from '../types';
import { STAGES } from '../data/stages';
import { getSpecialtyMeta } from '../data/specialties';
import { ThreeDCalendarIcon } from './ThreeDIcons';

interface CalendarViewProps {
  leads: MedicalLead[];
  onOpenEdit: (lead: MedicalLead) => void;
  onOpenWhatsApp: (lead: MedicalLead) => void;
  onAddNewAppointment: () => void;
  onOpenReceipt?: (lead: MedicalLead) => void;
}

type CalendarMode = 'month' | 'agenda';

export const CalendarView: React.FC<CalendarViewProps> = ({
  leads,
  onOpenEdit,
  onOpenWhatsApp,
  onAddNewAppointment,
  onOpenReceipt
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'demos' | 'high_priority'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter leads that have a follow up date or closing date
  const filteredLeads = leads.filter((l) => {
    if (!l.nextFollowUpDate) return false;
    if (filterType === 'demos') {
      return l.stage === 'demo_agendada';
    }
    if (filterType === 'high_priority') {
      return l.priority === 'alta';
    }
    return true;
  });

  // Group leads by date string 'YYYY-MM-DD'
  const leadsByDate = filteredLeads.reduce((acc, lead) => {
    const d = lead.nextFollowUpDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(lead);
    return acc;
  }, {} as Record<string, MedicalLead[]>);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDayStr(now.toISOString().split('T')[0]);
  };

  // Month days generation
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Starting day of week: Sunday = 0, Monday = 1... Let's convert to Monday=0, Sunday=6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  // Calendar cells
  const calendarDays: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

  // Padding days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const d = new Date(year, month - 1, day);
    calendarDays.push({
      dateStr: d.toISOString().split('T')[0],
      dayNum: day,
      isCurrentMonth: false
    });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    calendarDays.push({
      dateStr: d.toISOString().split('T')[0],
      dayNum: day,
      isCurrentMonth: true
    });
  }

  // Padding days from next month to complete rows (multiple of 7)
  const remainingCells = 7 - (calendarDays.length % 7);
  if (remainingCells < 7) {
    for (let day = 1; day <= remainingCells; day++) {
      const d = new Date(year, month + 1, day);
      calendarDays.push({
        dateStr: d.toISOString().split('T')[0],
        dayNum: day,
        isCurrentMonth: false
      });
    }
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Leads for currently selected day
  const selectedDayLeads = leadsByDate[selectedDayStr] || [];

  // Export to Google Calendar
  const handleAddToGoogleCalendar = (lead: MedicalLead) => {
    const title = encodeURIComponent(`Demo Directorio Médico: ${lead.doctorName} (${lead.specialty})`);
    const details = encodeURIComponent(
      `Reunión comercial y demostración de perfil médico.\n` +
      `Especialista: ${lead.doctorName}\n` +
      `Especialidad: ${lead.specialty}\n` +
      `Lugar: ${lead.clinicOrHospital} (${lead.city || 'Ecuador'})\n` +
      `Teléfono WhatsApp: ${lead.phone}\n` +
      `Notas: ${lead.notes || 'Sin notas adicionales'}`
    );
    const location = encodeURIComponent(`${lead.clinicOrHospital}, ${lead.city || 'Manta'}, Ecuador`);

    const dateVal = lead.nextFollowUpDate.replace(/-/g, '');
    const timeVal = (lead.nextFollowUpTime || '11:00').replace(':', '') + '00';
    const dates = `${dateVal}T${timeVal}/${dateVal}T${timeVal}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(url, '_blank');
  };

  // Generate .ICS file download
  const handleDownloadICS = (lead: MedicalLead) => {
    const dateVal = lead.nextFollowUpDate.replace(/-/g, '');
    const timeVal = (lead.nextFollowUpTime || '11:00').replace(':', '') + '00';
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Directorio Medico Ecuador//CRM//ES
BEGIN:VEVENT
SUMMARY:Demo Directorio Medico: ${lead.doctorName} (${lead.specialty})
DESCRIPTION:Demostracion comercial para consultorio en ${lead.clinicOrHospital}. WhatsApp: ${lead.phone}
LOCATION:${lead.clinicOrHospital}, ${lead.city || 'Manta'}, Ecuador
DTSTART:${dateVal}T${timeVal}
DTEND:${dateVal}T${timeVal}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cita_${lead.doctorName.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Demos & follow-ups count for current month
  const currentMonthEventsCount = filteredLeads.filter(l => l.nextFollowUpDate.startsWith(`${year}-${(month + 1).toString().padStart(2, '0')}`)).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Metrics Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900/60 shrink-0">
            <ThreeDCalendarIcon size={28} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Calendario de Citas y Demos</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {currentMonthEventsCount} eventos este mes
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Planificación de visitas a consultorios, demostraciones interactivas y cierres comerciales en Ecuador.
            </p>
          </div>
        </div>

        {/* View Switches & Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-between md:justify-end">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                calendarMode === 'month' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Mes</span>
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('agenda')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                calendarMode === 'agenda' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Agenda</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onAddNewAppointment}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Filter and Month Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight capitalize">
            {monthNames[month]} {year}
          </h3>

          <button
            type="button"
            onClick={handleToday}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            Hoy
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1 hidden md:inline">Filtrar:</span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 dark:bg-sky-600 text-white border-slate-900 dark:border-sky-500 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Todas ({filteredLeads.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('demos')}
            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
              filterType === 'demos'
                ? 'bg-amber-500 dark:bg-amber-600 text-white border-amber-600 dark:border-amber-500 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Solo Demos ({leads.filter(l => l.stage === 'demo_agendada').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('high_priority')}
            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
              filterType === 'high_priority'
                ? 'bg-rose-600 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-500 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Prioridad Alta ({leads.filter(l => l.priority === 'alta' && l.nextFollowUpDate).length})
          </button>
        </div>
      </div>

      {/* Main Mode View: Month Grid OR Agenda List */}
      {calendarMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 7-column Calendar Grid (Left 2 cols on lg) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col">
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
              {weekDayNames.map((wd) => (
                <div key={wd} className="py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2 flex-1 auto-rows-fr">
              {calendarDays.map((cell, idx) => {
                const dayLeads = leadsByDate[cell.dateStr] || [];
                const isSelected = selectedDayStr === cell.dateStr;
                const isToday = todayStr === cell.dateStr;

                return (
                  <button
                    key={`${cell.dateStr}-${idx}`}
                    type="button"
                    onClick={() => setSelectedDayStr(cell.dateStr)}
                    className={`min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 ring-2 ring-sky-500/20 shadow-xs'
                        : isToday
                        ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/30'
                        : cell.isCurrentMonth
                        ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800'
                        : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/30 opacity-40 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {dayLeads.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {dayLeads.length}
                        </span>
                      )}
                    </div>

                    {/* Event dots / preview */}
                    <div className="space-y-1 mt-1">
                      {dayLeads.slice(0, 2).map((l) => (
                        <div
                          key={l.id}
                          className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-semibold truncate flex items-center gap-1 ${
                            l.stage === 'demo_agendada'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : l.priority === 'alta'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                          title={`${l.doctorName} (${l.specialty}) ${l.nextFollowUpTime || ''}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span className="truncate">{l.doctorName.replace('Dr. ', '').replace('Dra. ', '')}</span>
                        </div>
                      ))}

                      {dayLeads.length > 2 && (
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-1">
                          +{dayLeads.length - 2} más
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Selected Day Inspector Panel (Right 1 col on lg) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Detalle del Día
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white capitalize">
                  {new Date(selectedDayStr + 'T00:00:00').toLocaleDateString('es-EC', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h4>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                selectedDayLeads.length > 0 
                  ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {selectedDayLeads.length} {selectedDayLeads.length === 1 ? 'cita' : 'citas'}
              </span>
            </div>

            {/* List of events for selected day */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 max-h-[460px]">
              {selectedDayLeads.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-500">
                  <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No hay citas programadas para este día.</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Puedes agendar una demostración médica con el botón superior.
                  </p>
                </div>
              ) : (
                selectedDayLeads.map((lead) => {
                  const specMeta = getSpecialtyMeta(lead.specialty);
                  const stageMeta = STAGES.find(s => s.id === lead.stage);

                  return (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {lead.doctorName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${specMeta.bgLight} ${specMeta.color}`}>
                              {lead.specialty}
                            </span>
                            {stageMeta && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                                {stageMeta.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 px-2 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            <span>{lead.nextFollowUpTime || '11:00'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div className="flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.clinicOrHospital}</span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.city || 'Manta'} ({lead.sector || 'Centro'})</span>
                        </div>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenWhatsApp(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEdit(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span>Ficha</span>
                          </button>
                        </div>

                        {/* Google Calendar export buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddToGoogleCalendar(lead)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                            title="Añadir a Google Calendar"
                          >
                            <CalendarRange className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadICS(lead)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-[10px] font-bold"
                            title="Descargar archivo .ics para iCal / Outlook"
                          >
                            .ics
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      ) : (
        /* Agenda Mode: Chronological List of all scheduled events */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Listado Cronológico de Citas y Demos ({filteredLeads.length})
            </h4>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ordenado por fecha</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLeads
              .sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate))
              .map((lead) => {
                const specMeta = getSpecialtyMeta(lead.specialty);
                const stageMeta = STAGES.find(s => s.id === lead.stage);
                const isPast = lead.nextFollowUpDate < todayStr;
                const isToday = lead.nextFollowUpDate === todayStr;

                return (
                  <div key={lead.id} className="py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-850 p-2 rounded-xl transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-14 text-center shrink-0 p-2 rounded-xl border font-bold ${
                        isToday
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                          : isPast
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        <div className="text-[10px] uppercase">
                          {new Date(lead.nextFollowUpDate + 'T00:00:00').toLocaleDateString('es-EC', { month: 'short' })}
                        </div>
                        <div className="text-base font-black">
                          {lead.nextFollowUpDate.slice(8)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {lead.doctorName}
                          </h5>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${specMeta.bgLight} ${specMeta.color}`}>
                            {lead.specialty}
                          </span>
                          {stageMeta && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                              {stageMeta.name}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>🏥 {lead.clinicOrHospital}</span>
                          <span>📍 {lead.city || 'Manta'} ({lead.sector || 'Centro'})</span>
                          <span className="font-mono text-sky-700 dark:text-sky-400 font-bold">⏰ {lead.nextFollowUpTime || '11:00'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddToGoogleCalendar(lead)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Google Calendar"
                      >
                        <CalendarRange className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span className="hidden sm:inline">Google Cal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(lead)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenEdit(lead)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

    </div>
  );
};
