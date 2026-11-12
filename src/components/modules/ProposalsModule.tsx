import React, { useState } from 'react';
import { ProposalFCI, UserRole } from '../../types';
import {
  FileSpreadsheet,
  Plus,
  Send,
  Save,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Eye,
  History,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ProposalsModuleProps {
  proposals: ProposalFCI[];
  currentRole: UserRole;
  onUpdateProposal: (updated: ProposalFCI) => void;
  onApproveAndCreateProject: (proposal: ProposalFCI) => void;
  onViewDocument: (doc: any) => void;
}

export const ProposalsModule: React.FC<ProposalsModuleProps> = ({
  proposals,
  currentRole,
  onUpdateProposal,
  onApproveAndCreateProject,
  onViewDocument
}) => {
  const [selectedProposal, setSelectedProposal] = useState<ProposalFCI>(proposals[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [observationText, setObservationText] = useState('');
  const [showObsModal, setShowObsModal] = useState(false);
  const [validationAlert, setValidationAlert] = useState<{ type: string; msg: string } | null>(null);

  // Form states for draft/new proposal
  const [formTitle, setFormTitle] = useState('');
  const [formLine, setFormLine] = useState('Redes Telemáticas, Telecomunicaciones y Sistemas Embebidos');
  const [formSummary, setFormSummary] = useState('');
  const [formGeneralObj, setFormGeneralObj] = useState('');
  const [formBudget, setFormBudget] = useState(12000);
  const [formFileSize, setFormFileSize] = useState(6.5);
  const [formFileName, setFormFileName] = useState('Propuesta_FCI_2026_Investigacion.pdf');

  const canReview = currentRole === 'COORDINADOR_CARRERA';
  const canPostulate = currentRole === 'FUTURO_DIRECTOR_FCI' || currentRole === 'DOCENTE_INVESTIGADOR_FCI' || currentRole === 'ADMINISTRADOR';

  const handleSendDraft = () => {
    if (formFileSize > 10) {
      setValidationAlert({
        type: 'error',
        msg: 'Regla RN-18 violada: El archivo adjunto supera los 10 MB permitidos para propuestas FCI.'
      });
      return;
    }

    const updated: ProposalFCI = {
      ...selectedProposal,
      status: 'ENVIADA',
      submissionDate: new Date().toISOString().split('T')[0],
      versionHistory: [
        ...selectedProposal.versionHistory,
        {
          version: selectedProposal.versionHistory.length + 1,
          date: new Date().toISOString().split('T')[0],
          action: 'Reenvío de propuesta',
          comment: 'Correcciones y documentos complementarios cargados por el postulante.',
          user: selectedProposal.applicantName
        }
      ]
    };
    onUpdateProposal(updated);
    setSelectedProposal(updated);
    setValidationAlert({
      type: 'success',
      msg: 'Propuesta enviada exitosamente a Coordinación de Carrera.'
    });
    setIsEditing(false);
  };

  const handleApprove = () => {
    if (!window.confirm(`¿Aprobar formalmente la propuesta ${selectedProposal.code}? Esto creará automáticamente el Proyecto FCI y asignará como Director a ${selectedProposal.applicantName}.`)) {
      return;
    }
    const updated: ProposalFCI = {
      ...selectedProposal,
      status: 'APROBADA',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewerName: 'Dr. Roberto Silva, PhD'
    };
    onUpdateProposal(updated);
    setSelectedProposal(updated);
    onApproveAndCreateProject(updated);
    setValidationAlert({
      type: 'success',
      msg: 'Propuesta APROBADA. El Proyecto FCI ha sido creado de forma automática con estado APROBADO.'
    });
  };

  const handleEmitObservations = () => {
    if (!observationText.trim()) return;
    const updated: ProposalFCI = {
      ...selectedProposal,
      status: 'OBSERVADA',
      reviewNotes: observationText,
      reviewDate: new Date().toISOString().split('T')[0],
      reviewerName: 'Dr. Roberto Silva, PhD',
      versionHistory: [
        ...selectedProposal.versionHistory,
        {
          version: selectedProposal.versionHistory.length,
          date: new Date().toISOString().split('T')[0],
          action: 'Observaciones de Coordinación',
          comment: observationText,
          user: 'Dr. Roberto Silva, PhD'
        }
      ]
    };
    onUpdateProposal(updated);
    setSelectedProposal(updated);
    setShowObsModal(false);
    setObservationText('');
    setValidationAlert({
      type: 'warning',
      msg: 'Observaciones registradas. Se ha habilitado la edición al postulante para subsanar.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Convocatoria Banner */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase bg-blue-800/80 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
            Convocatoria Anual FCI 2026-2027
          </span>
          <h1 className="text-lg font-bold mt-1">Convocatoria de Fondos Competitivos de Investigación</h1>
          <p className="text-xs text-blue-200 mt-0.5">
            Estado: <strong>ABIERTA</strong> · Cierre de postulaciones: <strong>30 de Noviembre de 2026</strong> · Límite PDF: <strong>&lt; 10 MB</strong>
          </p>
        </div>

        {canPostulate && (
          <button
            onClick={() => {
              setIsEditing(true);
              setFormTitle('Nueva Propuesta de Investigación en Redes Telemáticas');
              setFormSummary('Descripción preliminar del proyecto de investigación propuesto para la convocatoria...');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-blue-950 font-semibold text-xs rounded-lg hover:bg-blue-50 transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Postulación FCI</span>
          </button>
        )}
      </div>

      {/* Alert banner if actions executed */}
      {validationAlert && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            validationAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : validationAlert.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{validationAlert.msg}</span>
          <button
            onClick={() => setValidationAlert(null)}
            className="text-xs font-bold px-2 py-0.5"
          >
            &times;
          </button>
        </div>
      )}

      {/* Master Detail View of Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proposals List */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Propuestas Registradas
            </h2>
            <span className="text-xs font-mono font-semibold text-slate-600">
              {proposals.length} total
            </span>
          </div>

          <div className="space-y-2">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProposal(prop);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedProposal.id === prop.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-blue-900">{prop.code}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      prop.status === 'APROBADA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prop.status === 'OBSERVADA'
                        ? 'bg-amber-100 text-amber-800'
                        : prop.status === 'ENVIADA' || prop.status === 'EN_REVISION'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{prop.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  Postulante: {prop.applicantName}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Proposal Detail & Review Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedProposal.code}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    selectedProposal.status === 'APROBADA'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedProposal.status === 'OBSERVADA'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedProposal.status === 'ENVIADA' || selectedProposal.status === 'EN_REVISION'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selectedProposal.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1.5">
                {selectedProposal.title}
              </h2>
            </div>

            {/* Actions Toolbar depending on role */}
            <div className="flex items-center gap-2 shrink-0">
              {canReview && selectedProposal.status !== 'APROBADA' && (
                <>
                  <button
                    onClick={() => setShowObsModal(true)}
                    className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    Observar
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprobar Propuesta</span>
                  </button>
                </>
              )}

              {(canPostulate || selectedProposal.status === 'OBSERVADA' || selectedProposal.status === 'BORRADOR') && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {isEditing ? 'Cancelar Edición' : 'Editar Propuesta'}
                </button>
              )}
            </div>
          </div>

          {/* Form details or Edit Mode */}
          {isEditing ? (
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Formulario de Edición de Propuesta</h3>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título del Proyecto FCI</label>
                <input
                  type="text"
                  value={formTitle || selectedProposal.title}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Línea de Investigación</label>
                <input
                  type="text"
                  value={formLine}
                  onChange={(e) => setFormLine(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Resumen Ejecutivo</label>
                <textarea
                  rows={3}
                  value={formSummary || selectedProposal.summary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Presupuesto Solicitado (USD)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Archivo PDF Adjunto (Simulador de peso MB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formFileSize}
                      onChange={(e) => setFormFileSize(Number(e.target.value))}
                      className="w-24 p-2 border border-slate-300 rounded bg-white text-slate-900"
                    />
                    <span className="self-center font-mono text-[11px] text-slate-500">
                      MB (Límite: 10 MB)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSendDraft}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded hover:bg-blue-800 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Propuesta Definitiva</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">Postulante</span>
                  <span className="font-semibold text-slate-900">{selectedProposal.applicantName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Carrera</span>
                  <span className="font-semibold text-slate-900">{selectedProposal.career}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Convocatoria</span>
                  <span className="font-semibold text-slate-900">{selectedProposal.callYear}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Presupuesto</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    ${selectedProposal.budgetRequested.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Resumen de la Propuesta</h4>
                <p className="leading-relaxed text-slate-600">{selectedProposal.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Objetivo General</h4>
                <p className="leading-relaxed text-slate-600">{selectedProposal.generalObjective}</p>
              </div>

              {selectedProposal.reviewNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Observaciones de la Coordinación</span>
                  </h4>
                  <p className="text-amber-800 leading-relaxed">{selectedProposal.reviewNotes}</p>
                  <span className="text-[10px] text-amber-700 block mt-1">
                    Evaluado por: {selectedProposal.reviewerName} ({selectedProposal.reviewDate})
                  </span>
                </div>
              )}

              {/* Attached PDF file card */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-rose-700" />
                  <div>
                    <p className="font-semibold text-slate-900">{selectedProposal.documentName || 'Documento_Propuesta.pdf'}</p>
                    <p className="text-[11px] text-slate-500">
                      Peso: {selectedProposal.documentSizeMb} MB · Formato: PDF/A conforme · Límite: 10 MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Previsualizando ${selectedProposal.documentName}`)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white text-blue-900 border border-slate-300 rounded font-medium hover:bg-slate-100"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Documento</span>
                </button>
              </div>

              {/* Version History */}
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Historial de Versiones y Decisiones</span>
                </h4>
                <div className="space-y-2">
                  {selectedProposal.versionHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs flex items-start justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">
                          v{item.version}.0: {item.action}
                        </span>
                        <p className="text-slate-600 mt-0.5">{item.comment}</p>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-mono">
                        <span>{item.date}</span>
                        <p className="text-slate-700">{item.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
              Registrar Observaciones a la Propuesta
            </h3>
            <p className="text-xs text-slate-600">
              Indique con precisión las correcciones metodológicas, presupuestarias o documentales requeridas para que el postulante subsane.
            </p>
            <textarea
              rows={4}
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="Detalle de observaciones..."
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
                onClick={handleEmitObservations}
                className="px-3 py-1.5 text-xs bg-amber-700 text-white font-semibold rounded hover:bg-amber-800"
              >
                Guardar y Devolver para Subsanación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
