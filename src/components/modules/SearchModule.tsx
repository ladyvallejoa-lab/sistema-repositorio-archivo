import React, { useState } from 'react';
import {
  FciProject,
  DocumentMetadata,
  UserProfile,
  ResearcherSemiAnnualReport,
  ScientificProductionBatch
} from '../../types';
import {
  Search,
  User,
  FolderGit2,
  FileText,
  Filter,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface SearchModuleProps {
  projects: FciProject[];
  users: UserProfile[];
  documents: DocumentMetadata[];
  researcherReports: ResearcherSemiAnnualReport[];
  productionBatches: ScientificProductionBatch[];
  onViewDocument: (doc: any) => void;
  onNavigateToProject: (projectId: string) => void;
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  projects,
  users,
  documents,
  researcherReports,
  productionBatches,
  onViewDocument,
  onNavigateToProject
}) => {
  const [activeTab, setActiveTab] = useState<'global_search' | 'researcher_360'>('researcher_360');
  const [globalQuery, setGlobalQuery] = useState('');
  const [selectedResearcherId, setSelectedResearcherId] = useState<string>('USR-004'); // MSc. Xavier Andrade by default

  const researchers = users.filter((u) => u.roles.includes('DOCENTE_INVESTIGADOR_FCI'));
  const selectedResearcher = users.find((u) => u.id === selectedResearcherId) || researchers[0];

  // Global search filtering
  const matchingProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(globalQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(globalQuery.toLowerCase()) ||
      p.keywords.some((k) => k.toLowerCase().includes(globalQuery.toLowerCase()))
  );

  const matchingDocuments = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
      d.uploaderName.toLowerCase().includes(globalQuery.toLowerCase()) ||
      (d.projectId && d.projectId.toLowerCase().includes(globalQuery.toLowerCase()))
  );

  // 360 Profile data for selected researcher
  const researcherProjects = projects.filter((p) =>
    p.participants.some((part) => part.userId === selectedResearcher.id)
  );

  const researcherReportsList = researcherReports.filter(
    (r) => r.researcherId === selectedResearcher.id
  );

  const allPubs = productionBatches.flatMap((b) => b.items);
  const researcherPubs = allPubs.filter((pub) =>
    pub.authors.toLowerCase().includes(selectedResearcher.name.split(' ')[1]?.toLowerCase() || '')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <Search className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 12 · BÚSQUEDA Y CONSULTAS MULTIFILTRO</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Motor de Búsqueda y Ficha 360° del Investigador
          </h1>
          <p className="text-xs text-slate-500">
            Consultas transversales por metadatos e historial integral de trayectoria académica en proyectos FCI
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('researcher_360')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'researcher_360'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600'
            }`}
          >
            Ficha 360° del Investigador
          </button>
          <button
            onClick={() => setActiveTab('global_search')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'global_search'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600'
            }`}
          >
            Buscador Global
          </button>
        </div>
      </div>

      {activeTab === 'researcher_360' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Researcher Picker */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Investigadores FCI Telemática ({researchers.length})
            </h2>

            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {researchers.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedResearcherId(res.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedResearcher.id === res.id
                      ? 'border-blue-700 bg-blue-50/60 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-semibold text-slate-900 text-xs truncate">{res.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{res.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-100/70 px-1.5 py-0.2 rounded">
                      {res.fciProjects.join(', ') || 'Postulante'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 360 Sheet on Right */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {selectedResearcher.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedResearcher.name}</h2>
                <p className="text-xs text-slate-500">
                  {selectedResearcher.email} · {selectedResearcher.career}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedResearcher.roles.map((r, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects Adscription */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-blue-800" />
                <span>Proyectos FCI Adscritos ({researcherProjects.length})</span>
              </h3>

              <div className="space-y-2">
                {researcherProjects.map((p) => {
                  const part = p.participants.find((pt) => pt.userId === selectedResearcher.id);
                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-900">{p.code}</span>
                          <span className="font-bold text-slate-900">{p.title}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Rol en proyecto: <strong>{part?.projectRole}</strong> · Dedicación:{' '}
                          <strong>{part?.dedicationHoursWeekly}h semanales</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigateToProject(p.id)}
                        className="text-blue-700 hover:text-blue-900 text-xs font-semibold shrink-0 ml-2"
                      >
                        Abrir &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reports Historical */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-800" />
                <span>Historial de Reportes Semestrales Individuales</span>
              </h3>

              <div className="space-y-2">
                {researcherReportsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sin reportes registrados aún.</p>
                ) : (
                  researcherReportsList.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{r.period}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              r.status === 'APROBADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'OBSERVADO'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1">{r.activitiesDescription}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-700 text-xs shrink-0 ml-2">
                        {r.hoursDedicated}h
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Scientific Publications */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Publicaciones Científicas Registradas</span>
              </h3>

              <div className="space-y-2">
                {researcherPubs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Sin publicaciones específicas en el lote cargado.
                  </p>
                ) : (
                  researcherPubs.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                    >
                      <span className="font-bold text-slate-900">{pub.title}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {pub.journalOrConference} · {pub.indexing}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Global Search tab */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Escriba palabras clave: ej. 'LoRaWAN', 'SDN', 'Ciberseguridad', 'Andrade', 'Mininet'..."
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Proyectos Coincidentes ({matchingProjects.length})
              </h3>
              <div className="space-y-2">
                {matchingProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigateToProject(p.id)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-600 cursor-pointer transition-colors bg-slate-50/50"
                  >
                    <span className="font-mono font-bold text-blue-900 mr-2">{p.code}</span>
                    <span className="font-semibold text-slate-900">{p.title}</span>
                    <p className="text-slate-600 text-[11px] mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Documentos y Evidencias Coincidentes ({matchingDocuments.length})
              </h3>
              <div className="space-y-2">
                {matchingDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onViewDocument(doc)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-600 cursor-pointer transition-colors bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{doc.name}</span>
                      <p className="text-slate-500 text-[11px]">
                        {doc.projectId} · {doc.type} ({doc.sizeMb} MB) · {doc.uploaderName}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      v{doc.version}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
