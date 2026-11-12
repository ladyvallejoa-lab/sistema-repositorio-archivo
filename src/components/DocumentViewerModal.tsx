import React, { useState } from 'react';
import { DocumentMetadata, UserRole } from '../types';
import {
  X,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Calendar,
  User,
  HardDrive
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: DocumentMetadata | null;
  onClose: () => void;
  onDeleteDocument: (docId: string, reason: string) => void;
  currentRole: UserRole;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  onClose,
  onDeleteDocument,
  currentRole
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!document) return null;

  const canDelete =
    (currentRole === 'ADMINISTRADOR' || currentRole === 'COORDINADOR_CARRERA') &&
    document.active;

  const handleConfirmDelete = () => {
    if (!deletionReason.trim()) {
      setErrorMsg('Debe ingresar obligatoriamente el motivo de la baja lógica para auditoría.');
      return;
    }
    onDeleteDocument(document.id, deletionReason);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-800 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">{document.name}</h3>
              <p className="text-xs text-slate-400">
                Archivo original: {document.originalFileName} · Versión {document.version}{' '}
                {document.isLatest && <span className="text-emerald-400 font-semibold">(Vigente)</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Status banner if logically deleted */}
          {!document.active && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Documento dado de baja lógica en el expediente (Conservado en auditoría)</span>
              </div>
              <p className="mt-1 pl-6">
                <strong>Motivo registrado:</strong> {document.deletionReason}
              </p>
              <p className="pl-6 text-[11px] text-rose-600">
                Baja efectuada por: {document.deletedBy || 'Administrador'} en fecha: {document.deletedAt || 'Reciente'}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Tipo y Formato</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                  {document.type}
                </span>
                <span className="text-xs text-slate-600">({document.sizeMb} MB)</span>
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Categoría</span>
              <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                {document.category.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Subido por</span>
              <span className="font-semibold text-slate-900 text-xs mt-0.5 block truncate">
                {document.uploaderName}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Fecha de Carga</span>
              <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                {document.uploadDate}
              </span>
            </div>
          </div>

          {/* Validation Engine Results */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Dictamen del Motor de Validación Activa
            </h4>

            {document.validations && document.validations.length > 0 ? (
              <div className="space-y-2">
                {document.validations.map((v, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-3 text-xs ${
                      v.status === 'ACEPTADO'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : v.status === 'CON_ADVERTENCIA'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-rose-50/70 border-rose-200 text-rose-900'
                    }`}
                  >
                    {v.status === 'ACEPTADO' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : v.status === 'CON_ADVERTENCIA' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          [{v.ruleCode}] {v.ruleName}
                        </span>
                        <span className="text-[10px] opacity-75 font-mono">{v.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-slate-700">{v.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Validaciones básicas superadas (formato, tamaño e integridad).
              </p>
            )}
          </div>

          {/* Simulated File Preview Canvas */}
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 text-center">
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xs border border-slate-200 text-blue-900 font-bold">
                {document.type}
              </div>
              <p className="font-semibold text-slate-800 text-xs">{document.name}</p>
              <p className="text-[11px] text-slate-500">
                Documento verificado digitalmente para el expediente institucional de la Universidad de Guayaquil.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => alert(`Simulación: Descargando archivo ${document.originalFileName} (${document.sizeMb} MB)`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-md text-xs font-medium hover:bg-blue-800 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo Oficial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Logical Deletion Form (if triggered) */}
          {showDeleteConfirm && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg space-y-3">
              <h5 className="font-semibold text-xs text-rose-900">
                Confirmar Baja Lógica de Documento (Regla RN-22)
              </h5>
              <p className="text-xs text-rose-700">
                Por política institucional y trazabilidad estricta, ningún documento es eliminado físicamente. Ingrese el motivo formal de la anulación para el registro de auditoría:
              </p>
              <textarea
                value={deletionReason}
                onChange={(e) => {
                  setDeletionReason(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Ejemplo: Reemplazado por versión subsanada v1.1 tras observaciones de Coordinación..."
                className="w-full text-xs p-2.5 border border-rose-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                rows={3}
              />
              {errorMsg && <p className="text-xs text-rose-700 font-medium">{errorMsg}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 text-xs bg-rose-700 text-white font-medium hover:bg-rose-800 rounded"
                >
                  Proceder con Baja Lógica
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div>
            {canDelete && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-700 hover:text-rose-900 font-medium flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Dar de baja lógica</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};
