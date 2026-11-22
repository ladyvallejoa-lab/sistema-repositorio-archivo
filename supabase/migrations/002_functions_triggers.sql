-- ============================================================================
-- UG-Investiga FCI | Facultad de Ingeniería Industrial - Universidad de Guayaquil
-- Migración 002: Funciones Auxiliares RLS, Triggers y RPCs Transaccionales
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ACTUALIZACIÓN AUTOMÁTICA DE updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_proposals_updated_at ON public.proposals_fci;
CREATE TRIGGER trg_proposals_updated_at
  BEFORE UPDATE ON public.proposals_fci
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.fci_projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.fci_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_fci_reports_updated_at ON public.fci_semi_annual_reports;
CREATE TRIGGER trg_fci_reports_updated_at
  BEFORE UPDATE ON public.fci_semi_annual_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_res_reports_updated_at ON public.researcher_semi_annual_reports;
CREATE TRIGGER trg_res_reports_updated_at
  BEFORE UPDATE ON public.researcher_semi_annual_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. FUNCIONES HELPER DE SEGURIDAD (SECURITY DEFINER para RLS sin recursión)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.profiles
  WHERE auth_user_id = auth.uid()
    AND active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(target_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth.uid()
      AND p.active = true
      AND ur.role = target_role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(target_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth.uid()
      AND p.active = true
      AND ur.role = ANY(target_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(target_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_participants pp
    JOIN public.profiles p ON p.id = pp.user_id
    WHERE pp.project_id = target_project_id
      AND p.auth_user_id = auth.uid()
      AND p.active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_director(target_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_participants pp
    JOIN public.profiles p ON p.id = pp.user_id
    WHERE pp.project_id = target_project_id
      AND pp.project_role = 'DIRECTOR'
      AND p.auth_user_id = auth.uid()
      AND p.active = true
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. SINCRONIZACIÓN AUTOMÁTICA CON SUPABASE AUTH (auth.users -> public.profiles)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_profile_id uuid;
  v_full_name text;
  v_next_code text;
BEGIN
  -- Verificar si el usuario ya estaba pre-registrado en profiles por correo institucional
  SELECT id INTO v_existing_profile_id
  FROM public.profiles
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF v_existing_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET auth_user_id = NEW.id
    WHERE id = v_existing_profile_id;
    RETURN NEW;
  END IF;

  -- Si no existía, crear perfil nuevo (valida formato de correo electrónico)
  IF lower(NEW.email) !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' THEN
    RAISE EXCEPTION 'Formato de correo electrónico inválido.';
  END IF;

  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    initcap(replace(split_part(NEW.email, '@', 1), '.', ' '))
  );

  v_next_code := 'USR-' || lpad(
    (COALESCE((SELECT count(*) FROM public.profiles), 0) + 1)::text,
    3,
    '0'
  );

  INSERT INTO public.profiles (
    user_code,
    auth_user_id,
    full_name,
    email,
    career,
    faculty,
    active
  )
  VALUES (
    v_next_code,
    NEW.id,
    v_full_name,
    lower(NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'career', 'Ingeniería en Telemática'),
    'Facultad de Ingeniería Industrial',
    true
  )
  RETURNING id INTO v_existing_profile_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_existing_profile_id, 'DOCENTE_INVESTIGADOR_FCI')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. BLOQUEO DE EDICIÓN EN PROYECTOS FINALIZADOS / CANCELADOS (Solo Lectura)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_closed_project_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('FINALIZADO', 'CANCELADO') THEN
    RAISE EXCEPTION 'Regla de Cierre: El proyecto % está en estado % (Solo Lectura) y no puede modificarse.', OLD.code, OLD.status;
  END IF;

  IF NEW.status = 'FINALIZADO' AND OLD.document_completeness_percent < 100 THEN
    RAISE EXCEPTION 'Regla RN-10: No se puede finalizar el proyecto % con completitud documental inferior al 100%% (% actual).', OLD.code, OLD.document_completeness_percent;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_closed_project_mutation ON public.fci_projects;
CREATE TRIGGER trg_prevent_closed_project_mutation
  BEFORE UPDATE ON public.fci_projects
  FOR EACH ROW EXECUTE FUNCTION public.prevent_closed_project_mutation();

-- ----------------------------------------------------------------------------
-- 5. RPC RF-11: APROBAR PROPUESTA Y CREAR PROYECTO FCI ATÓMICAMENTE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_proposal_and_create_project(
  p_proposal_id uuid,
  p_review_notes text DEFAULT 'Propuesta aprobada por Coordinación de Carrera.'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_name text;
  v_prop public.proposals_fci%ROWTYPE;
  v_applicant public.profiles%ROWTYPE;
  v_project_id uuid;
  v_project_code text;
  v_seq integer;
  v_doc_id uuid;
BEGIN
  v_actor_id := public.current_profile_id();
  IF v_actor_id IS NULL OR NOT public.has_any_role(ARRAY['COORDINADOR_CARRERA', 'ADMINISTRADOR']) THEN
    RAISE EXCEPTION 'No autorizado: Solo Coordinación de Carrera o Administrador puede aprobar propuestas.';
  END IF;

  SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = v_actor_id;

  SELECT * INTO v_prop FROM public.proposals_fci WHERE id = p_proposal_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Propuesta no encontrada.';
  END IF;

  IF v_prop.status = 'APROBADA' THEN
    SELECT id INTO v_project_id FROM public.fci_projects WHERE proposal_id = p_proposal_id;
    RETURN v_project_id;
  END IF;

  SELECT * INTO v_applicant FROM public.profiles WHERE id = v_prop.applicant_id;

  -- Actualizar estado de la propuesta
  UPDATE public.proposals_fci
  SET
    status = 'APROBADA',
    review_date = CURRENT_DATE,
    reviewer_id = v_actor_id,
    reviewer_name = v_actor_name,
    review_notes = COALESCE(p_review_notes, review_notes)
  WHERE id = p_proposal_id;

  INSERT INTO public.proposal_versions (
    proposal_id, version, action_date, action, comment, actor_id, actor_name
  )
  VALUES (
    p_proposal_id,
    COALESCE((SELECT max(version) FROM public.proposal_versions WHERE proposal_id = p_proposal_id), 0) + 1,
    CURRENT_DATE,
    'Aprobación oficial de propuesta',
    COALESCE(p_review_notes, 'Propuesta aprobada y convertida automáticamente en proyecto FCI.'),
    v_actor_id,
    v_actor_name
  );

  -- Generar código secuencial del nuevo proyecto
  SELECT count(*) + 1 INTO v_seq FROM public.fci_projects;
  v_project_code := 'FCI-' || to_char(CURRENT_DATE, 'YYYY') || '-TEL-' || lpad(v_seq::text, 3, '0');

  INSERT INTO public.fci_projects (
    code,
    proposal_id,
    title,
    description,
    general_objective,
    specific_objectives,
    keywords,
    research_line,
    career,
    faculty,
    academic_period,
    start_date,
    estimated_end_date,
    status,
    budget_assigned,
    budget_executed,
    document_completeness_percent,
    current_semester,
    total_semesters
  )
  VALUES (
    v_project_code,
    v_prop.id,
    v_prop.title,
    v_prop.summary,
    v_prop.general_objective,
    v_prop.specific_objectives,
    ARRAY['Telemática', 'Investigación FCI', 'UG'],
    v_prop.research_line,
    v_prop.career,
    'Facultad de Ingeniería Industrial',
    v_prop.call_year,
    CURRENT_DATE,
    (CURRENT_DATE + interval '18 months')::date,
    'APROBADO',
    v_prop.budget_requested,
    0,
    40,
    1,
    3
  )
  RETURNING id INTO v_project_id;

  -- Asignar al postulante como Director del nuevo proyecto y otorgarle rol DIRECTOR_FCI
  INSERT INTO public.project_participants (
    project_id, user_id, institutional_role, project_role, dedication_hours_weekly
  )
  VALUES (
    v_project_id, v_applicant.id, 'Docente Titular Agregado', 'DIRECTOR', 10
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_applicant.id, 'DIRECTOR_FCI')
  ON CONFLICT DO NOTHING;

  -- Hito inicial precargado
  INSERT INTO public.project_milestones (
    project_id, milestone_code, title, description, target_date, progress_percent, status
  )
  VALUES (
    v_project_id,
    'M-' || lpad((v_seq * 100 + 1)::text, 3, '0'),
    'Conformación de equipo y arranque metodológico',
    'Validación inicial de cronograma, actas de compromiso y planificación técnica.',
    (CURRENT_DATE + interval '45 days')::date,
    0,
    'PENDIENTE'
  );

  -- Vincular documento de la propuesta al expediente del proyecto
  IF v_prop.document_id IS NOT NULL THEN
    UPDATE public.documents
    SET project_id = v_project_id
    WHERE id = v_prop.document_id;
  ELSE
    INSERT INTO public.documents (
      doc_code, project_id, proposal_id, name, original_file_name, category,
      file_type, size_mb, uploader_id, uploader_name, uploader_role, version, is_latest, confidentiality
    )
    VALUES (
      'DOC-' || upper(substr(gen_random_uuid()::text, 1, 8)),
      v_project_id,
      v_prop.id,
      'Propuesta_Oficial_Aprobada_' || v_project_code || '.pdf',
      COALESCE(v_prop.document_name, 'Propuesta_Aprobada.pdf'),
      'PROPUESTA',
      'PDF',
      COALESCE(v_prop.document_size_mb, 5.0),
      v_applicant.id,
      v_applicant.full_name,
      'FUTURO_DIRECTOR_FCI',
      '1.0',
      true,
      'PUBLICO_UG'
    )
    RETURNING id INTO v_doc_id;
  END IF;

  -- Registrar en auditoría inmutable
  INSERT INTO public.audit_logs (
    log_code, user_id, user_name, user_role, action, entity, entity_id,
    entity_description, previous_value, new_value
  )
  VALUES (
    'AUD-' || floor(extract(epoch from now()) * 1000)::text,
    v_actor_id,
    v_actor_name,
    'COORDINADOR_CARRERA',
    'APROBAR',
    'PROPUESTA',
    v_prop.code,
    v_prop.code || ' - ' || v_prop.title,
    'Estado: ' || v_prop.status,
    'Estado: APROBADA -> Proyecto creado: ' || v_project_code
  );

  -- Notificación institucional automática
  INSERT INTO public.system_notifications (
    notif_code, title, message, type, target_roles, target_user_id, link_module, email_sent
  )
  VALUES (
    'NOTIF-' || floor(extract(epoch from now()) * 1000)::text,
    'Nuevo Proyecto Creado: ' || v_project_code,
    'La propuesta ' || v_prop.code || ' fue aprobada y generó automáticamente el proyecto ' || v_project_code || '.',
    'APROBACION',
    ARRAY['COORDINADOR_CARRERA', 'DIRECTOR_FCI', 'GESTOR_CONOCIMIENTO'],
    v_applicant.id,
    'projects',
    true
  );

  RETURN v_project_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. RPC RN-22: BAJA LÓGICA OBLIGATORIA DE DOCUMENTO (SIN BORRADO FÍSICO)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.logical_delete_document(
  p_document_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid;
  v_actor_name text;
  v_doc public.documents%ROWTYPE;
BEGIN
  v_actor_id := public.current_profile_id();
  IF v_actor_id IS NULL OR NOT public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA']) THEN
    RAISE EXCEPTION 'No autorizado: Solo Administrador o Coordinador puede efectuar bajas lógicas documentales.';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) < 5 THEN
    RAISE EXCEPTION 'Regla RN-22: Debe ingresar obligatoriamente el motivo de la baja lógica (mínimo 5 caracteres).';
  END IF;

  SELECT full_name INTO v_actor_name FROM public.profiles WHERE id = v_actor_id;
  SELECT * INTO v_doc FROM public.documents WHERE id = p_document_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Documento no encontrado.';
  END IF;

  UPDATE public.documents
  SET
    active = false,
    deletion_reason = trim(p_reason),
    deleted_by = v_actor_id,
    deleted_by_name = v_actor_name,
    deleted_at = now()
  WHERE id = p_document_id;

  INSERT INTO public.audit_logs (
    log_code, user_id, user_name, user_role, action, entity, entity_id,
    entity_description, previous_value, new_value
  )
  VALUES (
    'AUD-' || floor(extract(epoch from now()) * 1000)::text,
    v_actor_id,
    v_actor_name,
    CASE WHEN public.has_role('ADMINISTRADOR') THEN 'ADMINISTRADOR' ELSE 'COORDINADOR_CARRERA' END,
    'ELIMINAR_LOGICO',
    'DOCUMENTO',
    v_doc.doc_code,
    v_doc.name,
    'Documento vigente (active = true)',
    'Baja lógica (active = false). Motivo: ' || trim(p_reason)
  );
END;
$$;
