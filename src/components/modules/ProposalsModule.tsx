import React, { useState } from 'react';
import {
  ConfigParameter,
  DocumentMetadata,
  ProposalFCI,
  UserRole
} from '../../types';
import {
  Plus,
  Send,
  Save,
  AlertTriangle,
  FileText,
  Eye,
  History,
  Check,
  Upload
} from 'lucide-react';

interface ProposalsModuleProps {
  proposals: ProposalFCI[];
  allDocuments: DocumentMetadata[];
  configParams: ConfigParameter[];
  currentRole: UserRole;
  onSaveOrSubmitProposal: (params: {
    proposalId?: string;
    title: string;
    researchLine: string;
    summary: string;
    generalObjective: string;
    budgetRequested: number;
    status: 'BORRADOR' | 'ENVIADA';
    file?: File | null;
    maxSizeMb: number;
  }) => Promise<void>;
  onObserveProposal: (proposal: ProposalFCI, notes: string) => Promise<void>;
  onApproveProposal: (proposal: ProposalFCI) => Promise<void>;
  onViewDocument: (doc: DocumentMetadata) => void;
}

export const ProposalsModule: React.FC<ProposalsModuleProps> = ({
  proposals,
  allDocuments,
  configParams,
  currentRole,
  onSaveOrSubmitProposal,
  onObserveProposal,
  onApproveProposal,
  onViewDocument
}) => {
  const [selectedProposalId, setSelectedProposalId] = useState<string>(proposals[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [observationText, setObservationText] = useState('');
  const [showObsModal, setShowObsModal] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationAlert, setValidationAlert] = useState<{ type: string; msg: string } | null>(null);

  // Form states for draft/new proposal
  const [formTitle, setFormTitle] = useState('');
  const [formLine, setFormLine] = useState('Redes Telemáticas, Telecomunicaciones y Sistemas Embebidos');
  const [formSummary, setFormSummary] = useState('');
  const [formGeneralObj, setFormGeneralObj] = useState('');
  const [formBudget, setFormBudget] = useState(12000);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId) || proposals[0];

  const maxProposalMb = Number(
    configParams.find((p) => p.key === 'MAX_SIZE_PROPUESTA_MB')?.value ?? 10
  );
  const deadlineConvocatoria = String(
    configParams.find((p) => p.key === 'FECHA_CIERRE_CONVOCATORIA')?.value ?? '2026-11-30'
  );

  const canReview = currentRole === 'COORDINADOR_CARRERA' || currentRole === 'ADMINISTRADOR';
  const canPostulate =
    currentRole === 'FUTURO_DIRECTOR_FCI' ||
    currentRole === 'DOCENTE_INVESTIGADOR_FCI' ||
    currentRole === 'ADMINISTRADOR';

  const startNewProposal = () => {
    setIsCreatingNew(true);
    setIsEditing(true);
    setConfirmApproveOpen(false);
    setFormTitle('');
    setFormLine('Redes Telemáticas, Telecomunicaciones y Sistemas Embebidos');
    setFormSummary('');
    setFormGeneralObj('');
    setFormBudget(12000);
    setSelectedFile(null);
    setValidationAlert(null);
  };

  const startEditSelected = () => {
    if (!selectedProposal) return;
    setIsCreatingNew(false);
    setIsEditing(true);
    setConfirmApproveOpen(false);
    setFormTitle(selectedProposal.title);
    setFormLine(selectedProposal.researchLine);
    setFormSummary(selectedProposal.summary);
    setFormGeneralObj(selectedProposal.generalObjective);
    setFormBudget(selectedProposal.budgetRequested);
    setSelectedFile(null);
    setValidationAlert(null);
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
      setValidationAlert({
        type: 'error',
        msg: 'Regla RN-VAL-01: Solo se admiten archivos en formato PDF para propuestas FCI.'
      });
      e.target.value = '';
      return;
    }
    if (sizeMb > maxProposalMb) {
      setValidationAlert({
        type: 'error',
        msg: `Regla RN-18 violada: El archivo (${sizeMb} MB) supera los ${maxProposalMb} MB permitidos.`
      });
      e.target.value = '';
      return;
    }
    setValidationAlert(null);
    setSelectedFile(file);
  };

  const handleSaveOrSubmit = async (targetStatus: 'BORRADOR' | 'ENVIADA') => {
    if (!formTitle.trim() || !formSummary.trim()) {
      setValidationAlert({
        type: 'error',
        msg: 'El título y el resumen ejecutivo son obligatorios para guardar la propuesta.'
      });
      return;
    }

    if (targetStatus === 'ENVIADA' && !selectedFile && !(!isCreatingNew && selectedProposal?.documentName)) {
      setValidationAlert({
        type: 'error',
        msg: 'Debe adjuntar el documento PDF oficial de la propuesta antes de enviarla.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveOrSubmitProposal({
        proposalId: isCreatingNew ? undefined : selectedProposal?.id,
        title: formTitle.trim(),
        researchLine: formLine.trim(),
        summary: formSummary.trim(),
        generalObjective: formGeneralObj.trim() || formSummary.trim(),
        budgetRequested: Number(formBudget) || 0,
        status: targetStatus,
        file: selectedFile,
        maxSizeMb: maxProposalMb
      });

      setIsEditing(false);
      setIsCreatingNew(false);
      setSelectedFile(null);
      setValidationAlert({
        type: 'success',
        msg:
          targetStatus === 'BORRADOR'
            ? 'Borrador guardado en PostgreSQL. Puedes completarlo antes del cierre de convocatoria.'
            : 'Propuesta enviada exitosamente a Coordinación de Carrera y almacenada en Supabase.'
      });
    } catch (err: any) {
      setValidationAlert({
        type: 'error',
        msg: err?.message || 'No se pudo procesar la propuesta en Supabase.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedProposal) return;
    setIsSubmitting(true);
    try {
      await onApproveProposal(selectedProposal);
      setConfirmApproveOpen(false);
      setValidationAlert({
        type: 'success',
        msg: 'Propuesta APROBADA. El Proyecto FCI y el rol de Director FCI se crearon automáticamente en la base de datos.'
      });
    } catch (err: any) {
      setValidationAlert({
        type: 'error',
        msg: err?.message || 'Error al aprobar propuesta.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmitObservations = async () => {
    if (!selectedProposal || !observationText.trim()) return;
    setIsSubmitting(true);
    try {
      await onObserveProposal(selectedProposal, observationText.trim());
      setShowObsModal(false);
      setObservationText('');
      setValidationAlert({
        type: 'warning',
        msg: 'Observaciones registradas en PostgreSQL. Se habilitó la edición al postulante para subsanar.'
      });
    } catch (err: any) {
      setValidationAlert({
        type: 'error',
        msg: err?.message || 'Error al registrar observaciones.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenProposalDocument = () => {
    if (!selectedProposal) return;
    const matched = selectedProposal.documentId
      ? allDocuments.find((d) => d.id === selectedProposal.documentId)
      : undefined;

    if (matched) {
      onViewDocument(matched);
      return;
    }

    onViewDocument({
      id: selectedProposal.documentId || `PROP-DOC-${selectedProposal.id}`,
      name: selectedProposal.documentName || `Propuesta_${selectedProposal.code}.pdf`,
      originalFileName: selectedProposal.documentName || `Propuesta_${selectedProposal.code}.pdf`,
      category: 'PROPUESTA',
      type: 'PDF',
      sizeMb: selectedProposal.documentSizeMb || 0,
      uploadDate: selectedProposal.submissionDate || new Date().toISOString().split('T')[0],
      uploaderName: selectedProposal.applicantName,
      uploaderRole: 'FUTURO_DIRECTOR_FCI',
      proposalId: selectedProposal.id,
      version: `${selectedProposal.versionHistory.length || 1}.0`,
      isLatest: true,
      confidentiality: 'PUBLICO_UG',
      active: true,
      validations: []
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
            Estado: <strong>ABIERTA</strong> · Cierre de postulaciones: <strong>{deadlineConvocatoria}</strong> · Límite PDF: <strong>&lt; {maxProposalMb} MB</strong>
          </p>
        </div>

        {canPostulate && (
          <button
            onClick={startNewProposal}
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
          <button onClick={() => setValidationAlert(null)} className="text-xs font-bold px-2 py-0.5">
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

          {proposals.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No hay propuestas visibles para tu rol actual. Crea una nueva postulación si eres postulante.
            </p>
          ) : (
            <div className="space-y-2">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedProposalId(prop.id);
                    setIsEditing(false);
                    setIsCreatingNew(false);
                    setConfirmApproveOpen(false);
                  }}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedProposal?.id === prop.id && !isCreatingNew
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
          )}
        </div>

        {/* Right: Selected Proposal Detail & Review Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          {!selectedProposal && !isCreatingNew ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Selecciona o crea una propuesta para gestionar su ciclo de postulación y validación.
            </div>
          ) : isEditing ? (
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isCreatingNew
                    ? 'Registrar Nueva Propuesta FCI'
                    : `Editar Propuesta ${selectedProposal?.code}`}
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título del Proyecto FCI</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej. Arquitectura Edge-IoT para monitoreo industrial..."
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
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Describe el problema, metodología y alcance..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Objetivo General</label>
                <textarea
                  rows={2}
                  value={formGeneralObj}
                  onChange={(e) => setFormGeneralObj(e.target.value)}
                  placeholder="Objetivo general del proyecto propuesto..."
                  className="w-full p-2 border border-slate-300 rounded bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Documento PDF Oficial (Máx. {maxProposalMb} MB)
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-dashed border-slate-400 rounded bg-white cursor-pointer hover:bg-slate-50">
                    <Upload className="w-4 h-4 text-blue-800 shrink-0" />
                    <span className="truncate text-slate-700">
                      {selectedFile
                        ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`
                        : !isCreatingNew && selectedProposal?.documentName
                        ? `Actual: ${selectedProposal.documentName} (subir nuevo PDF para reemplazar)`
                        : 'Seleccionar archivo .PDF...'}
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

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreatingNew(false);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Descartar
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSaveOrSubmit('BORRADOR')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Borrador</span>
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSaveOrSubmit('ENVIADA')}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded hover:bg-blue-800 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Subiendo y enviando...' : 'Enviar Propuesta Definitiva'}</span>
                </button>
              </div>
            </div>
          ) : (
            selectedProposal && (
              <>
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
                          disabled={isSubmitting}
                          onClick={() => setShowObsModal(true)}
                          className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                        >
                          Observar
                        </button>
                        <button
                          disabled={isSubmitting}
                          onClick={() => setConfirmApproveOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar Propuesta</span>
                        </button>
                      </>
                    )}

                    {canPostulate &&
                      (selectedProposal.status === 'OBSERVADA' ||
                        selectedProposal.status === 'BORRADOR' ||
                        currentRole === 'ADMINISTRADOR') && (
                        <button
                          onClick={startEditSelected}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Editar Propuesta
                        </button>
                      )}
                  </div>
                </div>

                {/* Inline Approval Confirmation */}
                {confirmApproveOpen && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs space-y-2">
                    <p className="font-bold text-emerald-950">
                      Confirmar Aprobación Formal (Regla RF-11)
                    </p>
                    <p className="text-emerald-900">
                      ¿Aprobar formalmente la propuesta <strong>{selectedProposal.code}</strong>? Esto creará automáticamente el Proyecto FCI en PostgreSQL y asignará como Director a{' '}
                      <strong>{selectedProposal.applicantName}</strong>.
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setConfirmApproveOpen(false)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        disabled={isSubmitting}
                        onClick={handleApprove}
                        className="px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Creando Proyecto FCI...' : 'Confirmar y Crear Proyecto FCI'}
                      </button>
                    </div>
                  </div>
                )}

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
                        <p className="font-semibold text-slate-900">
                          {selectedProposal.documentName || 'Sin documento PDF adjunto'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Peso: {selectedProposal.documentSizeMb || 0} MB · Formato: PDF · Límite: {maxProposalMb} MB
                        </p>
                      </div>
                    </div>
                    {selectedProposal.documentName && (
                      <button
                        onClick={handleOpenProposalDocument}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white text-blue-900 border border-slate-300 rounded font-medium hover:bg-slate-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Documento</span>
                      </button>
                    )}
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
              </>
            )
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
                disabled={isSubmitting || !observationText.trim()}
                onClick={handleEmitObservations}
                className="px-3 py-1.5 text-xs bg-amber-700 text-white font-semibold rounded hover:bg-amber-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar y Devolver para Subsanación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
