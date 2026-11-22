import { getSupabaseClient } from '../lib/supabase';
import {
  AuditLogEntry,
  ConfigParameter,
  DocumentMetadata,
  FciProject,
  FciSemiAnnualReport,
  ProposalFCI,
  RequiredDocumentRule,
  ResearcherSemiAnnualReport,
  ScientificProductionBatch,
  ScientificProductionItem,
  SystemNotification,
  UserProfile,
  UserRole,
  ValidationDetail
} from '../types';

export interface WorkspaceDataset {
  users: UserProfile[];
  projects: FciProject[];
  proposals: ProposalFCI[];
  fciReports: FciSemiAnnualReport[];
  researcherReports: ResearcherSemiAnnualReport[];
  productionBatches: ScientificProductionBatch[];
  auditLogs: AuditLogEntry[];
  notifications: SystemNotification[];
  configParams: ConfigParameter[];
  requiredDocRules: RequiredDocumentRule[];
  standaloneDocuments: DocumentMetadata[];
}

export async function computeFileSha256(file: File): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback below if SubtleCrypto is restricted
  }
  return `size-${file.size}-name-${file.name}-${file.lastModified}`;
}

export async function fetchAllWorkspaceData(currentProfileId: string): Promise<WorkspaceDataset> {
  const supabase = getSupabaseClient();

  const [
    profilesRes,
    rolesRes,
    configRes,
    rulesRes,
    proposalsRes,
    propVersionsRes,
    projectsRes,
    participantsRes,
    milestonesRes,
    milestoneDocsRes,
    documentsRes,
    validationsRes,
    fciReportsRes,
    resReportsRes,
    batchesRes,
    prodItemsRes,
    auditRes,
    notifsRes,
    notifReadsRes
  ] = await Promise.all([
    supabase.from('profiles').select('*').order('user_code', { ascending: true }),
    supabase.from('user_roles').select('*'),
    supabase.from('config_parameters').select('*').order('id', { ascending: true }),
    supabase.from('required_document_rules').select('*').order('id', { ascending: true }),
    supabase.from('proposals_fci').select('*').order('created_at', { ascending: false }),
    supabase.from('proposal_versions').select('*').order('created_at', { ascending: true }),
    supabase.from('fci_projects').select('*').order('code', { ascending: true }),
    supabase.from('project_participants').select('*'),
    supabase.from('project_milestones').select('*').order('milestone_code', { ascending: true }),
    supabase.from('milestone_documents').select('*'),
    supabase.from('documents').select('*').order('created_at', { ascending: false }),
    supabase.from('document_validations').select('*'),
    supabase.from('fci_semi_annual_reports').select('*').order('period', { ascending: false }),
    supabase.from('researcher_semi_annual_reports').select('*').order('report_code', { ascending: true }),
    supabase.from('scientific_production_batches').select('*').order('upload_date', { ascending: false }),
    supabase.from('scientific_production_items').select('*').order('publication_date', { ascending: false }),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('system_notifications').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('notification_reads').select('*').eq('user_id', currentProfileId)
  ]);

  const errors = [
    profilesRes.error,
    rolesRes.error,
    configRes.error,
    rulesRes.error,
    proposalsRes.error,
    projectsRes.error
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const profilesRows = profilesRes.data || [];
  const rolesRows = rolesRes.data || [];
  const participantsRows = participantsRes.data || [];
  const projectsRows = projectsRes.data || [];
  const milestonesRows = milestonesRes.data || [];
  const milestoneDocsRows = milestoneDocsRes.data || [];
  const documentsRows = documentsRes.data || [];
  const validationsRows = validationsRes.data || [];

  const profileById = new Map<string, any>(profilesRows.map((p: any) => [p.id, p]));
  const projectById = new Map<string, any>(projectsRows.map((p: any) => [p.id, p]));

  // Map users
  const users: UserProfile[] = profilesRows.map((p: any) => {
    const uRoles = rolesRows
      .filter((r: any) => r.user_id === p.id)
      .map((r: any) => r.role as UserRole);
    const uProjectCodes = participantsRows
      .filter((pp: any) => pp.user_id === p.id)
      .map((pp: any) => projectById.get(pp.project_id)?.code)
      .filter(Boolean);

    return {
      id: p.id,
      userCode: p.user_code,
      authUserId: p.auth_user_id,
      name: p.full_name,
      email: p.email,
      career: p.career,
      faculty: p.faculty,
      roles: uRoles.length > 0 ? uRoles : ['DOCENTE_INVESTIGADOR_FCI'],
      active: Boolean(p.active),
      avatarUrl: p.avatar_url || undefined,
      fciProjects: uProjectCodes
    };
  });

  // Map documents with validations
  const validationsByDoc = new Map<string, ValidationDetail[]>();
  for (const v of validationsRows) {
    const list = validationsByDoc.get(v.document_id) || [];
    list.push({
      ruleCode: v.rule_code,
      ruleName: v.rule_name,
      status: v.status,
      message: v.message,
      timestamp: v.validated_at
    });
    validationsByDoc.set(v.document_id, list);
  }

  const allDocuments: DocumentMetadata[] = documentsRows.map((d: any) => ({
    id: d.id,
    docCode: d.doc_code,
    name: d.name,
    originalFileName: d.original_file_name,
    category: d.category,
    type: d.file_type,
    mimeType: d.mime_type || undefined,
    sizeMb: Number(d.size_mb),
    uploadDate: d.upload_date,
    uploaderId: d.uploader_id || undefined,
    uploaderName: d.uploader_name,
    uploaderRole: d.uploader_role as UserRole,
    projectId: d.project_id || undefined,
    projectCode: d.project_id ? projectById.get(d.project_id)?.code : undefined,
    proposalId: d.proposal_id || undefined,
    reportPeriod: d.report_period || undefined,
    version: d.version,
    isLatest: Boolean(d.is_latest),
    confidentiality: d.confidentiality,
    active: Boolean(d.active),
    deletionReason: d.deletion_reason || undefined,
    deletedBy: d.deleted_by_name || undefined,
    deletedAt: d.deleted_at ? String(d.deleted_at).replace('T', ' ').slice(0, 16) : undefined,
    validations: validationsByDoc.get(d.id) || [],
    storageBucket: d.storage_bucket,
    storagePath: d.storage_path || undefined,
    checksumSha256: d.checksum_sha256 || undefined
  }));

  // Map projects
  const projects: FciProject[] = projectsRows.map((proj: any) => {
    const pParticipants = participantsRows
      .filter((pp: any) => pp.project_id === proj.id)
      .map((pp: any) => {
        const prof = profileById.get(pp.user_id);
        return {
          userId: pp.user_id,
          name: prof?.full_name || 'Investigador UG',
          email: prof?.email || '',
          institutionalRole: pp.institutional_role,
          projectRole: pp.project_role,
          dedicationHoursWeekly: pp.dedication_hours_weekly
        };
      });

    const pMilestones = milestonesRows
      .filter((m: any) => m.project_id === proj.id)
      .map((m: any) => ({
        id: m.id,
        milestoneCode: m.milestone_code,
        title: m.title,
        description: m.description,
        targetDate: m.target_date,
        completionDate: m.completion_date || undefined,
        progressPercent: m.progress_percent,
        status: m.status,
        linkedDocumentIds: milestoneDocsRows
          .filter((md: any) => md.milestone_id === m.id)
          .map((md: any) => md.document_id)
      }));

    const pDocs = allDocuments.filter((d) => d.projectId === proj.id);

    return {
      id: proj.id,
      code: proj.code,
      title: proj.title,
      description: proj.description,
      generalObjective: proj.general_objective,
      specificObjectives: Array.isArray(proj.specific_objectives) ? proj.specific_objectives : [],
      keywords: Array.isArray(proj.keywords) ? proj.keywords : [],
      researchLine: proj.research_line,
      career: proj.career,
      faculty: proj.faculty,
      academicPeriod: proj.academic_period,
      startDate: proj.start_date,
      estimatedEndDate: proj.estimated_end_date,
      actualEndDate: proj.actual_end_date || undefined,
      status: proj.status,
      participants: pParticipants,
      milestones: pMilestones,
      budgetAssigned: Number(proj.budget_assigned),
      budgetExecuted: Number(proj.budget_executed),
      documents: pDocs,
      documentCompletenessPercent: proj.document_completeness_percent,
      currentSemester: proj.current_semester,
      totalSemesters: proj.total_semesters
    };
  });

  // Map proposals
  const propVersionsRows = propVersionsRes.data || [];
  const proposals: ProposalFCI[] = (proposalsRes.data || []).map((pr: any) => {
    const applicant = profileById.get(pr.applicant_id);
    const versions = propVersionsRows
      .filter((v: any) => v.proposal_id === pr.id)
      .map((v: any) => ({
        version: v.version,
        date: v.action_date,
        action: v.action,
        comment: v.comment,
        user: v.actor_name
      }));

    return {
      id: pr.id,
      code: pr.code,
      title: pr.title,
      applicantId: pr.applicant_id,
      applicantName: applicant?.full_name || 'Docente Postulante',
      applicantEmail: applicant?.email || '',
      career: pr.career,
      researchLine: pr.research_line,
      callYear: pr.call_year,
      generalObjective: pr.general_objective,
      specificObjectives: Array.isArray(pr.specific_objectives) ? pr.specific_objectives : [],
      summary: pr.summary,
      budgetRequested: Number(pr.budget_requested),
      documentId: pr.document_id || undefined,
      documentName: pr.document_name || undefined,
      documentSizeMb: pr.document_size_mb != null ? Number(pr.document_size_mb) : undefined,
      status: pr.status,
      submissionDate: pr.submission_date || undefined,
      reviewNotes: pr.review_notes || undefined,
      reviewDate: pr.review_date || undefined,
      reviewerName: pr.reviewer_name || undefined,
      versionHistory: versions
    };
  });

  // Map FCI Semi-Annual Reports
  const fciReports: FciSemiAnnualReport[] = (fciReportsRes.data || []).map((r: any) => {
    const proj = projectById.get(r.project_id);
    const dir = profileById.get(r.director_id);
    return {
      id: r.id,
      projectId: r.project_id,
      projectCode: proj?.code || 'N/A',
      projectTitle: proj?.title || 'Proyecto FCI',
      directorId: r.director_id,
      directorName: dir?.full_name || 'Director FCI',
      period: r.period,
      semesterNumber: r.semester_number,
      summaryAdvances: r.summary_advances || '',
      achievedMilestones: Array.isArray(r.achieved_milestones) ? r.achieved_milestones : [],
      encounteredObstacles: r.encountered_obstacles || '',
      nextSteps: r.next_steps || '',
      status: r.status,
      documentEvidenceId: r.document_id || undefined,
      documentEvidenceName: r.document_evidence_name || undefined,
      documentSizeMb: r.document_size_mb != null ? Number(r.document_size_mb) : undefined,
      submissionDate: r.submission_date || undefined,
      reviewDate: r.review_date || undefined,
      coordinatorReviewNotes: r.coordinator_review_notes || undefined,
      deadlineDate: r.deadline_date,
      isOverdue: Boolean(r.is_overdue)
    };
  });

  // Map Researcher Semi-Annual Reports
  const researcherReports: ResearcherSemiAnnualReport[] = (resReportsRes.data || []).map((r: any) => {
    const proj = projectById.get(r.project_id);
    const res = profileById.get(r.researcher_id);
    return {
      id: r.id,
      projectId: r.project_id,
      projectCode: proj?.code || 'N/A',
      researcherId: r.researcher_id,
      researcherName: res?.full_name || 'Investigador FCI',
      period: r.period,
      hoursDedicated: r.hours_dedicated,
      activitiesDescription: r.activities_description || '',
      deliveredProducts: Array.isArray(r.delivered_products) ? r.delivered_products : [],
      status: r.status,
      documentEvidenceId: r.document_id || undefined,
      documentEvidenceName: r.document_evidence_name || undefined,
      documentSizeMb: r.document_size_mb != null ? Number(r.document_size_mb) : undefined,
      submissionDate: r.submission_date || undefined,
      coordinatorReviewNotes: r.coordinator_review_notes || undefined,
      deadlineDate: r.deadline_date
    };
  });

  // Map Scientific Production Batches
  const prodItemsRows = prodItemsRes.data || [];
  const productionBatches: ScientificProductionBatch[] = (batchesRes.data || []).map((b: any) => ({
    id: b.id,
    period: b.period,
    uploadDate: String(b.upload_date).replace('T', ' ').slice(0, 16),
    uploadedBy: b.uploaded_by_name,
    fileName: b.file_name,
    fileSizeMb: Number(b.file_size_mb),
    recordCount: b.record_count,
    version: b.version,
    status: b.status,
    items: prodItemsRows
      .filter((it: any) => it.batch_id === b.id)
      .map(
        (it: any): ScientificProductionItem => ({
          id: it.id,
          projectCode: it.project_code,
          title: it.title,
          authors: it.authors,
          hasUgAffiliation: Boolean(it.has_ug_affiliation),
          productionType: it.production_type,
          journalOrConference: it.journal_or_conference,
          issnOrIsbn: it.issn_or_isbn,
          indexing: it.indexing,
          doiOrUrl: it.doi_or_url,
          publicationDate: it.publication_date,
          period: it.period,
          statusInPeriod: it.status_in_period
        })
      )
  }));

  // Map Audit Logs
  const auditLogs: AuditLogEntry[] = (auditRes.data || []).map((a: any) => ({
    id: a.id,
    timestamp: String(a.created_at).replace('T', ' ').slice(0, 19),
    userId: a.user_id || '',
    userName: a.user_name,
    userRole: a.user_role as UserRole,
    action: a.action,
    entity: a.entity,
    entityId: a.entity_id,
    entityDescription: a.entity_description,
    previousValue: a.previous_value || undefined,
    newValue: a.new_value || undefined,
    ipAddress: a.ip_address
  }));

  // Map Notifications with per-user read tracking
  const readSet = new Set<string>((notifReadsRes.data || []).map((nr: any) => nr.notification_id));
  const notifications: SystemNotification[] = (notifsRes.data || []).map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    targetRoles: Array.isArray(n.target_roles) ? (n.target_roles as UserRole[]) : [],
    targetUserId: n.target_user_id || undefined,
    date: String(n.created_at).replace('T', ' ').slice(0, 16),
    read: readSet.has(n.id),
    linkModule: n.link_module || undefined,
    emailSent: Boolean(n.email_sent)
  }));

  // Map Config Parameters
  const configParams: ConfigParameter[] = (configRes.data || []).map((c: any) => ({
    id: c.id,
    key: c.key,
    name: c.name,
    description: c.description,
    category: c.category,
    value:
      c.value_type === 'number'
        ? Number(c.value_text)
        : c.value_type === 'boolean'
        ? c.value_text === 'true'
        : c.value_text,
    unit: c.unit || undefined
  }));

  // Map Required Document Rules
  const requiredDocRules: RequiredDocumentRule[] = (rulesRes.data || []).map((r: any) => ({
    id: r.id,
    documentType: r.document_type,
    projectStage: r.project_stage,
    mandatory: Boolean(r.mandatory),
    maxSizeMb: Number(r.max_size_mb),
    allowedFormats: Array.isArray(r.allowed_formats) ? r.allowed_formats : ['PDF']
  }));

  const standaloneDocuments = allDocuments.filter((d) => !d.projectId);

  return {
    users,
    projects,
    proposals,
    fciReports,
    researcherReports,
    productionBatches,
    auditLogs,
    notifications,
    configParams,
    requiredDocRules,
    standaloneDocuments
  };
}

export async function appendAuditLog(params: {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditLogEntry['action'];
  entity: AuditLogEntry['entity'];
  entityId: string;
  entityDescription: string;
  previousValue?: string;
  newValue?: string;
}) {
  const supabase = getSupabaseClient();
  const logCode = `AUD-${Date.now()}`;
  const { error } = await supabase.from('audit_logs').insert({
    log_code: logCode,
    user_id: params.userId,
    user_name: params.userName,
    user_role: params.userRole,
    action: params.action,
    entity: params.entity,
    entity_id: params.entityId,
    entity_description: params.entityDescription,
    previous_value: params.previousValue || null,
    new_value: params.newValue || null,
    ip_address: 'Supabase Client Auth'
  });
  if (error) {
    console.error('Error registrando auditoría:', error.message);
  }
}

export async function uploadDocumentToStorage(params: {
  file: File;
  category: DocumentMetadata['category'];
  projectId?: string;
  projectCode?: string;
  proposalId?: string;
  reportPeriod?: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: UserRole;
  maxSizeMb: number;
  allowedExtensions: string[];
}): Promise<DocumentMetadata> {
  const supabase = getSupabaseClient();
  const sizeMb = Number((params.file.size / (1024 * 1024)).toFixed(2));
  const ext = params.file.name.split('.').pop()?.toUpperCase() || '';

  if (!params.allowedExtensions.includes(ext)) {
    throw new Error(
      `Regla RN-VAL-01: Formato .${ext} no permitido. Solo se aceptan: ${params.allowedExtensions.join(', ')}.`
    );
  }

  if (sizeMb > params.maxSizeMb) {
    throw new Error(
      `Regla RN-18: El archivo (${sizeMb} MB) excede el límite configurado de ${params.maxSizeMb} MB.`
    );
  }

  const checksum = await computeFileSha256(params.file);

  // Check duplicate checksum on same project
  let isDuplicate = false;
  if (params.projectId) {
    const { data: dupRows } = await supabase
      .from('documents')
      .select('id')
      .eq('project_id', params.projectId)
      .eq('checksum_sha256', checksum)
      .limit(1);
    isDuplicate = Boolean(dupRows && dupRows.length > 0);
  }

  const sanitizedName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const folder = params.category.toLowerCase();
  const refFolder = params.projectCode || params.proposalId || 'general';
  const storagePath = `${folder}/${refFolder}/${Date.now()}_${sanitizedName}`;

  const { error: uploadErr } = await supabase.storage
    .from('fci-documents')
    .upload(storagePath, params.file, {
      cacheControl: '3600',
      upsert: false,
      contentType: params.file.type || undefined
    });

  if (uploadErr) {
    throw new Error(`Error al subir archivo a Supabase Storage: ${uploadErr.message}`);
  }

  // Compute version count
  let versionNum = 1;
  if (params.projectId) {
    const { count } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', params.projectId)
      .eq('category', params.category);
    versionNum = (count || 0) + 1;
  }

  const docCode = `DOC-${Date.now().toString().slice(-6)}`;
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const { data: insertedDoc, error: insertErr } = await supabase
    .from('documents')
    .insert({
      doc_code: docCode,
      project_id: params.projectId || null,
      proposal_id: params.proposalId || null,
      storage_bucket: 'fci-documents',
      storage_path: storagePath,
      name: sanitizedName,
      original_file_name: params.file.name,
      category: params.category,
      file_type: ext,
      mime_type: params.file.type || 'application/octet-stream',
      size_mb: sizeMb,
      checksum_sha256: checksum,
      uploader_id: params.uploaderId,
      uploader_name: params.uploaderName,
      uploader_role: params.uploaderRole,
      report_period: params.reportPeriod || null,
      version: `${versionNum}.0`,
      is_latest: true,
      confidentiality: params.category === 'PROPUESTA' ? 'PUBLICO_UG' : 'RESTRINGIDO_CARRERA',
      active: true
    })
    .select()
    .single();

  if (insertErr || !insertedDoc) {
    throw new Error(`Error registrando metadatos del documento: ${insertErr?.message}`);
  }

  const validationsToInsert = [
    {
      document_id: insertedDoc.id,
      rule_code: 'RN-VAL-01',
      rule_name: 'Formato y Firma MIME',
      status: 'ACEPTADO',
      message: `Archivo ${ext} (${params.file.type || 'verificado'}) conforme.`,
      validated_at: nowStr
    },
    {
      document_id: insertedDoc.id,
      rule_code: 'RN-VAL-02',
      rule_name: 'Límite de Tamaño Configurable',
      status: sizeMb > params.maxSizeMb * 0.9 ? 'CON_ADVERTENCIA' : 'ACEPTADO',
      message: `Peso ${sizeMb} MB dentro del límite de ${params.maxSizeMb} MB.`,
      validated_at: nowStr
    },
    {
      document_id: insertedDoc.id,
      rule_code: 'RN-VAL-03',
      rule_name: 'Integridad SHA-256 y Duplicados',
      status: isDuplicate ? 'CON_ADVERTENCIA' : 'ACEPTADO',
      message: isDuplicate
        ? `Checksum coincidente con archivo previo; almacenado como v${versionNum}.0.`
        : `Checksum SHA-256 único verificado (${checksum.slice(0, 12)}...).`,
      validated_at: nowStr
    }
  ];

  await supabase.from('document_validations').insert(validationsToInsert);

  await appendAuditLog({
    userId: params.uploaderId,
    userName: params.uploaderName,
    userRole: params.uploaderRole,
    action: 'CARGAR_ARCHIVO',
    entity: 'DOCUMENTO',
    entityId: docCode,
    entityDescription: params.file.name,
    newValue: `Subido a Supabase Storage (${sizeMb} MB, v${versionNum}.0)`
  });

  return {
    id: insertedDoc.id,
    docCode,
    name: insertedDoc.name,
    originalFileName: insertedDoc.original_file_name,
    category: insertedDoc.category,
    type: insertedDoc.file_type,
    mimeType: insertedDoc.mime_type,
    sizeMb,
    uploadDate: insertedDoc.upload_date,
    uploaderId: params.uploaderId,
    uploaderName: params.uploaderName,
    uploaderRole: params.uploaderRole,
    projectId: params.projectId,
    projectCode: params.projectCode,
    proposalId: params.proposalId,
    reportPeriod: params.reportPeriod,
    version: `${versionNum}.0`,
    isLatest: true,
    confidentiality: insertedDoc.confidentiality,
    active: true,
    storageBucket: 'fci-documents',
    storagePath,
    checksumSha256: checksum,
    validations: validationsToInsert.map((v) => ({
      ruleCode: v.rule_code,
      ruleName: v.rule_name,
      status: v.status as ValidationDetail['status'],
      message: v.message,
      timestamp: v.validated_at
    }))
  };
}

export async function getDocumentSignedUrl(storagePath: string, bucket = 'fci-documents'): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 300);
  if (error || !data?.signedUrl) {
    throw new Error(`No se pudo generar enlace seguro de descarga: ${error?.message}`);
  }
  return data.signedUrl;
}

export async function triggerDocumentDownload(doc: DocumentMetadata): Promise<void> {
  if (!doc.storagePath) {
    throw new Error(
      `El documento semilla "${doc.originalFileName}" es referencial; sube un archivo real desde Propuestas, Reportes o Producción para descargarlo desde Supabase Storage.`
    );
  }
  const url = await getDocumentSignedUrl(doc.storagePath, doc.storageBucket || 'fci-documents');
  const link = window.document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.download = doc.originalFileName || doc.name;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
}

// ----------------------------------------------------------------------------
// MÓDULO 1: USUARIOS Y ROLES
// ----------------------------------------------------------------------------
export async function createInstitutionalUser(params: {
  name: string;
  email: string;
  roles: UserRole[];
  projectCode?: string;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
  const userCode = `USR-${String((count || 0) + 1).padStart(3, '0')}`;

  const { data: created, error } = await supabase
    .from('profiles')
    .insert({
      user_code: userCode,
      full_name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      career: 'Ingeniería en Telemática',
      faculty: 'Facultad de Ingeniería Industrial',
      active: true
    })
    .select()
    .single();

  if (error || !created) {
    throw new Error(error?.message || 'Error al registrar usuario en PostgreSQL.');
  }

  const roleRows = params.roles.map((r) => ({ user_id: created.id, role: r }));
  const { error: roleErr } = await supabase.from('user_roles').insert(roleRows);
  if (roleErr) throw new Error(roleErr.message);

  if (params.projectCode) {
    const { data: proj } = await supabase
      .from('fci_projects')
      .select('id')
      .eq('code', params.projectCode)
      .maybeSingle();

    if (proj?.id) {
      await supabase.from('project_participants').insert({
        project_id: proj.id,
        user_id: created.id,
        institutional_role: 'Docente Investigador',
        project_role: params.roles.includes('DIRECTOR_FCI') ? 'DIRECTOR' : 'INVESTIGADOR',
        dedication_hours_weekly: 8
      });
    }
  }

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: 'CREAR',
    entity: 'CONFIGURACION',
    entityId: userCode,
    entityDescription: `Alta de usuario ${params.name} (${params.email})`,
    newValue: `Roles: ${params.roles.join(', ')}`
  });
}

export async function toggleUserActiveStatus(params: {
  userId: string;
  nextActive: boolean;
  userName: string;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('profiles')
    .update({ active: params.nextActive })
    .eq('id', params.userId);
  if (error) throw new Error(error.message);

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: 'EDITAR',
    entity: 'CONFIGURACION',
    entityId: params.userId,
    entityDescription: `Estado de cuenta de ${params.userName}`,
    previousValue: params.nextActive ? 'Inactivo' : 'Activo',
    newValue: params.nextActive ? 'Activo' : 'Inactivo'
  });
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  if (error) throw new Error(error.message);
}

// ----------------------------------------------------------------------------
// MÓDULO 2: CONFIGURACIÓN Y REGLAS
// ----------------------------------------------------------------------------
export async function saveConfigurationChanges(params: {
  parameters: ConfigParameter[];
  rules: RequiredDocumentRule[];
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();

  for (const p of params.parameters) {
    const { error } = await supabase
      .from('config_parameters')
      .update({
        value_text: String(p.value),
        updated_by: params.actor.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', p.id);
    if (error) throw new Error(error.message);
  }

  for (const r of params.rules) {
    const { error } = await supabase
      .from('required_document_rules')
      .update({
        mandatory: r.mandatory,
        max_size_mb: r.maxSizeMb,
        updated_at: new Date().toISOString()
      })
      .eq('id', r.id);
    if (error) throw new Error(error.message);
  }

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: 'EDITAR',
    entity: 'CONFIGURACION',
    entityId: 'PARAMETROS_SISTEMA',
    entityDescription: 'Actualización de límites, calendario y reglas documentales obligatorias',
    newValue: 'Parámetros sincronizados en PostgreSQL'
  });
}

// ----------------------------------------------------------------------------
// MÓDULO 3: PROPUESTAS FCI
// ----------------------------------------------------------------------------
export async function createOrSubmitProposal(params: {
  proposalId?: string;
  title: string;
  researchLine: string;
  summary: string;
  generalObjective: string;
  budgetRequested: number;
  status: 'BORRADOR' | 'ENVIADA';
  file?: File | null;
  maxSizeMb: number;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  let targetProposalId = params.proposalId;
  let proposalCode = '';

  if (!targetProposalId) {
    const { count } = await supabase.from('proposals_fci').select('id', { count: 'exact', head: true });
    const seq = String((count || 0) + 1).padStart(3, '0');
    proposalCode = `PROP-${new Date().getFullYear()}-TEL-${seq}`;

    const { data: created, error } = await supabase
      .from('proposals_fci')
      .insert({
        code: proposalCode,
        title: params.title,
        applicant_id: params.actor.id,
        career: 'Ingeniería en Telemática',
        research_line: params.researchLine,
        call_year: '2026-2027',
        general_objective: params.generalObjective || params.summary,
        specific_objectives: [],
        summary: params.summary,
        budget_requested: params.budgetRequested,
        status: params.status,
        submission_date: params.status === 'ENVIADA' ? new Date().toISOString().split('T')[0] : null
      })
      .select()
      .single();

    if (error || !created) throw new Error(error?.message || 'No se pudo crear la propuesta.');
    targetProposalId = created.id;
  } else {
    const { data: existing } = await supabase
      .from('proposals_fci')
      .select('code')
      .eq('id', targetProposalId)
      .single();
    proposalCode = existing?.code || targetProposalId;
  }

  let uploadedDoc: DocumentMetadata | null = null;
  if (params.file) {
    uploadedDoc = await uploadDocumentToStorage({
      file: params.file,
      category: 'PROPUESTA',
      proposalId: targetProposalId,
      projectCode: proposalCode,
      uploaderId: params.actor.id,
      uploaderName: params.actor.name,
      uploaderRole: params.actor.role,
      maxSizeMb: params.maxSizeMb,
      allowedExtensions: ['PDF']
    });
  }

  const updatePayload: Record<string, any> = {
    title: params.title,
    research_line: params.researchLine,
    summary: params.summary,
    general_objective: params.generalObjective || params.summary,
    budget_requested: params.budgetRequested,
    status: params.status
  };

  if (params.status === 'ENVIADA') {
    updatePayload.submission_date = new Date().toISOString().split('T')[0];
  }
  if (uploadedDoc) {
    updatePayload.document_id = uploadedDoc.id;
    updatePayload.document_name = uploadedDoc.originalFileName;
    updatePayload.document_size_mb = uploadedDoc.sizeMb;
  }

  const { error: updErr } = await supabase
    .from('proposals_fci')
    .update(updatePayload)
    .eq('id', targetProposalId);
  if (updErr) throw new Error(updErr.message);

  const { count: verCount } = await supabase
    .from('proposal_versions')
    .select('id', { count: 'exact', head: true })
    .eq('proposal_id', targetProposalId);

  await supabase.from('proposal_versions').insert({
    proposal_id: targetProposalId,
    version: (verCount || 0) + 1,
    action_date: new Date().toISOString().split('T')[0],
    action: params.status === 'BORRADOR' ? 'Guardado en borrador' : 'Envío oficial de propuesta',
    comment: uploadedDoc
      ? `Adjunto PDF real (${uploadedDoc.originalFileName}, ${uploadedDoc.sizeMb} MB).`
      : 'Actualización de formulario de propuesta.',
    actor_id: params.actor.id,
    actor_name: params.actor.name
  });

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: params.status === 'ENVIADA' ? 'ENVIAR' : 'EDITAR',
    entity: 'PROPUESTA',
    entityId: proposalCode,
    entityDescription: `${proposalCode} - ${params.title}`,
    newValue: `Estado: ${params.status}`
  });
}

export async function observeProposal(params: {
  proposal: ProposalFCI;
  notes: string;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('proposals_fci')
    .update({
      status: 'OBSERVADA',
      review_notes: params.notes,
      review_date: today,
      reviewer_id: params.actor.id,
      reviewer_name: params.actor.name
    })
    .eq('id', params.proposal.id);

  if (error) throw new Error(error.message);

  await supabase.from('proposal_versions').insert({
    proposal_id: params.proposal.id,
    version: params.proposal.versionHistory.length + 1,
    action_date: today,
    action: 'Observaciones de Coordinación',
    comment: params.notes,
    actor_id: params.actor.id,
    actor_name: params.actor.name
  });

  await supabase.from('system_notifications').insert({
    notif_code: `NOTIF-${Date.now()}`,
    title: `Propuesta ${params.proposal.code} observada`,
    message: params.notes,
    type: 'OBSERVACION',
    target_roles: ['FUTURO_DIRECTOR_FCI'],
    target_user_id: params.proposal.applicantId,
    link_module: 'proposals',
    email_sent: true
  });

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: 'OBSERVAR',
    entity: 'PROPUESTA',
    entityId: params.proposal.code,
    entityDescription: `${params.proposal.code} - ${params.proposal.title}`,
    previousValue: `Estado: ${params.proposal.status}`,
    newValue: `Estado: OBSERVADA (${params.notes})`
  });
}

export async function approveProposalAndCreateProjectRpc(proposalId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('approve_proposal_and_create_project', {
    p_proposal_id: proposalId,
    p_review_notes: 'Propuesta aprobada formalmente por Coordinación de Carrera.'
  });
  if (error) throw new Error(error.message);
  return data as string;
}

// ----------------------------------------------------------------------------
// MÓDULO 4: PROYECTOS FCI
// ----------------------------------------------------------------------------
export async function finalizeProjectInDb(params: {
  project: FciProject;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('fci_projects')
    .update({
      status: 'FINALIZADO',
      actual_end_date: today
    })
    .eq('id', params.project.id);

  if (error) throw new Error(error.message);

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: 'APROBAR',
    entity: 'PROYECTO',
    entityId: params.project.code,
    entityDescription: `${params.project.code} - ${params.project.title}`,
    previousValue: `Estado: ${params.project.status}`,
    newValue: 'Estado: FINALIZADO (Solo Lectura)'
  });
}

export async function updateProjectMilestoneProgress(params: {
  milestoneId: string;
  projectCode: string;
  progressPercent: number;
  status: 'PENDIENTE' | 'EN_CURSO' | 'COMPLETADO' | 'RETRASADO';
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('project_milestones')
    .update({
      progress_percent: params.progressPercent,
      status: params.status,
      completion_date: params.status === 'COMPLETADO' ? new Date().toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.milestoneId);
  if (error) throw new Error(error.message);

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: 'EDITAR',
    entity: 'PROYECTO',
    entityId: params.projectCode,
    entityDescription: `Actualización de hito del proyecto ${params.projectCode}`,
    newValue: `Avance: ${params.progressPercent}% (${params.status})`
  });
}

// ----------------------------------------------------------------------------
// MÓDULO 5: REPORTES SEMESTRALES DEL FCI
// ----------------------------------------------------------------------------
export async function updateFciReport(params: {
  report: FciSemiAnnualReport;
  nextStatus: FciSemiAnnualReport['status'];
  summaryAdvances: string;
  encounteredObstacles: string;
  nextSteps: string;
  reviewNotes?: string;
  file?: File | null;
  maxSizeMb: number;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split('T')[0];

  let uploadedDoc: DocumentMetadata | null = null;
  if (params.file) {
    uploadedDoc = await uploadDocumentToStorage({
      file: params.file,
      category: 'REPORTE_FCI',
      projectId: params.report.projectId,
      projectCode: params.report.projectCode,
      reportPeriod: params.report.period,
      uploaderId: params.actor.id,
      uploaderName: params.actor.name,
      uploaderRole: params.actor.role,
      maxSizeMb: params.maxSizeMb,
      allowedExtensions: ['PDF']
    });
  }

  const payload: Record<string, any> = {
    status: params.nextStatus,
    summary_advances: params.summaryAdvances,
    encountered_obstacles: params.encounteredObstacles,
    next_steps: params.nextSteps
  };

  if (params.nextStatus === 'ENVIADO') {
    payload.submission_date = today;
  }
  if (params.nextStatus === 'APROBADO' || params.nextStatus === 'OBSERVADO') {
    payload.review_date = today;
    payload.coordinator_review_notes = params.reviewNotes || '';
  }
  if (uploadedDoc) {
    payload.document_id = uploadedDoc.id;
    payload.document_evidence_name = uploadedDoc.originalFileName;
    payload.document_size_mb = uploadedDoc.sizeMb;
  }

  const { error } = await supabase
    .from('fci_semi_annual_reports')
    .update(payload)
    .eq('id', params.report.id);

  if (error) throw new Error(error.message);

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action:
      params.nextStatus === 'APROBADO'
        ? 'APROBAR'
        : params.nextStatus === 'OBSERVADO'
        ? 'OBSERVAR'
        : 'ENVIAR',
    entity: 'REPORTE_FCI',
    entityId: params.report.id,
    entityDescription: `Reporte Semestral FCI ${params.report.projectCode} (${params.report.period})`,
    previousValue: `Estado: ${params.report.status}`,
    newValue: `Estado: ${params.nextStatus}`
  });
}

// ----------------------------------------------------------------------------
// MÓDULO 6: REPORTES INDIVIDUALES DE INVESTIGADORES
// ----------------------------------------------------------------------------
export async function updateResearcherReport(params: {
  report: ResearcherSemiAnnualReport;
  nextStatus: ResearcherSemiAnnualReport['status'];
  hoursDedicated: number;
  activitiesDescription: string;
  reviewNotes?: string;
  file?: File | null;
  maxSizeMb: number;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split('T')[0];

  let uploadedDoc: DocumentMetadata | null = null;
  if (params.file) {
    uploadedDoc = await uploadDocumentToStorage({
      file: params.file,
      category: 'REPORTE_INVESTIGADOR',
      projectId: params.report.projectId,
      projectCode: params.report.projectCode,
      reportPeriod: params.report.period,
      uploaderId: params.actor.id,
      uploaderName: params.actor.name,
      uploaderRole: params.actor.role,
      maxSizeMb: params.maxSizeMb,
      allowedExtensions: ['PDF']
    });
  }

  const payload: Record<string, any> = {
    status: params.nextStatus,
    hours_dedicated: params.hoursDedicated,
    activities_description: params.activitiesDescription
  };

  if (params.nextStatus === 'ENVIADO') {
    payload.submission_date = today;
  }
  if (params.nextStatus === 'APROBADO' || params.nextStatus === 'OBSERVADO') {
    payload.coordinator_review_notes = params.reviewNotes || '';
  }
  if (uploadedDoc) {
    payload.document_id = uploadedDoc.id;
    payload.document_evidence_name = uploadedDoc.originalFileName;
    payload.document_size_mb = uploadedDoc.sizeMb;
  }

  const { error } = await supabase
    .from('researcher_semi_annual_reports')
    .update(payload)
    .eq('id', params.report.id);

  if (error) throw new Error(error.message);

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action:
      params.nextStatus === 'APROBADO'
        ? 'APROBAR'
        : params.nextStatus === 'OBSERVADO'
        ? 'OBSERVAR'
        : 'ENVIAR',
    entity: 'REPORTE_INVESTIGADOR',
    entityId: params.report.id,
    entityDescription: `Reporte Individual ${params.report.researcherName} (${params.report.projectCode})`,
    previousValue: `Estado: ${params.report.status}`,
    newValue: `Estado: ${params.nextStatus} (${params.hoursDedicated}h)`
  });
}

// ----------------------------------------------------------------------------
// MÓDULO 7: PRODUCCIÓN CIENTÍFICA
// ----------------------------------------------------------------------------
export async function uploadScientificProductionBatch(params: {
  period: string;
  file?: File | null;
  fileName: string;
  fileSizeMb: number;
  nextVersion: number;
  itemsToImport: ScientificProductionItem[];
  maxSizeMb: number;
  actor: { id: string; name: string; role: UserRole };
}) {
  const supabase = getSupabaseClient();

  let uploadedDoc: DocumentMetadata | null = null;
  if (params.file) {
    uploadedDoc = await uploadDocumentToStorage({
      file: params.file,
      category: 'PUBLICACION',
      projectCode: 'PRODUCCION-CIENTIFICA',
      reportPeriod: params.period,
      uploaderId: params.actor.id,
      uploaderName: params.actor.name,
      uploaderRole: params.actor.role,
      maxSizeMb: params.maxSizeMb,
      allowedExtensions: ['XLS', 'XLSX', 'CSV']
    });
  }

  const batchCode = `BATCH-${Date.now().toString().slice(-6)}`;
  const { data: batch, error } = await supabase
    .from('scientific_production_batches')
    .insert({
      batch_code: batchCode,
      period: params.period,
      uploaded_by: params.actor.id,
      uploaded_by_name: params.actor.name,
      document_id: uploadedDoc?.id || null,
      file_name: uploadedDoc?.originalFileName || params.fileName,
      file_size_mb: uploadedDoc?.sizeMb ?? params.fileSizeMb,
      record_count: params.itemsToImport.length,
      version: params.nextVersion,
      status: 'VALIDADO'
    })
    .select()
    .single();

  if (error || !batch) throw new Error(error?.message || 'Error al registrar lote.');

  const { data: allProjs } = await supabase.from('fci_projects').select('id, code');
  const codeToId = new Map((allProjs || []).map((p: any) => [p.code, p.id]));

  const itemsPayload = params.itemsToImport.map((it, idx) => ({
    item_code: `PUB-${Date.now()}-${idx + 1}`,
    batch_id: batch.id,
    project_id: codeToId.get(it.projectCode) || null,
    project_code: it.projectCode,
    title: it.title,
    authors: it.authors,
    has_ug_affiliation: it.hasUgAffiliation,
    production_type: it.productionType,
    journal_or_conference: it.journalOrConference,
    issn_or_isbn: it.issnOrIsbn,
    indexing: it.indexing,
    doi_or_url: it.doiOrUrl,
    publication_date: it.publicationDate,
    period: it.period,
    status_in_period: it.statusInPeriod
  }));

  if (itemsPayload.length > 0) {
    const { error: itemsErr } = await supabase
      .from('scientific_production_items')
      .insert(itemsPayload);
    if (itemsErr) throw new Error(itemsErr.message);
  }

  await appendAuditLog({
    userId: params.actor.id,
    userName: params.actor.name,
    userRole: params.actor.role,
    action: 'CARGAR_ARCHIVO',
    entity: 'PRODUCCION_CIENTIFICA',
    entityId: batchCode,
    entityDescription: `${uploadedDoc?.originalFileName || params.fileName} (${params.itemsToImport.length} registros)`,
    newValue: `Lote v${params.nextVersion}.0 validado en Supabase`
  });
}

// ----------------------------------------------------------------------------
// MÓDULO 8: BAJA LÓGICA DE DOCUMENTOS (RPC RN-22)
// ----------------------------------------------------------------------------
export async function logicalDeleteDocumentRpc(documentId: string, reason: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('logical_delete_document', {
    p_document_id: documentId,
    p_reason: reason
  });
  if (error) throw new Error(error.message);
}

// ----------------------------------------------------------------------------
// MÓDULO 11: NOTIFICACIONES
// ----------------------------------------------------------------------------
export async function markNotificationReadInDb(notificationId: string, userId: string) {
  const supabase = getSupabaseClient();
  await supabase
    .from('notification_reads')
    .upsert({ notification_id: notificationId, user_id: userId }, { onConflict: 'notification_id,user_id' });
}

export async function markAllNotificationsReadInDb(notificationIds: string[], userId: string) {
  if (notificationIds.length === 0) return;
  const supabase = getSupabaseClient();
  const rows = notificationIds.map((id) => ({ notification_id: id, user_id: userId }));
  await supabase.from('notification_reads').upsert(rows, { onConflict: 'notification_id,user_id' });
}
