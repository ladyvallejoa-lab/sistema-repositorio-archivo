import React, { useState } from 'react';
import { FciProject, RequiredDocumentRule, UserRole } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Settings,
  FileText,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface ActiveValidationEngineModuleProps {
  projects: FciProject[];
  rules: RequiredDocumentRule[];
  currentRole: UserRole;
  selectedProjectId?: string;
}

export const ActiveValidationEngineModule: React.FC<ActiveValidationEngineModuleProps> = ({
  projects,
  rules,
  currentRole,
  selectedProjectId: initialProjectId
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || projects[0]?.id || ''
  );
  const [simulatedSize, setSimulatedSize] = useState<number>(8.5);
  const [simulatedFormat, setSimulatedFormat] = useState<string>('application/pdf');
  const [simulatedDate, setSimulatedDate] = useState<string>('2026-10-15');
  const [simulatedDuplicate, setSimulatedDuplicate] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const runActiveValidation = () => {
    const results = [];

    // Rule 1: MIME Type Check
    if (simulatedFormat === 'application/pdf') {
      results.push({
        code: 'RN-VAL-01',
        name: 'Validación de Formato y Firma MIME',
        status: 'ACEPTADO',
        msg: 'Firma de cabecera binaria verificada (application/pdf conforme).'
      });
    } else {
      results.push({
        code: 'RN-VAL-01',
        name: 'Validación de Formato y Firma MIME',
        status: 'RECHAZADO',
        msg: `Formato inválido (${simulatedFormat}). Solo se permiten documentos en formato PDF para esta categoría.`
      });
    }

    // Rule 2: Size Limit Check (<10 MB for FCI report)
    if (simulatedSize <= 10) {
      if (simulatedSize > 9) {
        results.push({
          code: 'RN-VAL-02',
          name: 'Límite de Tamaño Configurado',
          status: 'CON_ADVERTENCIA',
          msg: `El tamaño (${simulatedSize} MB) se encuentra al 90%+ del límite permitido de 10 MB.`
        });
      } else {
        results.push({
          code: 'RN-VAL-02',
          name: 'Límite de Tamaño Configurado',
          status: 'ACEPTADO',
          msg: `Tamaño ${simulatedSize} MB dentro del límite máximo permitido (10 MB).`
        });
      }
    } else {
      results.push({
        code: 'RN-VAL-02',
        name: 'Límite de Tamaño Configurado',
        status: 'RECHAZADO',
        msg: `El archivo excede el tamaño máximo configurado (${simulatedSize} MB > 10 MB). Carga denegada.`
      });
    }

    // Rule 3: Duplicate detection
    if (simulatedDuplicate) {
      results.push({
        code: 'RN-VAL-03',
        name: 'Control de Duplicados e Integridad de Checksum',
        status: 'CON_ADVERTENCIA',
        msg: 'Se detectó coincidencia de hash criptográfico (MD5/SHA256) con un documento ya cargado en el expediente. Se registrará como versión histórica.'
      });
    } else {
      results.push({
        code: 'RN-VAL-03',
        name: 'Control de Duplicados e Integridad de Checksum',
        status: 'ACEPTADO',
        msg: 'Checksum único verificado. No existen duplicados en el repositorio del proyecto.'
      });
    }

    // Rule 4: Temporal coherence with milestones
    const startDate = new Date(selectedProject.startDate);
    const endDate = new Date(selectedProject.estimatedEndDate);
    const docDate = new Date(simulatedDate);

    if (docDate >= startDate && docDate <= endDate) {
      results.push({
        code: 'RN-VAL-04',
        name: 'Coherencia Temporal con Cronograma',
        status: 'ACEPTADO',
        msg: `Fecha de evidencia (${simulatedDate}) coherente con el intervalo de ejecución del proyecto (${selectedProject.startDate} al ${selectedProject.estimatedEndDate}).`
      });
    } else {
      results.push({
        code: 'RN-VAL-04',
        name: 'Coherencia Temporal con Cronograma',
        status: 'RECHAZADO',
        msg: `Fecha de evidencia (${simulatedDate}) fuera del intervalo de ejecución del proyecto.`
      });
    }

    // Rule 5: Mandatory documents check in current stage
    results.push({
      code: 'RN-VAL-05',
      name: 'Verificación de Expediente Obligatorio de Etapa',
      status: selectedProject.documentCompletenessPercent >= 80 ? 'ACEPTADO' : 'CON_ADVERTENCIA',
      msg: `Completitud del expediente al ${selectedProject.documentCompletenessPercent}%. Estado documental evaluado: ${selectedProject.documentCompletenessPercent >= 80 ? 'CONFORME' : 'CON EVIDENCIAS PENDIENTES'}.`
    });

    setTestResults(results);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <ShieldAlert className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 9 · MOTOR DE REGLAS ACTIVAS (NO ALMACENAMIENTO PASIVO)</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Motor de Validación Documental Activa
          </h1>
          <p className="text-xs text-slate-500">
            Evaluación sintáctica y semántica en tiempo real: formato MIME, límites de peso, duplicados y cronograma
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Evaluar Proyecto:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setTestResults(null);
            }}
            className="p-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs font-semibold"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.title.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulator Playground: Test active rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input parameters for test */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-800" />
              <span>Simulador de Carga y Reglas</span>
            </h2>
            <span className="text-slate-500 text-[10px]">Interactivo</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Formato de Archivo (MIME)</label>
            <select
              value={simulatedFormat}
              onChange={(e) => setSimulatedFormat(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-mono text-xs"
            >
              <option value="application/pdf">application/pdf (PDF Conforme)</option>
              <option value="image/jpeg">image/jpeg (JPG - No admitido en informe)</option>
              <option value="application/zip">application/zip (ZIP - No admitido)</option>
              <option value="application/vnd.ms-excel">application/vnd.ms-excel (XLS)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Tamaño del Archivo: <span className="font-mono font-bold">{simulatedSize} MB</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={simulatedSize}
              onChange={(e) => setSimulatedSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5 MB</span>
              <span className="text-amber-700 font-bold">Límite: 10 MB</span>
              <span className="text-rose-700 font-bold">15 MB</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Fecha de la Evidencia</label>
            <input
              type="date"
              value={simulatedDate}
              onChange={(e) => setSimulatedDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-mono text-xs"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Vigencia proyecto: {selectedProject.startDate} al {selectedProject.estimatedEndDate}
            </span>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={simulatedDuplicate}
                onChange={(e) => setSimulatedDuplicate(e.target.checked)}
                className="rounded border-slate-300 text-blue-900 focus:ring-blue-600"
              />
              <span className="font-semibold text-slate-700">Simular archivo ya existente (Duplicado)</span>
            </label>
          </div>

          <button
            onClick={runActiveValidation}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 text-xs"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Ejecutar Validación Activa</span>
          </button>
        </div>

        {/* Right: Real-time Rule Execution Output */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Dictamen del Motor de Validación Activa
              </h2>
              <p className="text-slate-500 text-[11px]">
                Resultados emitidos en tiempo real por el validador
              </p>
            </div>
            {testResults && (
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {testResults.filter((r) => r.status === 'ACEPTADO').length} / {testResults.length} superadas
              </span>
            )}
          </div>

          {!testResults ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">Presione &ldquo;Ejecutar Validación Activa&rdquo; para evaluar los parámetros.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                El motor analizará MIME, límites configurados, coherencia temporal y completitud de etapa.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.map((res, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs ${
                    res.status === 'ACEPTADO'
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : res.status === 'CON_ADVERTENCIA'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : 'bg-rose-50/80 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {res.status === 'ACEPTADO' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : res.status === 'CON_ADVERTENCIA' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        [{res.code}] {res.name}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          res.status === 'ACEPTADO'
                            ? 'bg-emerald-200 text-emerald-900'
                            : res.status === 'CON_ADVERTENCIA'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700 leading-relaxed">{res.msg}</p>
                  </div>
                </div>
              ))}

              {/* Global Assessment */}
              <div className="mt-4 p-4 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Resultado Global de Admisión Documental
                  </span>
                  <p className="font-bold text-sm mt-0.5">
                    {testResults.some((r) => r.status === 'RECHAZADO')
                      ? 'DENEGADO (Carga bloqueada por incumplimiento de regla obligatoria)'
                      : testResults.some((r) => r.status === 'CON_ADVERTENCIA')
                      ? 'ADMITIDO CON ADVERTENCIAS (Requiere confirmación de usuario)'
                      : 'CONFORME (Admitido e ingresado al expediente digital)'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
