import React from 'react';
import {
  FciProject,
  ProposalFCI,
  FciSemiAnnualReport,
  ResearcherSemiAnnualReport,
  UserRole
} from '../../types';
import {
  FolderGit2,
  Users,
  FileCheck2,
  Calendar,
  AlertCircle,
  Clock,
  Download,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardModuleProps {
  projects: FciProject[];
  proposals: ProposalFCI[];
  fciReports: FciSemiAnnualReport[];
  researcherReports: ResearcherSemiAnnualReport[];
  currentRole: UserRole;
  onNavigate: (module: any) => void;
  onViewDocument: (doc: any) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  projects,
  proposals,
  fciReports,
  researcherReports,
  currentRole,
  onNavigate,
  onViewDocument
}) => {
  // Calculations
  const activeProjectsCount = projects.filter((p) => p.status === 'EN_EJECUCION').length;
  const pendingProposalsCount = proposals.filter(
    (p) => p.status === 'ENVIADA' || p.status === 'EN_REVISION'
  ).length;

  const totalResearchers = 8;
  const approvedReports = researcherReports.filter((r) => r.status === 'APROBADO').length;
  const pendingReports = researcherReports.filter(
    (r) => r.status === 'PENDIENTE' || r.status === 'BORRADOR'
  ).length;
  const observedReports = researcherReports.filter((r) => r.status === 'OBSERVADO').length;

  const avgCompleteness = Math.round(
    projects.reduce((acc, p) => acc + p.documentCompletenessPercent, 0) / (projects.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Context Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-700"></span>
              <span>ALCANCE PILOTO ACTIVO · FACULTAD DE INGENIERÍA INDUSTRIAL</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tablero de Control y Monitoreo FCI Telemática
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ciclo académico 2026-CI · Control integral del expediente documental y seguimiento de hitos
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => alert('Generando informe ejecutivo consolidado de la Carrera en formato PDF...')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Resumen PDF</span>
            </button>
            <button
              onClick={() => alert('Exportando matriz de cumplimiento documental a formato XLSX...')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Proyectos FCI Activos</span>
              <FolderGit2 className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{activeProjectsCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">FCI-001 (IoT) y FCI-002 (SDN)</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Investigadores FCI</span>
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{totalResearchers}</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">100% adscritos a proyectos</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Completitud Documental</span>
              <FileCheck2 className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">{avgCompleteness}%</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${avgCompleteness}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Plazo Cierre Semestral</span>
              <Calendar className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-700">17 días</div>
            <p className="text-[11px] text-slate-500 mt-1">Límite oficial: 28 nov 2026</p>
          </div>
        </div>
      </div>

      {/* Grid: Active Projects Tracking & Semi-Annual Reports Semaphore */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Projects with Document Completeness */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Seguimiento de Proyectos FCI Piloto
              </h2>
              <p className="text-xs text-slate-500">
                Monitoreo de hitos técnicos y completitud del expediente
              </p>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
            >
              <span>Ver ficha detallada</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                      {project.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      Semestre {project.currentSemester} de {project.totalSemesters}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">
                      Completitud: {project.documentCompletenessPercent}%
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-900">{project.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{project.description}</p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>
                      Director:{' '}
                      <strong className="text-slate-800">
                        {project.participants.find((p) => p.projectRole === 'DIRECTOR')?.name}
                      </strong>
                    </span>
                    <span>
                      Presupuesto Ejec.: ${project.budgetExecuted.toLocaleString()} / $
                      {project.budgetAssigned.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        project.documentCompletenessPercent > 80
                          ? 'bg-emerald-600'
                          : 'bg-amber-600'
                      }`}
                      style={{ width: `${project.documentCompletenessPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Línea: {project.researchLine}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate('projects')}
                      className="px-2.5 py-1 text-xs text-blue-800 hover:bg-blue-50 rounded font-medium"
                    >
                      Abrir Expediente
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Semestral Reports Compliance Semaphore */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cumplimiento 2026-CI
            </h2>
            <p className="text-xs text-slate-500">
              Estado de los 8 reportes de investigadores FCI
            </p>
          </div>

          {/* Semaphore summary */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Aprobados por Coordinación</span>
              </div>
              <span className="font-bold font-mono text-emerald-800">{approvedReports} / 8</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-900">Con Observaciones Técnicas</span>
              </div>
              <span className="font-bold font-mono text-amber-800">{observedReports} / 8</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-800">Pendientes / En Borrador</span>
              </div>
              <span className="font-bold font-mono text-slate-800">{pendingReports} / 8</span>
            </div>
          </div>

          {/* Quick list of researchers status */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Estado de Investigadores</span>
              <button
                onClick={() => onNavigate('researcher_reports')}
                className="text-[11px] text-blue-700 hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {researcherReports.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-medium text-slate-800 truncate">{r.researcherName}</p>
                    <p className="text-[10px] text-slate-500">{r.projectCode}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                      r.status === 'APROBADO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'OBSERVADO'
                        ? 'bg-rose-100 text-rose-800'
                        : r.status === 'ENVIADO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Production alert */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>Producción Científica 2026-Q3</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              5 publicaciones registradas (2 Scopus Q1/Q2, 1 Latindex, 1 WoS, 1 Congreso).
            </p>
            <button
              onClick={() => onNavigate('scientific_production')}
              className="text-blue-800 font-semibold text-[11px] hover:underline block pt-1"
            >
              Consultar artículos indexados &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
