import React, { useState } from 'react';
import { DocumentMetadata, UserRole } from '../../types';
import {
  Files,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertTriangle,
  History
} from 'lucide-react';

interface DocumentRepositoryModuleProps {
  documents: DocumentMetadata[];
  currentRole: UserRole;
  onViewDocument: (doc: DocumentMetadata) => void;
  onDeleteDocument: (docId: string, reason: string) => void;
}

export const DocumentRepositoryModule: React.FC<DocumentRepositoryModuleProps> = ({
  documents,
  currentRole,
  onViewDocument,
  onDeleteDocument
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELETED'>('ACTIVE');

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.projectId && doc.projectId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && doc.active) ||
      (statusFilter === 'DELETED' && !doc.active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <Files className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 8 · GESTIÓN DOCUMENTAL TRANSVERSAL · REGLA RN-22</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Repositorio y Expediente Documental Institucional
          </h1>
          <p className="text-xs text-slate-500">
            Custodia centralizada con versionado automático (v1.0, v1.1), metadatos enriquecidos y baja lógica inmutable
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold">
            {filteredDocs.length} documentos listados
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, autor o código de proyecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Categoría:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs"
            >
              <option value="ALL">Todas las categorías</option>
              <option value="PROPUESTA">Propuesta FCI</option>
              <option value="REPORTE_FCI">Reporte FCI (Director)</option>
              <option value="REPORTE_INVESTIGADOR">Reporte Investigador</option>
              <option value="EVIDENCIA_TECNICA">Evidencia Técnica</option>
              <option value="ACTA_CIERRE">Acta de Cierre</option>
            </select>

            <span className="text-slate-500 font-medium ml-2">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs"
            >
              <option value="ACTIVE">Vigentes / Activos</option>
              <option value="DELETED">Bajas Lógicas (Históricos)</option>
              <option value="ALL">Todos los estados</option>
            </select>
          </div>
        </div>

        {/* Table of Documents */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Documento</th>
                <th className="py-2.5 px-3">Proyecto / Periodo</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Tamaño / Tipo</th>
                <th className="py-2.5 px-3">Versión</th>
                <th className="py-2.5 px-3">Subido por</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    !doc.active ? 'bg-rose-50/40 text-rose-900' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className={`w-4 h-4 shrink-0 ${!doc.active ? 'text-rose-500' : 'text-blue-900'}`} />
                      <div>
                        <p className="font-semibold text-slate-900 leading-snug">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.originalFileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-900">{doc.projectId || 'N/A'}</span>
                    {doc.reportPeriod && (
                      <span className="text-[10px] text-slate-500 block">{doc.reportPeriod}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {doc.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono">
                    <span className="font-bold">{doc.sizeMb} MB</span>
                    <span className="text-slate-500 text-[10px] block font-sans">{doc.type}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-bold text-[10px]">
                      v{doc.version}
                    </span>
                    {doc.isLatest && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                        Vigente
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-800 truncate max-w-[120px]">{doc.uploaderName}</p>
                    <span className="text-[10px] text-slate-500">{doc.uploaderRole}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                    {doc.uploadDate}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDocument(doc)}
                        className="p-1 text-blue-900 hover:bg-blue-50 rounded"
                        title="Ver ficha y validaciones"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Descargando archivo: ${doc.originalFileName}`)}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        title="Descargar archivo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
