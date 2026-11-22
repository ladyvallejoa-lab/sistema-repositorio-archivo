-- ============================================================================
-- UG-Investiga FCI | Facultad de Ingeniería Industrial - Universidad de Guayaquil
-- Migración 005: Datos Semilla Piloto (Carrera de Ingeniería en Telemática)
-- ============================================================================

-- 1. Usuarios Institucionales (USR-001 a USR-011)
INSERT INTO public.profiles (id, user_code, full_name, email, career, faculty, active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'USR-001', 'Ing. Carlos Mendoza', 'carlos.mendoza@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000002', 'USR-002', 'Dr. Roberto Silva, PhD', 'roberto.silva@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000003', 'USR-003', 'MSc. Diana Paredes', 'diana.paredes@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000004', 'USR-004', 'MSc. Xavier Andrade', 'xavier.andrade@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000005', 'USR-005', 'Dr. Mario Cevallos, PhD', 'mario.cevallos@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000006', 'USR-006', 'Dra. Elena Villacís', 'elena.villacis@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000007', 'USR-007', 'Ing. Gabriel Romero', 'gabriel.romero@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000008', 'USR-008', 'Ing. Lorena Castro', 'lorena.castro@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000009', 'USR-009', 'Ing. Patricia Morales', 'patricia.morales@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000010', 'USR-010', 'Ing. Fernando Viteri', 'fernando.viteri@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true),
  ('10000000-0000-0000-0000-000000000011', 'USR-011', 'Ing. Sofía Loor', 'sofia.loor@ug.edu.ec', 'Ingeniería en Telemática', 'Facultad de Ingeniería Industrial', true)
ON CONFLICT (user_code) DO NOTHING;

-- Roles múltiples por usuario
INSERT INTO public.user_roles (user_id, role) VALUES
  ('10000000-0000-0000-0000-000000000001', 'ADMINISTRADOR'),
  ('10000000-0000-0000-0000-000000000002', 'COORDINADOR_CARRERA'),
  ('10000000-0000-0000-0000-000000000003', 'GESTOR_CONOCIMIENTO'),
  ('10000000-0000-0000-0000-000000000004', 'DIRECTOR_FCI'),
  ('10000000-0000-0000-0000-000000000004', 'DOCENTE_INVESTIGADOR_FCI'),
  ('10000000-0000-0000-0000-000000000005', 'DIRECTOR_FCI'),
  ('10000000-0000-0000-0000-000000000005', 'DOCENTE_INVESTIGADOR_FCI'),
  ('10000000-0000-0000-0000-000000000006', 'FUTURO_DIRECTOR_FCI'),
  ('10000000-0000-0000-0000-000000000006', 'DOCENTE_INVESTIGADOR_FCI'),
  ('10000000-0000-0000-0000-000000000007', 'DOCENTE_INVESTIGADOR_FCI'),
  ('10000000-0000-0000-0000-000000000008', 'DOCENTE_INVESTIGADOR_FCI'),
  ('10000000-0000-0000-0000-000000000009', 'DOCENTE_INVESTIGADOR_FCI'),
  ('10000000-0000-0000-0000-000000000010', 'DOCENTE_INVESTIGADOR_FCI'),
  ('10000000-0000-0000-0000-000000000011', 'DOCENTE_INVESTIGADOR_FCI')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Parámetros Configurables (M2)
INSERT INTO public.config_parameters (id, key, name, description, category, value_text, value_type, unit) VALUES
  ('CFG-001', 'MAX_SIZE_PROPUESTA_MB', 'Límite tamaño PDF Propuesta FCI', 'Tamaño máximo permitido para la subida de la propuesta inicial en PDF.', 'LIMITES_ARCHIVO', '10', 'number', 'MB'),
  ('CFG-002', 'MAX_SIZE_REPORTE_FCI_MB', 'Límite tamaño PDF Reporte FCI', 'Tamaño máximo para el compendio de evidencias del reporte semestral del director.', 'LIMITES_ARCHIVO', '10', 'number', 'MB'),
  ('CFG-003', 'MAX_SIZE_REPORTE_INV_MB', 'Límite tamaño PDF Reporte Investigador', 'Tamaño máximo para el reporte semestral individual de cada investigador.', 'LIMITES_ARCHIVO', '5', 'number', 'MB'),
  ('CFG-004', 'MAX_SIZE_PRODUCCION_MB', 'Límite tamaño Excel Producción Científica', 'Tamaño máximo para el archivo consolidado de producción científica del periodo.', 'LIMITES_ARCHIVO', '4', 'number', 'MB'),
  ('CFG-005', 'PERIODO_ACTUAL', 'Periodo Académico Vigente', 'Periodo académico activo en el sistema para control de reportes.', 'PERIODOS', '2026-CI', 'string', NULL),
  ('CFG-006', 'FECHA_CIERRE_SEMESTRAL', 'Fecha Cierre Reportes Semestrales 2026-CI', 'Fecha límite institucional antes de marcar reportes como rezagados o fuera de plazo.', 'CALENDARIO', '2026-11-28', 'string', NULL),
  ('CFG-007', 'DIAS_AVISO_PREVIO_VENCIMIENTO', 'Días de Alerta Previa a Cierre', 'Días previos a la fecha límite para disparar alertas automáticas a directores e investigadores.', 'CALENDARIO', '7', 'number', 'días')
ON CONFLICT (id) DO NOTHING;

-- 3. Reglas Documentales Obligatorias por Etapa
INSERT INTO public.required_document_rules (id, document_type, project_stage, mandatory, max_size_mb, allowed_formats) VALUES
  ('RDR-001', 'Formulario de Propuesta FCI Firmado', 'PROPUESTA', true, 10, ARRAY['PDF']),
  ('RDR-002', 'Aval del Decanato / Consejo de Facultad', 'INICIO_PROYECTO', true, 5, ARRAY['PDF']),
  ('RDR-003', 'Acta de Compromiso de Investigadores', 'INICIO_PROYECTO', true, 5, ARRAY['PDF']),
  ('RDR-004', 'Informe Semestral Técnico FCI con Evidencias', 'SEMESTRAL_FCI', true, 10, ARRAY['PDF']),
  ('RDR-005', 'Informe Individual de Actividades del Investigador', 'SEMESTRAL_INVESTIGADOR', true, 5, ARRAY['PDF']),
  ('RDR-006', 'Informe Final de Resultados y Productos', 'CIERRE_FINAL', true, 20, ARRAY['PDF']),
  ('RDR-007', 'Acta de Finiquito y Cierre de Expediente', 'CIERRE_FINAL', true, 5, ARRAY['PDF'])
ON CONFLICT (id) DO NOTHING;

-- 4. Propuesta en Convocatoria (PROP-2026-TEL-003)
INSERT INTO public.proposals_fci (
  id, code, title, applicant_id, career, research_line, call_year,
  general_objective, specific_objectives, summary, budget_requested,
  document_name, document_size_mb, status, submission_date,
  review_notes, review_date, reviewer_id, reviewer_name
) VALUES (
  '20000000-0000-0000-0000-000000000003',
  'PROP-2026-TEL-003',
  'Sistema de Detección Temprana de Intrusiones en Redes de Sensores Telemáticos Mediante Algoritmos de Borde (Edge AI)',
  '10000000-0000-0000-0000-000000000006',
  'Ingeniería en Telemática',
  'Inteligencia en el Borde, Ciberseguridad y Redes Telemáticas',
  '2026-2027',
  'Diseñar y validar un motor ligero de detección de intrusiones embebido en microcontroladores de borde (ESP32/Raspberry Pi Pico) para asegurar la telemetría en infraestructuras industriales de Guayaquil.',
  '["Cuantificar el consumo computacional y energético de modelos de aprendizaje supervisado compactos.", "Evaluar la tasa de detección de ataques de inyección de paquetes en bus CAN y enlaces inalámbricos.", "Generar un prototipo de nodo seguro con capacidad de aislamiento automático."]'::jsonb,
  'La propuesta aborda la vulnerabilidad crítica de los nodos IoT sin cifrado robusto en el sector industrial de la región Guayas. Se propone una arquitectura de inferencia distribuida.',
  14200,
  'Propuesta_FCI_2026_Edge_AI_Villacis_v2.pdf',
  7.4,
  'EN_REVISION',
  '2026-10-25',
  'Se revisó la versión 2.0. Las observaciones respecto al desglose del cronograma y el presupuesto de equipos de radiofrecuencia fueron atendidas satisfactoriamente. Pendiente dictamen final de la Comisión de Investigación.',
  '2026-11-02',
  '10000000-0000-0000-0000-000000000002',
  'Dr. Roberto Silva, PhD'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.proposal_versions (id, proposal_id, version, action_date, action, comment, actor_id, actor_name) VALUES
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 1, '2026-10-10', 'Envío inicial de propuesta', 'Primera postulación de la Dra. Elena Villacís con PDF adjunto de 7.1 MB.', '10000000-0000-0000-0000-000000000006', 'Dra. Elena Villacís'),
  ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 1, '2026-10-18', 'Observaciones emitidas', 'Se requiere precisar la metodología de muestreo en plantas y ajustar cotización de tarjetas FPGA.', '10000000-0000-0000-0000-000000000002', 'Dr. Roberto Silva, PhD'),
  ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 2, '2026-10-25', 'Reenvío con correcciones', 'Se adjuntó versión corregida (v2) subsanando observaciones metodológicas.', '10000000-0000-0000-0000-000000000006', 'Dra. Elena Villacís')
ON CONFLICT (id) DO NOTHING;

-- 5. Proyectos FCI Activos Piloto (FCI-2025-TEL-001 y FCI-2025-TEL-002)
INSERT INTO public.fci_projects (
  id, code, title, description, general_objective, specific_objectives, keywords,
  research_line, career, faculty, academic_period, start_date, estimated_end_date,
  status, budget_assigned, budget_executed, document_completeness_percent, current_semester, total_semesters
) VALUES
(
  '30000000-0000-0000-0000-000000000001',
  'FCI-2025-TEL-001',
  'Plataforma Telemática IoT para Monitoreo y Eficiencia Energética en Plantas Industriales del Guayas',
  'Desarrollo de una arquitectura de sensores inalámbricos industriales (LoRaWAN y MQTT) integrada a dashboards predictivos de consumo energético para PYMES metalmecánicas y manufactureras de Guayaquil.',
  'Implementar una plataforma telemática basada en el Internet de las Cosas que optimice el monitoreo del consumo eléctrico en tiempo real en plantas de manufactura.',
  '["Diseñar la topología de red de sensores LoRaWAN adaptada a ambientes con alta interferencia electromagnética.", "Desarrollar el gateway telemático y la capa de ingesta de datos con protocolos seguros.", "Evaluar experimentalmente la reducción en el desperdicio energético en las plantas piloto seleccionadas."]'::jsonb,
  ARRAY['IoT Industrial', 'LoRaWAN', 'Eficiencia Energética', 'Telemetría', 'Telemática'],
  'Redes Telemáticas, Telecomunicaciones y Sistemas Embebidos',
  'Ingeniería en Telemática',
  'Facultad de Ingeniería Industrial',
  '2025-2026',
  '2025-05-02',
  '2026-12-15',
  'EN_EJECUCION',
  12500,
  9400,
  88,
  2,
  3
),
(
  '30000000-0000-0000-0000-000000000002',
  'FCI-2025-TEL-002',
  'Arquitectura de Seguridad Basada en Software Defined Networking (SDN) para Infraestructuras Críticas Universitarias',
  'Implementación y prueba de un plano de control distribuido SDN con mitigación autónoma de ataques de denegación distribuida de servicio (DDoS) en la red troncal de la Universidad de Guayaquil.',
  'Desarrollar un modelo de seguridad perimetral e interno para la red de datos universitaria basado en controladores SDN y telemetría de flujo OpenFlow.',
  '["Analizar los vectores de ataque más recurrentes en la infraestructura troncal de la UG.", "Implementar algoritmos de detección de anomalías de flujo en el controlador OpenDaylight / Ryu.", "Evaluar el impacto en latencia y jitter durante la aplicación de reglas de filtrado dinámico."]'::jsonb,
  ARRAY['SDN', 'Ciberseguridad', 'OpenFlow', 'DDoS', 'Redes de Telecomunicaciones'],
  'Ciberseguridad, Redes Definidas por Software e Interoperabilidad',
  'Ingeniería en Telemática',
  'Facultad de Ingeniería Industrial',
  '2025-2027',
  '2025-06-01',
  '2027-05-31',
  'EN_EJECUCION',
  15000,
  6200,
  71,
  1,
  4
)
ON CONFLICT (code) DO NOTHING;

-- Participantes de los 2 Proyectos
INSERT INTO public.project_participants (project_id, user_id, institutional_role, project_role, dedication_hours_weekly) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Docente Titular Agregado', 'DIRECTOR', 10),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'Docente Ocasional', 'INVESTIGADOR', 8),
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', 'Docente Titular Auxiliar', 'INVESTIGADOR', 8),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Docente Titular Principal', 'DIRECTOR', 10),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', 'Docente Titular Agregado', 'INVESTIGADOR', 8),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', 'Docente Ocasional', 'INVESTIGADOR', 8),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', 'Docente Ocasional', 'INVESTIGADOR', 8)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Hitos de Proyectos
INSERT INTO public.project_milestones (id, project_id, milestone_code, title, description, target_date, completion_date, progress_percent, status) VALUES
  ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'M-001', 'Estudio de campo y caracterización de radiofrecuencia en planta', 'Mediciones de propagación y pérdidas de paquetes en entorno fabril.', '2025-08-30', '2025-08-25', 100, 'COMPLETADO'),
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'M-002', 'Despliegue del concentrador LoRaWAN y nodos transceptores', 'Instalación de 12 nodos de medición eléctrica y gateway centralizado.', '2025-12-10', '2025-12-05', 100, 'COMPLETADO'),
  ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'M-003', 'Dashboard de visualización y pruebas de estrés de red', 'Integración del broker MQTT, base de series de tiempo y pruebas de latencia.', '2026-06-30', '2026-06-20', 100, 'COMPLETADO'),
  ('31000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'M-004', 'Validación en planta con cálculo de eficiencia y publicación científica', 'Monitoreo continuo durante 90 días y redacción de artículo indexado Scopus.', '2026-11-20', NULL, 75, 'EN_CURSO'),
  ('31000000-0000-0000-0000-000000000101', '30000000-0000-0000-0000-000000000002', 'M-101', 'Revisión sistemática y caracterización de tráfico universitario', 'Captura y análisis de flujos NetFlow en enlace troncal UG.', '2025-09-30', '2025-09-28', 100, 'COMPLETADO'),
  ('31000000-0000-0000-0000-000000000102', '30000000-0000-0000-0000-000000000002', 'M-102', 'Entorno de simulación Mininet y controlador SDN Ryu', 'Modelado topológico de la Facultad de Ingeniería Industrial.', '2026-03-30', '2026-03-15', 100, 'COMPLETADO'),
  ('31000000-0000-0000-0000-000000000103', '30000000-0000-0000-0000-000000000002', 'M-103', 'Módulo de mitigación de ataques SYN Flood y DNS Amplification', 'Inyección de flujos anómalos y prueba de reglas dinámicas OpenFlow.', '2026-11-15', NULL, 60, 'EN_CURSO')
ON CONFLICT (project_id, milestone_code) DO NOTHING;

-- 6. Documentos Iniciales y Validaciones
INSERT INTO public.documents (
  id, doc_code, project_id, name, original_file_name, category, file_type, mime_type,
  size_mb, upload_date, uploader_id, uploader_name, uploader_role, report_period, version, is_latest, confidentiality, active
) VALUES
  ('40000000-0000-0000-0000-000000000001', 'DOC-001', '30000000-0000-0000-0000-000000000001', 'Propuesta_FCI_Aprobada_FCI_2025_001.pdf', 'Propuesta_FCI_Plataforma_IoT.pdf', 'PROPUESTA', 'PDF', 'application/pdf', 6.8, '2025-03-14', '10000000-0000-0000-0000-000000000004', 'MSc. Xavier Andrade', 'DIRECTOR_FCI', NULL, '1.0', true, 'PUBLICO_UG', true),
  ('40000000-0000-0000-0000-000000000002', 'DOC-002', '30000000-0000-0000-0000-000000000001', 'Reporte_Semestral_FCI_1_2025_CII.pdf', 'Informe_Semestral_FCI_Periodo_2025_CII.pdf', 'REPORTE_FCI', 'PDF', 'application/pdf', 8.2, '2025-10-18', '10000000-0000-0000-0000-000000000004', 'MSc. Xavier Andrade', 'DIRECTOR_FCI', '2025-CII', '1.0', true, 'RESTRINGIDO_CARRERA', true),
  ('40000000-0000-0000-0000-000000000003', 'DOC-003', '30000000-0000-0000-0000-000000000001', 'Evidencias_Fotograficas_Despliegue_Nodos.pdf', 'Evidencias_Nodos_LoRa_Planta.pdf', 'EVIDENCIA_TECNICA', 'PDF', 'application/pdf', 4.1, '2025-12-05', '10000000-0000-0000-0000-000000000007', 'Ing. Gabriel Romero', 'DOCENTE_INVESTIGADOR_FCI', NULL, '1.0', true, 'PUBLICO_UG', true),
  ('40000000-0000-0000-0000-000000000004', 'DOC-004', '30000000-0000-0000-0000-000000000001', 'Reporte_Semestral_FCI_2_2026_CI_Borrador.pdf', 'Informe_Semestre_2_Avances_IoT.pdf', 'REPORTE_FCI', 'PDF', 'application/pdf', 7.9, '2026-11-05', '10000000-0000-0000-0000-000000000004', 'MSc. Xavier Andrade', 'DIRECTOR_FCI', '2026-CI', '1.0', true, 'RESTRINGIDO_CARRERA', true),
  ('40000000-0000-0000-0000-000000000101', 'DOC-101', '30000000-0000-0000-0000-000000000002', 'Propuesta_Aprobada_FCI_2025_002_SDN.pdf', 'Propuesta_SDN_Seguridad_FCI.pdf', 'PROPUESTA', 'PDF', 'application/pdf', 5.4, '2025-04-10', '10000000-0000-0000-0000-000000000005', 'Dr. Mario Cevallos, PhD', 'DIRECTOR_FCI', NULL, '1.0', true, 'PUBLICO_UG', true),
  ('40000000-0000-0000-0000-000000000102', 'DOC-102', '30000000-0000-0000-0000-000000000002', 'Reporte_Semestral_FCI_1_2025_CII_SDN.pdf', 'Reporte_Semestre_1_FCI_SDN.pdf', 'REPORTE_FCI', 'PDF', 'application/pdf', 9.1, '2025-11-20', '10000000-0000-0000-0000-000000000005', 'Dr. Mario Cevallos, PhD', 'DIRECTOR_FCI', '2025-CII', '1.0', true, 'RESTRINGIDO_CARRERA', true)
ON CONFLICT (doc_code) DO NOTHING;

INSERT INTO public.document_validations (id, document_id, rule_code, rule_name, status, message, validated_at) VALUES
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'RN-VAL-01', 'Formato de archivo', 'ACEPTADO', 'Archivo PDF válido (application/pdf).', '2025-03-14 10:15'),
  ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'RN-VAL-02', 'Límite de tamaño', 'ACEPTADO', 'Peso 6.8 MB dentro del límite máximo de 10 MB.', '2025-03-14 10:15'),
  ('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 'RN-VAL-02', 'Límite de tamaño', 'ACEPTADO', '8.2 MB dentro del límite de 10 MB.', '2025-10-18 16:30'),
  ('41000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 'RN-VAL-01', 'Formato', 'ACEPTADO', 'Formato PDF conforme.', '2025-12-05 11:20'),
  ('41000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000004', 'RN-VAL-04', 'Coherencia de cronograma', 'ACEPTADO', 'Hitos reportados coinciden con el cronograma vigente.', '2026-11-05 09:12'),
  ('41000000-0000-0000-0000-000000000101', '40000000-0000-0000-0000-000000000101', 'RN-VAL-01', 'Formato', 'ACEPTADO', 'PDF institucional verificado.', '2025-04-10 12:00'),
  ('41000000-0000-0000-0000-000000000102', '40000000-0000-0000-0000-000000000102', 'RN-VAL-02', 'Límite de peso', 'CON_ADVERTENCIA', '9.1 MB está cerca del límite máximo de 10 MB (91%).', '2025-11-20 18:40')
ON CONFLICT (id) DO NOTHING;

-- 7. Reportes Semestrales del FCI
INSERT INTO public.fci_semi_annual_reports (
  id, report_code, project_id, director_id, period, semester_number, summary_advances,
  achieved_milestones, encountered_obstacles, next_steps, status, document_id,
  document_evidence_name, document_size_mb, submission_date, review_date, coordinator_review_notes, deadline_date, is_overdue
) VALUES
  ('50000000-0000-0000-0000-000000000001', 'REP-FCI-001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '2025-CII', 1, 'Se completaron los hitos 1 y 2 satisfactoriamente. Se instalaron los 12 transceptores y el concentrador de datos en la planta piloto.', '["Estudio de campo en planta", "Despliegue concentrador LoRaWAN"]'::jsonb, 'Demora de 10 días en la nacionalización de módulos de radio en aduana, subsanada reordenando la fase de simulación previa.', 'Desarrollo del panel de visualización y pruebas de latencia con broker MQTT.', 'APROBADO', '40000000-0000-0000-0000-000000000002', 'Reporte_Semestral_FCI_1_2025_CII.pdf', 8.2, '2025-10-18', '2025-10-24', 'Reporte completo. Se adjuntaron bitácoras de campo y actas de instalación validadas por la empresa colaboradora.', '2025-10-30', false),
  ('50000000-0000-0000-0000-000000000002', 'REP-FCI-002', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '2026-CI', 2, 'Se integró el dashboard de analítica y se iniciaron las pruebas de estrés de la red de sensores. Consumo promedio medido con precisión del 98.4%.', '["Dashboard de visualización y pruebas de estrés de red"]'::jsonb, 'Interferencia en banda de 915 MHz resuelta mediante salto de frecuencia adaptable.', 'Finalización de la medición de 90 días y redacción del artículo de investigación para revista Scopus Q2.', 'EN_REVISION', '40000000-0000-0000-0000-000000000004', 'Reporte_Semestral_FCI_2_2026_CI_Borrador.pdf', 7.9, '2026-11-05', '2026-11-09', 'Informe técnico muy sólido. Por favor anexar el certificado de validación de calibración de los transformadores de corriente.', '2026-11-28', false),
  ('50000000-0000-0000-0000-000000000003', 'REP-FCI-003', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', '2026-CI', 1, 'Avance del 60% en el módulo de mitigación de ataques SYN Flood en entorno de simulación Mininet.', '["Revisión sistemática de flujos", "Modelado en Mininet"]'::jsonb, 'Sobrecarga de CPU en el controlador al superar 50,000 flujos/segundo. Se trabaja en optimización multi-hilo.', 'Pruebas en switches físicos con soporte OpenFlow 1.3 en el laboratorio de Telemática.', 'BORRADOR', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-28', false)
ON CONFLICT (report_code) DO NOTHING;

-- 8. Reportes Semestrales por Investigador (8 activos)
INSERT INTO public.researcher_semi_annual_reports (
  id, report_code, project_id, researcher_id, period, hours_dedicated, activities_description,
  delivered_products, status, document_evidence_name, document_size_mb, submission_date, coordinator_review_notes, deadline_date
) VALUES
  ('60000000-0000-0000-0000-000000000001', 'REP-INV-001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '2026-CI', 160, 'Coordinación técnica, supervisión del firmware en nodos ESP32 y redacción de la sección de resultados del artículo científico.', '["Firmware v2.1 compilado", "Borrador de manuscrito Scopus"]'::jsonb, 'ENVIADO', 'Informe_Individual_Andrade_2026_CI.pdf', 3.2, '2026-11-05', NULL, '2026-11-28'),
  ('60000000-0000-0000-0000-000000000002', 'REP-INV-002', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', '2026-CI', 128, 'Montaje de tarjetas de adquisición de corriente, calibración de sensores CT y pruebas de enlace radioeléctrico en sitio.', '["Bitácora de calibración de 12 sensores", "Tabla de mediciones en formato CSV"]'::jsonb, 'APROBADO', 'Informe_Individual_Romero_2026_CI.pdf', 4.1, '2026-11-03', 'Aprobado sin observaciones.', '2026-11-28'),
  ('60000000-0000-0000-0000-000000000003', 'REP-INV-003', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000008', '2026-CI', 128, 'Diseño e implementación de la API REST e interfaz web en React para el monitoreo telemático en tiempo real.', '["Código fuente documentado en repositorio institucional", "Guía de usuario"]'::jsonb, 'OBSERVADO', 'Informe_Individual_Castro_2026_CI.pdf', 4.8, '2026-11-06', 'Falta adjuntar el enlace verificable al repositorio de código institucional y capturas con marca de tiempo.', '2026-11-28'),
  ('60000000-0000-0000-0000-000000000004', 'REP-INV-004', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', '2026-CI', 160, 'Dirección del diseño metodológico, formulación de reglas OpenFlow reactivas y gestión de licencias.', '["Especificación de reglas SDN v1.0", "Dataset sintético de ataques"]'::jsonb, 'BORRADOR', NULL, NULL, NULL, NULL, '2026-11-28'),
  ('60000000-0000-0000-0000-000000000005', 'REP-INV-005', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', '2026-CI', 128, 'Simulación de escenarios de tráfico normal y anómalo en Mininet con 4 switches virtuales y 24 hosts.', '["Scripts de automatización en Python", "Reporte de rendimiento"]'::jsonb, 'ENVIADO', 'Informe_Individual_Morales_2026_CI.pdf', 2.9, '2026-11-07', NULL, '2026-11-28'),
  ('60000000-0000-0000-0000-000000000006', 'REP-INV-006', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000010', '2026-CI', 128, 'Implementación del algoritmo de detección de anomalías basado en entropía de Shannon sobre cabeceras IP.', '["Módulo Ryu controller en Python", "Gráficas de precisión ROC"]'::jsonb, 'PENDIENTE', NULL, NULL, NULL, NULL, '2026-11-28'),
  ('60000000-0000-0000-0000-000000000007', 'REP-INV-007', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000011', '2026-CI', 128, 'Análisis de vulnerabilidades y pruebas de bypass de firewall en la arquitectura definida por software.', '["Matriz de vectores de ataque mitigados"]'::jsonb, 'BORRADOR', NULL, NULL, NULL, NULL, '2026-11-28'),
  ('60000000-0000-0000-0000-000000000008', 'REP-INV-008', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', '2026-CI', 64, 'Asesoría técnica en ciberseguridad para la capa de enlace inalámbrico LoRaWAN del proyecto IoT.', '["Análisis de riesgos de encriptación AES-128"]'::jsonb, 'APROBADO', 'Informe_Individual_Villacis_2026_CI.pdf', 1.8, '2026-11-02', 'Cumplimiento adecuado de horas de asesoría.', '2026-11-28')
ON CONFLICT (report_code) DO NOTHING;

-- 9. Producción Científica Consolidada (Lote 2026-Q3)
INSERT INTO public.scientific_production_batches (
  id, batch_code, period, upload_date, uploaded_by, uploaded_by_name, file_name, file_size_mb, record_count, version, status
) VALUES (
  '70000000-0000-0000-0000-000000000001',
  'BATCH-2026-Q3',
  '2026 - Trimestre 3 (Julio - Septiembre)',
  '2026-10-04 15:30:00-05',
  '10000000-0000-0000-0000-000000000003',
  'MSc. Diana Paredes (Gestora de Conocimiento)',
  'Produccion_Cientifica_Telematica_2026_Q3.xlsx',
  1.25,
  5,
  1,
  'VALIDADO'
)
ON CONFLICT (batch_code) DO NOTHING;

INSERT INTO public.scientific_production_items (
  id, item_code, batch_id, project_id, project_code, title, authors, has_ug_affiliation,
  production_type, journal_or_conference, issn_or_isbn, indexing, doi_or_url, publication_date, period, status_in_period
) VALUES
  ('71000000-0000-0000-0000-000000000001', 'PUB-001', '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'FCI-2025-TEL-001', 'Energy Efficiency Optimization in Metal-Mechanical Small Industries using LoRaWAN Sensor Networks', 'Andrade X., Romero G., Castro L., Silva R.', true, 'ARTICULO_SCOPUS', 'IEEE Latin America Transactions', '1548-0992', 'Scopus Q2 / SJR 0.38', '10.1109/TLA.2026.1049281', '2026-08-15', '2026-Q3', 'PUBLICADO'),
  ('71000000-0000-0000-0000-000000000002', 'PUB-002', '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'FCI-2025-TEL-002', 'Dynamic OpenFlow Rule Reconfiguration against High-Volume Distributed Denial of Service in Campus Backbones', 'Cevallos M., Morales P., Viteri F., Silva R.', true, 'ARTICULO_SCOPUS', 'Computers & Security (Elsevier)', '0167-4048', 'Scopus Q1 / JCR 5.1', '10.1016/j.cose.2026.103991', '2026-09-02', '2026-Q3', 'PUBLICADO'),
  ('71000000-0000-0000-0000-000000000003', 'PUB-003', '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'FCI-2025-TEL-001', 'Topología de Radiofrecuencia Industrial: Casos de Estudio en la Zona 8 del Guayas', 'Romero G., Andrade X., Villacís E.', true, 'PONENCIA_CONGRESO', 'Congreso Internacional de Ingeniería Industrial y Telemática (CIIT 2026)', '978-9942-89-21-3', 'Scopus Proceedings', '10.1109/CIIT.2026.98214', '2026-07-28', '2026-Q3', 'PUBLICADO'),
  ('71000000-0000-0000-0000-000000000004', 'PUB-004', '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'FCI-2025-TEL-002', 'Entropy-Based Flow Analysis on Software Defined Networks: Empirical Validation', 'Viteri F., Cevallos M., Loor S.', true, 'ARTICULO_LATINDEX', 'Revista Científica y Tecnológica UPSE', '1390-7697', 'Latindex Catálogo 2.0', '10.26423/rctu.v13i2.812', '2026-08-30', '2026-Q3', 'PUBLICADO'),
  ('71000000-0000-0000-0000-000000000005', 'PUB-005', '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'FCI-2025-TEL-001', 'Edge Computing Implementations for Sensor Telemetry in Developing Countries: A Survey', 'Villacís E., Andrade X.', true, 'ARTICULO_WOS', 'Sensors (MDPI)', '1424-8220', 'Web of Science (WoS) Q1', '10.3390/s26186022', '2026-09-18', '2026-Q3', 'PUBLICADO')
ON CONFLICT (item_code) DO NOTHING;

-- 10. Auditoría Inicial
INSERT INTO public.audit_logs (
  log_code, created_at, user_id, user_name, user_role, action, entity, entity_id, entity_description, previous_value, new_value, ip_address
) VALUES
  ('AUD-1001', '2026-11-09 14:22:10-05', '10000000-0000-0000-0000-000000000002', 'Dr. Roberto Silva, PhD', 'COORDINADOR_CARRERA', 'OBSERVAR', 'REPORTE_FCI', 'REP-FCI-002', 'Reporte Semestral 2 - FCI-2025-TEL-001', 'Estado: EN_REVISION', 'Estado: OBSERVADO (Se solicitó certificado de calibración)', '190.15.142.88'),
  ('AUD-1002', '2026-11-06 18:05:40-05', '10000000-0000-0000-0000-000000000008', 'Ing. Lorena Castro', 'DOCENTE_INVESTIGADOR_FCI', 'ENVIAR', 'REPORTE_INVESTIGADOR', 'REP-INV-003', 'Reporte Semestral Individual - 2026-CI', 'Estado: BORRADOR', 'Estado: ENVIADO (PDF adjunto 4.8 MB)', '186.68.22.104'),
  ('AUD-1003', '2026-11-05 09:15:22-05', '10000000-0000-0000-0000-000000000004', 'MSc. Xavier Andrade', 'DIRECTOR_FCI', 'CARGAR_ARCHIVO', 'DOCUMENTO', 'DOC-004', 'Reporte_Semestral_FCI_2_2026_CI_Borrador.pdf', 'N/A', 'Cargado versión 1.0 (7.9 MB) - Validaciones: OK', '190.15.142.12'),
  ('AUD-1004', '2026-11-02 11:30:00-05', '10000000-0000-0000-0000-000000000002', 'Dr. Roberto Silva, PhD', 'COORDINADOR_CARRERA', 'APROBAR', 'REPORTE_INVESTIGADOR', 'REP-INV-008', 'Reporte Individual Dra. Elena Villacís', 'Estado: ENVIADO', 'Estado: APROBADO', '190.15.142.88'),
  ('AUD-1005', '2026-10-25 16:45:10-05', '10000000-0000-0000-0000-000000000006', 'Dra. Elena Villacís', 'FUTURO_DIRECTOR_FCI', 'EDITAR', 'PROPUESTA', 'PROP-2026-TEL-003', 'Propuesta Edge AI Convocatoria 2026', 'Versión 1 (OBSERVADA)', 'Versión 2 enviada con cronograma y presupuesto ajustados', '186.68.99.201'),
  ('AUD-1006', '2026-10-04 15:35:00-05', '10000000-0000-0000-0000-000000000003', 'MSc. Diana Paredes', 'GESTOR_CONOCIMIENTO', 'CARGAR_ARCHIVO', 'PRODUCCION_CIENTIFICA', 'BATCH-2026-Q3', 'Produccion_Cientifica_Telematica_2026_Q3.xlsx', 'N/A', 'Archivo validado con 5 registros leídos e importados', '190.15.142.95')
ON CONFLICT (log_code) DO NOTHING;

-- 11. Notificaciones Iniciales
INSERT INTO public.system_notifications (
  notif_code, title, message, type, target_roles, target_user_id, created_at, link_module, email_sent
) VALUES
  ('NOTIF-001', 'Aviso de vencimiento: 17 días para cierre de reportes semestrales 2026-CI', 'El plazo oficial para el envío de reportes semestrales de directores e investigadores finaliza el 28 de noviembre de 2026.', 'RECORDATORIO', ARRAY['DIRECTOR_FCI', 'DOCENTE_INVESTIGADOR_FCI', 'COORDINADOR_CARRERA'], NULL, '2026-11-11 08:00:00-05', 'fci_reports', true),
  ('NOTIF-002', 'Observación en Reporte Semestral FCI-2025-TEL-001', 'La Coordinación de Carrera emitió una observación sobre el reporte del semestre 2. Favor subsanar y reenviar.', 'OBSERVACION', ARRAY['DIRECTOR_FCI'], '10000000-0000-0000-0000-000000000004', '2026-11-09 14:22:00-05', 'fci_reports', true),
  ('NOTIF-003', 'Nuevo reporte individual recibido para revisión', 'La Ing. Patricia Morales envió el reporte semestral individual del proyecto FCI-2025-TEL-002.', 'ENVIO', ARRAY['COORDINADOR_CARRERA', 'DIRECTOR_FCI'], '10000000-0000-0000-0000-000000000002', '2026-11-07 10:15:00-05', 'researcher_reports', true),
  ('NOTIF-004', 'Alerta documental: Evidencia pendiente en FCI-2025-TEL-002', 'El expediente del proyecto FCI-2025-TEL-002 presenta 2 evidencias pendientes correspondientes al hito M-103.', 'ALERTA_DOCUMENTAL', ARRAY['DIRECTOR_FCI', 'COORDINADOR_CARRERA'], '10000000-0000-0000-0000-000000000005', '2026-11-04 11:30:00-05', 'projects', false),
  ('NOTIF-005', 'Propuesta PROP-2026-TEL-003 actualizada por el postulante', 'La Dra. Elena Villacís ha cargado la versión 2.0 subsanando las observaciones técnicas.', 'ENVIO', ARRAY['COORDINADOR_CARRERA'], '10000000-0000-0000-0000-000000000002', '2026-10-25 16:48:00-05', 'proposals', true)
ON CONFLICT (notif_code) DO NOTHING;
