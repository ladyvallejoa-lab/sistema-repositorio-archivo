-- ============================================================================
-- UG-Investiga FCI | Facultad de Ingeniería Industrial - Universidad de Guayaquil
-- Migración 001: Esquema Relacional PostgreSQL (Tablas, Claves, Índices y Check)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PERFILES Y ROLES DE USUARIO (Vinculados a Supabase Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code text UNIQUE NOT NULL,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  career text NOT NULL DEFAULT 'Ingeniería en Telemática',
  faculty text NOT NULL DEFAULT 'Facultad de Ingeniería Industrial',
  active boolean NOT NULL DEFAULT true,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (
    role IN (
      'ADMINISTRADOR',
      'COORDINADOR_CARRERA',
      'GESTOR_CONOCIMIENTO',
      'DIRECTOR_FCI',
      'FUTURO_DIRECTOR_FCI',
      'DOCENTE_INVESTIGADOR_FCI'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ----------------------------------------------------------------------------
-- 2. CONFIGURACIÓN Y REGLAS DOCUMENTALES OBLIGATORIAS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.config_parameters (
  id text PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (
    category IN ('LIMITES_ARCHIVO', 'CALENDARIO', 'PERIODOS', 'CATALOGOS')
  ),
  value_text text NOT NULL,
  value_type text NOT NULL DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean')),
  unit text,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.required_document_rules (
  id text PRIMARY KEY,
  document_type text NOT NULL,
  project_stage text NOT NULL CHECK (
    project_stage IN (
      'PROPUESTA',
      'INICIO_PROYECTO',
      'SEMESTRAL_FCI',
      'SEMESTRAL_INVESTIGADOR',
      'CIERRE_FINAL'
    )
  ),
  mandatory boolean NOT NULL DEFAULT true,
  max_size_mb numeric(6, 2) NOT NULL CHECK (max_size_mb > 0),
  allowed_formats text[] NOT NULL DEFAULT ARRAY['PDF'],
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. PROPUESTAS FCI Y VERSIONES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposals_fci (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  applicant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  career text NOT NULL DEFAULT 'Ingeniería en Telemática',
  research_line text NOT NULL,
  call_year text NOT NULL DEFAULT '2026-2027',
  general_objective text NOT NULL,
  specific_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text NOT NULL,
  budget_requested numeric(12, 2) NOT NULL DEFAULT 0 CHECK (budget_requested >= 0),
  document_id uuid,
  document_name text,
  document_size_mb numeric(6, 2),
  status text NOT NULL DEFAULT 'BORRADOR' CHECK (
    status IN ('BORRADOR', 'ENVIADA', 'EN_REVISION', 'OBSERVADA', 'APROBADA', 'RECHAZADA')
  ),
  submission_date date,
  review_notes text,
  review_date date,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.proposal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals_fci(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version >= 1),
  action_date date NOT NULL DEFAULT CURRENT_DATE,
  action text NOT NULL,
  comment text NOT NULL,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_applicant ON public.proposals_fci(applicant_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals_fci(status);
CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal ON public.proposal_versions(proposal_id);

-- ----------------------------------------------------------------------------
-- 4. PROYECTOS FCI, PARTICIPANTES E HITOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fci_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  proposal_id uuid UNIQUE REFERENCES public.proposals_fci(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  general_objective text NOT NULL,
  specific_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  research_line text NOT NULL,
  career text NOT NULL DEFAULT 'Ingeniería en Telemática',
  faculty text NOT NULL DEFAULT 'Facultad de Ingeniería Industrial',
  academic_period text NOT NULL,
  start_date date NOT NULL,
  estimated_end_date date NOT NULL,
  actual_end_date date,
  status text NOT NULL DEFAULT 'EN_FORMULACION' CHECK (
    status IN ('EN_FORMULACION', 'APROBADO', 'EN_EJECUCION', 'FINALIZADO', 'CANCELADO')
  ),
  budget_assigned numeric(12, 2) NOT NULL DEFAULT 0 CHECK (budget_assigned >= 0),
  budget_executed numeric(12, 2) NOT NULL DEFAULT 0 CHECK (budget_executed >= 0),
  document_completeness_percent integer NOT NULL DEFAULT 0 CHECK (
    document_completeness_percent BETWEEN 0 AND 100
  ),
  current_semester integer NOT NULL DEFAULT 1 CHECK (current_semester >= 1),
  total_semesters integer NOT NULL DEFAULT 3 CHECK (total_semesters >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.fci_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  institutional_role text NOT NULL DEFAULT 'Docente Investigador',
  project_role text NOT NULL CHECK (
    project_role IN ('DIRECTOR', 'COINVESTIGADOR', 'INVESTIGADOR', 'AUXILIAR_ESTUDIANTE')
  ),
  dedication_hours_weekly integer NOT NULL DEFAULT 8 CHECK (dedication_hours_weekly >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.fci_projects(id) ON DELETE CASCADE,
  milestone_code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  target_date date NOT NULL,
  completion_date date,
  progress_percent integer NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'PENDIENTE' CHECK (
    status IN ('PENDIENTE', 'EN_CURSO', 'COMPLETADO', 'RETRASADO')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, milestone_code)
);

CREATE INDEX IF NOT EXISTS idx_projects_code ON public.fci_projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.fci_projects(status);
CREATE INDEX IF NOT EXISTS idx_participants_project ON public.project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON public.project_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON public.project_milestones(project_id);

-- ----------------------------------------------------------------------------
-- 5. REPOSITORIO DOCUMENTAL Y DICTÁMENES DE VALIDACIÓN ACTIVA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_code text UNIQUE NOT NULL,
  project_id uuid REFERENCES public.fci_projects(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES public.proposals_fci(id) ON DELETE CASCADE,
  storage_bucket text NOT NULL DEFAULT 'fci-documents',
  storage_path text,
  name text NOT NULL,
  original_file_name text NOT NULL,
  category text NOT NULL CHECK (
    category IN (
      'PROPUESTA',
      'REPORTE_FCI',
      'REPORTE_INVESTIGADOR',
      'EVIDENCIA_TECNICA',
      'PUBLICACION',
      'ACTA_CIERRE'
    )
  ),
  file_type text NOT NULL,
  mime_type text,
  size_mb numeric(8, 2) NOT NULL CHECK (size_mb >= 0),
  checksum_sha256 text,
  upload_date date NOT NULL DEFAULT CURRENT_DATE,
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploader_name text NOT NULL,
  uploader_role text NOT NULL,
  report_period text,
  version text NOT NULL DEFAULT '1.0',
  is_latest boolean NOT NULL DEFAULT true,
  confidentiality text NOT NULL DEFAULT 'PUBLICO_UG' CHECK (
    confidentiality IN ('PUBLICO_UG', 'RESTRINGIDO_CARRERA', 'CONFIDENCIAL_FCI')
  ),
  active boolean NOT NULL DEFAULT true,
  deletion_reason text,
  deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_by_name text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  rule_code text NOT NULL,
  rule_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('ACEPTADO', 'CON_ADVERTENCIA', 'RECHAZADO')),
  message text NOT NULL,
  validated_at text NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.milestone_documents (
  milestone_id uuid NOT NULL REFERENCES public.project_milestones(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  PRIMARY KEY (milestone_id, document_id)
);

ALTER TABLE public.proposals_fci
  DROP CONSTRAINT IF EXISTS fk_proposals_document;
ALTER TABLE public.proposals_fci
  ADD CONSTRAINT fk_proposals_document
  FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_proposal ON public.documents(proposal_id);
CREATE INDEX IF NOT EXISTS idx_documents_active ON public.documents(active);
CREATE INDEX IF NOT EXISTS idx_documents_checksum ON public.documents(checksum_sha256);
CREATE INDEX IF NOT EXISTS idx_doc_validations_doc ON public.document_validations(document_id);

-- ----------------------------------------------------------------------------
-- 6. REPORTES SEMESTRALES FCI E INDIVIDUALES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fci_semi_annual_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code text UNIQUE NOT NULL,
  project_id uuid NOT NULL REFERENCES public.fci_projects(id) ON DELETE CASCADE,
  director_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  period text NOT NULL,
  semester_number integer NOT NULL CHECK (semester_number >= 1),
  summary_advances text NOT NULL DEFAULT '',
  achieved_milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  encountered_obstacles text NOT NULL DEFAULT '',
  next_steps text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'BORRADOR' CHECK (
    status IN ('PENDIENTE', 'BORRADOR', 'ENVIADO', 'EN_REVISION', 'OBSERVADO', 'APROBADO')
  ),
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  document_evidence_name text,
  document_size_mb numeric(6, 2),
  submission_date date,
  review_date date,
  coordinator_review_notes text,
  deadline_date date NOT NULL,
  is_overdue boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, period)
);

CREATE TABLE IF NOT EXISTS public.researcher_semi_annual_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code text UNIQUE NOT NULL,
  project_id uuid NOT NULL REFERENCES public.fci_projects(id) ON DELETE CASCADE,
  researcher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  period text NOT NULL,
  hours_dedicated integer NOT NULL DEFAULT 0 CHECK (hours_dedicated >= 0),
  activities_description text NOT NULL DEFAULT '',
  delivered_products jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'PENDIENTE' CHECK (
    status IN ('PENDIENTE', 'BORRADOR', 'ENVIADO', 'EN_REVISION', 'OBSERVADO', 'APROBADO')
  ),
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  document_evidence_name text,
  document_size_mb numeric(6, 2),
  submission_date date,
  coordinator_review_notes text,
  deadline_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, researcher_id, period)
);

CREATE INDEX IF NOT EXISTS idx_fci_reports_project ON public.fci_semi_annual_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_fci_reports_director ON public.fci_semi_annual_reports(director_id);
CREATE INDEX IF NOT EXISTS idx_res_reports_project ON public.researcher_semi_annual_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_res_reports_researcher ON public.researcher_semi_annual_reports(researcher_id);

-- ----------------------------------------------------------------------------
-- 7. PRODUCCIÓN CIENTÍFICA CONSOLIDADA
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scientific_production_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code text UNIQUE NOT NULL,
  period text NOT NULL,
  upload_date timestamptz NOT NULL DEFAULT now(),
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_name text NOT NULL,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_size_mb numeric(6, 2) NOT NULL CHECK (file_size_mb >= 0),
  record_count integer NOT NULL DEFAULT 0 CHECK (record_count >= 0),
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'VALIDADO' CHECK (status IN ('VALIDADO', 'CON_OBSERVACIONES')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scientific_production_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  batch_id uuid NOT NULL REFERENCES public.scientific_production_batches(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.fci_projects(id) ON DELETE SET NULL,
  project_code text NOT NULL,
  title text NOT NULL,
  authors text NOT NULL,
  has_ug_affiliation boolean NOT NULL DEFAULT true,
  production_type text NOT NULL CHECK (
    production_type IN (
      'ARTICULO_SCOPUS',
      'ARTICULO_WOS',
      'ARTICULO_LATINDEX',
      'PONENCIA_CONGRESO',
      'LIBRO_CAPITULO',
      'PATENTE'
    )
  ),
  journal_or_conference text NOT NULL,
  issn_or_isbn text NOT NULL DEFAULT '',
  indexing text NOT NULL,
  doi_or_url text NOT NULL DEFAULT '',
  publication_date date NOT NULL,
  period text NOT NULL,
  status_in_period text NOT NULL DEFAULT 'PUBLICADO' CHECK (
    status_in_period IN ('PUBLICADO', 'ACEPTADO')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sci_items_batch ON public.scientific_production_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_sci_items_project ON public.scientific_production_items(project_id);

-- ----------------------------------------------------------------------------
-- 8. AUDITORÍA INMUTABLE (APPEND-ONLY) Y NOTIFICACIONES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_code text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  user_role text NOT NULL,
  action text NOT NULL CHECK (
    action IN (
      'CREAR',
      'EDITAR',
      'ENVIAR',
      'OBSERVAR',
      'APROBAR',
      'RECHAZAR',
      'ELIMINAR_LOGICO',
      'CARGAR_ARCHIVO'
    )
  ),
  entity text NOT NULL CHECK (
    entity IN (
      'PROPUESTA',
      'PROYECTO',
      'REPORTE_FCI',
      'REPORTE_INVESTIGADOR',
      'DOCUMENTO',
      'CONFIGURACION',
      'PRODUCCION_CIENTIFICA'
    )
  ),
  entity_id text NOT NULL,
  entity_description text NOT NULL,
  previous_value text,
  new_value text,
  ip_address text NOT NULL DEFAULT 'Web Client'
);

CREATE TABLE IF NOT EXISTS public.system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notif_code text UNIQUE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (
    type IN (
      'RECORDATORIO',
      'VENCIMIENTO',
      'OBSERVACION',
      'APROBACION',
      'ENVIO',
      'ALERTA_DOCUMENTAL'
    )
  ),
  target_roles text[] NOT NULL DEFAULT ARRAY[]::text[],
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  link_module text,
  email_sent boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.notification_reads (
  notification_id uuid NOT NULL REFERENCES public.system_notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.system_notifications(created_at DESC);
