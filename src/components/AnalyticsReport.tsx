import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Award, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { MedicalLead } from '../types';
import { STAGES } from '../data/stages';
import { getSpecialtyMeta } from '../data/specialties';
import { 
  computeSpecialtyAnalytics, 
  computeSectorAnalytics, 
  computeServiceAnalytics, 
  formatCurrency 
} from '../utils/storage';
import { MapPin, Briefcase } from 'lucide-react';

interface AnalyticsReportProps {
  leads: MedicalLead[];
}

export const AnalyticsReport: React.FC<AnalyticsReportProps> = ({ leads }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'current_month' | 'all_time'>('current_month');

  // Filter leads based on selected period
  // Current month: 2026-09
  const currentMonthPrefix = '2026-09';
  const periodLeads = selectedPeriod === 'current_month'
    ? leads.filter((l) => (l.createdAt && l.createdAt.startsWith(currentMonthPrefix)) || (l.expectedClosingDate && l.expectedClosingDate.startsWith(currentMonthPrefix)))
    : leads;

  // General KPIs
  const totalLeads = periodLeads.length;
  const wonLeads = periodLeads.filter((l) => l.stage === 'ganado');
  const lostLeads = periodLeads.filter((l) => l.stage === 'perdido');
  const inPipelineLeads = periodLeads.filter((l) => l.stage !== 'ganado' && l.stage !== 'perdido');

  // Revenue metrics
  const totalPaidRevenue = wonLeads.reduce((acc, l) => acc + l.paidAmount, 0);
  const totalEstimatedWon = wonLeads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const pendingCollection = Math.max(0, totalEstimatedWon - totalPaidRevenue);
  const pipelineValue = inPipelineLeads.reduce((acc, l) => acc + l.estimatedValue, 0);

  const globalConversionRate = totalLeads > 0
    ? Math.round((wonLeads.length / totalLeads) * 1000) / 10
    : 0;

  // Specialty conversion analytics
  const specialtyMetrics = computeSpecialtyAnalytics(periodLeads);

  // Sector location analytics (Centro, Jocay, Pradera, Los Esteros, etc.)
  const sectorMetrics = computeSectorAnalytics(periodLeads);

  // Services analytics (Perfil 1 año $99 vs 2 años $150, etc.)
  const serviceMetrics = computeServiceAnalytics(periodLeads);

  // Top specialty by conversion rate (with at least 1 lead)
  const topConversionSpecialty = specialtyMetrics.length > 0 ? specialtyMetrics[0] : null;

  // Top specialty by revenue
  const topRevenueSpecialty = [...specialtyMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || null;

  // Payment methods breakdown
  const paymentMethodsMap: Record<string, { count: number; totalAmount: number }> = {};
  wonLeads.forEach((lead) => {
    const method = lead.paymentMethod || 'No Definido';
    const amount = lead.paidAmount > 0 ? lead.paidAmount : lead.estimatedValue;
    if (!paymentMethodsMap[method]) {
      paymentMethodsMap[method] = { count: 0, totalAmount: 0 };
    }
    paymentMethodsMap[method].count += 1;
    paymentMethodsMap[method].totalAmount += amount;
  });

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ['Especialidad', 'Total Prospectos', 'Cierres Ganados', 'Tasa Conversión %', 'Ingresos Generados', 'Ticket Promedio'];
    const rows = specialtyMetrics.map((m) => [
      `"${m.specialty}"`,
      m.totalLeads,
      m.wonLeads,
      `${m.conversionRate}%`,
      m.totalRevenue,
      m.averageTicket
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_medicas_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Panel de Analítica y Reporte Mensual
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas de conversión y recaudación por cada especialidad médica
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <select
            id="select-analytics-period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="current_month">Septiembre 2026 (Mes Actual)</option>
            <option value="all_time">Todo el Histórico</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={exportCSV}
            title="Exportar a CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            title="Imprimir reporte ejecutivo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer border border-transparent dark:border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ingresos Cobrados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalPaidRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>{wonLeads.length} contratos cerrados</span>
            </div>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Valor en Negociación</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">
              {formatCurrency(pipelineValue)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {inPipelineLeads.length} médicos en seguimiento activo
            </div>
          </div>
        </div>

        {/* Global Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tasa de Conversión</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">
              {globalConversionRate}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {wonLeads.length} ganados de {totalLeads} prospectos
            </div>
          </div>
        </div>

        {/* Pending Collections */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldos por Cobrar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
              {formatCurrency(pendingCollection)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Anticipos cobrados y remanentes
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Conversion Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topConversionSpecialty && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                Especialidad con Mayor Tasa de Éxito
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {topConversionSpecialty.specialty}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Tasa de conversión del <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{topConversionSpecialty.conversionRate}%</strong> con {topConversionSpecialty.wonLeads} de {topConversionSpecialty.totalLeads} prospectos convertidos e ingresos por {formatCurrency(topConversionSpecialty.totalRevenue)}.
              </p>
            </div>
          </div>
        )}

        {topRevenueSpecialty && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50/50 dark:from-teal-950/30 dark:to-blue-950/20 p-4 rounded-xl border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                Especialidad con Mayor Facturación
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                {topRevenueSpecialty.specialty}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Ingresos acumulados de <strong className="text-teal-700 dark:text-teal-400 font-bold">{formatCurrency(topRevenueSpecialty.totalRevenue)}</strong> con un ticket promedio de {formatCurrency(topRevenueSpecialty.averageTicket)} por médico especialista.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CORE FEATURE: CONVERSION BY MEDICAL SPECIALTY (CHART & TABLE) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Análisis de Conversión por Especialidad Médica</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualiza qué especialidades médicas tienen mayor respuesta, cierres y rentabilidad
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {specialtyMetrics.length} especialidades activas
          </span>
        </div>

        {/* Visual Bar Comparison */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 space-y-3.5">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
            Gráfica Comparativa de Tasa de Conversión (%)
          </div>
          <div className="space-y-3">
            {specialtyMetrics.map((item) => {
              const specMeta = getSpecialtyMeta(item.specialty);
              return (
                <div key={item.specialty} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${specMeta.color.replace('text', 'bg')}`} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.specialty}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">({item.wonLeads} ganados / {item.totalLeads} total)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.conversionRate}%</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium w-20 text-right">{formatCurrency(item.totalRevenue)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.conversionRate >= 60 ? 'bg-emerald-500' :
                        item.conversionRate >= 30 ? 'bg-teal-500' :
                        item.conversionRate > 0 ? 'bg-blue-400' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(item.conversionRate, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 font-bold">Especialidad Médica</th>
                <th className="py-3 px-4 font-bold text-center">Prospectos</th>
                <th className="py-3 px-4 font-bold text-center">En Proceso</th>
                <th className="py-3 px-4 font-bold text-center">Ganados</th>
                <th className="py-3 px-4 font-bold text-center">Perdidos</th>
                <th className="py-3 px-4 font-bold text-right">Tasa Conversión</th>
                <th className="py-3 px-4 font-bold text-right">Ingreso Generado</th>
                <th className="py-3 px-4 font-bold text-right">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {specialtyMetrics.map((item) => {
                const specMeta = getSpecialtyMeta(item.specialty);
                return (
                  <tr key={item.specialty} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${specMeta.bgLight} dark:bg-opacity-20 ${specMeta.color} ${specMeta.borderLight} dark:border-opacity-30`}
                        >
                          {item.specialty}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {item.totalLeads}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                      {item.inProgressLeads}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-400">
                      {item.wonLeads}
                    </td>
                    <td className="py-3 px-4 text-center text-rose-600 dark:text-rose-400">
                      {item.lostLeads}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.conversionRate >= 50
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : item.conversionRate >= 25
                          ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {item.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">
                      {formatCurrency(item.averageTicket)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Sales Funnel Stages & Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Funnel Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Embudo de Ventas por Etapas (Funnel)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribución de médicos especialistas en cada fase del proceso comercial
            </p>

            <div className="mt-4 space-y-2.5">
              {STAGES.map((st) => {
                const count = periodLeads.filter((l) => l.stage === st.id).length;
                const percent = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

                return (
                  <div key={st.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{st.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{count} médicos</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          st.id === 'ganado' ? 'bg-emerald-500' :
                          st.id === 'perdido' ? 'bg-rose-400' :
                          st.id === 'propuesta_enviada' ? 'bg-purple-500' :
                          st.id === 'demo_agendada' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(percent, count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recaudación por Método de Pago</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Preferencia de pago de los especialistas médicos en contratos cerrados
            </p>

            <div className="mt-4 space-y-3">
              {Object.keys(paymentMethodsMap).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  Aún no hay cobros registrados con método de pago definido.
                </div>
              ) : (
                Object.entries(paymentMethodsMap).map(([method, data]) => {
                  const percent = totalPaidRevenue > 0 
                    ? Math.round((data.totalAmount / totalPaidRevenue) * 100) 
                    : 0;

                  return (
                    <div key={method} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{method}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {data.count} {data.count === 1 ? 'médico' : 'médicos'} ({percent}% del total)
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 text-right">
                        {formatCurrency(data.totalAmount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>Total Recaudado en el periodo:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{formatCurrency(totalPaidRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* Row 3: Segmentación por Locación / Sector & Servicios Ofertados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sector Analytics Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Segmentación por Locación / Sector</span>
              </h3>
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                {sectorMetrics.length} sectores
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rendimiento comercial por zona (Centro, Jocay, La Pradera, Los Esteros...)
            </p>

            <div className="mt-4 space-y-3">
              {sectorMetrics.map((sec) => (
                <div key={sec.sector} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <span className="text-teal-600 dark:text-teal-400">📍</span>
                      <span>{sec.sector}</span>
                      <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                        ({sec.wonLeads} ganados / {sec.totalLeads} total)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(sec.totalRevenue)}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        sec.conversionRate >= 50
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : sec.conversionRate > 0
                          ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {sec.conversionRate}% conv.
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(sec.conversionRate, sec.totalLeads > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Analytics Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Desempeño por Servicio ($99 vs $150)</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {serviceMetrics.length} servicios
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Planes contratados de 1 año ($99), 2 años ($150) y catálogo personalizado
            </p>

            <div className="mt-4 space-y-3">
              {serviceMetrics.map((srv) => (
                <div key={srv.serviceName} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      <span>{srv.serviceName}</span>
                      <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 block sm:inline sm:ml-1.5">
                        {srv.totalLeads} prospectos · {srv.wonLeads} cerrados
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {formatCurrency(srv.totalRevenue)}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        {srv.conversionRate}% éxito
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(srv.conversionRate, srv.totalLeads > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
