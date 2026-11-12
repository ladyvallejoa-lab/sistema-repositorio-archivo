import {
  UserProfile,
  FciProject,
  ProposalFCI,
  FciSemiAnnualReport,
  ResearcherSemiAnnualReport,
  ScientificProductionBatch,
  AuditLogEntry,
  SystemNotification,
  ConfigParameter,
  RequiredDocumentRule
} from '../types';

export const USERS_DATA: UserProfile[] = [
  {
    id: 'USR-001',
    name: 'Ing. Carlos Mendoza',
    email: 'carlos.mendoza@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['ADMINISTRADOR'],
    active: true,
    fciProjects: []
  },
  {
    id: 'USR-002',
    name: 'Dr. Roberto Silva, PhD',
    email: 'roberto.silva@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['COORDINADOR_CARRERA'],
    active: true,
    fciProjects: ['FCI-2025-TEL-001', 'FCI-2025-TEL-002']
  },
  {
    id: 'USR-003',
    name: 'MSc. Diana Paredes',
    email: 'diana.paredes@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['GESTOR_CONOCIMIENTO'],
    active: true,
    fciProjects: ['FCI-2025-TEL-001', 'FCI-2025-TEL-002']
  },
  {
    id: 'USR-004',
    name: 'MSc. Xavier Andrade',
    email: 'xavier.andrade@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['DIRECTOR_FCI', 'DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: ['FCI-2025-TEL-001']
  },
  {
    id: 'USR-005',
    name: 'Dr. Mario Cevallos, PhD',
    email: 'mario.cevallos@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['DIRECTOR_FCI', 'DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: ['FCI-2025-TEL-002']
  },
  {
    id: 'USR-006',
    name: 'Dra. Elena Villacís',
    email: 'elena.villacis@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['FUTURO_DIRECTOR_FCI', 'DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: []
  },
  {
    id: 'USR-007',
    name: 'Ing. Gabriel Romero',
    email: 'gabriel.romero@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: ['FCI-2025-TEL-001']
  },
  {
    id: 'USR-008',
    name: 'Ing. Lorena Castro',
    email: 'lorena.castro@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: ['FCI-2025-TEL-001']
  },
  {
    id: 'USR-009',
    name: 'Ing. Patricia Morales',
    email: 'patricia.morales@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: ['FCI-2025-TEL-002']
  },
  {
    id: 'USR-010',
    name: 'Ing. Fernando Viteri',
    email: 'fernando.viteri@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: ['FCI-2025-TEL-002']
  },
  {
    id: 'USR-011',
    name: 'Ing. Sofía Loor',
    email: 'sofia.loor@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    roles: ['DOCENTE_INVESTIGADOR_FCI'],
    active: true,
    fciProjects: ['FCI-2025-TEL-002']
  }
];

export const CONFIG_PARAMETERS_DATA: ConfigParameter[] = [
  {
    id: 'CFG-001',
    key: 'MAX_SIZE_PROPUESTA_MB',
    name: 'Límite tamaño PDF Propuesta FCI',
    description: 'Tamaño máximo permitido para la subida de la propuesta inicial en PDF.',
    category: 'LIMITES_ARCHIVO',
    value: 10,
    unit: 'MB'
  },
  {
    id: 'CFG-002',
    key: 'MAX_SIZE_REPORTE_FCI_MB',
    name: 'Límite tamaño PDF Reporte FCI',
    description: 'Tamaño máximo para el compendio de evidencias del reporte semestral del director.',
    category: 'LIMITES_ARCHIVO',
    value: 10,
    unit: 'MB'
  },
  {
    id: 'CFG-003',
    key: 'MAX_SIZE_REPORTE_INV_MB',
    name: 'Límite tamaño PDF Reporte Investigador',
    description: 'Tamaño máximo para el reporte semestral individual de cada investigador.',
    category: 'LIMITES_ARCHIVO',
    value: 5,
    unit: 'MB'
  },
  {
    id: 'CFG-004',
    key: 'MAX_SIZE_PRODUCCION_MB',
    name: 'Límite tamaño Excel Producción Científica',
    description: 'Tamaño máximo para el archivo consolidado de producción científica del periodo.',
    category: 'LIMITES_ARCHIVO',
    value: 4,
    unit: 'MB'
  },
  {
    id: 'CFG-005',
    key: 'PERIODO_ACTUAL',
    name: 'Periodo Académico Vigente',
    description: 'Periodo académico activo en el sistema para control de reportes.',
    category: 'PERIODOS',
    value: '2026-CI'
  },
  {
    id: 'CFG-006',
    key: 'FECHA_CIERRE_SEMESTRAL',
    name: 'Fecha Cierre Reportes Semestrales 2026-CI',
    description: 'Fecha límite institucional antes de marcar reportes como rezagados o fuera de plazo.',
    category: 'CALENDARIO',
    value: '2026-11-28'
  },
  {
    id: 'CFG-007',
    key: 'DIAS_AVISO_PREVIO_VENCIMIENTO',
    name: 'Días de Alerta Previa a Cierre',
    description: 'Días previos a la fecha límite para disparar alertas automáticas a directores e investigadores.',
    category: 'CALENDARIO',
    value: 7,
    unit: 'días'
  }
];

export const REQUIRED_DOCUMENT_RULES_DATA: RequiredDocumentRule[] = [
  {
    id: 'RDR-001',
    documentType: 'Formulario de Propuesta FCI Firmado',
    projectStage: 'PROPUESTA',
    mandatory: true,
    maxSizeMb: 10,
    allowedFormats: ['PDF']
  },
  {
    id: 'RDR-002',
    documentType: 'Aval del Decanato / Consejo de Facultad',
    projectStage: 'INICIO_PROYECTO',
    mandatory: true,
    maxSizeMb: 5,
    allowedFormats: ['PDF']
  },
  {
    id: 'RDR-003',
    documentType: 'Acta de Compromiso de Investigadores',
    projectStage: 'INICIO_PROYECTO',
    mandatory: true,
    maxSizeMb: 5,
    allowedFormats: ['PDF']
  },
  {
    id: 'RDR-004',
    documentType: 'Informe Semestral Técnico FCI con Evidencias',
    projectStage: 'SEMESTRAL_FCI',
    mandatory: true,
    maxSizeMb: 10,
    allowedFormats: ['PDF']
  },
  {
    id: 'RDR-005',
    documentType: 'Informe Individual de Actividades del Investigador',
    projectStage: 'SEMESTRAL_INVESTIGADOR',
    mandatory: true,
    maxSizeMb: 5,
    allowedFormats: ['PDF']
  },
  {
    id: 'RDR-006',
    documentType: 'Informe Final de Resultados y Productos',
    projectStage: 'CIERRE_FINAL',
    mandatory: true,
    maxSizeMb: 20,
    allowedFormats: ['PDF']
  },
  {
    id: 'RDR-007',
    documentType: 'Acta de Finiquito y Cierre de Expediente',
    projectStage: 'CIERRE_FINAL',
    mandatory: true,
    maxSizeMb: 5,
    allowedFormats: ['PDF']
  }
];

export const FCI_PROJECTS_DATA: FciProject[] = [
  {
    id: 'FCI-2025-TEL-001',
    code: 'FCI-2025-TEL-001',
    title: 'Plataforma Telemática IoT para Monitoreo y Eficiencia Energética en Plantas Industriales del Guayas',
    description: 'Desarrollo de una arquitectura de sensores inalámbricos industriales (LoRaWAN y MQTT) integrada a dashboards predictivos de consumo energético para PYMES metalmecánicas y manufactureras de Guayaquil.',
    generalObjective: 'Implementar una plataforma telemática basada en el Internet de las Cosas que optimice el monitoreo del consumo eléctrico en tiempo real en plantas de manufactura.',
    specificObjectives: [
      'Diseñar la topología de red de sensores LoRaWAN adaptada a ambientes con alta interferencia electromagnética.',
      'Desarrollar el gateway telemático y la capa de ingesta de datos con protocolos seguros.',
      'Evaluar experimentalmente la reducción en el desperdicio energético en las plantas piloto seleccionadas.'
    ],
    keywords: ['IoT Industrial', 'LoRaWAN', 'Eficiencia Energética', 'Telemetría', 'Telemática'],
    researchLine: 'Redes Telemáticas, Telecomunicaciones y Sistemas Embebidos',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    academicPeriod: '2025-2026',
    startDate: '2025-05-02',
    estimatedEndDate: '2026-12-15',
    status: 'EN_EJECUCION',
    budgetAssigned: 12500,
    budgetExecuted: 9400,
    currentSemester: 2,
    totalSemesters: 3,
    documentCompletenessPercent: 88,
    participants: [
      {
        userId: 'USR-004',
        name: 'MSc. Xavier Andrade',
        email: 'xavier.andrade@ug.edu.ec',
        institutionalRole: 'Docente Titular Agregado',
        projectRole: 'DIRECTOR',
        dedicationHoursWeekly: 10
      },
      {
        userId: 'USR-007',
        name: 'Ing. Gabriel Romero',
        email: 'gabriel.romero@ug.edu.ec',
        institutionalRole: 'Docente Ocasional',
        projectRole: 'INVESTIGADOR',
        dedicationHoursWeekly: 8
      },
      {
        userId: 'USR-008',
        name: 'Ing. Lorena Castro',
        email: 'lorena.castro@ug.edu.ec',
        institutionalRole: 'Docente Titular Auxiliar',
        projectRole: 'INVESTIGADOR',
        dedicationHoursWeekly: 8
      }
    ],
    milestones: [
      {
        id: 'M-001',
        title: 'Estudio de campo y caracterización de radiofrecuencia en planta',
        description: 'Mediciones de propagación y pérdidas de paquetes en entorno fabril.',
        targetDate: '2025-08-30',
        completionDate: '2025-08-25',
        progressPercent: 100,
        status: 'COMPLETADO',
        linkedDocumentIds: ['DOC-002']
      },
      {
        id: 'M-002',
        title: 'Despliegue del concentrador LoRaWAN y nodos transceptores',
        description: 'Instalación de 12 nodos de medición eléctrica y gateway centralizado.',
        targetDate: '2025-12-10',
        completionDate: '2025-12-05',
        progressPercent: 100,
        status: 'COMPLETADO',
        linkedDocumentIds: ['DOC-003']
      },
      {
        id: 'M-003',
        title: 'Dashboard de visualización y pruebas de estrés de red',
        description: 'Integración del broker MQTT, base de series de tiempo y pruebas de latencia.',
        targetDate: '2026-06-30',
        completionDate: '2026-06-20',
        progressPercent: 100,
        status: 'COMPLETADO',
        linkedDocumentIds: ['DOC-004']
      },
      {
        id: 'M-004',
        title: 'Validación en planta con cálculo de eficiencia y publicación científica',
        description: 'Monitoreo continuo durante 90 días y redacción de artículo indexado Scopus.',
        targetDate: '2026-11-20',
        progressPercent: 75,
        status: 'EN_CURSO',
        linkedDocumentIds: ['DOC-005']
      }
    ],
    documents: [
      {
        id: 'DOC-001',
        name: 'Propuesta_FCI_Aprobada_FCI_2025_001.pdf',
        originalFileName: 'Propuesta_FCI_Plataforma_IoT.pdf',
        category: 'PROPUESTA',
        type: 'PDF',
        sizeMb: 6.8,
        uploadDate: '2025-03-14',
        uploaderName: 'MSc. Xavier Andrade',
        uploaderRole: 'DIRECTOR_FCI',
        projectId: 'FCI-2025-TEL-001',
        version: '1.0',
        isLatest: true,
        confidentiality: 'PUBLICO_UG',
        active: true,
        validations: [
          {
            ruleCode: 'RN-VAL-01',
            ruleName: 'Formato de archivo',
            status: 'ACEPTADO',
            message: 'Archivo PDF válido (application/pdf).',
            timestamp: '2025-03-14 10:15'
          },
          {
            ruleCode: 'RN-VAL-02',
            ruleName: 'Límite de tamaño',
            status: 'ACEPTADO',
            message: 'Peso 6.8 MB dentro del límite máximo de 10 MB.',
            timestamp: '2025-03-14 10:15'
          }
        ]
      },
      {
        id: 'DOC-002',
        name: 'Reporte_Semestral_FCI_1_2025_CII.pdf',
        originalFileName: 'Informe_Semestral_FCI_Periodo_2025_CII.pdf',
        category: 'REPORTE_FCI',
        type: 'PDF',
        sizeMb: 8.2,
        uploadDate: '2025-10-18',
        uploaderName: 'MSc. Xavier Andrade',
        uploaderRole: 'DIRECTOR_FCI',
        projectId: 'FCI-2025-TEL-001',
        reportPeriod: '2025-CII',
        version: '1.0',
        isLatest: true,
        confidentiality: 'RESTRINGIDO_CARRERA',
        active: true,
        validations: [
          {
            ruleCode: 'RN-VAL-02',
            ruleName: 'Límite de tamaño',
            status: 'ACEPTADO',
            message: '8.2 MB dentro del límite de 10 MB.',
            timestamp: '2025-10-18 16:30'
          }
        ]
      },
      {
        id: 'DOC-003',
        name: 'Evidencias_Fotograficas_Despliegue_Nodos.pdf',
        originalFileName: 'Evidencias_Nodos_LoRa_Planta.pdf',
        category: 'EVIDENCIA_TECNICA',
        type: 'PDF',
        sizeMb: 4.1,
        uploadDate: '2025-12-05',
        uploaderName: 'Ing. Gabriel Romero',
        uploaderRole: 'DOCENTE_INVESTIGADOR_FCI',
        projectId: 'FCI-2025-TEL-001',
        version: '1.0',
        isLatest: true,
        confidentiality: 'PUBLICO_UG',
        active: true,
        validations: [
          {
            ruleCode: 'RN-VAL-01',
            ruleName: 'Formato',
            status: 'ACEPTADO',
            message: 'Formato PDF conforme.',
            timestamp: '2025-12-05 11:20'
          }
        ]
      },
      {
        id: 'DOC-004',
        name: 'Reporte_Semestral_FCI_2_2026_CI_Borrador.pdf',
        originalFileName: 'Informe_Semestre_2_Avances_IoT.pdf',
        category: 'REPORTE_FCI',
        type: 'PDF',
        sizeMb: 7.9,
        uploadDate: '2026-11-05',
        uploaderName: 'MSc. Xavier Andrade',
        uploaderRole: 'DIRECTOR_FCI',
        projectId: 'FCI-2025-TEL-001',
        reportPeriod: '2026-CI',
        version: '1.0',
        isLatest: true,
        confidentiality: 'RESTRINGIDO_CARRERA',
        active: true,
        validations: [
          {
            ruleCode: 'RN-VAL-04',
            ruleName: 'Coherencia de cronograma',
            status: 'ACEPTADO',
            message: 'Hitos reportados coinciden con el cronograma vigente.',
            timestamp: '2026-11-05 09:12'
          }
        ]
      }
    ]
  },
  {
    id: 'FCI-2025-TEL-002',
    code: 'FCI-2025-TEL-002',
    title: 'Arquitectura de Seguridad Basada en Software Defined Networking (SDN) para Infraestructuras Críticas Universitarias',
    description: 'Implementación y prueba de un plano de control distribuido SDN con mitigación autónoma de ataques de denegación distribuida de servicio (DDoS) en la red troncal de la Universidad de Guayaquil.',
    generalObjective: 'Desarrollar un modelo de seguridad perimetral e interno para la red de datos universitaria basado en controladores SDN y telemetría de flujo OpenFlow.',
    specificObjectives: [
      'Analizar los vectores de ataque más recurrentes en la infraestructura troncal de la UG.',
      'Implementar algoritmos de detección de anomalías de flujo en el controlador OpenDaylight / Ryu.',
      'Evaluar el impacto en latencia y jitter durante la aplicación de reglas de filtrado dinámico.'
    ],
    keywords: ['SDN', 'Ciberseguridad', 'OpenFlow', 'DDoS', 'Redes de Telecomunicaciones'],
    researchLine: 'Ciberseguridad, Redes Definidas por Software e Interoperabilidad',
    career: 'Ingeniería en Telemática',
    faculty: 'Facultad de Ingeniería Industrial',
    academicPeriod: '2025-2027',
    startDate: '2025-06-01',
    estimatedEndDate: '2027-05-31',
    status: 'EN_EJECUCION',
    budgetAssigned: 15000,
    budgetExecuted: 6200,
    currentSemester: 1,
    totalSemesters: 4,
    documentCompletenessPercent: 71,
    participants: [
      {
        userId: 'USR-005',
        name: 'Dr. Mario Cevallos, PhD',
        email: 'mario.cevallos@ug.edu.ec',
        institutionalRole: 'Docente Titular Principal',
        projectRole: 'DIRECTOR',
        dedicationHoursWeekly: 10
      },
      {
        userId: 'USR-009',
        name: 'Ing. Patricia Morales',
        email: 'patricia.morales@ug.edu.ec',
        institutionalRole: 'Docente Titular Agregado',
        projectRole: 'INVESTIGADOR',
        dedicationHoursWeekly: 8
      },
      {
        userId: 'USR-010',
        name: 'Ing. Fernando Viteri',
        email: 'fernando.viteri@ug.edu.ec',
        institutionalRole: 'Docente Ocasional',
        projectRole: 'INVESTIGADOR',
        dedicationHoursWeekly: 8
      },
      {
        userId: 'USR-011',
        name: 'Ing. Sofía Loor',
        email: 'sofia.loor@ug.edu.ec',
        institutionalRole: 'Docente Ocasional',
        projectRole: 'INVESTIGADOR',
        dedicationHoursWeekly: 8
      }
    ],
    milestones: [
      {
        id: 'M-101',
        title: 'Revisión sistemática y caracterización de tráfico universitario',
        description: 'Captura y análisis de flujos NetFlow en enlace troncal UG.',
        targetDate: '2025-09-30',
        completionDate: '2025-09-28',
        progressPercent: 100,
        status: 'COMPLETADO',
        linkedDocumentIds: ['DOC-101']
      },
      {
        id: 'M-102',
        title: 'Entorno de simulación Mininet y controlador SDN Ryu',
        description: 'Modelado topológico de la Facultad de Ingeniería Industrial.',
        targetDate: '2026-03-30',
        completionDate: '2026-03-15',
        progressPercent: 100,
        status: 'COMPLETADO',
        linkedDocumentIds: ['DOC-102']
      },
      {
        id: 'M-103',
        title: 'Módulo de mitigación de ataques SYN Flood y DNS Amplification',
        description: 'Inyección de flujos anómalos y prueba de reglas dinámicas OpenFlow.',
        targetDate: '2026-11-15',
        progressPercent: 60,
        status: 'EN_CURSO',
        linkedDocumentIds: []
      }
    ],
    documents: [
      {
        id: 'DOC-101',
        name: 'Propuesta_Aprobada_FCI_2025_002_SDN.pdf',
        originalFileName: 'Propuesta_SDN_Seguridad_FCI.pdf',
        category: 'PROPUESTA',
        type: 'PDF',
        sizeMb: 5.4,
        uploadDate: '2025-04-10',
        uploaderName: 'Dr. Mario Cevallos, PhD',
        uploaderRole: 'DIRECTOR_FCI',
        projectId: 'FCI-2025-TEL-002',
        version: '1.0',
        isLatest: true,
        confidentiality: 'PUBLICO_UG',
        active: true,
        validations: [
          {
            ruleCode: 'RN-VAL-01',
            ruleName: 'Formato',
            status: 'ACEPTADO',
            message: 'PDF institucional verificado.',
            timestamp: '2025-04-10 12:00'
          }
        ]
      },
      {
        id: 'DOC-102',
        name: 'Reporte_Semestral_FCI_1_2025_CII_SDN.pdf',
        originalFileName: 'Reporte_Semestre_1_FCI_SDN.pdf',
        category: 'REPORTE_FCI',
        type: 'PDF',
        sizeMb: 9.1,
        uploadDate: '2025-11-20',
        uploaderName: 'Dr. Mario Cevallos, PhD',
        uploaderRole: 'DIRECTOR_FCI',
        projectId: 'FCI-2025-TEL-002',
        reportPeriod: '2025-CII',
        version: '1.0',
        isLatest: true,
        confidentiality: 'RESTRINGIDO_CARRERA',
        active: true,
        validations: [
          {
            ruleCode: 'RN-VAL-02',
            ruleName: 'Límite de peso',
            status: 'CON_ADVERTENCIA',
            message: '9.1 MB está cerca del límite máximo de 10 MB (91%).',
            timestamp: '2025-11-20 18:40'
          }
        ]
      }
    ]
  }
];

export const PROPOSALS_DATA: ProposalFCI[] = [
  {
    id: 'PROP-2026-TEL-003',
    code: 'PROP-2026-TEL-003',
    title: 'Sistema de Detección Temprana de Intrusiones en Redes de Sensores Telemáticos Mediante Algoritmos de Borde (Edge AI)',
    applicantId: 'USR-006',
    applicantName: 'Dra. Elena Villacís',
    applicantEmail: 'elena.villacis@ug.edu.ec',
    career: 'Ingeniería en Telemática',
    researchLine: 'Inteligencia en el Borde, Ciberseguridad y Redes Telemáticas',
    callYear: '2026-2027',
    generalObjective: 'Diseñar y validar un motor ligero de detección de intrusiones embebido en microcontroladores de borde (ESP32/Raspberry Pi Pico) para asegurar la telemetría en infraestructuras industriales de Guayaquil.',
    specificObjectives: [
      'Cuantificar el consumo computacional y energético de modelos de aprendizaje supervisado compactos.',
      'Evaluar la tasa de detección de ataques de inyección de paquetes en bus CAN y enlaces inalámbricos.',
      'Generar un prototipo de nodo seguro con capacidad de aislamiento automático.'
    ],
    summary: 'La propuesta aborda la vulnerabilidad crítica de los nodos IoT sin cifrado robusto en el sector industrial de la región Guayas. Se propone una arquitectura de inferencia distribuida.',
    budgetRequested: 14200,
    documentId: 'DOC-PROP-003',
    documentName: 'Propuesta_FCI_2026_Edge_AI_Villacis_v2.pdf',
    documentSizeMb: 7.4,
    status: 'EN_REVISION',
    submissionDate: '2026-10-25',
    reviewNotes: 'Se revisó la versión 2.0. Las observaciones respecto al desglose del cronograma y el presupuesto de equipos de radiofrecuencia fueron atendidas satisfactoriamente. Pendiente dictamen final de la Comisión de Investigación.',
    reviewDate: '2026-11-02',
    reviewerName: 'Dr. Roberto Silva, PhD',
    versionHistory: [
      {
        version: 1,
        date: '2026-10-10',
        action: 'Envío inicial de propuesta',
        comment: 'Primera postulación de la Dra. Elena Villacís con PDF adjunto de 7.1 MB.',
        user: 'Dra. Elena Villacís'
      },
      {
        version: 1,
        date: '2026-10-18',
        action: 'Observaciones emitidas',
        comment: 'Se requiere precisar la metodología de muestreo en plantas y ajustar cotización de tarjetas FPGA.',
        user: 'Dr. Roberto Silva, PhD'
      },
      {
        version: 2,
        date: '2026-10-25',
        action: 'Reenvío con correcciones',
        comment: 'Se adjuntó versión corregida (v2) subsanando observaciones metodológicas.',
        user: 'Dra. Elena Villacís'
      }
    ]
  }
];

export const FCI_REPORTS_DATA: FciSemiAnnualReport[] = [
  {
    id: 'REP-FCI-001',
    projectId: 'FCI-2025-TEL-001',
    projectCode: 'FCI-2025-TEL-001',
    projectTitle: 'Plataforma Telemática IoT para Monitoreo y Eficiencia Energética',
    directorId: 'USR-004',
    directorName: 'MSc. Xavier Andrade',
    period: '2025-CII',
    semesterNumber: 1,
    summaryAdvances: 'Se completaron los hitos 1 y 2 satisfactoriamente. Se instalaron los 12 transceptores y el concentrador de datos en la planta piloto.',
    achievedMilestones: ['Estudio de campo en planta', 'Despliegue concentrador LoRaWAN'],
    encounteredObstacles: 'Demora de 10 días en la nacionalización de módulos de radio en aduana, subsanada reordenando la fase de simulación previa.',
    nextSteps: 'Desarrollo del panel de visualización y pruebas de latencia con broker MQTT.',
    status: 'APROBADO',
    documentEvidenceId: 'DOC-002',
    documentEvidenceName: 'Reporte_Semestral_FCI_1_2025_CII.pdf',
    documentSizeMb: 8.2,
    submissionDate: '2025-10-18',
    reviewDate: '2025-10-24',
    coordinatorReviewNotes: 'Reporte completo. Se adjuntaron bitácoras de campo y actas de instalación validadas por la empresa colaboradora.',
    deadlineDate: '2025-10-30',
    isOverdue: false
  },
  {
    id: 'REP-FCI-002',
    projectId: 'FCI-2025-TEL-001',
    projectCode: 'FCI-2025-TEL-001',
    projectTitle: 'Plataforma Telemática IoT para Monitoreo y Eficiencia Energética',
    directorId: 'USR-004',
    directorName: 'MSc. Xavier Andrade',
    period: '2026-CI',
    semesterNumber: 2,
    summaryAdvances: 'Se integró el dashboard de analítica y se iniciaron las pruebas de estrés de la red de sensores. Consumo promedio medido con precisión del 98.4%.',
    achievedMilestones: ['Dashboard de visualización y pruebas de estrés de red'],
    encounteredObstacles: 'Interferencia en banda de 915 MHz resuelta mediante salto de frecuencia adaptable.',
    nextSteps: 'Finalización de la medición de 90 días y redacción del artículo de investigación para revista Scopus Q2.',
    status: 'EN_REVISION',
    documentEvidenceId: 'DOC-004',
    documentEvidenceName: 'Reporte_Semestral_FCI_2_2026_CI_Borrador.pdf',
    documentSizeMb: 7.9,
    submissionDate: '2026-11-05',
    reviewDate: '2026-11-09',
    coordinatorReviewNotes: 'Informe técnico muy sólido. Por favor anexar el certificado de validación de calibración de los transformadores de corriente.',
    deadlineDate: '2026-11-28',
    isOverdue: false
  },
  {
    id: 'REP-FCI-003',
    projectId: 'FCI-2025-TEL-002',
    projectCode: 'FCI-2025-TEL-002',
    projectTitle: 'Arquitectura de Seguridad Basada en Software Defined Networking (SDN)',
    directorId: 'USR-005',
    directorName: 'Dr. Mario Cevallos, PhD',
    period: '2026-CI',
    semesterNumber: 1,
    summaryAdvances: 'Avance del 60% en el módulo de mitigación de ataques SYN Flood en entorno de simulación Mininet.',
    achievedMilestones: ['Revisión sistemática de flujos', 'Modelado en Mininet'],
    encounteredObstacles: 'Sobrecarga de CPU en el controlador al superar 50,000 flujos/segundo. Se trabaja en optimización multi-hilo.',
    nextSteps: 'Pruebas en switches físicos con soporte OpenFlow 1.3 en el laboratorio de Telemática.',
    status: 'BORRADOR',
    deadlineDate: '2026-11-28',
    isOverdue: false
  }
];

export const RESEARCHER_REPORTS_DATA: ResearcherSemiAnnualReport[] = [
  // FCI-2025-TEL-001 (Periodo 2026-CI)
  {
    id: 'REP-INV-001',
    projectId: 'FCI-2025-TEL-001',
    projectCode: 'FCI-2025-TEL-001',
    researcherId: 'USR-004',
    researcherName: 'MSc. Xavier Andrade',
    period: '2026-CI',
    hoursDedicated: 160,
    activitiesDescription: 'Coordinación técnica, supervisión del firmware en nodos ESP32 y redacción de la sección de resultados del artículo científico.',
    deliveredProducts: ['Firmware v2.1 compilado', 'Borrador de manuscrito Scopus'],
    status: 'ENVIADO',
    documentEvidenceId: 'DOC-INV-001',
    documentEvidenceName: 'Informe_Individual_Andrade_2026_CI.pdf',
    documentSizeMb: 3.2,
    submissionDate: '2026-11-05',
    deadlineDate: '2026-11-28'
  },
  {
    id: 'REP-INV-002',
    projectId: 'FCI-2025-TEL-001',
    projectCode: 'FCI-2025-TEL-001',
    researcherId: 'USR-007',
    researcherName: 'Ing. Gabriel Romero',
    period: '2026-CI',
    hoursDedicated: 128,
    activitiesDescription: 'Montaje de tarjetas de adquisición de corriente, calibración de sensores CT y pruebas de enlace radioeléctrico en sitio.',
    deliveredProducts: ['Bitácora de calibración de 12 sensores', 'Tabla de mediciones en formato CSV'],
    status: 'APROBADO',
    documentEvidenceId: 'DOC-INV-002',
    documentEvidenceName: 'Informe_Individual_Romero_2026_CI.pdf',
    documentSizeMb: 4.1,
    submissionDate: '2026-11-03',
    coordinatorReviewNotes: 'Aprobado sin observaciones.',
    deadlineDate: '2026-11-28'
  },
  {
    id: 'REP-INV-003',
    projectId: 'FCI-2025-TEL-001',
    projectCode: 'FCI-2025-TEL-001',
    researcherId: 'USR-008',
    researcherName: 'Ing. Lorena Castro',
    period: '2026-CI',
    hoursDedicated: 128,
    activitiesDescription: 'Diseño e implementación de la API REST e interfaz web en React para el monitoreo telemático en tiempo real.',
    deliveredProducts: ['Código fuente documentado en repositorio institucional', 'Guía de usuario'],
    status: 'OBSERVADO',
    documentEvidenceId: 'DOC-INV-003',
    documentEvidenceName: 'Informe_Individual_Castro_2026_CI.pdf',
    documentSizeMb: 4.8,
    submissionDate: '2026-11-06',
    coordinatorReviewNotes: 'Falta adjuntar el enlace verificable al repositorio de código institucional y capturas con marca de tiempo.',
    deadlineDate: '2026-11-28'
  },
  // FCI-2025-TEL-002 (Periodo 2026-CI)
  {
    id: 'REP-INV-004',
    projectId: 'FCI-2025-TEL-002',
    projectCode: 'FCI-2025-TEL-002',
    researcherId: 'USR-005',
    researcherName: 'Dr. Mario Cevallos, PhD',
    period: '2026-CI',
    hoursDedicated: 160,
    activitiesDescription: 'Dirección del diseño metodológico, formulación de reglas OpenFlow reactivas y gestión de licencias.',
    deliveredProducts: ['Especificación de reglas SDN v1.0', 'Dataset sintético de ataques'],
    status: 'BORRADOR',
    deadlineDate: '2026-11-28'
  },
  {
    id: 'REP-INV-005',
    projectId: 'FCI-2025-TEL-002',
    projectCode: 'FCI-2025-TEL-002',
    researcherId: 'USR-009',
    researcherName: 'Ing. Patricia Morales',
    period: '2026-CI',
    hoursDedicated: 128,
    activitiesDescription: 'Simulación de escenarios de tráfico normal y anómalo en Mininet con 4 switches virtuales y 24 hosts.',
    deliveredProducts: ['Scripts de automatización en Python', 'Reporte de rendimiento'],
    status: 'ENVIADO',
    documentEvidenceId: 'DOC-INV-005',
    documentEvidenceName: 'Informe_Individual_Morales_2026_CI.pdf',
    documentSizeMb: 2.9,
    submissionDate: '2026-11-07',
    deadlineDate: '2026-11-28'
  },
  {
    id: 'REP-INV-006',
    projectId: 'FCI-2025-TEL-002',
    projectCode: 'FCI-2025-TEL-002',
    researcherId: 'USR-010',
    researcherName: 'Ing. Fernando Viteri',
    period: '2026-CI',
    hoursDedicated: 128,
    activitiesDescription: 'Implementación del algoritmo de detección de anomalías basado en entropía de Shannon sobre cabeceras IP.',
    deliveredProducts: ['Módulo Ryu controller en Python', 'Gráficas de precisión ROC'],
    status: 'PENDIENTE',
    deadlineDate: '2026-11-28'
  },
  {
    id: 'REP-INV-007',
    projectId: 'FCI-2025-TEL-002',
    projectCode: 'FCI-2025-TEL-002',
    researcherId: 'USR-011',
    researcherName: 'Ing. Sofía Loor',
    period: '2026-CI',
    hoursDedicated: 128,
    activitiesDescription: 'Análisis de vulnerabilidades y pruebas de bypass de firewall en la arquitectura definida por software.',
    deliveredProducts: ['Matriz de vectores de ataque mitigados'],
    status: 'BORRADOR',
    deadlineDate: '2026-11-28'
  },
  {
    id: 'REP-INV-008',
    projectId: 'FCI-2025-TEL-001',
    projectCode: 'FCI-2025-TEL-001',
    researcherId: 'USR-006',
    researcherName: 'Dra. Elena Villacís',
    period: '2026-CI',
    hoursDedicated: 64,
    activitiesDescription: 'Asesoría técnica en ciberseguridad para la capa de enlace inalámbrico LoRaWAN del proyecto IoT.',
    deliveredProducts: ['Análisis de riesgos de encriptación AES-128'],
    status: 'APROBADO',
    documentEvidenceId: 'DOC-INV-008',
    documentEvidenceName: 'Informe_Individual_Villacis_2026_CI.pdf',
    documentSizeMb: 1.8,
    submissionDate: '2026-11-02',
    coordinatorReviewNotes: 'Cumplimiento adecuado de horas de asesoría.',
    deadlineDate: '2026-11-28'
  }
];

export const SCIENTIFIC_PRODUCTION_BATCHES_DATA: ScientificProductionBatch[] = [
  {
    id: 'BATCH-2026-Q3',
    period: '2026 - Trimestre 3 (Julio - Septiembre)',
    uploadDate: '2026-10-04 15:30',
    uploadedBy: 'MSc. Diana Paredes (Gestora de Conocimiento)',
    fileName: 'Produccion_Cientifica_Telematica_2026_Q3.xlsx',
    fileSizeMb: 1.25,
    recordCount: 5,
    version: 1,
    status: 'VALIDADO',
    items: [
      {
        id: 'PUB-001',
        projectCode: 'FCI-2025-TEL-001',
        title: 'Energy Efficiency Optimization in Metal-Mechanical Small Industries using LoRaWAN Sensor Networks',
        authors: 'Andrade X., Romero G., Castro L., Silva R.',
        hasUgAffiliation: true,
        productionType: 'ARTICULO_SCOPUS',
        journalOrConference: 'IEEE Latin America Transactions',
        issnOrIsbn: '1548-0992',
        indexing: 'Scopus Q2 / SJR 0.38',
        doiOrUrl: '10.1109/TLA.2026.1049281',
        publicationDate: '2026-08-15',
        period: '2026-Q3',
        statusInPeriod: 'PUBLICADO'
      },
      {
        id: 'PUB-002',
        projectCode: 'FCI-2025-TEL-002',
        title: 'Dynamic OpenFlow Rule Reconfiguration against High-Volume Distributed Denial of Service in Campus Backbones',
        authors: 'Cevallos M., Morales P., Viteri F., Silva R.',
        hasUgAffiliation: true,
        productionType: 'ARTICULO_SCOPUS',
        journalOrConference: 'Computers & Security (Elsevier)',
        issnOrIsbn: '0167-4048',
        indexing: 'Scopus Q1 / JCR 5.1',
        doiOrUrl: '10.1016/j.cose.2026.103991',
        publicationDate: '2026-09-02',
        period: '2026-Q3',
        statusInPeriod: 'PUBLICADO'
      },
      {
        id: 'PUB-003',
        projectCode: 'FCI-2025-TEL-001',
        title: 'Topología de Radiofrecuencia Industrial: Casos de Estudio en la Zona 8 del Guayas',
        authors: 'Romero G., Andrade X., Villacís E.',
        hasUgAffiliation: true,
        productionType: 'PONENCIA_CONGRESO',
        journalOrConference: 'Congreso Internacional de Ingeniería Industrial y Telemática (CIIT 2026)',
        issnOrIsbn: '978-9942-89-21-3',
        indexing: 'Scopus Proceedings',
        doiOrUrl: '10.1109/CIIT.2026.98214',
        publicationDate: '2026-07-28',
        period: '2026-Q3',
        statusInPeriod: 'PUBLICADO'
      },
      {
        id: 'PUB-004',
        projectCode: 'FCI-2025-TEL-002',
        title: 'Entropy-Based Flow Analysis on Software Defined Networks: Empirical Validation',
        authors: 'Viteri F., Cevallos M., Loor S.',
        hasUgAffiliation: true,
        productionType: 'ARTICULO_LATINDEX',
        journalOrConference: 'Revista Científica y Tecnológica UPSE',
        issnOrIsbn: '1390-7697',
        indexing: 'Latindex Catálogo 2.0',
        doiOrUrl: '10.26423/rctu.v13i2.812',
        publicationDate: '2026-08-30',
        period: '2026-Q3',
        statusInPeriod: 'PUBLICADO'
      },
      {
        id: 'PUB-005',
        projectCode: 'FCI-2025-TEL-001',
        title: 'Edge Computing Implementations for Sensor Telemetry in Developing Countries: A Survey',
        authors: 'Villacís E., Andrade X.',
        hasUgAffiliation: true,
        productionType: 'ARTICULO_WOS',
        journalOrConference: 'Sensors (MDPI)',
        issnOrIsbn: '1424-8220',
        indexing: 'Web of Science (WoS) Q1',
        doiOrUrl: '10.3390/s26186022',
        publicationDate: '2026-09-18',
        period: '2026-Q3',
        statusInPeriod: 'PUBLICADO'
      }
    ]
  }
];

export const AUDIT_LOG_DATA: AuditLogEntry[] = [
  {
    id: 'AUD-1001',
    timestamp: '2026-11-09 14:22:10',
    userId: 'USR-002',
    userName: 'Dr. Roberto Silva, PhD',
    userRole: 'COORDINADOR_CARRERA',
    action: 'OBSERVAR',
    entity: 'REPORTE_FCI',
    entityId: 'REP-FCI-002',
    entityDescription: 'Reporte Semestral 2 - FCI-2025-TEL-001',
    previousValue: 'Estado: EN_REVISION',
    newValue: 'Estado: OBSERVADO (Se solicitó certificado de calibración)',
    ipAddress: '190.15.142.88'
  },
  {
    id: 'AUD-1002',
    timestamp: '2026-11-06 18:05:40',
    userId: 'USR-008',
    userName: 'Ing. Lorena Castro',
    userRole: 'DOCENTE_INVESTIGADOR_FCI',
    action: 'ENVIAR',
    entity: 'REPORTE_INVESTIGADOR',
    entityId: 'REP-INV-003',
    entityDescription: 'Reporte Semestral Individual - 2026-CI',
    previousValue: 'Estado: BORRADOR',
    newValue: 'Estado: ENVIADO (PDF adjunto 4.8 MB)',
    ipAddress: '186.68.22.104'
  },
  {
    id: 'AUD-1003',
    timestamp: '2026-11-05 09:15:22',
    userId: 'USR-004',
    userName: 'MSc. Xavier Andrade',
    userRole: 'DIRECTOR_FCI',
    action: 'CARGAR_ARCHIVO',
    entity: 'DOCUMENTO',
    entityId: 'DOC-004',
    entityDescription: 'Reporte_Semestral_FCI_2_2026_CI_Borrador.pdf',
    previousValue: 'N/A',
    newValue: 'Cargado versión 1.0 (7.9 MB) - Validaciones: OK',
    ipAddress: '190.15.142.12'
  },
  {
    id: 'AUD-1004',
    timestamp: '2026-11-02 11:30:00',
    userId: 'USR-002',
    userName: 'Dr. Roberto Silva, PhD',
    userRole: 'COORDINADOR_CARRERA',
    action: 'APROBAR',
    entity: 'REPORTE_INVESTIGADOR',
    entityId: 'REP-INV-008',
    entityDescription: 'Reporte Individual Dra. Elena Villacís',
    previousValue: 'Estado: ENVIADO',
    newValue: 'Estado: APROBADO',
    ipAddress: '190.15.142.88'
  },
  {
    id: 'AUD-1005',
    timestamp: '2026-10-25 16:45:10',
    userId: 'USR-006',
    userName: 'Dra. Elena Villacís',
    userRole: 'FUTURO_DIRECTOR_FCI',
    action: 'EDITAR',
    entity: 'PROPUESTA',
    entityId: 'PROP-2026-TEL-003',
    entityDescription: 'Propuesta Edge AI Convocatoria 2026',
    previousValue: 'Versión 1 (OBSERVADA)',
    newValue: 'Versión 2 enviada con cronograma y presupuesto ajustados',
    ipAddress: '186.68.99.201'
  },
  {
    id: 'AUD-1006',
    timestamp: '2026-10-04 15:35:00',
    userId: 'USR-003',
    userName: 'MSc. Diana Paredes',
    userRole: 'GESTOR_CONOCIMIENTO',
    action: 'CARGAR_ARCHIVO',
    entity: 'PRODUCCION_CIENTIFICA',
    entityId: 'BATCH-2026-Q3',
    entityDescription: 'Produccion_Cientifica_Telematica_2026_Q3.xlsx',
    previousValue: 'N/A',
    newValue: 'Archivo validado con 5 registros leídos e importados',
    ipAddress: '190.15.142.95'
  }
];

export const SYSTEM_NOTIFICATIONS_DATA: SystemNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'Aviso de vencimiento: 17 días para cierre de reportes semestrales 2026-CI',
    message: 'El plazo oficial para el envío de reportes semestrales de directores e investigadores finaliza el 28 de noviembre de 2026.',
    type: 'RECORDATORIO',
    targetRoles: ['DIRECTOR_FCI', 'DOCENTE_INVESTIGADOR_FCI', 'COORDINADOR_CARRERA'],
    date: '2026-11-11 08:00',
    read: false,
    linkModule: 'fci_reports',
    emailSent: true
  },
  {
    id: 'NOTIF-002',
    title: 'Observación en Reporte Semestral FCI-2025-TEL-001',
    message: 'La Coordinación de Carrera emitió una observación sobre el reporte del semestre 2. Favor subsanar y reenviar.',
    type: 'OBSERVACION',
    targetRoles: ['DIRECTOR_FCI'],
    targetUserId: 'USR-004',
    date: '2026-11-09 14:22',
    read: false,
    linkModule: 'fci_reports',
    emailSent: true
  },
  {
    id: 'NOTIF-003',
    title: 'Nuevo reporte individual recibido para revisión',
    message: 'La Ing. Patricia Morales envió el reporte semestral individual del proyecto FCI-2025-TEL-002.',
    type: 'ENVIO',
    targetRoles: ['COORDINADOR_CARRERA', 'DIRECTOR_FCI'],
    targetUserId: 'USR-002',
    date: '2026-11-07 10:15',
    read: true,
    linkModule: 'researcher_reports',
    emailSent: true
  },
  {
    id: 'NOTIF-004',
    title: 'Alerta documental: Evidencia pendiente en FCI-2025-TEL-002',
    message: 'El expediente del proyecto FCI-2025-TEL-002 presenta 2 evidencias pendientes correspondientes al hito M-103.',
    type: 'ALERTA_DOCUMENTAL',
    targetRoles: ['DIRECTOR_FCI', 'COORDINADOR_CARRERA'],
    targetUserId: 'USR-005',
    date: '2026-11-04 11:30',
    read: true,
    linkModule: 'projects',
    emailSent: false
  },
  {
    id: 'NOTIF-005',
    title: 'Propuesta PROP-2026-TEL-003 actualizada por el postulante',
    message: 'La Dra. Elena Villacís ha cargado la versión 2.0 subsanando las observaciones técnicas.',
    type: 'ENVIO',
    targetRoles: ['COORDINADOR_CARRERA'],
    targetUserId: 'USR-002',
    date: '2026-10-25 16:48',
    read: true,
    linkModule: 'proposals',
    emailSent: true
  }
];
