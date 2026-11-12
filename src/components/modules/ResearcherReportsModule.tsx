import React, { useState } from 'react';
import { ResearcherSemiAnnualReport, UserRole } from '../../types';
import {
  UserCheck2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Check,
  MessageSquare,
  Search,
  Users
} from 'lucide-react';

interface ResearcherReportsModuleProps {
  reports: ResearcherSemiAnnualReport[];
  currentRole: UserRole;
  onUpdateReport: (updated: ResearcherSemiAnnualReport) => void;
  onViewDocument: (doc: any) => void;
}

export const ResearcherReportsModule: React.FC<ResearcherReportsModuleProps> = ({
  reports,
  currentRole,
  onUpdateReport,
  onViewDocument
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [obsText, setObsText] = useState('');

  // Form states
  const [hours, setHours] = useState(128);
  const [activities, setActivities] = useState('');
  const [fileSize, setFileSize] = useState(3.5);
  const [fileName, setFileName] = useState('Informe_Individual_Actividades.pdf');
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const canEdit =
    (currentRole === 'DOCENTE_INVESTIGADOR_FCI' || currentRole === 'DIRECTOR_FCI' || currentRole === 'ADMINISTRADOR') &&
    (selectedReport?.status === 'BORRADOR' ||
      selectedReport?.status === 'PENDIENTE' ||
      selectedReport?.status === 'OBSERVADO');

  const canReview = currentRole === 'COORDINADOR_CARRERA' || currentRole === 'DIRECTOR_FCI';

  const handleSendReport = () => {
    if (fileSize > 5) {
      alert('Regla RN-18 violada: El reporte individual de actividades no puede superar los 5 MB.');
      return;
    }

    const updated: ResearcherSemiAnnualReport = {
      ...selectedReport,
      status: 'ENVIADO',
      submissionDate: new Date().toISOString().split('T')[0],
      hoursDedicated: hours,
      activitiesDescription: activities || selectedReport.activitiesDescription,
      documentSizeMb: fileSize,
      documentEvidenceName: fileName
    };
    onUpdateReport(updated);
    setIsEditing(false);
    setAlertBanner('Reporte individual enviado exitosamente para revisión.');
  };

  const handleApprove = () => {
    const updated: ResearcherSemiAnnualReport = {
      ...selectedReport,
      status: 'APROBADO',
      coordinatorReviewNotes: 'Reporte revisado y aprobado.'
    };
    onUpdateReport(updated);
    setAlertBanner('Reporte individual APROBADO.');
  };

  const handleObserve = () => {
    if (!obsText.trim()) return;
    const updated: ResearcherSemiAnnualReport = {
      ...selectedReport,
      status: 'OBSERVADO',
      coordinatorReviewNotes: obsText
    };
    onUpdateReport(updated);
    setObsModalOpen(false);
    setObsText('');
    setAlertBanner('Observación registrada para subsanación del investigador.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <UserCheck2 className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 6 · ALCANCE PILOTO: 8 INVESTIGADORES FCI ACTIVOS</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Reportes Semestrales Individuales por Investigador
          </h1>
          <p className="text-xs text-slate-500">
            Control de horas efectivas dedicadas, productos entregados y evidencias (&lt; 5 MB) vinculadas al FCI
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Todos ({reports.length})
          </button>
          <button
            onClick={() => setFilterStatus('APROBADO')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatus === 'APROBADO' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Aprobados
          </button>
          <button
            onClick={() => setFilterStatus('OBSERVADO')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatus === 'OBSERVADO' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Observados
          </button>
          <button
            onClick={() => setFilterStatus('ENVIADO')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterStatus === 'ENVIADO' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Enviados
          </button>
        </div>
      </div>

      {alertBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex justify-between items-center">
          <span>{alertBanner}</span>
          <button onClick={() => setAlertBanner(null)} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Grid: 8 Researchers List + Detailed Review/Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Researchers list */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
            Matriz de Cumplimiento (8 Investigadores)
          </h2>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredReports.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedReportId(r.id);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedReport.id === r.id
                    ? 'border-blue-700 bg-blue-50/60 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-900 truncate mr-2">
                    {r.researcherName}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      r.status === 'APROBADO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'OBSERVADO'
                        ? 'bg-rose-100 text-rose-800'
                        : r.status === 'ENVIADO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{r.projectCode}</span>
                  <span>{r.hoursDedicated}h dedicadas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Researcher Report Form / Detail */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedReport.projectCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedReport.status === 'APROBADO'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedReport.status === 'OBSERVADO'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedReport.status}
                </span>
                <span className="text-xs text-slate-500 font-medium font-mono">
                  Periodo: {selectedReport.period}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Reporte de Actividades: {selectedReport.researcherName}
              </h2>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 shrink-0">
              {canReview && selectedReport.status !== 'APROBADO' && (
                <>
                  <button
                    onClick={() => setObsModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
                  >
                    Observar
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprobar</span>
                  </button>
                </>
              )}

              {canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs"
                >
                  {isEditing ? 'Cancelar' : 'Editar Informe Individual'}
                </button>
              )}
            </div>
          </div>

          {/* Form edit or display */}
          {isEditing ? (
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">
                Diligenciamiento del Informe Individual
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Horas de dedicación efectivas en el semestre
                  </label>
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tamaño PDF Evidencias (Límite: 5 MB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={fileSize}
                      onChange={(e) => setFileSize(Number(e.target.value))}
                      className="w-24 p-2 border border-slate-300 rounded bg-white text-slate-900 font-mono"
                    />
                    <span className="self-center font-mono text-[11px] text-slate-500">
                      MB (máx 5 MB)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Descripción Detallada de Tareas y Experimentos Realizados
                </label>
                <textarea
                  rows={4}
                  value={activities || selectedReport.activitiesDescription}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-900"
                  placeholder="Describa el trabajo de campo, desarrollo de software, análisis estadístico o pruebas de laboratorio..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendReport}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Informe Individual</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">Investigador</span>
                  <span className="font-semibold text-slate-900">{selectedReport.researcherName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Horas Reportadas</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedReport.hoursDedicated} horas
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Fecha de Envío</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {selectedReport.submissionDate || 'Pendiente'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Fecha Límite</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {selectedReport.deadlineDate}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Actividades Ejecutadas</h4>
                <p className="leading-relaxed text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  {selectedReport.activitiesDescription}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Productos Entregados</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.deliveredProducts.map((prod, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50 text-blue-900 font-semibold rounded border border-blue-200 text-xs"
                    >
                      {prod}
                    </span>
                  ))}
                </div>
              </div>

              {selectedReport.coordinatorReviewNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                    <span>Observaciones de la Coordinación</span>
                  </h4>
                  <p className="text-amber-800 leading-relaxed">
                    {selectedReport.coordinatorReviewNotes}
                  </p>
                </div>
              )}

              {/* PDF Evidence */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-rose-700" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedReport.documentEvidenceName || 'Sin evidencia adjunta'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Peso: {selectedReport.documentSizeMb || 0} MB · Límite máximo: 5 MB
                    </p>
                  </div>
                </div>

                {selectedReport.documentEvidenceName && (
                  <button
                    onClick={() => alert(`Previsualizando archivo: ${selectedReport.documentEvidenceName}`)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-900 border border-slate-300 rounded font-medium hover:bg-slate-100"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Evidencia</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Observation Modal */}
      {obsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Registrar Observación a Reporte Individual
            </h3>
            <p className="text-xs text-slate-600">
              Indique qué corrección o justificación de horas/evidencias se solicita al docente investigador.
            </p>
            <textarea
              rows={4}
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              placeholder="Detalle de la observación técnica..."
              className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setObsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleObserve}
                className="px-3 py-1.5 text-xs bg-amber-700 text-white font-semibold rounded hover:bg-amber-800"
              >
                Guardar Observación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
