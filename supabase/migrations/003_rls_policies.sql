-- ============================================================================
-- UG-Investiga FCI | Facultad de Ingeniería Industrial - Universidad de Guayaquil
-- Migración 003: Políticas de Seguridad a Nivel de Fila (Row Level Security - RLS)
-- ============================================================================

-- Permisos base de esquema, tablas, secuencias y funciones para roles de Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Refuerzo a nivel de privilegios SQL (RN-21 y RN-22)
REVOKE DELETE ON public.documents FROM authenticated;
REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO authenticated;

-- Habilitar RLS en TODAS las tablas del sistema
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_document_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals_fci ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fci_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fci_semi_annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researcher_semi_annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scientific_production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scientific_production_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. PROFILES Y USER_ROLES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR active = true
  );

DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role('ADMINISTRADOR'));

DROP POLICY IF EXISTS "profiles_update_admin_or_self" ON public.profiles;
CREATE POLICY "profiles_update_admin_or_self"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role('ADMINISTRADOR') OR auth_user_id = auth.uid())
  WITH CHECK (public.has_role('ADMINISTRADOR') OR auth_user_id = auth.uid());

DROP POLICY IF EXISTS "user_roles_select_authenticated" ON public.user_roles;
CREATE POLICY "user_roles_select_authenticated"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
CREATE POLICY "user_roles_admin_manage"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role('ADMINISTRADOR'))
  WITH CHECK (public.has_role('ADMINISTRADOR'));

-- ----------------------------------------------------------------------------
-- 2. CONFIG_PARAMETERS Y REQUIRED_DOCUMENT_RULES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "config_params_select" ON public.config_parameters;
CREATE POLICY "config_params_select"
  ON public.config_parameters FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "config_params_admin_write" ON public.config_parameters;
CREATE POLICY "config_params_admin_write"
  ON public.config_parameters FOR ALL
  TO authenticated
  USING (public.has_role('ADMINISTRADOR'))
  WITH CHECK (public.has_role('ADMINISTRADOR'));

DROP POLICY IF EXISTS "required_rules_select" ON public.required_document_rules;
CREATE POLICY "required_rules_select"
  ON public.required_document_rules FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "required_rules_admin_write" ON public.required_document_rules;
CREATE POLICY "required_rules_admin_write"
  ON public.required_document_rules FOR ALL
  TO authenticated
  USING (public.has_role('ADMINISTRADOR'))
  WITH CHECK (public.has_role('ADMINISTRADOR'));

-- ----------------------------------------------------------------------------
-- 3. PROPOSALS_FCI Y PROPOSAL_VERSIONS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "proposals_select_authorized" ON public.proposals_fci;
CREATE POLICY "proposals_select_authorized"
  ON public.proposals_fci FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR applicant_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS "proposals_insert_postulant" ON public.proposals_fci;
CREATE POLICY "proposals_insert_postulant"
  ON public.proposals_fci FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role('ADMINISTRADOR')
    OR (
      applicant_id = public.current_profile_id()
      AND public.has_any_role(ARRAY['FUTURO_DIRECTOR_FCI', 'DOCENTE_INVESTIGADOR_FCI', 'DIRECTOR_FCI'])
    )
  );

DROP POLICY IF EXISTS "proposals_update_authorized" ON public.proposals_fci;
CREATE POLICY "proposals_update_authorized"
  ON public.proposals_fci FOR UPDATE
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR (
      applicant_id = public.current_profile_id()
      AND status IN ('BORRADOR', 'OBSERVADA')
    )
  )
  WITH CHECK (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR applicant_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS "proposal_versions_select" ON public.proposal_versions;
CREATE POLICY "proposal_versions_select"
  ON public.proposal_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals_fci pr
      WHERE pr.id = proposal_versions.proposal_id
        AND (
          public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
          OR pr.applicant_id = public.current_profile_id()
        )
    )
  );

DROP POLICY IF EXISTS "proposal_versions_insert" ON public.proposal_versions;
CREATE POLICY "proposal_versions_insert"
  ON public.proposal_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = public.current_profile_id()
    OR public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
  );

-- ----------------------------------------------------------------------------
-- 4. FCI_PROJECTS, PARTICIPANTS Y MILESTONES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "projects_select_authorized" ON public.fci_projects;
CREATE POLICY "projects_select_authorized"
  ON public.fci_projects FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR public.is_project_member(id)
  );

DROP POLICY IF EXISTS "projects_insert_coord_admin" ON public.fci_projects;
CREATE POLICY "projects_insert_coord_admin"
  ON public.fci_projects FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA']));

DROP POLICY IF EXISTS "projects_update_authorized" ON public.fci_projects;
CREATE POLICY "projects_update_authorized"
  ON public.fci_projects FOR UPDATE
  TO authenticated
  USING (
    status NOT IN ('FINALIZADO', 'CANCELADO')
    AND (
      public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
      OR public.is_project_director(id)
    )
  );

DROP POLICY IF EXISTS "participants_select" ON public.project_participants;
CREATE POLICY "participants_select"
  ON public.project_participants FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR public.is_project_member(project_id)
  );

DROP POLICY IF EXISTS "participants_manage" ON public.project_participants;
CREATE POLICY "participants_manage"
  ON public.project_participants FOR ALL
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR public.is_project_director(project_id)
  )
  WITH CHECK (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR public.is_project_director(project_id)
  );

DROP POLICY IF EXISTS "milestones_select" ON public.project_milestones;
CREATE POLICY "milestones_select"
  ON public.project_milestones FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR public.is_project_member(project_id)
  );

DROP POLICY IF EXISTS "milestones_manage" ON public.project_milestones;
CREATE POLICY "milestones_manage"
  ON public.project_milestones FOR ALL
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR public.is_project_director(project_id)
  )
  WITH CHECK (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR public.is_project_director(project_id)
  );

-- ----------------------------------------------------------------------------
-- 5. DOCUMENTS, VALIDATIONS Y MILESTONE_DOCUMENTS (RN-22: Sin DELETE físico)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "documents_select_authorized" ON public.documents;
CREATE POLICY "documents_select_authorized"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR uploader_id = public.current_profile_id()
    OR (project_id IS NOT NULL AND public.is_project_member(project_id))
    OR (
      proposal_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.proposals_fci pr
        WHERE pr.id = documents.proposal_id AND pr.applicant_id = public.current_profile_id()
      )
    )
  );

DROP POLICY IF EXISTS "documents_insert_authenticated" ON public.documents;
CREATE POLICY "documents_insert_authenticated"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_profile_id() IS NOT NULL
    AND (uploader_id = public.current_profile_id() OR public.has_role('ADMINISTRADOR'))
  );

DROP POLICY IF EXISTS "documents_update_logical_delete" ON public.documents;
CREATE POLICY "documents_update_logical_delete"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA']))
  WITH CHECK (public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA']));

DROP POLICY IF EXISTS "doc_validations_select" ON public.document_validations;
CREATE POLICY "doc_validations_select"
  ON public.document_validations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_validations.document_id
    )
  );

DROP POLICY IF EXISTS "doc_validations_insert" ON public.document_validations;
CREATE POLICY "doc_validations_insert"
  ON public.document_validations FOR INSERT
  TO authenticated
  WITH CHECK (public.current_profile_id() IS NOT NULL);

DROP POLICY IF EXISTS "milestone_docs_select" ON public.milestone_documents;
CREATE POLICY "milestone_docs_select"
  ON public.milestone_documents FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "milestone_docs_manage" ON public.milestone_documents;
CREATE POLICY "milestone_docs_manage"
  ON public.milestone_documents FOR ALL
  TO authenticated
  USING (public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'DIRECTOR_FCI']))
  WITH CHECK (public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'DIRECTOR_FCI']));

-- ----------------------------------------------------------------------------
-- 6. REPORTES SEMESTRALES FCI E INVESTIGADORES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "fci_reports_select" ON public.fci_semi_annual_reports;
CREATE POLICY "fci_reports_select"
  ON public.fci_semi_annual_reports FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR public.is_project_member(project_id)
  );

DROP POLICY IF EXISTS "fci_reports_insert" ON public.fci_semi_annual_reports;
CREATE POLICY "fci_reports_insert"
  ON public.fci_semi_annual_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR public.is_project_director(project_id)
  );

DROP POLICY IF EXISTS "fci_reports_update" ON public.fci_semi_annual_reports;
CREATE POLICY "fci_reports_update"
  ON public.fci_semi_annual_reports FOR UPDATE
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR (
      director_id = public.current_profile_id()
      AND status IN ('PENDIENTE', 'BORRADOR', 'OBSERVADO')
    )
  )
  WITH CHECK (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR director_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS "researcher_reports_select" ON public.researcher_semi_annual_reports;
CREATE POLICY "researcher_reports_select"
  ON public.researcher_semi_annual_reports FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR public.is_project_director(project_id)
    OR researcher_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS "researcher_reports_insert" ON public.researcher_semi_annual_reports;
CREATE POLICY "researcher_reports_insert"
  ON public.researcher_semi_annual_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR (researcher_id = public.current_profile_id() AND public.is_project_member(project_id))
  );

DROP POLICY IF EXISTS "researcher_reports_update" ON public.researcher_semi_annual_reports;
CREATE POLICY "researcher_reports_update"
  ON public.researcher_semi_annual_reports FOR UPDATE
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR public.is_project_director(project_id)
    OR (
      researcher_id = public.current_profile_id()
      AND status IN ('PENDIENTE', 'BORRADOR', 'OBSERVADO')
    )
  )
  WITH CHECK (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR public.is_project_director(project_id)
    OR researcher_id = public.current_profile_id()
  );

-- ----------------------------------------------------------------------------
-- 7. PRODUCCIÓN CIENTÍFICA
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "sci_batches_select" ON public.scientific_production_batches;
CREATE POLICY "sci_batches_select"
  ON public.scientific_production_batches FOR SELECT
  TO authenticated
  USING (public.current_profile_id() IS NOT NULL);

DROP POLICY IF EXISTS "sci_batches_write" ON public.scientific_production_batches;
CREATE POLICY "sci_batches_write"
  ON public.scientific_production_batches FOR ALL
  TO authenticated
  USING (public.has_any_role(ARRAY['ADMINISTRADOR', 'GESTOR_CONOCIMIENTO']))
  WITH CHECK (public.has_any_role(ARRAY['ADMINISTRADOR', 'GESTOR_CONOCIMIENTO']));

DROP POLICY IF EXISTS "sci_items_select" ON public.scientific_production_items;
CREATE POLICY "sci_items_select"
  ON public.scientific_production_items FOR SELECT
  TO authenticated
  USING (public.current_profile_id() IS NOT NULL);

DROP POLICY IF EXISTS "sci_items_write" ON public.scientific_production_items;
CREATE POLICY "sci_items_write"
  ON public.scientific_production_items FOR ALL
  TO authenticated
  USING (public.has_any_role(ARRAY['ADMINISTRADOR', 'GESTOR_CONOCIMIENTO']))
  WITH CHECK (public.has_any_role(ARRAY['ADMINISTRADOR', 'GESTOR_CONOCIMIENTO']));

-- ----------------------------------------------------------------------------
-- 8. AUDITORÍA INMUTABLE (RN-21: Solo SELECT e INSERT, jamás UPDATE/DELETE)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
    OR user_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS "audit_logs_insert_append_only" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_append_only"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_profile_id() IS NOT NULL
    AND user_id = public.current_profile_id()
  );

-- ----------------------------------------------------------------------------
-- 9. NOTIFICACIONES Y ESTADO DE LECTURA
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_select" ON public.system_notifications;
CREATE POLICY "notifications_select"
  ON public.system_notifications FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA'])
    OR target_user_id = public.current_profile_id()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = public.current_profile_id()
        AND ur.role = ANY(system_notifications.target_roles)
    )
  );

DROP POLICY IF EXISTS "notifications_insert" ON public.system_notifications;
CREATE POLICY "notifications_insert"
  ON public.system_notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.current_profile_id() IS NOT NULL);

DROP POLICY IF EXISTS "notification_reads_own" ON public.notification_reads;
CREATE POLICY "notification_reads_own"
  ON public.notification_reads FOR ALL
  TO authenticated
  USING (user_id = public.current_profile_id())
  WITH CHECK (user_id = public.current_profile_id());
