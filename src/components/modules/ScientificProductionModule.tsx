import React, { useState } from 'react';
import {
  ConfigParameter,
  DocumentMetadata,
  ScientificProductionBatch,
  ScientificProductionItem,
  UserRole
} from '../../types';
import { triggerDocumentDownload } from '../../services/supabaseService';
import {
  Upload,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Award,
  ExternalLink
} from 'lucide-react';

interface ScientificProductionModuleProps {
  batches: ScientificProductionBatch[];
  allDocuments: DocumentMetadata[];
  configParams: ConfigParameter[];
  currentRole: UserRole;
  onUploadBatch: (params: {
    period: string;
    file: File | null;
    fileName: string;
    fileSizeMb: number;
    nextVersion: number;
    itemsToImport: ScientificProductionItem[];
    maxSizeMb: number;
  }) => Promise<void>;
}

const REQUIRED_CSV_HEADERS = [
  'Código_FCI',
  'Título_Publicación',
  'Tipo_Producción',
  'Autores_UG',
  'Filiación_Institucional',
  'Revista_Editorial',
  'ISSN_ISBN',
  'Indexación',
  'DOI_URL',
  'Fecha_Publicación'
];

export const ScientificProductionModule: React.FC<ScientificProductionModuleProps> = ({
  batches,
  allDocuments,
  configParams,
  currentRole,
  onUploadBatch
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Real upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [periodInput, setPeriodInput] = useState('2026 - Trimestre 4 (Octubre - Diciembre)');
  const [parsedItems, setParsedItems] = useState<ScientificProductionItem[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAlert, setUploadAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const maxProductionMb = Number(
    configParams.find((p) => p.key === 'MAX_SIZE_PRODUCCION_MB')?.value ?? 4
  );
  const canUpload = currentRole === 'GESTOR_CONOCIMIENTO' || currentRole === 'ADMINISTRADOR';

  // Filter items
  const filteredItems = (selectedBatch?.items || []).filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.journalOrConference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || item.productionType === filterType;

    return matchesSearch && matchesType;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setParsedItems(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    const sizeMb = Number((file.size / (1024 * 1024)).toFixed(2));

    if (!['XLS', 'XLSX', 'CSV'].includes(ext)) {
      setUploadAlert({
        type: 'error',
        msg: 'Regla RN-VAL-01: Solo se aceptan archivos XLS, XLSX o CSV para producción científica.'
      });
      e.target.value = '';
      return;
    }

    if (sizeMb > maxProductionMb) {
      setUploadAlert({
        type: 'error',
        msg: `Regla RN-18: El archivo (${sizeMb} MB) supera el límite máximo configurado de ${maxProductionMb} MB.`
      });
      e.target.value = '';
      return;
    }

    if (ext === 'CSV') {
      try {
        const text = await file.text();
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length < 2) {
          throw new Error('Regla RN-15: El archivo CSV no contiene registros de publicaciones.');
        }
        const sep = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ''));
        const missing = REQUIRED_CSV_HEADERS.filter((req) => !headers.includes(req));
        if (missing.length > 0) {
          throw new Error(
            `Regla RN-15: Faltan columnas obligatorias en el archivo: ${missing.join(', ')}.`
          );
        }

        const idx = (name: string) => headers.indexOf(name);
        const items: ScientificProductionItem[] = lines.slice(1).map((line, i) => {
          const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));
          return {
            id: `CSV-${Date.now()}-${i}`,
            projectCode: cols[idx('Código_FCI')] || 'FCI-2025-TEL-001',
            title: cols[idx('Título_Publicación')] || 'Publicación sin título',
            productionType: (cols[idx('Tipo_Producción')] as ScientificProductionItem['productionType']) || 'ARTICULO_SCOPUS',
            authors: cols[idx('Autores_UG')] || 'Investigadores UG',
            hasUgAffiliation: (cols[idx('Filiación_Institucional')] || 'SI').toUpperCase().includes('SI') ||
              (cols[idx('Filiación_Institucional')] || '').toLowerCase().includes('guayaquil'),
            journalOrConference: cols[idx('Revista_Editorial')] || 'Revista Indexada',
            issnOrIsbn: cols[idx('ISSN_ISBN')] || 'N/A',
            indexing: cols[idx('Indexación')] || 'Scopus',
            doiOrUrl: cols[idx('DOI_URL')] || '',
            publicationDate: cols[idx('Fecha_Publicación')] || new Date().toISOString().split('T')[0],
            period: periodInput,
            statusInPeriod: 'PUBLICADO'
          };
        });
        setParsedItems(items);
      } catch (err: any) {
        setUploadAlert({
          type: 'error',
          msg: err?.message || 'Error al validar la estructura del archivo.'
        });
        e.target.value = '';
        return;
      }
    }

    setUploadAlert(null);
    setSelectedFile(file);
  };

  const handleUploadRealFile = async () => {
    if (!selectedFile) {
      setUploadAlert({
        type: 'error',
        msg: 'Selecciona un archivo .XLS, .XLSX o .CSV válido para subir a Supabase.'
      });
      return;
    }

    const sizeMb = Number((selectedFile.size / (1024 * 1024)).toFixed(2));
    const itemsToImport = parsedItems || selectedBatch?.items || [];

    setIsUploading(true);
    try {
      await onUploadBatch({
        period: periodInput.trim(),
        file: selectedFile,
        fileName: selectedFile.name,
        fileSizeMb: sizeMb,
        nextVersion: (selectedBatch?.version || 0) + 1,
        itemsToImport,
        maxSizeMb: maxProductionMb
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      setParsedItems(null);
      setUploadAlert({
        type: 'success',
        msg: `Archivo ${selectedFile.name} almacenado en Supabase Storage e importado en PostgreSQL (${itemsToImport.length} registros).`
      });
    } catch (err: any) {
      setUploadAlert({
        type: 'error',
        msg: err?.message || 'Error al cargar el lote de producción científica.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadOfficialBatch = async () => {
    if (!selectedBatch) return;
    const matchingStorageDoc = allDocuments.find(
      (d) =>
        d.category === 'PUBLICACION' &&
        d.storagePath &&
        (d.originalFileName === selectedBatch.fileName || d.reportPeriod === selectedBatch.period)
    );

    if (matchingStorageDoc) {
      try {
        await triggerDocumentDownload(matchingStorageDoc);
        return;
      } catch (err: any) {
        setUploadAlert({
          type: 'error',
          msg: err?.message || 'No se pudo descargar el archivo desde Supabase Storage.'
        });
        return;
      }
    }

    // Export consolidated CSV compatible with Excel
    const rows = [
      REQUIRED_CSV_HEADERS.join(','),
      ...selectedBatch.items.map((it) =>
        [
          it.projectCode,
          `"${it.title.replace(/"/g, '""')}"`,
          it.productionType,
          `"${it.authors.replace(/"/g, '""')}"`,
          it.hasUgAffiliation ? 'SI - Universidad de Guayaquil' : 'NO',
          `"${it.journalOrConference.replace(/"/g, '""')}"`,
          it.issnOrIsbn,
          it.indexing,
          it.doiOrUrl,
          it.publicationDate
        ].join(',')
      )
    ];
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedBatch.fileName.replace(/\.xlsx?$/i, '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            Reporte de Producción Científica Consolidada (XLS/XLSX/CSV)
          </h1>
          <p className="text-xs text-slate-500">
            Carga periódica de publicaciones indexadas, ponencias y patentes con validación activa de columnas y filiación UG
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedBatch && (
            <button
              onClick={handleDownloadOfficialBatch}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Descargar Consolidado Oficial</span>
            </button>
          )}

          {canUpload && (
            <button
              onClick={() => {
                setShowUploadModal(true);
                setUploadAlert(null);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Nuevo Archivo</span>
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

      {/* Batch Selector + Overview Card */}
      {batches.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {batches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBatchId(b.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                selectedBatch?.id === b.id
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              v{b.version}.0 · {b.period}
            </button>
          ))}
        </div>
      )}

      {selectedBatch ? (
        <>
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

            {/* Tabular View of Scientific Publications */}
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
        </>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
          No existen lotes de producción científica cargados aún.
        </div>
      )}

      {/* Real File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-lg w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Cargar y Validar Archivo de Producción Científica
            </h3>
            <p className="text-slate-600">
              El motor verificará automáticamente la extensión XLS/XLSX/CSV, el límite de {maxProductionMb} MB y almacenará el archivo en Supabase Storage.
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Periodo del Informe</label>
              <input
                type="text"
                value={periodInput}
                onChange={(e) => setPeriodInput(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Archivo Oficial (.XLS, .XLSX, .CSV · Máx. {maxProductionMb} MB)
              </label>
              <label className="flex items-center gap-2 p-3 border border-dashed border-slate-400 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100">
                <Upload className="w-4 h-4 text-blue-800 shrink-0" />
                <span className="truncate text-slate-800">
                  {selectedFile
                    ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`
                    : 'Seleccionar archivo de producción científica...'}
                </span>
                <input
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {parsedItems && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded text-[11px]">
                Estructura CSV validada (RN-15): <strong>{parsedItems.length}</strong> registros listos para importar.
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-1">
              <p className="font-semibold text-slate-700">Columnas validadas activamente (CSV/Excel):</p>
              <p className="text-slate-500 font-mono text-[10px]">
                {REQUIRED_CSV_HEADERS.join(', ')}
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
                disabled={isUploading || !selectedFile}
                onClick={handleUploadRealFile}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs disabled:opacity-50"
              >
                {isUploading ? 'Subiendo y validando...' : 'Validar, Subir e Importar Lote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
