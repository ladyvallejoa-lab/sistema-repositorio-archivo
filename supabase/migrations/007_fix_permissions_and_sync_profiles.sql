-- ============================================================================
-- UG-Investiga FCI | Migración 007: Corrección de permisos SQL (GRANT) y
-- sincronización retroactiva de usuarios de auth.users -> public.profiles
-- Ejecutar en Supabase SQL Editor si apareció:
--   "permission denied for table profiles"
-- ============================================================================

-- 1. Otorgar privilegios de esquema, tablas, secuencias y funciones a authenticated
--    (PostgreSQL valida GRANT antes de evaluar las políticas RLS)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Refuerzo de inmutabilidad y baja lógica (RN-21 y RN-22)
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

-- 2. Función RPC segura para auto-crear o vincular el perfil del usuario autenticado
CREATE OR REPLACE FUNCTION public.ensure_current_user_profile()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_uid uuid;
  v_email text;
  v_meta jsonb;
  v_profile_id uuid;
  v_full_name text;
  v_next_code text;
BEGIN
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE auth_user_id = v_auth_uid
  LIMIT 1;

  IF v_profile_id IS NOT NULL THEN
    RETURN v_profile_id;
  END IF;

  SELECT email, raw_user_meta_data
  INTO v_email, v_meta
  FROM auth.users
  WHERE id = v_auth_uid;

  IF v_email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE lower(email) = lower(v_email)
  LIMIT 1;

  IF v_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET auth_user_id = v_auth_uid
    WHERE id = v_profile_id;
    RETURN v_profile_id;
  END IF;

  v_full_name := COALESCE(
    NULLIF(trim(v_meta ->> 'full_name'), ''),
    initcap(replace(split_part(v_email, '@', 1), '.', ' '))
  );

  SELECT 'USR-' || lpad(
    (
      COALESCE(
        MAX(NULLIF(regexp_replace(user_code, '[^0-9]', '', 'g'), '')::integer),
        0
      ) + 1
    )::text,
    3,
    '0'
  )
  INTO v_next_code
  FROM public.profiles;

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
    v_auth_uid,
    v_full_name,
    lower(v_email),
    COALESCE(NULLIF(trim(v_meta ->> 'career'), ''), 'Ingeniería en Telemática'),
    'Facultad de Ingeniería Industrial',
    true
  )
  RETURNING id INTO v_profile_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_profile_id, 'DOCENTE_INVESTIGADOR_FCI')
  ON CONFLICT DO NOTHING;

  RETURN v_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_current_user_profile() TO authenticated;

-- 3. Sincronización retroactiva: vincular o crear perfiles para usuarios ya
--    registrados previamente en auth.users que aún no tengan fila en public.profiles
DO $$
DECLARE
  u record;
  v_profile_id uuid;
  v_full_name text;
  v_next_code text;
BEGIN
  FOR u IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE email IS NOT NULL
  LOOP
    SELECT id INTO v_profile_id
    FROM public.profiles
    WHERE auth_user_id = u.id
       OR lower(email) = lower(u.email)
    LIMIT 1;

    IF v_profile_id IS NOT NULL THEN
      UPDATE public.profiles
      SET auth_user_id = u.id
      WHERE id = v_profile_id
        AND (auth_user_id IS NULL OR auth_user_id <> u.id);
    ELSE
      v_full_name := COALESCE(
        NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), ''),
        initcap(replace(split_part(u.email, '@', 1), '.', ' '))
      );

      SELECT 'USR-' || lpad(
        (
          COALESCE(
            MAX(NULLIF(regexp_replace(user_code, '[^0-9]', '', 'g'), '')::integer),
            0
          ) + 1
        )::text,
        3,
        '0'
      )
      INTO v_next_code
      FROM public.profiles;

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
        u.id,
        v_full_name,
        lower(u.email),
        COALESCE(NULLIF(trim(u.raw_user_meta_data ->> 'career'), ''), 'Ingeniería en Telemática'),
        'Facultad de Ingeniería Industrial',
        true
      )
      RETURNING id INTO v_profile_id;

      INSERT INTO public.user_roles (user_id, role)
      VALUES (v_profile_id, 'DOCENTE_INVESTIGADOR_FCI')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;
