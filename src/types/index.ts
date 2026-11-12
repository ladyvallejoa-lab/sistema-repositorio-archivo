/**
 * Definición de tipos y estructuras del dominio funcional para UG-Investiga FCI
 * Facultad de Ingeniería Industrial - Universidad de Guayaquil
 * Carrera Piloto: Ingeniería en Telemática
 */

export type UserRole =
  | 'ADMINISTRADOR'
  | 'COORDINADOR_CARRERA'
  | 'GESTOR_CONOCIMIENTO'
  | 'DIRECTOR_FCI'
  | 'FUTURO_DIRECTOR_FCI'
  | 'DOCENTE_INVESTIGADOR_FCI';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  career: string;
  faculty: string;
  roles: UserRole[];
  active: boolean;
  avatarUrl?: string;
  fciProjects: string[]; // IDs de proyectos asociados
}

export type ProposalStatus =
  | 'BORRADOR'
  | 'ENVIADA'
  | 'EN_REVISION'
  | 'OBSERVADA'
  | 'APROBADA'
  | 'RECHAZADA';

export type ProjectStatus =
  | 'EN_FORMULACION'
  | 'APROBADO'
  | 'EN_EJECUCION'
  | 'FINALIZADO'
  | 'CANCELADO';

export type ReportStatus =
  | 'PENDIENTE'
  | 'BORRADOR'
  | 'ENVIADO'
  | 'EN_REVISION'
  | 'OBSERVADO'
  | 'APROBADO';

export type ValidationResultType = 'ACEPTADO' | 'CON_ADVERTENCIA' | 'RECHAZADO';

export interface ValidationDetail {
  ruleCode: string;
  ruleName: string;
  status: ValidationResultType;
  message: string;
  timestamp: string;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  originalFileName: string;
  category: 'PROPUESTA' | 'REPORTE_FCI' | 'REPORTE_INVESTIGADOR' | 'EVIDENCIA_TECNICA' | 'PUBLICACION' | 'ACTA_CIERRE';
  type: string; // PDF, DOCX, XLSX
  sizeMb: number;
  uploadDate: string;
  uploaderName: string;
  uploaderRole: UserRole;
  projectId?: string;
  reportPeriod?: string;
  version: string;
  isLatest: boolean;
  confidentiality: 'PUBLICO_UG' | 'RESTRINGIDO_CARRERA' | 'CONFIDENCIAL_FCI';
  active: boolean; // para eliminación lógica
  deletionReason?: string;
  deletedBy?: string;
  deletedAt?: string;
  validations: ValidationDetail[];
  fileUrl?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completionDate?: string;
  progressPercent: number;
  status: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO' | 'RETRASADO';
  linkedDocumentIds: string[];
}

export interface ProjectParticipant {
  userId: string;
  name: string;
  email: string;
  institutionalRole: string; // Docente Titular, Docente Ocasional, Estudiante
  projectRole: 'DIRECTOR' | 'COINVESTIGADOR' | 'INVESTIGADOR' | 'AUXILIAR_ESTUDIANTE';
  dedicationHoursWeekly: number;
}

export interface FciProject {
  id: string;
  code: string; // ej. FCI-2025-TEL-001
  title: string;
  description: string;
  generalObjective: string;
  specificObjectives: string[];
  keywords: string[];
  researchLine: string;
  career: string;
  faculty: string;
  academicPeriod: string;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
  status: ProjectStatus;
  participants: ProjectParticipant[];
  milestones: ProjectMilestone[];
  budgetAssigned: number;
  budgetExecuted: number;
  documents: DocumentMetadata[];
  documentCompletenessPercent: number;
  currentSemester: number;
  totalSemesters: number;
}

export interface ProposalFCI {
  id: string;
  code: string;
  title: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  career: string;
  researchLine: string;
  callYear: string;
  generalObjective: string;
  specificObjectives: string[];
  summary: string;
  budgetRequested: number;
  documentId?: string;
  documentName?: string;
  documentSizeMb?: number;
  status: ProposalStatus;
  submissionDate?: string;
  reviewNotes?: string;
  reviewDate?: string;
  reviewerName?: string;
  versionHistory: {
    version: number;
    date: string;
    action: string;
    comment: string;
    user: string;
  }[];
}

export interface FciSemiAnnualReport {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  directorId: string;
  directorName: string;
  period: string; // 2025-CII, 2026-CI
  semesterNumber: number;
  summaryAdvances: string;
  achievedMilestones: string[];
  encounteredObstacles: string;
  nextSteps: string;
  status: ReportStatus;
  documentEvidenceId?: string;
  documentEvidenceName?: string;
  documentSizeMb?: number;
  submissionDate?: string;
  reviewDate?: string;
  coordinatorReviewNotes?: string;
  deadlineDate: string;
  isOverdue: boolean;
}

export interface ResearcherSemiAnnualReport {
  id: string;
  projectId: string;
  projectCode: string;
  researcherId: string;
  researcherName: string;
  period: string;
  hoursDedicated: number;
  activitiesDescription: string;
  deliveredProducts: string[];
  status: ReportStatus;
  documentEvidenceId?: string;
  documentEvidenceName?: string;
  documentSizeMb?: number;
  submissionDate?: string;
  coordinatorReviewNotes?: string;
  deadlineDate: string;
}

export interface ScientificProductionItem {
  id: string;
  projectCode: string;
  title: string;
  authors: string;
  hasUgAffiliation: boolean;
  productionType: 'ARTICULO_SCOPUS' | 'ARTICULO_WOS' | 'ARTICULO_LATINDEX' | 'PONENCIA_CONGRESO' | 'LIBRO_CAPITULO' | 'PATENTE';
  journalOrConference: string;
  issnOrIsbn: string;
  indexing: string;
  doiOrUrl: string;
  publicationDate: string;
  period: string;
  statusInPeriod: 'PUBLICADO' | 'ACEPTADO';
}

export interface ScientificProductionBatch {
  id: string;
  period: string;
  uploadDate: string;
  uploadedBy: string;
  fileName: string;
  fileSizeMb: number;
  recordCount: number;
  version: number;
  status: 'VALIDADO' | 'CON_OBSERVACIONES';
  items: ScientificProductionItem[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREAR' | 'EDITAR' | 'ENVIAR' | 'OBSERVAR' | 'APROBAR' | 'RECHAZAR' | 'ELIMINAR_LOGICO' | 'CARGAR_ARCHIVO';
  entity: 'PROPUESTA' | 'PROYECTO' | 'REPORTE_FCI' | 'REPORTE_INVESTIGADOR' | 'DOCUMENTO' | 'CONFIGURACION' | 'PRODUCCION_CIENTIFICA';
  entityId: string;
  entityDescription: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'RECORDATORIO' | 'VENCIMIENTO' | 'OBSERVACION' | 'APROBACION' | 'ENVIO' | 'ALERTA_DOCUMENTAL';
  targetRoles: UserRole[];
  targetUserId?: string;
  date: string;
  read: boolean;
  linkModule?: string;
  emailSent: boolean;
}

export interface ConfigParameter {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'LIMITES_ARCHIVO' | 'CALENDARIO' | 'PERIODOS' | 'CATALOGOS';
  value: string | number | boolean;
  unit?: string;
}

export interface RequiredDocumentRule {
  id: string;
  documentType: string;
  projectStage: 'PROPUESTA' | 'INICIO_PROYECTO' | 'SEMESTRAL_FCI' | 'SEMESTRAL_INVESTIGADOR' | 'CIERRE_FINAL';
  mandatory: boolean;
  maxSizeMb: number;
  allowedFormats: string[];
}
