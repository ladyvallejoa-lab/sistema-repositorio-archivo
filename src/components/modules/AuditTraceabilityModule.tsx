import React, { useState } from 'react';
import { AuditLogEntry, UserRole } from '../../types';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Lock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface AuditTraceabilityModuleProps {
  logs: AuditLogEntry[];
  currentRole: UserRole;
}

export const AuditTraceabilityModule: React.FC<AuditTraceabilityModuleProps> = ({
  logs,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'audit_table' | 'timeline'>('audit_table');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entityDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntity = entityFilter === 'ALL' || l.entity === entityFilter;

    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <Lock className="w-4 h-4 text-slate-800" />
            <span>MÓDULO 10 · REGLA RN-21 · REGISTRO INMUTABLE Y TRAZABILIDAD</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Seguimiento, Trazabilidad y Auditoría Inmutable
          </h1>
          <p className="text-xs text-slate-500">
            Registro cronológico protegido contra alteraciones: usuario, rol, acción, valores antes/después y dirección IP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exportando bitácora inmutable de auditoría institucional a formato CSV cifrado...')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar Bitácora CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Audit Table vs Timeline */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex border-b border-slate-200 pb-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit_table')}
            className={`pb-2 transition-colors ${
              activeTab === 'audit_table'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bitácora General de Auditoría ({filteredLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Línea de Tiempo del Proyecto Piloto FCI-001
          </button>
        </div>

        {activeTab === 'audit_table' ? (
          <div className="space-y-3">
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar en auditoría por usuario o acción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500 font-medium">Entidad:</span>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="p-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs cursor-pointer"
                >
                  <option value="ALL">Todas las entidades</option>
                  <option value="PROPUESTA">Propuesta</option>
                  <option value="PROYECTO">Proyecto</option>
                  <option value="REPORTE_FCI">Reporte FCI</option>
                  <option value="REPORTE_INVESTIGADOR">Reporte Investigador</option>
                  <option value="DOCUMENTO">Documento</option>
                  <option value="PRODUCCION_CIENTIFICA">Producción Científica</option>
                </select>
              </div>
            </div>

            {/* Inmutable Table */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Fecha y Hora (ISO)</th>
                    <th className="py-2.5 px-3">Usuario y Rol</th>
                    <th className="py-2.5 px-3">Acción</th>
                    <th className="py-2.5 px-3">Entidad Afectada</th>
                    <th className="py-2.5 px-3">Detalle / Valor Previo &rarr; Nuevo</th>
                    <th className="py-2.5 px-3 font-mono text-right">Dirección IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {entry.timestamp}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{entry.userName}</p>
                        <span className="text-[10px] text-slate-500">{entry.userRole}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            entry.action === 'APROBAR'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.action === 'OBSERVAR'
                              ? 'bg-amber-100 text-amber-800'
                              : entry.action === 'ELIMINAR_LOGICO'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {entry.entity.replace('_', ' ')}
                        </span>
                        <p className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {entry.entityDescription}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        {entry.previousValue && (
                          <span className="text-slate-400 line-through mr-1 block sm:inline">
                            {entry.previousValue}
                          </span>
                        )}
                        <span className="text-slate-800 font-medium">{entry.newValue}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {entry.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Timeline view of Pilot Project FCI-001 */
          <div className="py-4 px-2 space-y-6">
            <div className="relative pl-6 border-l-2 border-blue-900 space-y-6">
              <div className="relative">
                <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white ring-2 ring-blue-900"></span>
                <span className="text-[10px] font-mono text-slate-500">14 de Marzo de 2025</span>
                <h4 className="font-bold text-slate-900 text-xs">Aprobación de la Propuesta FCI</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  La Coordinación de Carrera aprueba la propuesta de la Plataforma IoT presentada por el MSc. Xavier Andrade.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white ring-2 ring-blue-900"></span>
                <span className="text-[10px] font-mono text-slate-500">2 de Mayo de 2025</span>
                <h4 className="font-bold text-slate-900 text-xs">Arranque Formal y Firma de Actas</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Inicio del ciclo de ejecución con presupuesto asignado de $12,500 USD.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white ring-2 ring-blue-900"></span>
                <span className="text-[10px] font-mono text-slate-500">18 de Octubre de 2025</span>
                <h4 className="font-bold text-slate-900 text-xs">Reporte Semestral 1 (2025-CII)</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Envío del primer informe semestral del FCI con PDF de evidencias (8.2 MB). Aprobado el 24 de Octubre.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white ring-2 ring-amber-600"></span>
                <span className="text-[10px] font-mono text-slate-500">5 de Noviembre de 2026</span>
                <h4 className="font-bold text-slate-900 text-xs">Reporte Semestral 2 (2026-CI)</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  El Director envía reporte técnico. Coordinación emite observación de calibración de sensores el 9 de Noviembre.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
