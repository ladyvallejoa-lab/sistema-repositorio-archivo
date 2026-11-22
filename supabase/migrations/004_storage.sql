-- ============================================================================
-- UG-Investiga FCI | Facultad de Ingeniería Industrial - Universidad de Guayaquil
-- Migración 004: Configuración de Supabase Storage (Bucket Privado y Políticas)
-- ============================================================================

-- 1. Crear bucket privado para custodia de PDFs, evidencias y archivos XLS/XLSX
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fci-documents',
  'fci-documents',
  false,
  20971520, -- Límite técnico máximo de 20 MB (el motor valida 4/5/10 MB por categoría)
  ARRAY[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Política de lectura / descarga (URLs firmadas) en storage.objects
DROP POLICY IF EXISTS "fci_docs_storage_select" ON storage.objects;
CREATE POLICY "fci_docs_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'fci-documents'
    AND public.current_profile_id() IS NOT NULL
    AND (
      public.has_any_role(ARRAY['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO'])
      OR owner = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.documents d
        WHERE d.storage_path = storage.objects.name
          AND (
            d.uploader_id = public.current_profile_id()
            OR (d.project_id IS NOT NULL AND public.is_project_member(d.project_id))
          )
      )
    )
  );

-- 3. Política de subida (INSERT) según rol institucional
DROP POLICY IF EXISTS "fci_docs_storage_insert" ON storage.objects;
CREATE POLICY "fci_docs_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'fci-documents'
    AND public.current_profile_id() IS NOT NULL
    AND (
      public.has_any_role(
        ARRAY[
          'ADMINISTRADOR',
          'COORDINADOR_CARRERA',
          'GESTOR_CONOCIMIENTO',
          'DIRECTOR_FCI',
          'FUTURO_DIRECTOR_FCI',
          'DOCENTE_INVESTIGADOR_FCI'
        ]
      )
    )
  );

-- Nota RN-22: No se crean políticas DELETE en storage.objects para evitar borrado físico.
