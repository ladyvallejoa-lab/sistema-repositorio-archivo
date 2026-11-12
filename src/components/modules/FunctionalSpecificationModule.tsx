import React, { useState } from 'react';
import { FUNCTIONAL_SPECIFICATION } from '../../data/specificationContent';
import {
  BookMarked,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Printer,
  ChevronRight,
  ListOrdered,
  Layers,
  Send,
  Database
} from 'lucide-react';

export const FunctionalSpecificationModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [searchWord, setSearchWord] = useState('');

  const sections = [
    { id: 1, title: '1. Comprensión del Problema y Supuestos' },
    { id: 2, title: '2. Matriz de Permisos (Rol × Funcionalidad)' },
    { id: 3, title: '3. Requerimientos Funcionales (RF-01 a RF-38)' },
    { id: 4, title: '4. Catálogo de Reglas de Negocio (RN-01 a RN-22)' },
    { id: 5, title: '5. Diagramas de Estados (Texto Estructurado)' },
    { id: 6, title: '6. Casos de Uso Principales' },
    { id: 7, title: '7. Catálogo de Datos Funcionales' },
    { id: 8, title: '8. Matriz de Notificaciones y Alertas' },
    { id: 9, title: '9. Preguntas Abiertas y Ambigüedades' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1">
            <BookMarked className="w-4 h-4 text-blue-400" />
            <span>DOCUMENTO FORMAL DE INGENIERÍA DE REQUERIMIENTOS</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Dossier de Análisis Funcional Senior (9 Entregables)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Facultad de Ingeniería Industrial · Universidad de Guayaquil · Alcance Piloto: Carrera de Ingeniería en Telemática
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Navigation Pill Tabs + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Index on Left */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 self-start">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
            Índice de Entregables
          </span>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                activeSection === sec.id
                  ? 'bg-blue-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{sec.title}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeSection === sec.id ? 'text-white' : 'text-slate-400'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Content Section on Right */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* SECTION 1 */}
          {activeSection === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                {FUNCTIONAL_SPECIFICATION.section1_understanding.title}
              </h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-line leading-relaxed">
                {FUNCTIONAL_SPECIFICATION.section1_understanding.summary}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <strong>Alcance del Piloto:</strong> {FUNCTIONAL_SPECIFICATION.section1_understanding.pilotScope}
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-4">Supuestos Funcionales Asumidos</h3>
              <div className="space-y-2">
                {FUNCTIONAL_SPECIFICATION.section1_understanding.assumptions.map((sup) => (
                  <div key={sup.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-blue-900 font-mono">[{sup.id}] {sup.title}</span>
                    <p className="mt-1 text-slate-600">{sup.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2 */}
          {activeSection === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                {FUNCTIONAL_SPECIFICATION.section2_permissionsMatrix.title}
              </h2>
              <p className="text-slate-600">
                {FUNCTIONAL_SPECIFICATION.section2_permissionsMatrix.description}
              </p>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-[11px] text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Módulo Funcional</th>
                      <th className="py-2.5 px-2">Administrador</th>
                      <th className="py-2.5 px-2">Coordinador</th>
                      <th className="py-2.5 px-2">Gestor Conocimiento</th>
                      <th className="py-2.5 px-2">Director FCI</th>
                      <th className="py-2.5 px-2">Futuro Director</th>
                      <th className="py-2.5 px-2">Investigador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {FUNCTIONAL_SPECIFICATION.section2_permissionsMatrix.matrix.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                          {row.module}
                        </td>
                        <td className="py-2.5 px-2 text-slate-800">{row.admin}</td>
                        <td className="py-2.5 px-2 text-indigo-900 font-medium">{row.coord}</td>
                        <td className="py-2.5 px-2 text-emerald-900 font-medium">{row.gestor}</td>
                        <td className="py-2.5 px-2 text-blue-900 font-medium">{row.dirFci}</td>
                        <td className="py-2.5 px-2 text-amber-900 font-medium">{row.futuroDir}</td>
                        <td className="py-2.5 px-2 text-teal-900 font-medium">{row.investigador}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3 */}
          {activeSection === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  3. Requerimientos Funcionales Completos (RF-01 a RF-38)
                </h2>
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                  {FUNCTIONAL_SPECIFICATION.section3_functionalRequirements.length} RFs catalogados
                </span>
              </div>

              <div className="space-y-2.5">
                {FUNCTIONAL_SPECIFICATION.section3_functionalRequirements.map((rf) => (
                  <div
                    key={rf.code}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded">
                          {rf.code}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs">{rf.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                            rf.priority === 'Esencial'
                              ? 'bg-rose-100 text-rose-800'
                              : rf.priority === 'Importante'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Prioridad {rf.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{rf.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500">
                      <span>{rf.module}</span>
                      <span>Actores: {rf.actors.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4 */}
          {activeSection === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold text-slate-900">
                  4. Catálogo de Reglas de Negocio y Validación Documental (RN-01 a RN-22)
                </h2>
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                  {FUNCTIONAL_SPECIFICATION.section4_businessRules.length} Reglas Gobernantes
                </span>
              </div>

              <div className="space-y-2.5">
                {FUNCTIONAL_SPECIFICATION.section4_businessRules.map((rn) => (
                  <div
                    key={rn.code}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-800 text-white px-1.5 py-0.2 rounded">
                          {rn.code}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs">{rn.title}</h3>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          rn.severity === 'Bloqueante'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rn.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs mt-1 font-medium leading-relaxed">
                      {rn.statement}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-1.5">
                      Categoría: {rn.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5 */}
          {activeSection === 5 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                {FUNCTIONAL_SPECIFICATION.section5_stateDiagrams.title}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                    5.1 Diagrama de Estados de una Propuesta FCI
                  </h3>
                  <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                    {FUNCTIONAL_SPECIFICATION.section5_stateDiagrams.proposalDiagram}
                  </pre>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                    5.2 Diagrama del Ciclo de Vida de un Proyecto FCI
                  </h3>
                  <pre className="p-4 bg-slate-950 text-cyan-400 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                    {FUNCTIONAL_SPECIFICATION.section5_stateDiagrams.projectDiagram}
                  </pre>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                    5.3 Diagrama de Estados de Reportes Semestrales
                  </h3>
                  <pre className="p-4 bg-slate-950 text-amber-400 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                    {FUNCTIONAL_SPECIFICATION.section5_stateDiagrams.reportDiagram}
                  </pre>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                    5.4 Diagrama de Estados y Versionado de Documentos
                  </h3>
                  <pre className="p-4 bg-slate-950 text-purple-400 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                    {FUNCTIONAL_SPECIFICATION.section5_stateDiagrams.documentDiagram}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6 */}
          {activeSection === 6 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                6. Casos de Uso Principales Formalizados
              </h2>

              <div className="space-y-6">
                {FUNCTIONAL_SPECIFICATION.section6_useCases.map((cu) => (
                  <div key={cu.code} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-blue-900 text-white px-2 py-0.5 rounded">
                          {cu.code}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{cu.title}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Actor: {cu.actor}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Precondiciones:</span>
                      <ul className="list-disc list-inside text-slate-600 text-xs space-y-0.5">
                        {cu.preconditions.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Flujo Normal de Eventos:</span>
                      <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 text-slate-700 text-xs">
                        {cu.normalFlow.map((step, i) => (
                          <p key={i}>{step}</p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-amber-900 block mb-1">Flujos Alternos / Excepciones:</span>
                      <ul className="list-disc list-inside text-amber-800 text-xs space-y-0.5 bg-amber-50/60 p-2.5 rounded border border-amber-200">
                        {cu.alternateFlows.map((alt, i) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-900 block mb-1">Postcondiciones:</span>
                      <ul className="list-disc list-inside text-emerald-800 text-xs space-y-0.5 bg-emerald-50/60 p-2.5 rounded border border-emerald-200">
                        {cu.postconditions.map((post, i) => (
                          <li key={i}>{post}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7 */}
          {activeSection === 7 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                {FUNCTIONAL_SPECIFICATION.section7_dataCatalog.title}
              </h2>
              <p className="text-slate-600">
                {FUNCTIONAL_SPECIFICATION.section7_dataCatalog.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FUNCTIONAL_SPECIFICATION.section7_dataCatalog.entities.map((ent, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                      {ent.module}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">{ent.name}</h3>
                    <ul className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200 pt-2">
                      {ent.attributes.map((attr, aIdx) => (
                        <li key={aIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>{attr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8 */}
          {activeSection === 8 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                8. Matriz de Notificaciones y Mensajería Institucional
              </h2>

              <div className="space-y-3">
                {FUNCTIONAL_SPECIFICATION.section8_notificationsMatrix.map((notif) => (
                  <div key={notif.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded">
                          {notif.id}
                        </span>
                        <h3 className="font-bold text-slate-900">{notif.event}</h3>
                      </div>
                      <div className="flex gap-1 font-mono text-[10px]">
                        {notif.channels.map((ch, i) => (
                          <span key={i} className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Destinatario: <strong>{notif.recipient}</strong>
                    </p>
                    <div className="p-2.5 bg-white border border-slate-200 rounded text-slate-700 italic text-[11px]">
                      &ldquo;{notif.baseTemplate}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9 */}
          {activeSection === 9 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                {FUNCTIONAL_SPECIFICATION.section9_openQuestions.title}
              </h2>
              <p className="text-slate-600">
                {FUNCTIONAL_SPECIFICATION.section9_openQuestions.description}
              </p>

              <div className="space-y-4">
                {FUNCTIONAL_SPECIFICATION.section9_openQuestions.questions.map((q) => (
                  <div key={q.number} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                      <span className="font-mono text-amber-800">Pregunta 0{q.number}:</span>
                      <span>{q.question}</span>
                    </h3>
                    <div className="pl-6 pt-1 text-slate-700 leading-relaxed">
                      <strong>Análisis y recomendación del analista senior:</strong> {q.analysis}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
