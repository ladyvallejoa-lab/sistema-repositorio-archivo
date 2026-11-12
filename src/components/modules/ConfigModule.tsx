import React, { useState } from 'react';
import { ConfigParameter, RequiredDocumentRule, UserRole } from '../../types';
import {
  Settings,
  Save,
  Calendar,
  HardDrive,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ConfigModuleProps {
  parameters: ConfigParameter[];
  rules: RequiredDocumentRule[];
  currentRole: UserRole;
  onUpdateParameter: (param: ConfigParameter) => void;
  onUpdateRule: (rule: RequiredDocumentRule) => void;
}

export const ConfigModule: React.FC<ConfigModuleProps> = ({
  parameters,
  rules,
  currentRole,
  onUpdateParameter,
  onUpdateRule
}) => {
  const [paramList, setParamList] = useState<ConfigParameter[]>(parameters);
  const [ruleList, setRuleList] = useState<RequiredDocumentRule[]>(rules);
  const [savedBanner, setSavedBanner] = useState(false);

  const canEdit = currentRole === 'ADMINISTRADOR';

  const handleParamValueChange = (id: string, newVal: any) => {
    setParamList(
      paramList.map((p) => (p.id === id ? { ...p, value: newVal } : p))
    );
  };

  const handleRuleToggleMandatory = (id: string) => {
    setRuleList(
      ruleList.map((r) => (r.id === id ? { ...r, mandatory: !r.mandatory } : r))
    );
  };

  const handleRuleMaxSizeChange = (id: string, size: number) => {
    setRuleList(
      ruleList.map((r) => (r.id === id ? { ...r, maxSizeMb: size } : r))
    );
  };

  const handleSaveAll = () => {
    paramList.forEach((p) => onUpdateParameter(p));
    ruleList.forEach((r) => onUpdateRule(r));
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <Sliders className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 2 · CONFIGURACIÓN Y PARAMETRIZACIÓN ACTIVA · REGLAS RN-04, RN-05</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Parámetros del Sistema, Calendario y Reglas Documentales
          </h1>
          <p className="text-xs text-slate-500">
            Valores configurables para límites de almacenamiento, periodos académicos y matriz de documentos obligatorios por etapa
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros</span>
          </button>
        )}
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuración y límites de validación actualizados con éxito en el sistema.</span>
        </div>
      )}

      {/* Grid: Storage Limits & Calendars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Limits */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HardDrive className="w-4 h-4 text-blue-800" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Límites Máximos de Archivo Configurables (Regla RN-04)
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {paramList
              .filter((p) => p.category === 'LIMITES_ARCHIVO')
              .map((param) => (
                <div
                  key={param.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{param.name}</span>
                    <p className="text-[11px] text-slate-500">{param.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={param.value as number}
                      onChange={(e) => handleParamValueChange(param.id, Number(e.target.value))}
                      className="w-16 p-1.5 border border-slate-300 rounded text-right font-mono font-bold text-xs bg-white text-slate-900 disabled:bg-slate-100"
                    />
                    <span className="font-mono text-slate-600 text-xs">{param.unit}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Calendar and Periods */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-blue-800" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Calendario y Periodos Académicos
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {paramList
              .filter((p) => p.category === 'CALENDARIO' || p.category === 'PERIODOS')
              .map((param) => (
                <div
                  key={param.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{param.name}</span>
                    <p className="text-[11px] text-slate-500">{param.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type={typeof param.value === 'number' ? 'number' : 'text'}
                      disabled={!canEdit}
                      value={param.value as any}
                      onChange={(e) => handleParamValueChange(param.id, e.target.value)}
                      className="w-32 p-1.5 border border-slate-300 rounded text-center font-mono font-bold text-xs bg-white text-slate-900 disabled:bg-slate-100"
                    />
                    {param.unit && (
                      <span className="font-mono text-slate-600 text-xs">{param.unit}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Catalog of Required Documents per Stage */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-800" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Catálogo de Documentos Obligatorios por Etapa del Proyecto
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Reglas evaluadas por el motor de validación para el cierre (RN-10)
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Tipo de Documento</th>
                <th className="py-2.5 px-4">Etapa del Proyecto</th>
                <th className="py-2.5 px-4">Obligatoriedad</th>
                <th className="py-2.5 px-4">Límite Tamaño</th>
                <th className="py-2.5 px-4">Formatos Permitidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ruleList.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {rule.documentType}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {rule.projectStage}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={rule.mandatory}
                        onChange={() => handleRuleToggleMandatory(rule.id)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-600"
                      />
                      <span
                        className={`text-[11px] font-bold ${
                          rule.mandatory ? 'text-indigo-900' : 'text-slate-500'
                        }`}
                      >
                        {rule.mandatory ? 'Obligatorio' : 'Opcional'}
                      </span>
                    </label>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={rule.maxSizeMb}
                      onChange={(e) => handleRuleMaxSizeChange(rule.id, Number(e.target.value))}
                      className="w-16 p-1 border border-slate-300 rounded text-right font-mono text-xs bg-white text-slate-900 disabled:bg-slate-100 mr-1"
                    />
                    <span>MB</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 font-mono text-[10px]">
                      {rule.allowedFormats.map((f, i) => (
                        <span
                          key={i}
                          className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
