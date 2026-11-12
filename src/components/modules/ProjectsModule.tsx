import React, { useState } from 'react';
import { FciProject, UserRole, ProjectMilestone } from '../../types';
import {
  FolderGit2,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  FileText,
  ShieldCheck,
  Eye,
  CheckSquare,
  Plus
} from 'lucide-react';

interface ProjectsModuleProps {
  projects: FciProject[];
  currentRole: UserRole;
  onUpdateProject: (updated: FciProject) => void;
  onViewDocument: (doc: any) => void;
  onNavigateToValidation: (projectId: string) => void;
}

export const ProjectsModule: React.FC<ProjectsModuleProps> = ({
  projects,
  currentRole,
  onUpdateProject,
  onViewDocument,
  onNavigateToValidation
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'info' | 'team' | 'milestones' | 'documents'>('info');
  const [closureAlert, setClosureAlert] = useState<{ allowed: boolean; msg: string; missingDocs?: string[] } | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const isClosed = selectedProject?.status === 'FINALIZADO' || selectedProject?.status === 'CANCELADO';
  const canManageProject =
    (currentRole === 'DIRECTOR_FCI' || currentRole === 'COORDINADOR_CARRERA' || currentRole === 'ADMINISTRADOR') &&
    !isClosed;

  // Rule RN-10: Verification before closing project
  const handleVerifyClosure = () => {
    if (!selectedProject) return;

    if (selectedProject.documentCompletenessPercent < 100) {
      setClosureAlert({
        allowed: false,
        msg: `Regla RN-10 Bloqueante: El proyecto cuenta con un ${selectedProject.documentCompletenessPercent}% de completitud documental. No se puede finalizar sin el expediente 100% completo.`,
        missingDocs: [
          'Informe Semestral 2 - Periodo 2026-CI (En revisión)',
          'Acta de Finiquito y Cierre de Expediente (Pendiente)',
          'Informe Final de Resultados de Investigación (Pendiente)'
        ]
      });
    } else {
      setClosureAlert({
        allowed: true,
        msg: 'Expediente documental 100% verificado. Todos los requisitos obligatorios de todas las fases han sido aprobados.'
      });
    }
  };

  const handleFinalizeProject = () => {
    if (!selectedProject) return;
    if (!window.confirm(`¿Confirmar el cierre definitivo del proyecto ${selectedProject.code}? El expediente pasará a modo SOLO LECTURA irreversible.`)) {
      return;
    }

    const updated: FciProject = {
      ...selectedProject,
      status: 'FINALIZADO',
      actualEndDate: new Date().toISOString().split('T')[0]
    };
    onUpdateProject(updated);
    setClosureAlert({
      allowed: true,
      msg: `El proyecto ${updated.code} ha sido FINALIZADO formalmente. El expediente ha quedado archivado en modo Solo Lectura.`
    });
  };

  if (!selectedProject) {
    return <div className="p-8 text-center text-slate-500">No hay proyectos activos registrados.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Selector Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-5 h-5 text-blue-800" />
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Gestión Integral de Proyectos FCI
            </h1>
            <p className="text-xs text-slate-500">
              Proyectos activos de la Carrera de Ingeniería en Telemática · Universidad de Guayaquil
            </p>
          </div>
        </div>

        {/* Project picker buttons */}
        <div className="flex items-center gap-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProjectId(p.id);
                setClosureAlert(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                p.id === selectedProjectId
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p.code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Project Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Project Header Banner */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded">
                  {selectedProject.code}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    selectedProject.status === 'EN_EJECUCION'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedProject.status === 'FINALIZADO'
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  {selectedProject.status.replace('_', ' ')}
                </span>
                {isClosed && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <Lock className="w-3 h-3" />
                    <span>Solo Lectura</span>
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  {selectedProject.academicPeriod}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {selectedProject.title}
              </h2>
            </div>

            {/* Quick Action: Expediente Closure Verification */}
            {currentRole === 'COORDINADOR_CARRERA' && !isClosed && (
              <div className="shrink-0">
                <button
                  onClick={handleVerifyClosure}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  <span>Verificar Cierre de Expediente</span>
                </button>
              </div>
            )}
          </div>

          {/* Closure Alert Box if triggered */}
          {closureAlert && (
            <div
              className={`mt-4 p-4 rounded-lg border text-xs ${
                closureAlert.allowed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {closureAlert.allowed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>{closureAlert.msg}</span>
              </div>

              {closureAlert.missingDocs && (
                <div className="mt-2 pl-6 space-y-1">
                  <p className="font-semibold text-rose-800">Documentos pendientes obligatorios:</p>
                  <ul className="list-disc list-inside text-rose-700">
                    {closureAlert.missingDocs.map((doc, i) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {closureAlert.allowed && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleFinalizeProject}
                    className="px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded hover:bg-emerald-800 text-xs shadow-2xs"
                  >
                    Confirmar Transición a FINALIZADO
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs within Project */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ficha General y Objetivos
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipo de Investigación ({selectedProject.participants.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'milestones'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Cronograma e Hitos ({selectedProject.milestones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Expediente Documental ({selectedProject.documents.length})</span>
          </button>
        </div>

        {/* Tab 1: Ficha General */}
        {activeTab === 'info' && (
          <div className="p-6 space-y-6 text-xs text-slate-700">
            {/* Meta badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Línea de Investigación</span>
                <span className="font-semibold text-slate-900 text-xs block mt-0.5">
                  {selectedProject.researchLine}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Carrera y Facultad</span>
                <span className="font-semibold text-slate-900 text-xs block mt-0.5">
                  {selectedProject.career} · {selectedProject.faculty}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Presupuesto Aprobado</span>
                <span className="font-bold text-slate-900 font-mono text-xs block mt-0.5">
                  ${selectedProject.budgetAssigned.toLocaleString()} USD (Ejecutado: ${selectedProject.budgetExecuted.toLocaleString()})
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Vigencia del Proyecto</span>
                <span className="font-semibold text-slate-900 text-xs block mt-0.5">
                  {selectedProject.startDate} al {selectedProject.estimatedEndDate}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-slate-500">
                Descripción del Proyecto
              </h3>
              <p className="leading-relaxed text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                {selectedProject.description}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-slate-500">
                Objetivo General
              </h3>
              <p className="leading-relaxed text-slate-800 font-medium bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                {selectedProject.generalObjective}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-xs mb-1.5 uppercase tracking-wider text-slate-500">
                Objetivos Específicos
              </h3>
              <ul className="space-y-2">
                {selectedProject.specificObjectives.map((obj, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-slate-200"
                  >
                    <span className="font-bold text-blue-900 shrink-0 font-mono">0{i + 1}.</span>
                    <span className="text-slate-700">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Team Members */}
        {activeTab === 'team' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Investigadores y Personal Asignado al Proyecto
              </h3>
              <span className="text-slate-500 text-[11px]">
                Validado con Consejo de Facultad
              </span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {selectedProject.participants.map((person, idx) => (
                <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs">
                      {person.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{person.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {person.email} · {person.institutionalRole}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        person.projectRole === 'DIRECTOR'
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {person.projectRole}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {person.dedicationHoursWeekly}h / semana
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Milestones & Cronograma */}
        {activeTab === 'milestones' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cronograma Oficial de Hitos</h3>
                <p className="text-slate-500 text-[11px]">
                  Avance físico vinculado con evidencias técnicas registradas
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedProject.milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                        {m.id}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-xs">{m.title}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === 'COMPLETADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'EN_CURSO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status} ({m.progressPercent}%)
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-2">{m.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>
                      Fecha meta: <strong>{m.targetDate}</strong>{' '}
                      {m.completionDate && `· Completado: ${m.completionDate}`}
                    </span>
                    <span>
                      Evidencias vinculadas: <strong>{m.linkedDocumentIds.length}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Expediente Documental */}
        {activeTab === 'documents' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Expediente Documental del Proyecto
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Todos los documentos pasan por el motor de reglas activas (formato, peso y cronograma)
                </p>
              </div>

              <button
                onClick={() => onNavigateToValidation(selectedProject.id)}
                className="px-3 py-1.5 bg-blue-900 text-white rounded text-xs font-medium hover:bg-blue-800 transition-colors shadow-2xs"
              >
                Abrir Validador Activo
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {selectedProject.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-5 h-5 text-rose-700 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {doc.type} · {doc.sizeMb} MB · Subido por: {doc.uploaderName} ({doc.uploadDate})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      v{doc.version}
                    </span>
                    <button
                      onClick={() => onViewDocument(doc)}
                      className="p-1.5 text-blue-900 hover:bg-blue-50 rounded"
                      title="Ver detalles y validaciones"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
