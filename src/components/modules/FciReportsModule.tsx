import React, { useState } from 'react';
import { FciSemiAnnualReport, UserRole } from '../../types';
import {
  CalendarCheck,
  Send,
  Save,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Eye,
  AlertCircle,
  FileUp,
  MessageSquare
} from 'lucide-react';

interface FciReportsModuleProps {
  reports: FciSemiAnnualReport[];
  currentRole: UserRole;
  onUpdateReport: (updated: FciSemiAnnualReport) => void;
  onViewDocument: (doc: any) => void;
}

export const FciReportsModule: React.FC<FciReportsModuleProps> = ({
  reports,
  currentRole,
  onUpdateReport,
  onViewDocument
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[1]?.id || reports[0]?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryAdvances, setSummaryAdvances] = useState('');
  const [encounteredObstacles, setEncounteredObstacles] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [fileSize, setFileSize] = useState(7.9);
  const [fileName, setFileName] = useState('Reporte_Semestral_FCI_2026_CI.pdf');
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [showObsModal, setShowObsModal] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{ type: string; msg: string } | null>(null);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const canEdit =
    (currentRole === 'DIRECTOR_FCI' || currentRole === 'ADMINISTRADOR') &&
    (selectedReport?.status === 'BORRADOR' ||
      selectedReport?.status === 'PENDIENTE' ||
      selectedReport?.status === 'OBSERVADO');

  const canReview = currentRole === 'COORDINADOR_CARRERA';

  const handleSendReport = () => {
    if (fileSize > 10) {
      setAlertBanner({
        type: 'error',
        msg: 'Regla RN-18 violada: El documento de evidencias del FCI excede el límite máximo de 10 MB.'
      });
      return;
    }

    const updated: FciSemiAnnualReport = {
      ...selectedReport,
      status: 'ENVIADO',
      submissionDate: new Date().toISOString().split('T')[0],
      summaryAdvances: summaryAdvances || selectedReport.summaryAdvances,
      encounteredObstacles: encounteredObstacles || selectedReport.encounteredObstacles,
      nextSteps: nextSteps || selectedReport.nextSteps,
      documentSizeMb: fileSize,
      documentEvidenceName: fileName
    };
    onUpdateReport(updated);
    setIsEditing(false);
    setAlertBanner({
      type: 'success',
      msg: 'Reporte semestral del FCI enviado formalmente a la Coordinación de Carrera.'
    });
  };

  const handleApprove = () => {
    const updated: FciSemiAnnualReport = {
      ...selectedReport,
      status: 'APROBADO',
      reviewDate: new Date().toISOString().split('T')[0],
      coordinatorReviewNotes: 'Reporte e informe de evidencias revisados y aprobados sin observaciones.'
    };
    onUpdateReport(updated);
    setAlertBanner({
      type: 'success',
      msg: 'Reporte semestral APROBADO satisfactoriamente.'
    });
  };

  const handleSaveObservation = () => {
    if (!reviewNoteInput.trim()) return;
    const updated: FciSemiAnnualReport = {
      ...selectedReport,
      status: 'OBSERVADO',
      coordinatorReviewNotes: reviewNoteInput,
      reviewDate: new Date().toISOString().split('T')[0]
    };
    onUpdateReport(updated);
    setShowObsModal(false);
    setReviewNoteInput('');
    setAlertBanner({
      type: 'warning',
      msg: 'Observaciones emitidas. El formulario ha sido reabierto al Director para corrección.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <CalendarCheck className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 5 · REGLAS RN-12, RN-13, RN-14</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Reportes Semestrales del FCI (Responsabilidad del Director)
          </h1>
          <p className="text-xs text-slate-500">
            Registro semestral de avances técnicos, justificación de obstáculos y carga de evidencias en PDF (&lt; 10 MB)
          </p>
        </div>

        {/* Period indicator */}
        <div className="text-right">
          <span className="text-[11px] text-slate-500 block">Periodo Activo</span>
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            2026-CI (Límite: 28 Nov 2026)
          </span>
        </div>
      </div>

      {alertBanner && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            alertBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : alertBanner.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{alertBanner.msg}</span>
          <button onClick={() => setAlertBanner(null)} className="font-bold px-2">
            &times;
          </button>
        </div>
      )}

      {/* Grid: List on Left, Form/Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Reports selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
            Reportes Semestrales Registrados
          </h2>

          <div className="space-y-2">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => {
                  setSelectedReportId(rep.id);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedReport.id === rep.id
                    ? 'border-blue-700 bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-blue-900">{rep.projectCode}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      rep.status === 'APROBADO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rep.status === 'OBSERVADO'
                        ? 'bg-rose-100 text-rose-800'
                        : rep.status === 'EN_REVISION' || rep.status === 'ENVIADO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-900 truncate">
                  Semestre {rep.semesterNumber} · {rep.period}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  Director: {rep.directorName}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Report View / Edit Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedReport.projectCode}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  Reporte Semestre {selectedReport.semesterNumber} ({selectedReport.period})
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
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {selectedReport.projectTitle}
              </h2>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {canReview && selectedReport.status !== 'APROBADO' && (
                <>
                  <button
                    onClick={() => setShowObsModal(true)}
                    className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
                  >
                    Emitir Observaciones
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs"
                  >
                    Aprobar Reporte
                  </button>
                </>
              )}

              {canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs"
                >
                  {isEditing ? 'Cancelar' : 'Completar / Editar Reporte'}
                </button>
              )}
            </div>
          </div>

          {/* Edit Mode vs Read View */}
          {isEditing ? (
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">
                Formulario de Reporte Semestral del Director
              </h3>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Resumen Técnico de Avances en el Semestre
                </label>
                <textarea
                  rows={4}
                  value={summaryAdvances || selectedReport.summaryAdvances}
                  onChange={(e) => setSummaryAdvances(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-900"
                  placeholder="Detalle los hitos alcanzados, experimentos en laboratorio y pruebas de campo..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Obstáculos Encontrados y Soluciones Aplicadas
                </label>
                <textarea
                  rows={3}
                  value={encounteredObstacles || selectedReport.encounteredObstacles}
                  onChange={(e) => setEncounteredObstacles(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-900"
                  placeholder="Describa problemas en adquisiciones, retrasos de componentes o reprogramación..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Próximos Pasos para el Siguiente Ciclo
                </label>
                <input
                  type="text"
                  value={nextSteps || selectedReport.nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-900"
                />
              </div>

              {/* PDF Evidence upload simulator */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <label className="font-semibold text-slate-800 block mb-1">
                  Documento PDF Consolidado de Evidencias (Límite: 10 MB)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded text-slate-800 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Tamaño simulado:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={fileSize}
                      onChange={(e) => setFileSize(Number(e.target.value))}
                      className="w-20 p-2 border border-slate-300 rounded text-xs text-slate-800 font-mono"
                    />
                    <span className="text-[11px] font-mono text-slate-600">MB</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSendReport}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Reporte y Bloquear Edición</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">Director Responsable</span>
                  <span className="font-semibold text-slate-900">{selectedReport.directorName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Fecha de Envío</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {selectedReport.submissionDate || 'Pendiente de envío'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Fecha Límite</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {selectedReport.deadlineDate}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Hitos Reportados</span>
                  <span className="font-semibold text-slate-900">
                    {selectedReport.achievedMilestones.length} hitos
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Resumen Técnico de Avances</h4>
                <p className="leading-relaxed text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  {selectedReport.summaryAdvances || 'Aún no se ha redactado el resumen de avances.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Obstáculos y Mitigación</h4>
                <p className="leading-relaxed text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  {selectedReport.encounteredObstacles || 'Sin obstáculos registrados.'}
                </p>
              </div>

              {selectedReport.coordinatorReviewNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                    <span>Observaciones Registradas por Coordinación de Carrera</span>
                  </h4>
                  <p className="text-amber-800 leading-relaxed">
                    {selectedReport.coordinatorReviewNotes}
                  </p>
                </div>
              )}

              {/* Evidence Document */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-rose-700" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedReport.documentEvidenceName || 'Sin evidencia adjunta'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Peso: {selectedReport.documentSizeMb || 0} MB · Límite máximo: 10 MB
                    </p>
                  </div>
                </div>

                {selectedReport.documentEvidenceName && (
                  <button
                    onClick={() => alert(`Previsualizando archivo: ${selectedReport.documentEvidenceName}`)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-900 border border-slate-300 rounded font-medium hover:bg-slate-100"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Evidencias</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Observation Modal */}
      {showObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Registrar Observación Técnica a Reporte Semestral
            </h3>
            <p className="text-xs text-slate-600">
              Indique qué evidencias faltan o qué secciones del informe requieren corrección por el Director.
            </p>
            <textarea
              rows={4}
              value={reviewNoteInput}
              onChange={(e) => setReviewNoteInput(e.target.value)}
              placeholder="Detalle de observaciones formales..."
              className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowObsModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveObservation}
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
