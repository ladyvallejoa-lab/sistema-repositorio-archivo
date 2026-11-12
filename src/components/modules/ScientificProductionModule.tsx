import React, { useState } from 'react';
import { ScientificProductionBatch, ScientificProductionItem, UserRole } from '../../types';
import {
  FileCheck2,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  BookOpen,
  Award,
  ExternalLink,
  Layers
} from 'lucide-react';

interface ScientificProductionModuleProps {
  batches: ScientificProductionBatch[];
  currentRole: UserRole;
  onUploadBatch: (batch: ScientificProductionBatch) => void;
}

export const ScientificProductionModule: React.FC<ScientificProductionModuleProps> = ({
  batches,
  currentRole,
  onUploadBatch
}) => {
  const [selectedBatch, setSelectedBatch] = useState<ScientificProductionBatch>(batches[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload simulation states
  const [simulatedFileName, setSimulatedFileName] = useState('Produccion_Cientifica_Telematica_2026_Q4.xlsx');
  const [simulatedFileSize, setSimulatedFileSize] = useState(1.4);
  const [columnCheckValid, setColumnCheckValid] = useState(true);
  const [uploadAlert, setUploadAlert] = useState<{ type: string; msg: string } | null>(null);

  const canUpload = currentRole === 'GESTOR_CONOCIMIENTO' || currentRole === 'ADMINISTRADOR';

  // Filter items
  const filteredItems = selectedBatch.items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.journalOrConference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || item.productionType === filterType;

    return matchesSearch && matchesType;
  });

  const handleSimulateUpload = () => {
    if (simulatedFileSize > 4) {
      setUploadAlert({
        type: 'error',
        msg: 'Regla RN-18: El archivo de producción científica supera el límite máximo de 4 MB.'
      });
      return;
    }

    if (!columnCheckValid) {
      setUploadAlert({
        type: 'error',
        msg: 'Regla RN-15: Error estructural. El archivo carece de las columnas obligatorias requeridas.'
      });
      return;
    }

    const newBatch: ScientificProductionBatch = {
      id: `BATCH-2026-Q4`,
      period: '2026 - Trimestre 4 (Octubre - Diciembre)',
      uploadDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      uploadedBy: 'MSc. Diana Paredes (Gestora de Conocimiento)',
      fileName: simulatedFileName,
      fileSizeMb: simulatedFileSize,
      recordCount: selectedBatch.items.length,
      version: selectedBatch.version + 1,
      status: 'VALIDADO',
      items: selectedBatch.items
    };

    onUploadBatch(newBatch);
    setSelectedBatch(newBatch);
    setShowUploadModal(false);
    setUploadAlert({
      type: 'success',
      msg: `Archivo ${simulatedFileName} validado e importado con éxito (5 publicaciones registradas).`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>MÓDULO 7 · REGLAS RN-15 Y RN-16 · GESTOR DE CONOCIMIENTO</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Reporte de Producción Científica Consolidada (XLS/XLSX)
          </h1>
          <p className="text-xs text-slate-500">
            Carga periódica de publicaciones indexadas, ponencias y patentes con validación activa de columnas y filiación UG
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => alert(`Descargando archivo original consolidado: ${selectedBatch.fileName}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar XLS Oficial</span>
          </button>

          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Nuevo Archivo XLS</span>
            </button>
          )}
        </div>
      </div>

      {uploadAlert && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            uploadAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{uploadAlert.msg}</span>
          <button onClick={() => setUploadAlert(null)} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Batch Overview Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-bold">
            XLS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{selectedBatch.fileName}</span>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                Versión {selectedBatch.version}.0
              </span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                {selectedBatch.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Periodo: {selectedBatch.period} · Subido el: {selectedBatch.uploadDate} por {selectedBatch.uploadedBy}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-700">
          <div>
            <span className="text-[11px] text-slate-500 block">Tamaño</span>
            <span className="font-mono font-bold">{selectedBatch.fileSizeMb} MB</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Publicaciones Leídas</span>
            <span className="font-mono font-bold text-emerald-700">{selectedBatch.recordCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por título, autor, revista o proyecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Tipo:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs cursor-pointer"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="ARTICULO_SCOPUS">Artículo Scopus (Q1/Q2)</option>
              <option value="ARTICULO_WOS">Artículo Web of Science</option>
              <option value="ARTICULO_LATINDEX">Artículo Latindex 2.0</option>
              <option value="PONENCIA_CONGRESO">Ponencia en Congreso</option>
            </select>
          </div>
        </div>

        {/* Tabular View of Scientific Publications parsed from Excel */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Proyecto</th>
                <th className="py-2.5 px-3">Título de Publicación</th>
                <th className="py-2.5 px-3">Autores (Filiación UG)</th>
                <th className="py-2.5 px-3">Revista / Congreso</th>
                <th className="py-2.5 px-3">Indexación</th>
                <th className="py-2.5 px-3">DOI / URL</th>
                <th className="py-2.5 px-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                    {item.projectCode}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <p className="font-semibold text-slate-900 leading-snug">{item.title}</p>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                      {item.productionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-800">{item.authors}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Filiación UG Verificada</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800">{item.journalOrConference}</p>
                    <span className="text-[10px] text-slate-500 font-mono">ISSN: {item.issnOrIsbn}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded">
                      {item.indexing}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <a
                      href={`https://doi.org/${item.doiOrUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 hover:text-blue-900 font-mono flex items-center gap-1"
                    >
                      <span>{item.doiOrUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                    {item.publicationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Simulation Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Cargar y Validar Archivo de Producción Científica
            </h3>
            <p className="text-slate-600">
              El motor verificará automáticamente el formato XLS/XLSX, el límite de 4 MB y la existencia de las 10 columnas obligatorias según RN-15.
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre de Archivo</label>
              <input
                type="text"
                value={simulatedFileName}
                onChange={(e) => setSimulatedFileName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tamaño (MB)</label>
                <input
                  type="number"
                  step="0.1"
                  value={simulatedFileSize}
                  onChange={(e) => setSimulatedFileSize(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Validación Columnas</label>
                <select
                  value={columnCheckValid ? 'valid' : 'invalid'}
                  onChange={(e) => setColumnCheckValid(e.target.value === 'valid')}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                >
                  <option value="valid">Columnas Conformes (OK)</option>
                  <option value="invalid">Columnas Incompletas (Falta DOI)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
              <p className="font-semibold text-slate-700">Columnas validadas activamente:</p>
              <p className="text-slate-500 font-mono text-[10px]">
                Código_FCI, Título_Publicación, Tipo_Producción, Autores_UG, Filiación_Institucional, Revista_Editorial, ISSN_ISBN, Indexación, DOI_URL, Fecha_Publicación.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSimulateUpload}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs"
              >
                Ejecutar Validación Activa e Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
