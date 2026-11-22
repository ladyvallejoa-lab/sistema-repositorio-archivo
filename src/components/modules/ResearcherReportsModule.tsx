import React, { useState } from 'react';
import {
  ConfigParameter,
  DocumentMetadata,
  ResearcherSemiAnnualReport,
  UserRole
} from '../../types';
import {
  UserCheck2,
  FileText,
  Send,
  Save,
  Eye,
  Check,
  MessageSquare,
  Upload
} from 'lucide-react';

interface ResearcherReportsModuleProps {
  reports: ResearcherSemiAnnualReport[];
  allDocuments: DocumentMetadata[];
  configParams: ConfigParameter[];
  currentRole: UserRole;
  onSubmitOrSaveReport: (params: {
    report: ResearcherSemiAnnualReport;
    nextStatus: 'BORRADOR' | 'ENVIADO';
    hoursDedicated: number;
    activitiesDescription: string;
    file?: File | null;
    maxSizeMb: number;
  }) => Promise<void>;
  onReviewReport: (params: {
    report: ResearcherSemiAnnualReport;
    nextStatus: 'APROBADO' | 'OBSERVADO';
    reviewNotes?: string;
  }) => Promise<void>;
  onViewDocument: (doc: DocumentMetadata) => void;
}

export const ResearcherReportsModule: React.FC<ResearcherReportsModuleProps> = ({
  reports,
  allDocuments,
  configParams,
  currentRole,
  onSubmitOrSaveReport,
  onReviewReport,
  onViewDocument
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [obsText, setObsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [hours, setHours] = useState(128);
  const [activities, setActivities] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error' | 'warning'; msg: string } | null>(null);

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];
  const maxResReportMb = Number(
    configParams.find((p) => p.key === 'MAX_SIZE_REPORTE_INV_MB')?.value ?? 5
  );

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const canEdit =
    (currentRole === 'DOCENTE_INVESTIGADOR_FCI' || currentRole === 'DIRECTOR_FCI' || currentRole === 'ADMINISTRADOR') &&
    (selectedReport?.status === 'BORRADOR' ||
      selectedReport?.status === 'PENDIENTE' ||
      selectedReport?.status === 'OBSERVADO');

  const canReview =
    currentRole === 'COORDINADOR_CARRERA' ||
    currentRole === 'DIRECTOR_FCI' ||
    currentRole === 'ADMINISTRADOR';

  const startEditing = () => {
    if (!selectedReport) return;
    setHours(selectedReport.hoursDedicated || 120);
    setActivities(selectedReport.activitiesDescription || '');
    setSelectedFile(null);
    setAlertBanner(null);
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    const sizeMb = Number((file.size / (1024 * 1024)).toFixed(2));
    if (ext !== 'PDF') {
      setAlertBanner({
        type: 'error',
        msg: 'Regla RN-VAL-01: El reporte individual de evidencias debe estar en formato PDF.'
      });
      e.target.value = '';
      return;
    }
    if (sizeMb > maxResReportMb) {
      setAlertBanner({
        type: 'error',
        msg: `Regla RN-18 violada: El reporte individual (${sizeMb} MB) no puede superar los ${maxResReportMb} MB.`
      });
      e.target.value = '';
      return;
    }
    setAlertBanner(null);
    setSelectedFile(file);
  };

  const handleSaveOrSend = async (nextStatus: 'BORRADOR' | 'ENVIADO') => {
    if (!selectedReport) return;
    if (nextStatus === 'ENVIADO' && !activities.trim()) {
      setAlertBanner({
        type: 'error',
        msg: 'Describe las actividades ejecutadas antes de enviar el reporte individual.'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitOrSaveReport({
        report: selectedReport,
        nextStatus,
        hoursDedicated: hours,
        activitiesDescription: activities,
        file: selectedFile,
        maxSizeMb: maxResReportMb
      });
      setIsEditing(false);
      setSelectedFile(null);
      setAlertBanner({
        type: 'success',
        msg:
          nextStatus === 'BORRADOR'
            ? 'Borrador guardado en PostgreSQL.'
            : 'Reporte individual enviado exitosamente a Supabase para revisión.'
      });
    } catch (err: any) {
      setAlertBanner({
        type: 'error',
        msg: err?.message || 'Error al guardar el reporte individual.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      await onReviewReport({
        report: selectedReport,
        nextStatus: 'APROBADO',
        reviewNotes: 'Reporte revisado y aprobado.'
      });
      setAlertBanner({ type: 'success', msg: 'Reporte individual APROBADO en PostgreSQL.' });
    } catch (err: any) {
      setAlertBanner({ type: 'error', msg: err?.message || 'Error al aprobar reporte.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleObserve = async () => {
    if (!selectedReport || !obsText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReviewReport({
        report: selectedReport,
        nextStatus: 'OBSERVADO',
        reviewNotes: obsText.trim()
      });
      setObsModalOpen(false);
      setObsText('');
      setAlertBanner({
        type: 'warning',
        msg: 'Observación registrada para subsanación del investigador.'
      });
    } catch (err: any) {
      setAlertBanner({ type: 'error', msg: err?.message || 'Error al observar reporte.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEvidence = () => {
    if (!selectedReport) return;
    const matched = selectedReport.documentEvidenceId
      ? allDocuments.find((d) => d.id === selectedReport.documentEvidenceId)
      : undefined;

    if (matched) {
      onViewDocument(matched);
      return;
    }

    onViewDocument({
      id: selectedReport.documentEvidenceId || `INV-DOC-${selectedReport.id}`,
      name: selectedReport.documentEvidenceName || `Informe_${selectedReport.projectCode}.pdf`,
      originalFileName:
        selectedReport.documentEvidenceName || `Informe_${selectedReport.projectCode}.pdf`,
      category: 'REPORTE_INVESTIGADOR',
      type: 'PDF',
      sizeMb: selectedReport.documentSizeMb || 0,
      uploadDate: selectedReport.submissionDate || selectedReport.deadlineDate,
      uploaderName: selectedReport.researcherName,
      uploaderRole: 'DOCENTE_INVESTIGADOR_FCI',
      projectId: selectedReport.projectId,
      projectCode: selectedReport.projectCode,
      reportPeriod: selectedReport.period,
      version: '1.0',
      isLatest: true,
      confidentiality: 'RESTRINGIDO_CARRERA',
      active: true,
      validations: []
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <UserCheck2 className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 6 · ALCANCE PILOTO: {reports.length} REPORTES DE INVESTIGADORES FCI</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Reportes Semestrales Individuales por Investigador
          </h1>
          <p className="text-xs text-slate-500">
            Control de horas efectivas dedicadas, productos entregados y evidencias (&lt; {maxResReportMb} MB) vinculadas al FCI
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
        <div
          className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
            alertBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : alertBanner.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{alertBanner.msg}</span>
          <button onClick={() => setAlertBanner(null)} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Grid: Researchers List + Detailed Review/Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Researchers list */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
            Matriz de Cumplimiento ({filteredReports.length} reportes)
          </h2>

          {filteredReports.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No hay reportes con este filtro.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredReports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedReportId(r.id);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedReport?.id === r.id
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
          )}
        </div>

        {/* Right Column: Selected Researcher Report Form / Detail */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          {!selectedReport ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Selecciona un informe individual para ver o editar sus detalles.
            </div>
          ) : (
            <>
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
                        disabled={isSubmitting}
                        onClick={() => setObsModalOpen(true)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg"
                      >
                        Observar
                      </button>
                      <button
                        disabled={isSubmitting}
                        onClick={handleApprove}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprobar</span>
                      </button>
                    </>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => (isEditing ? setIsEditing(false) : startEditing())}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        PDF de Evidencias Individuales (Límite: {maxResReportMb} MB)
                      </label>
                      <label className="flex items-center gap-2 p-2 border border-dashed border-slate-400 rounded bg-white cursor-pointer hover:bg-slate-50">
                        <Upload className="w-4 h-4 text-blue-800 shrink-0" />
                        <span className="truncate text-slate-700">
                          {selectedFile
                            ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`
                            : selectedReport.documentEvidenceName || 'Seleccionar archivo .PDF...'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Descripción Detallada de Tareas y Experimentos Realizados
                    </label>
                    <textarea
                      rows={4}
                      value={activities}
                      onChange={(e) => setActivities(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded bg-white text-slate-900"
                      placeholder="Describa el trabajo de campo, desarrollo de software, análisis estadístico o pruebas de laboratorio..."
                    />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleSaveOrSend('BORRADOR')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Borrador</span>
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleSaveOrSend('ENVIADO')}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Subiendo...' : 'Enviar Informe Individual'}</span>
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
                      {selectedReport.activitiesDescription || 'Sin descripción registrada todavía.'}
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
                          Peso: {selectedReport.documentSizeMb || 0} MB · Límite máximo: {maxResReportMb} MB
                        </p>
                      </div>
                    </div>

                    {selectedReport.documentEvidenceName && (
                      <button
                        onClick={handleOpenEvidence}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-900 border border-slate-300 rounded font-medium hover:bg-slate-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Evidencia</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
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
                disabled={isSubmitting || !obsText.trim()}
                onClick={handleObserve}
                className="px-3 py-1.5 text-xs bg-amber-700 text-white font-semibold rounded hover:bg-amber-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Observación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
