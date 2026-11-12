/**
 * Documento de Especificación de Análisis Funcional Senior
 * Sistema de Gestión Documental y Seguimiento de Proyectos FCI
 * Facultad de Ingeniería Industrial - Universidad de Guayaquil
 * Carrera Piloto: Ingeniería en Telemática
 */

export interface FunctionalRequirement {
  code: string;
  module: string;
  title: string;
  description: string;
  priority: 'Esencial' | 'Importante' | 'Deseable';
  actors: string[];
}

export interface BusinessRule {
  code: string;
  category: 'Acceso y Roles' | 'Configuración' | 'Propuestas' | 'Proyectos y Estados' | 'Reportes Semestrales' | 'Producción Científica' | 'Validación Documental' | 'Auditoría y Notificaciones';
  title: string;
  statement: string;
  severity: 'Bloqueante' | 'Advertencia' | 'Informativa';
}

export interface UseCaseSpec {
  code: string;
  title: string;
  actor: string;
  preconditions: string[];
  normalFlow: string[];
  alternateFlows: string[];
  postconditions: string[];
}

export interface NotificationSpec {
  id: string;
  event: string;
  recipient: string;
  channels: string[];
  baseTemplate: string;
}

export const FUNCTIONAL_SPECIFICATION = {
  section1_understanding: {
    title: '1. Resumen de Comprensión del Problema y Supuestos Asumidos',
    summary: `La Facultad de Ingeniería Industrial de la Universidad de Guayaquil administra proyectos de investigación financiados por Fondos Competitivos de Investigación (FCI). Actualmente, la gestión documental sufre de alta dispersión (hojas de cálculo aisladas, correos electrónicos, carpetas en discos locales y nubes personales), lo cual provoca:
1. Carencia de una versión única y verídica del expediente de cada proyecto.
2. Inexistencia de validaciones activas en tiempo real (los archivos se almacenan pasivamente sin verificar formato, integridad, correspondencia temporal ni límites de peso).
3. Cero trazabilidad sobre observaciones, reenvíos, aprobaciones y modificaciones.
4. Alta carga operativa manual para el Coordinador de Carrera y el Gestor de Conocimiento al consolidar información para auditorías y rendición de cuentas institucional.

El sistema web centralizará el ciclo documental de extremo a extremo: desde la postulación anual de propuestas, pasando por la ejecución semestral con reportes del director e investigadores, hasta el cierre formal del proyecto y custodia de producción científica, aplicando reglas de validación en el momento de la carga.`,
    pilotScope: 'Carrera de Ingeniería en Telemática (2 proyectos FCI activos: FCI-2025-TEL-001 y FCI-2025-TEL-002, 8 investigadores FCI activos, 1 propuesta anual en formulación).',
    assumptions: [
      {
        id: 'SUP-01',
        title: 'Cuentas institucionales y multi-rol',
        description: 'Todo usuario se autentica con su correo institucional (@ug.edu.ec). Un docente puede desempeñarse simultáneamente como Director en un proyecto FCI y como Docente Investigador en otro, o postular como Futuro Director.'
      },
      {
        id: 'SUP-02',
        title: 'Alcance estricto de visibilidad por proyecto',
        description: 'El principio de mínimo privilegio rige el acceso: un investigador solo puede cargar y consultar sus propios reportes e informes del proyecto en el cual está formalmente adscrito; el Director supervisa únicamente su FCI; el Coordinador de Carrera supervisa todos los proyectos de Telemática; el Gestor de Conocimiento y el Administrador tienen vista consolidada.'
      },
      {
        id: 'SUP-03',
        title: 'Eliminación lógica estricta',
        description: 'Ningún documento, propuesta ni reporte enviado puede ser borrado físicamente de la base de registros. Se aplica eliminación lógica que exige un motivo formal obligatorio, preservando el archivo histórico y la entrada en la bitácora inmutable de auditoría.'
      },
      {
        id: 'SUP-04',
        title: 'Límites de tamaño iniciales y configurabilidad',
        description: 'Los límites base estipulados (<10 MB para propuesta, <10 MB para reporte FCI, <5 MB para reporte de investigador, <4 MB para producción científica) son parámetros modificables por el Administrador sin requerir intervención de desarrollo de software.'
      },
      {
        id: 'SUP-05',
        title: 'Validación activa inmediata',
        description: 'El sistema no actúa como un repositorio pasivo (tipo Google Drive o Dropbox). Al momento de cargar cualquier documento, el motor ejecuta reglas de verificación de extensión MIME, tamaño en bytes, duplicidad y coherencia con el calendario y cronograma.'
      }
    ]
  },

  section2_permissionsMatrix: {
    title: '2. Matriz de Permisos: Rol × Funcionalidad',
    description: 'Niveles de acceso aplicados: Crear (C), Ver (V), Editar (E), Validar (Val), Aprobar (A), Eliminar Lógico (D), Exportar (X). El guion (-) indica sin acceso.',
    matrix: [
      {
        module: 'M1. Usuarios y Roles',
        admin: 'C, V, E, D, X',
        coord: 'V, X',
        gestor: 'V, X',
        dirFci: '-',
        futuroDir: '-',
        investigador: '-'
      },
      {
        module: 'M2. Configuración y Calendario',
        admin: 'C, V, E, D',
        coord: 'V',
        gestor: 'V',
        dirFci: 'V (Solo lectura calendario)',
        futuroDir: 'V (Solo lectura convocatorias)',
        investigador: 'V (Solo lectura calendario)'
      },
      {
        module: 'M3. Propuestas FCI (Convocatoria)',
        admin: 'V, X',
        coord: 'V, Val, A, X',
        gestor: 'V, X',
        dirFci: 'V (Histórico)',
        futuroDir: 'C, V, E (En borrador), X',
        investigador: 'V (Solo lectura)'
      },
      {
        module: 'M4. Gestión de Proyectos FCI',
        admin: 'V, E (Metadatos globales), X',
        coord: 'V, Val, A (Cierre), X',
        gestor: 'V, X',
        dirFci: 'V, E (Su proyecto y cronograma), X',
        futuroDir: '-',
        investigador: 'V (Solo su proyecto)'
      },
      {
        module: 'M5. Reportes Semestrales FCI',
        admin: 'V, X',
        coord: 'V, Val, A, X',
        gestor: 'V, X',
        dirFci: 'C, V, E (Su borrador), X',
        futuroDir: '-',
        investigador: 'V (Solo lectura de su FCI)'
      },
      {
        module: 'M6. Reportes Semestrales Investigador',
        admin: 'V, X',
        coord: 'V, Val, A, X',
        gestor: 'V, X',
        dirFci: 'V (De su equipo), Val, X',
        futuroDir: '-',
        investigador: 'C, V, E (Su propio reporte)'
      },
      {
        module: 'M7. Producción Científica (XLS)',
        admin: 'V, X',
        coord: 'V, X',
        gestor: 'C, V, E (Cargar/Reemplazar), Val, X',
        dirFci: 'V (Artículos de su proyecto)',
        futuroDir: '-',
        investigador: 'V (Sus publicaciones)'
      },
      {
        module: 'M8. Gestión Documental Transversal',
        admin: 'V, D (Con justificación), X',
        coord: 'V, D (Con justificación), X',
        gestor: 'V, X',
        dirFci: 'C, V, E (Su FCI), X',
        futuroDir: 'C, V (Su propuesta)',
        investigador: 'C, V (Sus evidencias)'
      },
      {
        module: 'M9. Motor de Validación Activa',
        admin: 'Configurar umbrales',
        coord: 'Ejecutar / Revisar dictamen',
        gestor: 'Ejecutar / Revisar dictamen',
        dirFci: 'Revisar dictamen de su carga',
        futuroDir: 'Revisar dictamen de su carga',
        investigador: 'Revisar dictamen de su carga'
      },
      {
        module: 'M10. Auditoría y Trazabilidad',
        admin: 'V, X (Auditoría completa)',
        coord: 'V, X (De su carrera)',
        gestor: 'V, X (De su carrera)',
        dirFci: 'V (Línea de tiempo de su FCI)',
        futuroDir: 'V (Historial de su propuesta)',
        investigador: 'V (Historial de sus entregas)'
      },
      {
        module: 'M11. Notificaciones y Alertas',
        admin: 'V, Configurar eventos',
        coord: 'V, Recibir alertas de revisión',
        gestor: 'V, Recibir alertas de producción',
        dirFci: 'V, Recibir alertas de plazos y obs.',
        futuroDir: 'V, Recibir estado de propuesta',
        investigador: 'V, Recibir alertas de plazos y obs.'
      },
      {
        module: 'M12. Búsqueda y Consultas',
        admin: 'V, Búsqueda global, X',
        coord: 'V, Búsqueda carrera, X',
        gestor: 'V, Búsqueda global carrera, X',
        dirFci: 'V, Búsqueda en su FCI, X',
        futuroDir: 'V, Búsqueda en su propuesta',
        investigador: 'V, Búsqueda en su FCI, X'
      },
      {
        module: 'M13. Tableros y Reportes',
        admin: 'V (KPIs globales), X',
        coord: 'V (KPIs carrera), X',
        gestor: 'V (KPIs investigación/producción), X',
        dirFci: 'V (KPIs su proyecto), X',
        futuroDir: 'V (Estado postulación)',
        investigador: 'V (Mis tareas y entregables)'
      }
    ]
  },

  section3_functionalRequirements: [
    // M1
    {
      code: 'RF-01',
      module: 'Módulo 1: Acceso, Usuarios y Roles',
      title: 'Autenticación de Usuarios Institucionales',
      description: 'El sistema debe permitir a los usuarios iniciar y cerrar sesión mediante correo institucional y contraseña segura, con recuperación por enlace seguro.',
      priority: 'Esencial',
      actors: ['Todos los roles']
    },
    {
      code: 'RF-02',
      module: 'Módulo 1: Acceso, Usuarios y Roles',
      title: 'Gestión y Activación de Usuarios',
      description: 'El sistema debe permitir al Administrador registrar, actualizar datos, activar y desactivar usuarios, especificando nombres, correo, carrera y facultad.',
      priority: 'Esencial',
      actors: ['Administrador']
    },
    {
      code: 'RF-03',
      module: 'Módulo 1: Acceso, Usuarios y Roles',
      title: 'Asignación de Multi-Roles y Control de Ámbito',
      description: 'El sistema debe soportar la asignación simultánea de múltiples roles a un mismo usuario y restringir la visibilidad de datos a los proyectos a los que pertenece.',
      priority: 'Esencial',
      actors: ['Administrador']
    },
    // M2
    {
      code: 'RF-04',
      module: 'Módulo 2: Configuración y Parametrización',
      title: 'Parametrización de Periodos Académicos y Convocatorias',
      description: 'El sistema debe permitir al Administrador definir y activar periodos académicos (ej. 2026-CI) y convocatorias anuales de proyectos FCI.',
      priority: 'Esencial',
      actors: ['Administrador']
    },
    {
      code: 'RF-05',
      module: 'Módulo 2: Configuración y Parametrización',
      title: 'Calendario de Apertura y Cierre de Reportes',
      description: 'El sistema debe permitir programar fechas límite de apertura, cierre formal y días de prórroga para reportes semestrales y producción científica.',
      priority: 'Esencial',
      actors: ['Administrador']
    },
    {
      code: 'RF-06',
      module: 'Módulo 2: Configuración y Parametrización',
      title: 'Catálogo de Documentos Obligatorios por Etapa',
      description: 'El sistema debe permitir parametrizar qué tipos de documentos son estrictamente obligatorios en cada fase (Propuesta, Ejecución, Cierre).',
      priority: 'Esencial',
      actors: ['Administrador']
    },
    {
      code: 'RF-07',
      module: 'Módulo 2: Configuración y Parametrización',
      title: 'Configuración de Reglas de Formato y Peso Máximo',
      description: 'El sistema debe permitir configurar los tamaños máximos en megabytes y las extensiones MIME permitidas por cada tipo documental de manera dinámica.',
      priority: 'Esencial',
      actors: ['Administrador']
    },
    // M3
    {
      code: 'RF-08',
      module: 'Módulo 3: Propuestas de Proyectos FCI',
      title: 'Registro de Propuesta en Formulario y Adjunto PDF',
      description: 'El sistema debe permitir al Futuro Director registrar los campos estructurados de la propuesta (título, objetivos, resumen, presupuesto) y adjuntar el archivo PDF (<10 MB).',
      priority: 'Esencial',
      actors: ['Futuro Director de FCI']
    },
    {
      code: 'RF-09',
      module: 'Módulo 3: Propuestas de Proyectos FCI',
      title: 'Guardado en Borrador y Envío en Convocatoria',
      description: 'El sistema debe permitir guardar la propuesta en estado Borrador tantas veces como sea necesario y enviarla a revisión únicamente si la convocatoria está abierta.',
      priority: 'Esencial',
      actors: ['Futuro Director de FCI']
    },
    {
      code: 'RF-10',
      module: 'Módulo 3: Propuestas de Proyectos FCI',
      title: 'Revisión, Observaciones y Dictamen de Propuesta',
      description: 'El sistema debe permitir al Coordinador de Carrera revisar la propuesta, registrar observaciones específicas, devolver para subsanación, aprobar o rechazar.',
      priority: 'Esencial',
      actors: ['Coordinador de Carrera']
    },
    {
      code: 'RF-11',
      module: 'Módulo 3: Propuestas de Proyectos FCI',
      title: 'Creación Automática de Proyecto tras Aprobación',
      description: 'Al marcarse una propuesta como Aprobada, el sistema debe crear de forma automática la ficha del Proyecto FCI activo, precargando todos sus metadatos y asignando al postulante como Director.',
      priority: 'Esencial',
      actors: ['Sistema (Automático)', 'Coordinador de Carrera']
    },
    // M4
    {
      code: 'RF-12',
      module: 'Módulo 4: Gestión de Proyectos FCI',
      title: 'Ficha Integral del Proyecto FCI',
      description: 'El sistema debe desplegar la ficha completa del proyecto con código, título, línea de investigación, resumen, objetivos, presupuesto asignado/ejecutado y carrera.',
      priority: 'Esencial',
      actors: ['Director de FCI', 'Coordinador de Carrera', 'Gestor de Conocimiento']
    },
    {
      code: 'RF-13',
      module: 'Módulo 4: Gestión de Proyectos FCI',
      title: 'Gestión del Equipo de Investigación',
      description: 'El sistema debe permitir registrar los participantes del proyecto (Director, Coinvestigadores, Investigadores, Estudiantes) indicando sus horas semanales de dedicación.',
      priority: 'Esencial',
      actors: ['Director de FCI', 'Coordinador de Carrera']
    },
    {
      code: 'RF-14',
      module: 'Módulo 4: Gestión de Proyectos FCI',
      title: 'Cronograma de Hitos y Actividades',
      description: 'El sistema debe permitir gestionar los hitos del proyecto con fechas programadas, fechas reales de ejecución, porcentaje de avance y vinculación de evidencias.',
      priority: 'Importante',
      actors: ['Director de FCI', 'Coordinador de Carrera']
    },
    {
      code: 'RF-15',
      module: 'Módulo 4: Gestión de Proyectos FCI',
      title: 'Control de Transiciones de Ciclo de Vida y Cierre',
      description: 'El sistema debe gobernar los estados del proyecto e impedir el cierre a estado Finalizado si el expediente documental no cuenta con el 100% de requisitos obligatorios aprobados.',
      priority: 'Esencial',
      actors: ['Coordinador de Carrera']
    },
    {
      code: 'RF-16',
      module: 'Módulo 4: Gestión de Proyectos FCI',
      title: 'Bloqueo a Modo Solo Lectura tras Cierre',
      description: 'El sistema debe bloquear irreversiblemente en modo solo lectura todos los formularios y la carga de documentos de cualquier proyecto con estado Finalizado o Cancelado.',
      priority: 'Esencial',
      actors: ['Sistema']
    },
    // M5
    {
      code: 'RF-17',
      module: 'Módulo 5: Reportes Semestrales del FCI',
      title: 'Habilitación de Periodo de Reporte según Calendario',
      description: 'El sistema debe habilitar el formulario de reporte semestral del FCI únicamente durante la ventana temporal configurada en el calendario académico.',
      priority: 'Esencial',
      actors: ['Sistema']
    },
    {
      code: 'RF-18',
      module: 'Módulo 5: Reportes Semestrales del FCI',
      title: 'Diligenciamiento de Reporte Semestral por el Director',
      description: 'El sistema debe permitir al Director documentar avances del semestre, hitos logrados, problemas encontrados y adjuntar el archivo PDF consolidado de evidencias (<10 MB).',
      priority: 'Esencial',
      actors: ['Director de FCI']
    },
    {
      code: 'RF-19',
      module: 'Módulo 5: Reportes Semestrales del FCI',
      title: 'Bloqueo tras Envío y Flujo de Revisión',
      description: 'El sistema debe congelar la edición del reporte una vez enviado a Coordinación, permitiendo al Coordinador observarlo para reenvío o aprobarlo definitivamente.',
      priority: 'Esencial',
      actors: ['Director de FCI', 'Coordinador de Carrera']
    },
    // M6
    {
      code: 'RF-20',
      module: 'Módulo 6: Reportes Semestrales por Investigador',
      title: 'Diligenciamiento de Reporte Individual',
      description: 'El sistema debe permitir a cada Docente Investigador llenar su informe semestral individual con horas ejecutadas, actividades y PDF de evidencias (<5 MB).',
      priority: 'Esencial',
      actors: ['Docente Investigador FCI']
    },
    {
      code: 'RF-21',
      module: 'Módulo 6: Reportes Semestrales por Investigador',
      title: 'Matriz de Cumplimiento de Investigadores del FCI',
      description: 'El sistema debe proporcionar una vista consolidada para el Director y Coordinador indicando quiénes han enviado a tiempo, quiénes tienen observaciones y quiénes están rezagados.',
      priority: 'Esencial',
      actors: ['Director de FCI', 'Coordinador de Carrera']
    },
    // M7
    {
      code: 'RF-22',
      module: 'Módulo 7: Reporte de Producción Científica',
      title: 'Carga y Validación de Archivo XLS/XLSX',
      description: 'El sistema debe permitir al Gestor de Conocimiento cargar el archivo de producción científica del periodo (<4 MB) y validar automáticamente su estructura de columnas.',
      priority: 'Esencial',
      actors: ['Gestor de Conocimiento']
    },
    {
      code: 'RF-23',
      module: 'Módulo 7: Reporte de Producción Científica',
      title: 'Lectura, Consulta Tabular y Control de Versiones del Archivo',
      description: 'El sistema debe leer e interpretar los registros del archivo para su visualización y filtrado en línea, guardando la versión del archivo si se efectúa una recarga.',
      priority: 'Importante',
      actors: ['Gestor de Conocimiento', 'Coordinador de Carrera', 'Director de FCI']
    },
    // M8
    {
      code: 'RF-24',
      module: 'Módulo 8: Gestión Documental Transversal',
      title: 'Repositorio Documental con Metadatos Enriquecidos',
      description: 'El sistema debe almacenar todo archivo asociado a proyectos, propuestas o reportes con metadatos: autor, fecha/hora, tamaño, tipo, periodo y confidencialidad.',
      priority: 'Esencial',
      actors: ['Todos los roles con permisos de carga']
    },
    {
      code: 'RF-25',
      module: 'Módulo 8: Gestión Documental Transversal',
      title: 'Versionado Automático y Señalización de Vigencia',
      description: 'Al cargar una nueva versión de un documento existente, el sistema debe incrementar la versión automáticamente y rotular inequívocamente cuál es la versión vigente.',
      priority: 'Esencial',
      actors: ['Sistema']
    },
    {
      code: 'RF-26',
      module: 'Módulo 8: Gestión Documental Transversal',
      title: 'Eliminación Lógica con Motivo Obligatorio',
      description: 'El sistema debe impedir el borrado físico de documentos; la baja lógica debe requerir obligatoriamente una justificación textual que queda asentada en la auditoría.',
      priority: 'Esencial',
      actors: ['Administrador', 'Coordinador de Carrera']
    },
    // M9
    {
      code: 'RF-27',
      module: 'Módulo 9: Motor de Validación Documental Activa',
      title: 'Validación Activa de Formatos y Pesos Máximos',
      description: 'El sistema debe rechazar en tiempo real la subida de archivos que no cumplan el formato MIME permitido o excedan el tamaño configurado en la parametrización.',
      priority: 'Esencial',
      actors: ['Sistema (Motor Activo)']
    },
    {
      code: 'RF-28',
      module: 'Módulo 9: Motor de Validación Documental Activa',
      title: 'Detección Activa de Evidencias Faltantes y Semáforo',
      description: 'El sistema debe evaluar el expediente contra los requisitos obligatorios de la etapa actual y clasificar el resultado en: Aceptado, Con Advertencia o Rechazado.',
      priority: 'Esencial',
      actors: ['Sistema (Motor Activo)']
    },
    {
      code: 'RF-29',
      module: 'Módulo 9: Motor de Validación Documental Activa',
      title: 'Control de Duplicados por Nombre y Hash de Contenido',
      description: 'El sistema debe advertir si un archivo con el mismo contenido o nombre idéntico ya fue cargado previamente en el mismo proyecto o periodo.',
      priority: 'Importante',
      actors: ['Sistema (Motor Activo)']
    },
    {
      code: 'RF-30',
      module: 'Módulo 9: Motor de Validación Documental Activa',
      title: 'Control de Coherencia Temporal con Cronograma',
      description: 'El sistema debe validar que las fechas de las evidencias coincidan con el marco temporal del periodo o hito del cronograma del proyecto.',
      priority: 'Importante',
      actors: ['Sistema (Motor Activo)']
    },
    // M10
    {
      code: 'RF-31',
      module: 'Módulo 10: Seguimiento, Trazabilidad y Auditoría',
      title: 'Línea de Tiempo Cronológica del Proyecto',
      description: 'El sistema debe renderizar la cronología de eventos del proyecto (postulación, dictámenes, aprobaciones, cargas de reportes, observaciones) en orden temporal.',
      priority: 'Esencial',
      actors: ['Director de FCI', 'Coordinador de Carrera', 'Gestor de Conocimiento']
    },
    {
      code: 'RF-32',
      module: 'Módulo 10: Seguimiento, Trazabilidad y Auditoría',
      title: 'Bitácora Inmutable de Auditoría',
      description: 'El sistema debe registrar de forma inalterable: fecha, hora, usuario, rol, acción, entidad afectada, valor anterior y nuevo, e identificador de sesión/IP.',
      priority: 'Esencial',
      actors: ['Administrador', 'Coordinador de Carrera']
    },
    // M11
    {
      code: 'RF-33',
      module: 'Módulo 11: Notificaciones y Alertas',
      title: 'Alertas de Próximo Cierre y Vencimiento',
      description: 'El sistema debe emitir alertas automatizadas en la bandeja interna y vía correo institucional cuando falten N días configurados para el cierre de un periodo.',
      priority: 'Esencial',
      actors: ['Sistema']
    },
    {
      code: 'RF-34',
      module: 'Módulo 11: Notificaciones y Alertas',
      title: 'Notificación de Envíos, Observaciones y Dictámenes',
      description: 'El sistema debe notificar de inmediato al Coordinador ante un nuevo envío, y al autor ante la recepción de observaciones o la aprobación de su reporte/propuesta.',
      priority: 'Esencial',
      actors: ['Sistema']
    },
    // M12
    {
      code: 'RF-35',
      module: 'Módulo 12: Búsqueda y Consultas Multifiltro',
      title: 'Búsqueda Global y Filtros Facetados',
      description: 'El sistema debe permitir buscar documentos, proyectos y reportes por palabras clave en metadatos, filtrando por investigador, línea, periodo, estado y tipo.',
      priority: 'Importante',
      actors: ['Todos los roles']
    },
    {
      code: 'RF-36',
      module: 'Módulo 12: Búsqueda y Consultas Multifiltro',
      title: 'Ficha Histórica 360° del Investigador',
      description: 'El sistema debe permitir consultar todos los proyectos, reportes semestrales y documentos vinculados a un investigador en su trayectoria dentro de la carrera.',
      priority: 'Importante',
      actors: ['Coordinador de Carrera', 'Gestor de Conocimiento', 'Director de FCI']
    },
    // M13
    {
      code: 'RF-37',
      module: 'Módulo 13: Tableros de Control y Reportes Ejecutivos',
      title: 'Tablero de Control Segmentado por Rol',
      description: 'El sistema debe presentar dashboards personalizados con indicadores acordes al rol: completitud documental, porcentaje de avance, semáforos de cumplimiento y alertas.',
      priority: 'Esencial',
      actors: ['Todos los roles']
    },
    {
      code: 'RF-38',
      module: 'Módulo 13: Tableros de Control y Reportes Ejecutivos',
      title: 'Exportación de Reportes Consolidados a PDF y Excel',
      description: 'El sistema debe permitir generar resúmenes ejecutivos del estado documental de la carrera exportables en formatos PDF y Excel/CSV para auditoría institucional.',
      priority: 'Importante',
      actors: ['Coordinador de Carrera', 'Gestor de Conocimiento', 'Administrador']
    }
  ],

  section4_businessRules: [
    // Acceso y roles
    {
      code: 'RN-01',
      category: 'Acceso y Roles',
      title: 'Dominio institucional de correo electrónico',
      statement: 'Todo usuario registrado debe poseer obligatoriamente una cuenta de correo con dominio @ug.edu.ec.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-02',
      category: 'Acceso y Roles',
      title: 'Segregación y alcance de visibilidad de proyectos',
      statement: 'Un Director o Docente Investigador solo puede visualizar la documentación y gestionar reportes de los proyectos FCI en los que figura formalmente como miembro del equipo.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-03',
      category: 'Acceso y Roles',
      title: 'Incompatibilidad de auto-aprobación',
      statement: 'Si un usuario posee el rol de Coordinador de Carrera y a su vez es Director de un proyecto FCI, no podrá aprobar sus propios reportes semestrales ni sus propuestas; dicha revisión deberá ser delegada a la autoridad subrogante.',
      severity: 'Bloqueante'
    },
    // Configuración
    {
      code: 'RN-04',
      category: 'Configuración',
      title: 'Parametrización dinámica de límites de almacenamiento',
      statement: 'Los límites máximos de tamaño por tipo de archivo y las extensiones permitidas no deben estar fijos en código, sino definidos en la tabla de configuración administrable.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-05',
      category: 'Configuración',
      title: 'Cierre inmutable de calendarios vencidos',
      statement: 'Vencida la fecha límite programada en el calendario sin prórroga autorizada, el sistema cambiará el estado de los reportes no entregados a "Fuera de Plazo" y bloqueará el botón de envío normal.',
      severity: 'Bloqueante'
    },
    // Propuestas
    {
      code: 'RN-06',
      category: 'Propuestas',
      title: 'Postulación exclusiva en convocatorias abiertas',
      statement: 'Una propuesta de proyecto FCI solo puede crearse y enviarse si existe una convocatoria anual configurada con estado "Abierta" y la fecha actual es menor o igual a la fecha de cierre.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-07',
      category: 'Propuestas',
      title: 'Borrador editable hasta el envío',
      statement: 'El Futuro Director puede guardar y modificar la propuesta tantas veces requiera mientras esté en estado Borrador. Una vez enviada, queda bloqueada hasta recibir observaciones.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-08',
      category: 'Propuestas',
      title: 'Generación automática de proyecto por aprobación',
      statement: 'Al aprobarse una propuesta por la Coordinación y Consejo Directivo, el sistema debe instanciar inmediatamente un proyecto con estado "Aprobado" y copiar todos los datos y el PDF como documento base v1.0.',
      severity: 'Bloqueante'
    },
    // Proyectos y Estados
    {
      code: 'RN-09',
      category: 'Proyectos y Estados',
      title: 'Transición válida del ciclo de vida del proyecto',
      statement: 'Las transiciones permitidas son: EN_FORMULACION -> APROBADO -> EN_EJECUCION -> FINALIZADO. La transición a CANCELADO solo es permitida desde APROBADO o EN_EJECUCION.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-10',
      category: 'Proyectos y Estados',
      title: 'Condición previa sine qua non para el Cierre de Proyecto',
      statement: 'El proyecto NO puede transicionar a estado FINALIZADO a menos que el 100% de los documentos obligatorios de todas las etapas estén cargados y marcados en estado APROBADO.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-11',
      category: 'Proyectos y Estados',
      title: 'Inmutabilidad de proyectos finalizados',
      statement: 'Todo proyecto en estado FINALIZADO o CANCELADO queda en modo de solo lectura. Queda prohibida la carga de nuevos documentos, edición de cronograma o emisión de reportes.',
      severity: 'Bloqueante'
    },
    // Reportes Semestrales
    {
      code: 'RN-12',
      category: 'Reportes Semestrales',
      title: 'Congelamiento de reporte en revisión',
      statement: 'Una vez que el Director o Investigador presiona "Enviar Reporte", los datos y el PDF quedan congelados en modo solo lectura mientras el Coordinador efectúa la revisión.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-13',
      category: 'Reportes Semestrales',
      title: 'Reenvío obligatorio tras observación',
      statement: 'Cuando un reporte es marcado como OBSERVADO por el Coordinador, el autor dispone de la interfaz habilitada para corregir datos, cargar nueva versión del PDF y reenviar, incrementando el historial de revisión.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-14',
      category: 'Reportes Semestrales',
      title: 'Condición del reporte FCI respecto a reportes individuales',
      statement: 'El sistema emitirá una ADVERTENCIA al Director si intenta enviar el reporte semestral del FCI cuando más del 50% de los investigadores de su equipo aún no han enviado su reporte individual.',
      severity: 'Advertencia'
    },
    // Producción Científica
    {
      code: 'RN-15',
      category: 'Producción Científica',
      title: 'Estructura obligatoria de columnas en archivo de producción',
      statement: 'El archivo XLS/XLSX cargado por el Gestor debe contener estrictamente las columnas: Código_FCI, Título_Publicación, Tipo_Producción, Autores_UG, Filiación_Institucional, Revista_Editorial, ISSN_ISBN, Indexación, DOI_URL y Fecha_Publicación.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-16',
      category: 'Producción Científica',
      title: 'Verificación de filiación Universidad de Guayaquil',
      statement: 'Toda publicación registrada debe poseer al menos un autor con filiación declarada a la Universidad de Guayaquil para ser admitida como producción válida.',
      severity: 'Bloqueante'
    },
    // Validación Documental Activa
    {
      code: 'RN-17',
      category: 'Validación Documental',
      title: 'Validación activa de tipo MIME',
      statement: 'El sistema debe validar no solo la extensión del archivo, sino la firma de cabecera binaria (MIME type). Todo PDF de evidencia o informe debe corresponder a application/pdf.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-18',
      category: 'Validación Documental',
      title: 'Validación de peso en tiempo real',
      statement: 'Si un archivo excede el límite máximo configurado (ej. >10 MB en FCI o >5 MB en individual), la subida es rechazada inmediatamente con un mensaje de error explicativo.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-19',
      category: 'Validación Documental',
      title: 'Control de duplicidad',
      statement: 'Si se carga un archivo cuyo checksum criptográfico o nombre exacto ya existe en el proyecto, el sistema advertirá sobre duplicación y solicitará confirmar si corresponde a una nueva versión.',
      severity: 'Advertencia'
    },
    {
      code: 'RN-20',
      category: 'Validación Documental',
      title: 'Coherencia temporal de evidencias',
      statement: 'La fecha declarada en una evidencia técnica debe encontrarse comprendida entre la fecha de inicio del proyecto y la fecha límite del periodo semestral en curso.',
      severity: 'Advertencia'
    },
    // Auditoría y Trazabilidad
    {
      code: 'RN-21',
      category: 'Auditoría y Notificaciones',
      title: 'Inmutabilidad del registro de auditoría',
      statement: 'El registro de auditoría no puede ser editado, vaciado ni eliminado por ningún rol, incluido el Administrador del sistema.',
      severity: 'Bloqueante'
    },
    {
      code: 'RN-22',
      category: 'Auditoría y Notificaciones',
      title: 'Prohibición de borrado físico documental',
      statement: 'La eliminación de cualquier evidencia es lógica. El archivo queda marcado como inactivo, requiere justificación textual obligatoria y permanece consultable por el Administrador y Coordinador.',
      severity: 'Bloqueante'
    }
  ],

  section5_stateDiagrams: {
    title: '5. Diagramas de Estados en Formato Texto',
    proposalDiagram: `[ESTADOS DE UNA PROPUESTA FCI]
+-----------------+
|    BORRADOR     | <-- Creación por Futuro Director dentro de la convocatoria anual
+-----------------+
         |
         | [Acción: Enviar propuesta con PDF adjunto < 10MB]
         v
+-----------------+
|     ENVIADA     | <-- Bloqueada para edición por el postulante
+-----------------+
         |
         | [Acción: Coordinador inicia revisión técnica]
         v
+-----------------+
|   EN REVISIÓN   |
+-----------------+
    /         \\
   /           \\ [Acción: Coordinador o Comisión emite observaciones]
  /             v
 |       +-----------------+
 |       |    OBSERVADA    | <-- Se reabre edición al Futuro Director
 |       +-----------------+
 |              |
 |              | [Acción: Subir PDF v2 con correcciones y Reenviar]
 |              +-----------------------+
 |                                      |
 |                                      v
 |                              (Regresa a EN REVISIÓN)
 |
 | [Acción: Aprobación por Coordinación y Decanato]
 v
+-----------------+
|    APROBADA     | ===> DISPARA AUTOMÁTICAMENTE:
+-----------------+      - Creación del Proyecto FCI en estado APROBADO
                         - Copia de metadatos y PDF base v1.0
                         - Asignación de rol de Director al proponente

O en su defecto:
+-----------------+
|    RECHAZADA    | <-- Dictamen negativo no subsanable (Cierre definitivo de propuesta)
+-----------------+`,

    projectDiagram: `[ESTADOS DEL CICLO DE VIDA DE UN PROYECTO FCI]
+-------------------+
|  EN FORMULACIÓN   | <-- Fase preliminar de ajuste presupuestario y asignación de equipo
+-------------------+
          |
          | [Acción: Aprobación formal de Consejo Directivo y asignación de código]
          v
+-------------------+
|     APROBADO      | <-- Resolución emitida; habilitado para carga de actas de compromiso
+-------------------+
          |
          | [Acción: Firma de acta de inicio y arranque de cronograma]
          v
+-------------------+
|   EN EJECUCIÓN    | <---> Habilitado para:
+-------------------+       - Registro de hitos y actividades
          |                 - Carga de Reportes Semestrales del FCI
          |                 - Carga de Reportes Semestrales de Investigadores
          |                 - Carga de Evidencias Técnicas continuas
          |
          | [Acción: Director solicita Cierre y Coordinador verifica]
          | [VALIDACIÓN BLOQUEANTE: 100% de documentos obligatorios APROBADOS]
          v
+-------------------+
|    FINALIZADO     | <-- Modo SOLO LECTURA permanente y expediente archivado
+-------------------+

Transición excepcional:
+-------------------+
|     CANCELADO     | <-- Por resolución de Facultad (incumplimiento, renuncia). Solo lectura.
+-------------------+`,

    reportDiagram: `[ESTADOS DE REPORTES SEMESTRALES (DIRECTOR E INVESTIGADOR)]
+-----------------+
|    PENDIENTE    | <-- Se genera automáticamente al abrirse el periodo semestral
+-----------------+
         |
         | [Acción: Usuario abre formulario y guarda primer avance]
         v
+-----------------+
|    BORRADOR     | <-- Guardado parcial de avance, horas y evidencias preliminares
+-----------------+
         |
         | [Acción: Validaciones de peso y formato superadas -> ENVIAR]
         v
+-----------------+
|     ENVIADO     | <-- Congelado para el autor; visible en bandeja de Coordinación
+-----------------+
         |
         | [Acción: Coordinador abre expediente de reporte]
         v
+-----------------+
|   EN REVISIÓN   |
+-----------------+
    /         \\
   /           \\ [Acción: Coordinador registra observaciones formales]
  /             v
 |       +-----------------+
 |       |    OBSERVADO    | <-- El formulario se desbloquea para el autor
 |       +-----------------+
 |              |
 |              | [Acción: Carga nuevo PDF de evidencias v1.1 y Reenvía]
 |              v
 |       (Regresa a ENVIADO -> EN REVISIÓN)
 |
 | [Acción: Dictamen conforme del Coordinador]
 v
+-----------------+
|    APROBADO     | <-- Cierre del periodo semestral para este informe. Suma a la completitud del FCI.
+-----------------+`,

    documentDiagram: `[ESTADOS Y VERSIONADO DE UN DOCUMENTO]
[Archivo en disco local]
         |
         | [Acción: Cargar archivo en el sistema]
         v
[MOTOR DE VALIDACIÓN ACTIVA]
  - Formato MIME válido? (PDF, DOCX, XLSX)
  - Peso <= Límite configurable? (<10MB, <5MB)
  - Coherencia temporal con periodo?
  - Nombre duplicado / Checksum existente?
         |
   +-----+-----+
   |           |
[Supera]    [No supera]
   |           |
   v           v
+----------------------+     +----------------------+
|       ACEPTADO       |     |      RECHAZADO       | (Subida abortada con mensaje de error)
+----------------------+     +----------------------+
   |
   | Se almacena con estado ACTIVO y Versión (v1.0)
   |
   +---> Si se carga una corrección:
         - Archivo previo pasa a: NO VIGENTE (Histórico)
         - Nuevo archivo pasa a: VIGENTE (v1.1, v2.0)
   |
   +---> Si se ejecuta baja:
         - Eliminación Lógica con motivo obligatorio
         - Estado: DADO DE BAJA (Inactivo en expediente ordinario, visible en auditoría)`
  },

  section6_useCases: [
    {
      code: 'CU-01',
      title: 'Postular Propuesta de Proyecto FCI en Convocatoria Anual',
      actor: 'Futuro Director de FCI',
      preconditions: [
        'El usuario ha iniciado sesión con cuenta institucional activa.',
        'La convocatoria anual de proyectos FCI se encuentra en estado "Abierta".'
      ],
      normalFlow: [
        '1. El Futuro Director ingresa al Módulo de Propuestas y selecciona "Nueva Postulación".',
        '2. El sistema despliega el formulario solicitando: Título, Línea de investigación, Resumen, Objetivos generales y específicos, Presupuesto referencial y Cronograma estimado.',
        '3. El postulante completa los datos y adjunta el archivo PDF de la propuesta técnica.',
        '4. El motor de validación comprueba que el formato sea application/pdf y que el tamaño no exceda el límite parametrizado (10 MB).',
        '5. El postulante hace clic en "Guardar Borrador" para almacenar preliminarmente.',
        '6. Tras verificar los datos, el postulante presiona "Enviar Propuesta Definitiva".',
        '7. El sistema valida que todos los campos requeridos estén completos, cambia el estado a "ENVIADA", bloquea la edición del formulario y genera una notificación al Coordinador de Carrera.',
        '8. Se registra el evento en la bitácora de auditoría.'
      ],
      alternateFlows: [
        '4a. El archivo no es un PDF válido o pesa más de 10 MB: El sistema bloquea la carga, muestra alerta "El archivo supera el tamaño máximo permitido de 10 MB" y el usuario debe adjuntar un archivo válido.',
        '6a. La convocatoria ha vencido durante la sesión: El sistema rechaza el envío con el mensaje "La convocatoria anual ha finalizado. No se admiten nuevos envíos". La propuesta permanece en borrador.'
      ],
      postconditions: [
        'La propuesta queda registrada con estado ENVIADA.',
        'El Coordinador de Carrera recibe notificación en su bandeja.',
        'El postulante ya no puede modificar los datos hasta recibir dictamen.'
      ]
    },
    {
      code: 'CU-02',
      title: 'Revisión y Aprobación de Propuesta con Creación de Proyecto',
      actor: 'Coordinador de Carrera',
      preconditions: [
        'Existe al menos una propuesta en estado ENVIADA para la carrera de Telemática.',
        'El Coordinador de Carrera está autenticado con permisos vigentes.'
      ],
      normalFlow: [
        '1. El Coordinador ingresa al Módulo de Propuestas y visualiza la lista de propuestas enviadas.',
        '2. Selecciona la propuesta "PROP-2026-TEL-003" y descarga/visualiza el formulario y el PDF adjunto.',
        '3. El Coordinador evalúa la pertinencia técnica, concordancia con las líneas de investigación y el presupuesto.',
        '4. El Coordinador registra su dictamen favorable y hace clic en "Aprobar Propuesta".',
        '5. El sistema solicita confirmación final.',
        '6. Al confirmar, el sistema ejecuta la transición a "APROBADA", crea automáticamente el nuevo Proyecto FCI con estado "APROBADO", transfiere todos los metadatos de la propuesta, asigna al postulante como Director y genera la carpeta documental con el PDF base v1.0.',
        '7. El sistema notifica al postulante sobre la aprobación y registra la creación del proyecto en la auditoría inmutable.'
      ],
      alternateFlows: [
        '4a. El Coordinador encuentra inconsistencias metodológicas o presupuestarias: Hace clic en "Observar Propuesta", ingresa las observaciones detalladas y envía. La propuesta pasa a "OBSERVADA", se notifica al postulante y se habilita la edición para subsanación.',
        '4b. La propuesta es rechazada de plano por la Comisión: Se selecciona "Rechazar Propuesta" ingresando la resolución final. Pasa a "RECHAZADA" y se archiva.'
      ],
      postconditions: [
        'La propuesta pasa a APROBADA.',
        'Se crea el Proyecto FCI activo listo para iniciar ejecución.',
        'El postulante adquiere el rol de Director de FCI sobre el nuevo proyecto.'
      ]
    },
    {
      code: 'CU-03',
      title: 'Envío de Reporte Semestral del FCI con Paquete de Evidencias',
      actor: 'Director de FCI',
      preconditions: [
        'El proyecto FCI se encuentra en estado "EN EJECUCIÓN".',
        'El periodo semestral vigente se encuentra abierto según el calendario académico.',
        'El usuario es el Director asignado al proyecto.'
      ],
      normalFlow: [
        '1. El Director accede al Módulo de Reportes Semestrales del FCI.',
        '2. El sistema despliega el formulario semestral con los hitos del cronograma que debían completarse en el periodo.',
        '3. El Director redacta el resumen técnico de avances, selecciona los hitos cumplidos, documenta obstáculos y adjunta el PDF consolidado de evidencias técnicas.',
        '4. El motor de validación activa verifica que el PDF pese menos de 10 MB y comprueba que las evidencias correspondan al intervalo de fechas del semestre.',
        '5. El sistema verifica el estado de los reportes individuales de los investigadores del equipo y despliega un resumen informativo.',
        '6. El Director hace clic en "Enviar Reporte a Coordinación".',
        '7. El sistema bloquea el reporte contra modificaciones, asigna el estado "ENVIADO" y notifica al Coordinador de Carrera.',
        '8. Se registra la transacción en la bitácora de auditoría.'
      ],
      alternateFlows: [
        '4a. El archivo de evidencias excede los 10 MB: El sistema rechaza la carga e indica: "El documento de evidencias supera el límite de 10 MB. Optimice el archivo antes de enviar".',
        '5a. Menos del 50% de los investigadores han reportado: El sistema emite advertencia: "Aviso: Existen investigadores que no han enviado su reporte semestral. ¿Desea proceder con el envío institucional del FCI?". El Director puede confirmar o postergar.'
      ],
      postconditions: [
        'El reporte semestral del FCI queda en estado ENVIADO.',
        'Queda bloqueada la edición por el Director.'
      ]
    },
    {
      code: 'CU-04',
      title: 'Carga y Validación del Reporte de Producción Científica (XLS)',
      actor: 'Gestor de Conocimiento de la Carrera',
      preconditions: [
        'El usuario posee el rol de Gestor de Conocimiento / Investigación.',
        'Se cuenta con el archivo consolidado de producción científica en formato XLS o XLSX.'
      ],
      normalFlow: [
        '1. El Gestor ingresa al Módulo de Producción Científica.',
        '2. Selecciona el periodo de reporte (Trimestral o Semestral) y hace clic en "Cargar Archivo de Producción".',
        '3. Selecciona el archivo local (.xlsx).',
        '4. El sistema ejecuta las validaciones activas: tamaño (<4 MB), formato MIME y verificación de las columnas obligatorias.',
        '5. El sistema lee e interpreta las filas del archivo, mostrando una vista previa tabular con el conteo de artículos, ponencias, libros y autores.',
        '6. El Gestor revisa la vista previa y presiona "Confirmar e Importar".',
        '7. El sistema almacena el lote de producción, actualiza la base de datos de consulta en línea y genera una versión numerada del reporte.',
        '8. Se emite notificación de actualización a los Directores cuyos proyectos registren nuevas publicaciones.'
      ],
      alternateFlows: [
        '4a. El archivo no contiene la columna obligatoria "Código_FCI" o "DOI_URL": El sistema aborta la lectura y muestra: "Error estructural: La plantilla no contiene las columnas obligatorias requeridas".',
        '4b. Se detecta una publicación sin filiación a la Universidad de Guayaquil: Se marca la fila con advertencia para verificación del Gestor.'
      ],
      postconditions: [
        'Las publicaciones quedan disponibles para consulta, filtrado y tableros en el sistema.',
        'El archivo original queda resguardado en el repositorio documental con versionado.'
      ]
    },
    {
      code: 'CU-05',
      title: 'Cierre Definitivo de Expediente y Finalización de Proyecto',
      actor: 'Coordinador de Carrera',
      preconditions: [
        'El proyecto está en estado EN EJECUCIÓN.',
        'Se han cumplido los semestres programados del proyecto.'
      ],
      normalFlow: [
        '1. El Coordinador abre la ficha del proyecto FCI.',
        '2. Hace clic en "Verificar Expediente y Proceder a Cierre".',
        '3. El motor de validación activa analiza el expediente completo frente a la matriz de documentos obligatorios: Propuesta aprobada, informes semestrales de cada periodo, reportes individuales de todos los investigadores, informe final de resultados y acta de finiquito.',
        '4. El sistema comprueba que el porcentaje de completitud documental es del 100% y que no existen documentos con estado OBSERVADO o PENDIENTE.',
        '5. El Coordinador carga el Acta de Cierre suscrita por el Consejo de Facultad.',
        '6. El Coordinador presiona "Confirmar Cierre de Proyecto".',
        '7. El sistema cambia el estado del proyecto a FINALIZADO, bloquea irreversiblemente todo el expediente a modo SOLO LECTURA y genera un paquete descargable del expediente digital.',
        '8. Se notifica a todo el equipo de investigación y se asienta el evento en la auditoría inmutable.'
      ],
      alternateFlows: [
        '4a. Faltan documentos obligatorios o existen reportes sin aprobar: El sistema BLOQUEA la transición y despliega la lista de faltantes: "No se puede cerrar el proyecto. Faltan los siguientes requisitos: [Informe Semestral 2 de Ing. Fernando Viteri]. El expediente se encuentra al 88% de completitud". El proyecto permanece EN EJECUCIÓN.'
      ],
      postconditions: [
        'El proyecto pasa a estado FINALIZADO.',
        'Todo el expediente queda congelado en solo lectura para consultas históricas y auditorías.'
      ]
    }
  ],

  section7_dataCatalog: {
    title: '7. Catálogo de Datos Funcionales (Entidades y Atributos)',
    description: 'Descripción conceptual de los datos manejados por cada módulo funcional, sin especificaciones técnicas de base de datos ni modelos relacionales.',
    entities: [
      {
        module: 'M1: Acceso y Usuarios',
        name: 'Usuario y Credencial',
        attributes: [
          'Identificador institucional único',
          'Nombres y Apellidos completos',
          'Correo institucional (@ug.edu.ec)',
          'Contraseña cifrada y estado de autenticación',
          'Carrera de adscripción (ej. Telemática)',
          'Facultad (Ingeniería Industrial)',
          'Lista de roles asignados (Admin, Coordinador, Gestor, Director, Investigador)',
          'Estado de la cuenta (Activo / Inactivo)',
          'Fecha de último acceso y registro de sesiones'
        ]
      },
      {
        module: 'M2: Configuración',
        name: 'Parámetros del Sistema y Calendario',
        attributes: [
          'Código de parámetro y nombre descriptivo',
          'Categoría (Límites, Calendarios, Periodos, Catálogos)',
          'Valor configurado y unidad de medida (MB, días, fechas)',
          'Periodo académico vigente (ej. 2026-CI)',
          'Fecha de apertura y cierre de convocatorias anuales',
          'Fecha límite de entrega de reportes semestrales',
          'Días de antelación para alertas preventivas',
          'Catálogo de líneas de investigación de la carrera'
        ]
      },
      {
        module: 'M3: Propuestas FCI',
        name: 'Propuesta de Proyecto',
        attributes: [
          'Código correlativo de propuesta (ej. PROP-2026-TEL-003)',
          'Título de la propuesta postulada',
          'Datos del postulante (Futuro Director)',
          'Línea de investigación y carrera asociada',
          'Año de convocatoria',
          'Resumen ejecutivo y planteamiento del problema',
          'Objetivo general y objetivos específicos',
          'Presupuesto referencial solicitado en USD',
          'Documento PDF adjunto (referencia, tamaño, hash)',
          'Estado de la propuesta (Borrador, Enviada, En Revisión, Observada, Aprobada, Rechazada)',
          'Historial de observaciones y dictámenes con fecha y revisor'
        ]
      },
      {
        module: 'M4: Gestión de Proyectos',
        name: 'Expediente del Proyecto FCI',
        attributes: [
          'Código institucional FCI (ej. FCI-2025-TEL-001)',
          'Título definitivo del proyecto',
          'Resumen y justificación técnica',
          'Objetivo general y específicos',
          'Palabras clave (metadatos)',
          'Línea de investigación, carrera y facultad',
          'Periodo académico de inicio y finalización estimada/real',
          'Presupuesto total aprobado y monto ejecutado',
          'Estado del proyecto (En formulación, Aprobado, En ejecución, Finalizado, Cancelado)',
          'Lista de participantes: Usuario, Rol en proyecto, Rol docente, Horas semanales',
          'Lista de hitos del cronograma: Título, fecha meta, fecha real, % avance, estado',
          'Porcentaje global de completitud documental del expediente'
        ]
      },
      {
        module: 'M5 y M6: Reportes Semestrales',
        name: 'Reportes Semestrales (FCI e Individual)',
        attributes: [
          'Identificador de reporte y código del proyecto FCI vinculado',
          'Periodo semestral reportado (ej. 2026-CI)',
          'Número correlativo de semestre (1, 2, 3...)',
          'Autor del reporte (Director para reporte FCI, Docente para individual)',
          'Horas dedicadas efectivas en el periodo',
          'Descripción técnica de actividades ejecutadas',
          'Hitos alcanzados y productos entregados',
          'Obstáculos encontrados y plan de contingencia',
          'Documento PDF de evidencias (referencia, tamaño, hash)',
          'Estado del reporte (Pendiente, Borrador, Enviado, En Revisión, Observado, Aprobado)',
          'Observaciones de Coordinación y fechas de revisión'
        ]
      },
      {
        module: 'M7: Producción Científica',
        name: 'Lote y Registros de Producción Científica',
        attributes: [
          'Identificador de lote de carga y periodo reportado',
          'Archivo fuente cargado (nombre original, peso, fecha)',
          'Gestor responsable de la carga',
          'Registros leídos: Código FCI, Título de publicación, Tipo de producción (Scopus, WoS, Latindex, Ponencia, Libro, Patente)',
          'Autores registrados y confirmación de filiación UG',
          'Revista o congreso de publicación, ISSN / ISBN',
          'Indexación y cuartil reportado',
          'Identificador DOI o enlace web verificable',
          'Fecha de publicación y estado (Publicado / Aceptado)'
        ]
      },
      {
        module: 'M8 y M9: Gestión y Validación Documental',
        name: 'Documento y Reglas de Validación',
        attributes: [
          'Identificador único del documento',
          'Nombre del archivo físico y nombre formal en el sistema',
          'Categoría (Propuesta, Reporte FCI, Reporte Individual, Evidencia Técnica, Publicación, Acta)',
          'Formato MIME y tamaño en megabytes',
          'Fecha y hora exacta de subida',
          'Usuario autor y rol al momento de carga',
          'Proyecto, propuesta o reporte asociado',
          'Número de versión (v1.0, v1.1...) e indicador de versión vigente',
          'Nivel de confidencialidad institucional',
          'Estado de borrado lógico (Activo / Dado de baja con motivo y autor)',
          'Registro de validaciones: Regla evaluada, resultado (Aceptado, Advertencia, Rechazado) y motivo'
        ]
      },
      {
        module: 'M10 y M11: Auditoría y Notificaciones',
        name: 'Bitácora de Auditoría y Mensajería',
        attributes: [
          'Identificador de evento y marca de tiempo ISO',
          'Identificador y nombre de usuario causante',
          'Rol activo con el que ejecutó la acción',
          'Tipo de acción (Crear, Editar, Enviar, Observar, Aprobar, Rechazar, Baja lógica, Carga)',
          'Entidad afectada y descripción resumida',
          'Valor anterior y nuevo valor de los campos clave',
          'Dirección IP y datos de sesión',
          'Notificación: Destinatario, Título, Mensaje, Tipo, Fecha, Estado de lectura y Canal (Web / Email)'
        ]
      }
    ]
  },

  section8_notificationsMatrix: [
    {
      id: 'NOT-01',
      event: 'Apertura de periodo semestral de reportes',
      recipient: 'Directores de FCI y Docentes Investigadores',
      channels: ['Bandeja Web', 'Correo Institucional'],
      baseTemplate: 'Estimado(a) [Nombre_Usuario]: Se informa que ha iniciado el periodo de presentación de reportes semestrales correspondiente al ciclo [Periodo_Académico]. La fecha límite improrrogable es el [Fecha_Límite]. Ingrese al sistema para completar sus formularios.'
    },
    {
      id: 'NOT-02',
      event: 'Recordatorio preventivo (7 días previos al vencimiento)',
      recipient: 'Usuarios con reportes en estado Pendiente o Borrador',
      channels: ['Bandeja Web', 'Correo Institucional'],
      baseTemplate: 'Aviso Importante: Restan 7 días para el cierre formal del periodo de reportes [Periodo_Académico]. Su reporte del proyecto [Código_FCI] aún no ha sido enviado. Evite observaciones institucionales.'
    },
    {
      id: 'NOT-03',
      event: 'Envío de reporte o propuesta para revisión',
      recipient: 'Coordinador de Carrera',
      channels: ['Bandeja Web', 'Correo Institucional'],
      baseTemplate: 'Nuevo trámite recibido: El usuario [Nombre_Autor] ha enviado el [Tipo_Trámite] correspondiente a [Código_Proyecto_o_Propuesta] para su correspondiente revisión y dictamen.'
    },
    {
      id: 'NOT-04',
      event: 'Emisión de observaciones técnicas en reporte o propuesta',
      recipient: 'Director de FCI o Investigador autor',
      channels: ['Bandeja Web', 'Correo Institucional'],
      baseTemplate: 'Observaciones registradas: La Coordinación de Carrera ha emitido observaciones a su [Tipo_Trámite] del proyecto [Código_FCI]. Motivo: "[Detalle_Observación]". El formulario ha sido habilitado para subsanación.'
    },
    {
      id: 'NOT-05',
      event: 'Aprobación definitiva de reporte o propuesta',
      recipient: 'Director de FCI, Investigador postulante',
      channels: ['Bandeja Web', 'Correo Institucional'],
      baseTemplate: 'Felicitaciones: Su [Tipo_Trámite] del proyecto [Código_FCI] ha sido formalmente APROBADO por la Coordinación de Carrera. El expediente documental ha sido actualizado satisfactoriamente.'
    },
    {
      id: 'NOT-06',
      event: 'Alerta de evidencia obligatoria faltante o inconsistente',
      recipient: 'Director de FCI y Coordinador de Carrera',
      channels: ['Bandeja Web'],
      baseTemplate: 'Alerta de Cumplimiento Documental: El proyecto [Código_FCI] presenta inconsistencias: el hito [Código_Hito] requiere evidencia técnica obligatoria no cargada. Completitud actual: [Porcentaje]%.'
    }
  ],

  section9_openQuestions: {
    title: '9. Lista de Preguntas Abiertas y Ambigüedades a Resolver',
    description: 'Como analista funcional sénior, he identificado los siguientes puntos que presentan ambigüedades funcionales en las normativas actuales de la Universidad de Guayaquil o que requieren definición antes de la especificación técnica final:',
    questions: [
      {
        number: 1,
        question: '¿El archivo Excel de Producción Científica debe ser procesado fila por fila para alimentar búsquedas y estadísticas, o basta con almacenarlo como un archivo adjunto?',
        analysis: 'El requerimiento funcional preliminar dejaba abierta esta interrogante. Recomendación funcional: El sistema DEBE leer, validar e ingerir las filas estructuradas del archivo Excel a nivel funcional para que el Coordinador, Directores e Investigadores puedan buscar publicaciones, filtrar por cuartiles y asociarlas automáticamente al expediente del proyecto FCI en lugar de abrir archivos aislados manualmente.'
      },
      {
        number: 2,
        question: '¿Qué ocurre si un docente investigador no entrega su reporte individual al momento en que el Director debe enviar el Reporte Semestral del FCI?',
        analysis: 'En la práctica académica, si un coinvestigador se retrasa, ¿se bloquea el envío general del Director o se permite enviar con una marca de excepción? Recomendación funcional: Permitir el envío del Director emitiendo una ADVERTENCIA explícita que liste a los investigadores ausentes, pero no bloquear el informe global del FCI para no penalizar a los demás integrantes ni a la ejecución presupuestaria del proyecto.'
      },
      {
        number: 3,
        question: '¿Existe firma electrónica de documentos dentro del alcance funcional o se aceptan PDFs con firmas hológrafas escaneadas o certificados ya incorporados?',
        analysis: 'Dado que la normativa ecuatoriana (Ley de Comercio Electrónico y Firma Electrónica) promueve firma digital (FirmaEC / Banco Central), se debe aclarar si el sistema solo verifica que el archivo sea PDF, o si debe validar criptográficamente la presencia de certificados de firma electrónica reconocidos.'
      },
      {
        number: 4,
        question: '¿Cuál es la instancia formal encargada de aprobar el Cierre Definitivo de un proyecto FCI?',
        analysis: '¿El Coordinador de Carrera tiene potestad autónoma de cerrar el proyecto en el sistema, o requiere registrar previamente el número de Acta y Resolución del Consejo Directivo de la Facultad de Ingeniería Industrial para autorizar la transición a "Finalizado"?'
      },
      {
        number: 5,
        question: '¿Cómo se manejarán los proyectos inter-carrera cuando el sistema se expanda más allá de la carrera piloto de Telemática?',
        analysis: 'Actualmente el alcance es Ingeniería en Telemática. Si un proyecto FCI incluye investigadores de Ingeniería Industrial, Sistemas u Operaciones, ¿el reporte lo valida exclusivamente el Coordinador de la carrera del Director, o debe haber una validación cruzada entre coordinadores de distintas carreras?'
      }
    ]
  }
};
