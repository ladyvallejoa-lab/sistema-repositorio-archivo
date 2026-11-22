-- ============================================================================
-- UG-Investiga FCI | Migración 006: Permitir acceso/registro con cualquier correo
-- Ejecutar en Supabase SQL Editor si ya ejecutaste 001 y 002 anteriormente.
-- ============================================================================

-- 1. Reemplazar restricción CHECK de dominio exclusivo @ug.edu.ec en public.profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_email_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_email_check
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 2. Actualizar trigger handle_new_user() para aceptar cualquier correo válido
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
