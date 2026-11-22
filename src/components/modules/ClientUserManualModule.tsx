import React, { useState } from 'react';
import { generateManualPDF } from '../../utils/pdfGenerator';
import {
  BookOpen,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  FolderGit2,
  CalendarCheck,
  FileSpreadsheet,
  AlertTriangle,
  Play,
  Download,
  Search,
  Sliders,
  UserCheck2,
  Lock,
  Layers,
  Sparkles,
  FileDown
} from 'lucide-react';

export const ClientUserManualModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        generateManualPDF(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 250);
  };

  const chapters = [
    { id: 1, title: '1. Presentación Ejecutiva y Objetivos' },
    { id: 2, title: '2. Qué Tiene el Prototipo (Módulos y Capacidades)' },
    { id: 3, title: '3. Guía de Manejo Paso a Paso por Rol' },
    { id: 4, title: '4. Guion de Demostración Práctica (5 Minutos)' },
    { id: 5, title: '5. Reglas de Validación y Cierre de Expediente' },
    { id: 6, title: '6. Preguntas Frecuentes y Puntos de Decisión' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>DOCUMENTO DE ENTREGA AL CLIENTE · GUÍA OPERATIVA Y MANUAL DE USUARIO</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Manual de Usuario y Presentación del Prototipo Web FCI
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Facultad de Ingeniería Industrial · Universidad de Guayaquil · Piloto: Ingeniería en Telemática
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Generar y descargar archivo PDF oficial del manual"
          >
            <FileDown className="w-4 h-4 text-slate-950" />
            <span>{isGenerating ? 'Generando PDF...' : 'Descargar Manual en PDF'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              ¡PDF generado exitosamente! Se ha descargado el archivo:{' '}
              <strong>Manual_Usuario_Sistema_FCI_Universidad_Guayaquil.pdf</strong>
            </span>
          </div>
          <button onClick={() => setDownloadSuccess(false)} className="font-bold px-2">
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: Navigation on Left + Chapter Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation list */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 self-start">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
            Índice del Manual
          </span>
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveTab(ch.id)}
              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                activeTab === ch.id
                  ? 'bg-blue-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{ch.title}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeTab === ch.id ? 'text-white' : 'text-slate-400'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Content View */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* CHAPTER 1 */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                1. Presentación Ejecutiva y Objetivos del Prototipo
              </h2>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  ¿Para qué sirve este sistema?
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  El <strong>Sistema Web UG-Investiga FCI</strong> es la solución integral diseñada para la
                  Facultad de Ingeniería Industrial de la Universidad de Guayaquil con el propósito de
                  <strong> erradicar la dispersión de información y evidencias</strong> (que hoy se manejan de
                  manera desarticulada en carpetas locales, correos y hojas de cálculo).
                </p>
                <p className="text-slate-700 leading-relaxed">
                  A diferencia de repositorios pasivos de archivos (como Google Drive, Dropbox o carpetas en red),
                  este prototipo implementa un <strong>motor activo de validación documental</strong> que revisa en
                  tiempo real si las evidencias cumplen con el formato reglamentario, el límite de peso en megabytes,
                  el calendario académico y la coherencia temporal con los hitos del cronograma del proyecto.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
                  <span className="font-bold text-blue-900 text-xs block mb-1">
                    Alcance del Piloto
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Carrera de <strong>Ingeniería en Telemática</strong>. Cuenta con 2 proyectos FCI activos (FCI-001 y FCI-002) y 8 investigadores docentes adscritos.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <span className="font-bold text-emerald-900 text-xs block mb-1">
                    Control de Evidencias
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    4 fuentes de información normalizadas: propuestas anuales (&lt;10 MB), reportes semestrales FCI (&lt;10 MB), reportes individuales (&lt;5 MB) y producción científica XLS (&lt;4 MB).
                  </p>
                </div>

                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-lg">
                  <span className="font-bold text-purple-900 text-xs block mb-1">
                    Trazabilidad Inmutable
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Cada cambio, observación, aprobación y baja lógica queda registrado con fecha, hora, usuario causante, valores previos/nuevos y dirección IP.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <span className="font-bold block">Cómo interactuar con el prototipo:</span>
                <p className="text-slate-700">
                  En la parte superior de la pantalla encontrará un <strong>selector de roles</strong>. Permite alternar
                  al instante entre el Coordinador de Carrera, el Director de Proyecto, los Investigadores, el Gestor de
                  Conocimiento y el Administrador para probar la experiencia exacta que vivirá cada usuario de la facultad.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 2 */}
          {activeTab === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                2. Qué Tiene el Prototipo: Módulos y Funcionalidades
              </h2>

              <p className="text-slate-600">
                El prototipo entregado cuenta con <strong>13 módulos funcionales interactivos</strong> que cubren
                el 100% del ciclo de vida de los proyectos de investigación:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-900 text-white px-1.5 py-0.2 rounded">
                      M13
                    </span>
                    <h3 className="font-bold text-slate-900">Tablero de Control y Reportes Ejecutivos</h3>
                  </div>
                  <p className="text-slate-600">
                    Semáforos de cumplimiento semestral de los 8 investigadores, porcentaje de completitud documental de los 2 proyectos FCI piloto, plazos de cierre y botones de exportación a PDF y Excel.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-900 text-white px-1.5 py-0.2 rounded">
                      M3
                    </span>
                    <h3 className="font-bold text-slate-900">Propuestas de Proyectos FCI (Convocatoria Anual)</h3>
                  </div>
                  <p className="text-slate-600">
                    Bandeja de convocatoria abierta 2026-2027. Incluye el formulario de formulación con PDF adjunto (&lt;10 MB), flujo de borrador, envío a Coordinación, emisión de observaciones y <strong>creación automática del proyecto FCI al aprobarse</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-900 text-white px-1.5 py-0.2 rounded">
                      M4
                    </span>
                    <h3 className="font-bold text-slate-900">Gestión de Proyectos FCI y Cronograma de Hitos</h3>
                  </div>
                  <p className="text-slate-600">
                    Ficha integral de los proyectos piloto (FCI-001 y FCI-002), equipo adscrito con horas semanales, hitos con barra de progreso y botón de <strong>Verificación de Cierre de Expediente (RN-10)</strong> que bloquea el cierre si falta documentación obligatoria.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-900 text-white px-1.5 py-0.2 rounded">
                      M5 y M6
                    </span>
                    <h3 className="font-bold text-slate-900">Reportes Semestrales del FCI y por Investigador</h3>
                  </div>
                  <p className="text-slate-600">
                    Módulos separados para el reporte del Director (&lt;10 MB) y el reporte individual de cada investigador (&lt;5 MB). Congelamiento tras envío, revisión con observaciones de Coordinación y matriz de semáforo de cumplimiento.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-900 text-white px-1.5 py-0.2 rounded">
                      M7
                    </span>
                    <h3 className="font-bold text-slate-900">Producción Científica Consolidada (XLS/XLSX)</h3>
                  </div>
                  <p className="text-slate-600">
                    Herramienta exclusiva del Gestor de Conocimiento para subir el archivo de publicaciones. El sistema valida las 10 columnas obligatorias, comprueba la filiación a la Universidad de Guayaquil y muestra una tabla interactiva con artículos Scopus, WoS y ponencias.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-900 text-white px-1.5 py-0.2 rounded">
                      M8 y M9
                    </span>
                    <h3 className="font-bold text-slate-900">Repositorio con Versionado y Motor de Validación Activa</h3>
                  </div>
                  <p className="text-slate-600">
                    Control de versiones automáticas (v1.0, v1.1...), visor modal de metadatos, baja lógica obligatoria con motivo asentado y simulador interactivo para comprobar reglas de formato MIME, límites de peso y coherencia de fechas.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-900 text-white px-1.5 py-0.2 rounded">
                      M10, M11 y M12
                    </span>
                    <h3 className="font-bold text-slate-900">Auditoría Inmutable, Alertas y Ficha 360°</h3>
                  </div>
                  <p className="text-slate-600">
                    Línea de tiempo del proyecto, bitácora de auditoría con dirección IP, bandeja de notificaciones con simulador de correo institucional `@ug.edu.ec` y búsqueda facetada con ficha 360° por investigador.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 3 */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                3. Guía de Manejo Paso a Paso según el Rol
              </h2>

              {/* COORDINADOR */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-700"></span>
                  <h3 className="font-bold text-indigo-950 text-sm">
                    Rol: Coordinador de Carrera (Dr. Roberto Silva, PhD)
                  </h3>
                </div>
                <p className="text-slate-600 text-xs">
                  Es la autoridad encargada de supervisar el cumplimiento documental y dictaminar sobre propuestas y reportes semestrales.
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-indigo-300 text-xs text-slate-700">
                  <p><strong>1. Revisar cumplimiento en tiempo real:</strong> En el menú <em>Tableros y Reportes</em>, observe el semáforo de reportes de los 8 investigadores y la completitud porcentual de los expedientes.</p>
                  <p><strong>2. Dictaminar propuestas anuales:</strong> Diríjase a <em>Propuestas Convocatoria</em>, abra la postulación `PROP-2026-TEL-003`, examine el PDF adjunto y pulse <em>Aprobar Propuesta</em> (esto creará de inmediato el nuevo proyecto) o <em>Observar</em> para devolver correcciones.</p>
                  <p><strong>3. Validar reportes semestrales:</strong> En <em>Reportes Semestrales FCI</em> y <em>Reportes de Investigadores</em>, apruebe los informes conformes o redacte observaciones técnicas para que el docente subsane.</p>
                  <p><strong>4. Autorizar cierre de proyecto:</strong> En <em>Proyectos FCI Activos</em>, pulse <em>Verificar Cierre de Expediente</em>. Si faltan documentos obligatorios, el sistema bloqueará el cierre explicando el motivo.</p>
                </div>
              </div>

              {/* DIRECTOR */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                  <h3 className="font-bold text-blue-950 text-sm">
                    Rol: Director de FCI (MSc. Xavier Andrade)
                  </h3>
                </div>
                <p className="text-slate-600 text-xs">
                  Responsable del proyecto FCI activo (`FCI-2025-TEL-001`) y del envío del reporte técnico semestral.
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-blue-300 text-xs text-slate-700">
                  <p><strong>1. Consultar estado de su proyecto:</strong> Ingrese a <em>Proyectos FCI Activos</em> para revisar el cronograma de hitos, presupuesto ejecutado y expedientes cargados.</p>
                  <p><strong>2. Enviar el Reporte Semestral del FCI:</strong> En <em>Reportes Semestrales FCI</em>, pulse <em>Completar / Editar Reporte</em>, redacte los avances, justifique obstáculos y adjunte el PDF de evidencias (&lt;10 MB). Al pulsar <em>Enviar</em>, el formulario se congelará contra edición.</p>
                  <p><strong>3. Monitorear a su equipo de investigación:</strong> En <em>Reportes de Investigadores</em>, verifique quiénes de sus colaboradores ya enviaron su reporte individual y quiénes están rezagados.</p>
                </div>
              </div>

              {/* INVESTIGADOR */}
              <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-700"></span>
                  <h3 className="font-bold text-teal-950 text-sm">
                    Rol: Docente Investigador FCI (Ing. Gabriel Romero)
                  </h3>
                </div>
                <p className="text-slate-600 text-xs">
                  Participa como investigador en el proyecto y debe reportar semestralmente sus horas y entregables.
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-teal-300 text-xs text-slate-700">
                  <p><strong>1. Llenar informe semestral individual:</strong> En <em>Reportes de Investigadores</em>, seleccione su nombre, pulse <em>Editar Informe Individual</em>, ingrese las horas efectivas (ej. 128 horas), detalle las tareas y adjunte su PDF de evidencias (&lt;5 MB).</p>
                  <p><strong>2. Atender observaciones:</strong> Si su reporte fue marcado como <em>Observado</em>, el formulario se reabrirá para que cargue la versión corregida y reenvíe.</p>
                </div>
              </div>

              {/* GESTOR DE CONOCIMIENTO */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                  <h3 className="font-bold text-emerald-950 text-sm">
                    Rol: Gestor de Conocimiento de la Carrera (MSc. Diana Paredes)
                  </h3>
                </div>
                <p className="text-slate-600 text-xs">
                  Responsable del consolidado de producción científica y publicaciones indexadas.
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-emerald-300 text-xs text-slate-700">
                  <p><strong>1. Cargar archivo Excel:</strong> Ingrese a <em>Producción Científica (XLS)</em> y pulse <em>Cargar Nuevo Archivo XLS</em>. El sistema validará que pese menos de 4 MB y que contenga las 10 columnas obligatorias.</p>
                  <p><strong>2. Consultar catálogo de artículos:</strong> Filtre las publicaciones importadas por tipo (Scopus Q1/Q2, WoS, Latindex, Ponencias) y corrobore los enlaces DOI y la filiación institucional UG.</p>
                </div>
              </div>

              {/* ADMINISTRADOR */}
              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-700"></span>
                  <h3 className="font-bold text-rose-950 text-sm">
                    Rol: Administrador del Sistema (Ing. Carlos Mendoza)
                  </h3>
                </div>
                <p className="text-slate-600 text-xs">
                  Configura reglas globales, límites de peso, periodos académicos y cuentas de usuarios.
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-rose-300 text-xs text-slate-700">
                  <p><strong>1. Configurar límites de almacenamiento:</strong> En <em>Configuración y Reglas</em>, modifique los valores en megabytes para propuestas, reportes y producción según las políticas de almacenamiento institucional.</p>
                  <p><strong>2. Administrar usuarios y roles:</strong> En <em>Usuarios y Roles</em>, active/desactive cuentas, restablezca credenciales y asigne múltiples roles a docentes.</p>
                  <p><strong>3. Auditar operaciones:</strong> En <em>Trazabilidad y Auditoría</em>, consulte el registro inmutable de transacciones filtrando por usuario, entidad o acción.</p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 4 */}
          {activeTab === 4 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                4. Guion de Demostración Práctica (5 Minutos)
              </h2>

              <p className="text-slate-600">
                Siga este guion paso a paso frente al cliente o evaluador institucional para evidenciar todas las fortalezas del sistema:
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">1</span>
                    <span>Minuto 1: Conmutación de Roles y Tablero de Control</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Muestre la barra superior y cambie el rol activo entre <em>Coordinador</em> y <em>Director</em>. Explique cómo los datos se adaptan de inmediato según los permisos de cada actor sin exponer información restringida. Señale los semáforos de cumplimiento semestral.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">2</span>
                    <span>Minuto 2: Aprobación de Propuesta con Creación Automática de Proyecto</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Con el rol de <em>Coordinador de Carrera</em>, vaya a <em>Propuestas Convocatoria</em>. Seleccione la propuesta `PROP-2026-TEL-003` (Dra. Elena Villacís) y haga clic en <strong>Aprobar Propuesta</strong>. Diríjase a <em>Proyectos FCI Activos</em> y demuestre cómo el proyecto `FCI-2026-TEL-003` apareció automáticamente con todos sus datos y PDF base.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">3</span>
                    <span>Minuto 3: Verificación de Regla de Cierre de Proyecto (RN-10)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    En <em>Proyectos FCI Activos</em>, seleccione el proyecto `FCI-2025-TEL-001` (88% de avance) y presione el botón <strong>Verificar Cierre de Expediente</strong>. Muestre cómo el sistema bloquea el cierre indicando con precisión cuáles documentos obligatorios faltan para alcanzar el 100%.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">4</span>
                    <span>Minuto 4: Motor de Validación Activa Interactivo</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Ingrese a <em>Motor de Reglas Activas</em>. Mueva la barra de tamaño a 12 MB o cambie el formato a `.zip` y presione <strong>Ejecutar Validación Activa</strong>. El motor rechazará la carga al instante por infringir las reglas parametrizadas.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs">5</span>
                    <span>Minuto 5: Trazabilidad, Auditoría y Producción Científica</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Muestre cómo el Gestor de Conocimiento carga el archivo Excel en <em>Producción Científica</em> y cómo cada una de las acciones anteriores quedó registrada con fecha, hora e IP en <em>Trazabilidad y Auditoría</em>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 5 */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                5. Reglas de Validación y Política de Expediente Digital
              </h2>

              <p className="text-slate-600">
                El sistema garantiza la validez jurídica e institucional de los expedientes mediante las siguientes reglas obligatorias:
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 text-xs block mb-1">
                    1. Eliminación Lógica Estricta (Regla RN-21 y RN-22)
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Ningún archivo subido puede ser eliminado físicamente de la base documental. Al dar de baja un documento, el sistema exige ingresar un motivo justificado (ej. &ldquo;Reemplazado por versión con firma corregida&rdquo;) y preserva el archivo original en la bitácora de auditoría.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 text-xs block mb-1">
                    2. Congelamiento tras Envío (Regla RN-07 y RN-12)
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    En el momento en que un postulante, director o investigador presiona &ldquo;Enviar&rdquo;, el formulario y los archivos quedan bloqueados contra edición. Solo la Coordinación de Carrera puede reabrir el formulario emitiendo una observación formal.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 text-xs block mb-1">
                    3. Integridad Temporal con el Cronograma (Regla RN-19)
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Las evidencias técnicas cargadas deben corresponder al intervalo de vigencia del proyecto y a las fechas del semestre reportado, evitando el ingreso de evidencias anacrónicas o ajenas a la ejecución real.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-900 text-xs block mb-1">
                    4. Validación Estructural de Producción Científica (Regla RN-14 y RN-15)
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    El archivo Excel de producción no se almacena a ciegas: el sistema valida la presencia de las 10 columnas obligatorias y certifica que al menos un autor posea filiación declarada a la Universidad de Guayaquil.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 6 */}
          {activeTab === 6 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                6. Preguntas Frecuentes y Puntos de Decisión con el Cliente
              </h2>

              <div className="space-y-3">
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
                  <h3 className="font-bold text-amber-950 text-xs mb-1">
                    ¿Qué ocurre si un investigador no envía su reporte a tiempo?
                  </h3>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    <strong>Decisión funcional recomendada:</strong> El sistema emite una advertencia al Director del FCI indicando la lista de investigadores ausentes, pero permite enviar el reporte semestral general del proyecto para no paralizar la justificación técnica institucional ni la ejecución presupuestaria.
                  </p>
                </div>

                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
                  <h3 className="font-bold text-amber-950 text-xs mb-1">
                    ¿Se procesa el Excel de Producción Científica o solo se guarda?
                  </h3>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    <strong>Decisión funcional recomendada:</strong> El sistema procesa fila por fila el archivo para que docentes y directores puedan buscar y consultar artículos indexados en Scopus y Web of Science directamente desde el sistema web, vinculándolos al expediente del FCI.
                  </p>
                </div>

                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
                  <h3 className="font-bold text-amber-950 text-xs mb-1">
                    ¿Cómo crece el sistema después de la carrera piloto de Telemática?
                  </h3>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    El modelo funcional fue diseñado para escalar a toda la Facultad de Ingeniería Industrial (Ingeniería Industrial, Sistemas, Operaciones). Bastará con habilitar nuevas carreras en el catálogo sin requerir reestructuración funcional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
