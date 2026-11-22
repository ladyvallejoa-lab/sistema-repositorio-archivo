import { jsPDF } from 'jspdf';

/**
 * Utility to generate a clean, multi-page, professional PDF manual
 * for Universidad de Guayaquil - Facultad de Ingeniería Industrial
 * Focus: Clear flow of actors, the 4 files, chronological sequence, and step-by-step operation.
 */
export function generateManualPDF(returnBlob: boolean = false): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Institutional Color palette
  const primaryBlue: [number, number, number] = [26, 54, 93]; // UG Navy
  const darkText: [number, number, number] = [30, 41, 59];
  const mutedText: [number, number, number] = [100, 116, 139];
  const lightBg: [number, number, number] = [248, 250, 252];
  const borderGrey: [number, number, number] = [226, 232, 240];

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin + 10;
      addPageHeader();
    }
  };

  const addPageHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.text('UNIVERSIDAD DE GUAYAQUIL · FACULTAD DE INGENIERÍA INDUSTRIAL', margin, margin);
    doc.text('MANUAL DE FLUJO DE ACTORES · SISTEMA FCI', pageWidth - margin, margin, { align: 'right' });
    doc.setDrawColor(...borderGrey);
    doc.setLineWidth(0.3);
    doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
  };

  // ================= PAGE 1: PORTADA =================
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('UNIVERSIDAD DE GUAYAQUIL', margin, 15);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('FACULTAD DE INGENIERÍA INDUSTRIAL · CARRERA DE INGENIERÍA EN TELEMÁTICA', margin, 22);
  doc.text('SISTEMA WEB PARA GESTIÓN DOCUMENTAL Y PROYECTOS DE INVESTIGACIÓN (FCI)', margin, 28);

  y = 56;

  // Badge
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(margin, y, 68, 6.5, 2, 2, 'F');
  doc.setTextColor(49, 46, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('GUÍA RÁPIDA Y MANUAL DE FLUJO DE ACTORES', margin + 3, y + 4.5);

  y += 14;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryBlue);
  doc.text('¿Cómo funciona el Sistema Web FCI?', margin, y);

  y += 6;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.text('Flujo de Actores, Archivos Gestionados y Seguimiento Cronológico Paso a Paso', margin, y);

  y += 12;

  // Executive card
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGrey);
  doc.roundedRect(margin, y, contentWidth, 44, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryBlue);
  doc.text('Ficha Técnica del Alcance Piloto:', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text('• Carrera Piloto: Ingeniería en Telemática (Facultad de Ingeniería Industrial).', margin + 5, y + 14);
  doc.text('• Proyectos Piloto Activos: FCI-2025-TEL-001 (IoT Industrial) y FCI-2025-TEL-002 (Seguridad SDN).', margin + 5, y + 20);
  doc.text('• Investigadores Activos: 8 Docentes Investigadores adscritos a proyectos FCI.', margin + 5, y + 26);
  doc.text('• Regla Central: Motor de Validación Activa en tiempo real (formato MIME, peso en MB, cronograma y duplicados).', margin + 5, y + 32);
  doc.text('• Dominio Requerido: Cuentas institucionales con dominio obligatorio @ug.edu.ec.', margin + 5, y + 38);

  y += 52;

  // Section 1: Los 4 archivos del sistema
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryBlue);
  doc.text('1. Primero lo Básico: ¿Cuáles son los 4 Archivos que maneja el Sistema?', margin, y);
  y += 6;

  const filesTable = [
    { name: '1. Propuesta de Proyecto FCI', who: 'Docente Postulante', freq: '1 vez al año', size: 'PDF (< 10 MB)', purpose: 'Plan formal de investigación y presupuesto postulado al concurso de fondos.' },
    { name: '2. Reporte Semestral del FCI', who: 'Director del Proyecto', freq: '2 veces al año', size: 'PDF (< 10 MB)', purpose: 'Informe técnico de avance general con fotos, bitácoras y pruebas de campo.' },
    { name: '3. Reporte Semestral Individual', who: '8 Investigadores', freq: '2 veces al año', size: 'PDF (< 5 MB)', purpose: 'Justificación individual de horas dedicadas (ej. 128h) y tareas ejecutadas.' },
    { name: '4. Producción Científica XLS', who: 'Gestor de Conocimiento', freq: 'Trimestral', size: 'Excel (< 4 MB)', purpose: 'Artículos científicos en Scopus/WoS; el sistema valida columnas y filiación UG.' }
  ];

  filesTable.forEach((item) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderGrey);
    doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryBlue);
    doc.text(`${item.name} (${item.size})`, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...darkText);
    doc.text(`Sube: ${item.who} · Frecuencia: ${item.freq} · ${item.purpose}`, margin + 3, y + 8.5);

    y += 13;
  });

  // Footer Cover
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text('Manual para entrega formal a autoridades, decanato, coordinación y directores de investigación.', margin, pageHeight - margin);

  // ================= PAGE 2: EL FLUJO CRONOLÓGICO =================
  doc.addPage();
  y = margin + 10;
  addPageHeader();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryBlue);
  doc.text('2. ¿Con qué actor debo empezar? El Flujo Cronológico en 7 Pasos', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  doc.text('Este es el orden natural en el que deben ingresar los actores para entender el sistema de principio a fin:', margin, y);
  y += 7;

  const stepsFlow = [
    {
      step: 'PASO 1',
      actor: 'El Administrador (Ing. Carlos Mendoza)',
      desc: 'Prepara el terreno: abre el calendario 2026-CI, define los límites de peso de los archivos (< 10 MB, < 5 MB, < 4 MB) y crea las cuentas institucionales @ug.edu.ec.'
    },
    {
      step: 'PASO 2',
      actor: 'El Futuro Director / Postulante (Dra. Elena Villacís)',
      desc: 'Llena su propuesta en la convocatoria abierta (objetivos, resumen, presupuesto) y sube el PDF de la Propuesta (< 10 MB). Puede guardar en borrador o enviar formalmente.'
    },
    {
      step: 'PASO 3',
      actor: 'El Coordinador de Carrera (Dr. Roberto Silva, PhD)',
      desc: 'Revisa la propuesta. Si tiene dudas la "Observa"; si está correcta la "Aprueba". ¡Efecto inmediato!: El sistema crea automáticamente el Proyecto FCI activo y nombra Directora a la Dra. Villacís.'
    },
    {
      step: 'PASO 4',
      actor: 'Los Docentes Investigadores (ej. Ing. Gabriel Romero)',
      desc: 'Durante el semestre, cada uno de los 8 investigadores entra, registra sus horas dedicadas (ej. 128h), describe sus actividades y sube su PDF individual (< 5 MB).'
    },
    {
      step: 'PASO 5',
      actor: 'El Director del FCI Activo (MSc. Xavier Andrade)',
      desc: 'Revisa que sus investigadores hayan reportado, llena el informe técnico semestral general del proyecto y sube el PDF con todas las evidencias consolidadas (< 10 MB).'
    },
    {
      step: 'PASO 6',
      actor: 'El Gestor de Conocimiento (MSc. Diana Paredes)',
      desc: 'Sube el archivo Excel de publicaciones. El sistema valida las 10 columnas obligatorias, confirma si están en Scopus y certifica que los autores pertenezcan a la Universidad de Guayaquil.'
    },
    {
      step: 'PASO 7',
      actor: 'El Coordinador de Carrera (Control de Semáforos y Cierre)',
      desc: 'Revisa los semáforos (verde/ámbar/gris), aprueba los reportes y verifica el cierre: si no está al 100%, el sistema BLOQUEA el cierre; si está al 100%, archiva el proyecto en Modo Solo Lectura.'
    }
  ];

  stepsFlow.forEach((sf) => {
    checkPageBreak(18);
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...borderGrey);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryBlue);
    doc.text(`[${sf.step}] ${sf.actor}:`, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkText);
    const textLines = doc.splitTextToSize(sf.desc, contentWidth - 6);
    doc.text(textLines, margin + 3, y + 8.5);

    y += 16.5;
  });

  // ================= PAGE 3: DETALLE POR ACTOR Y ACCESOS =================
  doc.addPage();
  y = margin + 10;
  addPageHeader();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryBlue);
  doc.text('3. Detalle de cada Actor: Pantallas, Accesos y Qué Puede Hacer', margin, y);
  y += 7;

  const actorDetails = [
    {
      actor: '1. Coordinador de Carrera (Dr. Roberto Silva, PhD)',
      pantalla: 'Tableros (M13) · Propuestas (M3) · Proyectos (M4) · Reportes (M5/M6)',
      acciones: [
        '• Ve el semáforo de cumplimiento de los 8 investigadores (Aprobados, Observados, Pendientes).',
        '• Revisa y aprueba propuestas en concurso (al aprobar, crea automáticamente el nuevo proyecto).',
        '• Aprueba o emite observaciones a los reportes semestrales del Director y de los Investigadores.',
        '• Presiona "Verificar Cierre de Expediente": el sistema bloquea el cierre si la completitud es < 100%.'
      ]
    },
    {
      actor: '2. Director de FCI (MSc. Xavier Andrade)',
      pantalla: 'Proyectos FCI Activos (M4) · Reportes Semestrales FCI (M5)',
      acciones: [
        '• Consulta su proyecto activo (FCI-001), los hitos del cronograma y presupuesto ejecutado.',
        '• Supervisa qué investigadores de su equipo ya enviaron su informe y quiénes están rezagados.',
        '• Redacta el avance del semestre y sube el PDF consolidado de evidencias (< 10 MB).',
        '• Al presionar "Enviar", el formulario se congela contra edición hasta que Coordinación dictamine.'
      ]
    },
    {
      actor: '3. Docente Investigador FCI (Ing. Gabriel Romero)',
      pantalla: 'Reportes de Investigadores (M6)',
      acciones: [
        '• Ingresa sus horas de dedicación semestrales (ej. 128 horas) y detalle de experimentos realizados.',
        '• Sube su PDF individual de evidencias (< 5 MB) con bitácoras de campo.',
        '• Si el reporte es observado, el formulario se le desbloquea para subsanar y reenviar versión corregida.'
      ]
    },
    {
      actor: '4. Gestor de Conocimiento (MSc. Diana Paredes)',
      pantalla: 'Producción Científica XLS (M7)',
      acciones: [
        '• Sube el archivo Excel consolidado de publicaciones (< 4 MB).',
        '• El motor valida las 10 columnas obligatorias y la filiación de los autores a la Universidad de Guayaquil.',
        '• Consulta la tabla interactiva de artículos indexados en Scopus (Q1/Q2), Web of Science y ponencias.'
      ]
    },
    {
      actor: '5. Futuro Director / Postulante (Dra. Elena Villacís)',
      pantalla: 'Propuestas Convocatoria (M3)',
      acciones: [
        '• Llena formulario de postulación: título, resumen, objetivos, presupuesto referencial y adjunto PDF (< 10 MB).',
        '• Guarda en borrador o realiza el envío definitivo dentro del calendario de la convocatoria anual.'
      ]
    },
    {
      actor: '6. Administrador del Sistema (Ing. Carlos Mendoza)',
      pantalla: 'Usuarios y Roles (M1) · Configuración y Reglas (M2) · Auditoría (M10)',
      acciones: [
        '• Ajusta dinámicamente los límites de peso (<10 MB, <5 MB, <4 MB) y fechas de corte.',
        '• Administra cuentas con dominio obligatorio @ug.edu.ec y asigna multi-roles docentes.',
        '• Audita el log inmutable donde cada acción queda registrada con fecha, hora, usuario e IP.'
      ]
    }
  ];

  actorDetails.forEach((ad) => {
    checkPageBreak(25);
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...borderGrey);
    doc.roundedRect(margin, y, contentWidth, 23, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryBlue);
    doc.text(ad.actor, margin + 3, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...mutedText);
    doc.text(`Pantallas: ${ad.pantalla}`, margin + 3, y + 7.5);

    doc.setTextColor(...darkText);
    let lineY = y + 11.5;
    ad.acciones.forEach((ac) => {
      doc.text(ac, margin + 4, lineY);
      lineY += 2.8;
    });

    y += 25.5;
  });

  // ================= PAGE 4: TABLA RESUMEN & REGLAS =================
  doc.addPage();
  y = margin + 10;
  addPageHeader();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryBlue);
  doc.text('4. Matriz Resumen: "Quién Hace Qué"', margin, y);
  y += 7;

  // Table summary
  const summaryRows = [
    { actor: 'Administrador', screen: 'Configuración y Usuarios', file: 'Ninguno (configura reglas)', action: 'Fija límites de peso en MB, calendarios y crea cuentas @ug.edu.ec.' },
    { actor: 'Futuro Director', screen: 'Propuestas Convocatoria', file: 'Sube PDF Propuesta (< 10 MB)', action: 'Postula el proyecto a concurso anual de financiamiento.' },
    { actor: 'Coordinador', screen: 'Propuestas y Tableros', file: 'Revisa PDF Propuesta', action: 'Aprueba la propuesta y el sistema crea automáticamente el proyecto activo.' },
    { actor: 'Investigador', screen: 'Reportes Investigadores', file: 'Sube PDF Individual (< 5 MB)', action: 'Reporta sus horas trabajadas (ej. 128h) y evidencias individuales.' },
    { actor: 'Director FCI', screen: 'Reportes Semestrales FCI', file: 'Sube PDF General (< 10 MB)', action: 'Reporta el avance técnico general del proyecto ante la Facultad.' },
    { actor: 'Gestor Conocimiento', screen: 'Producción Científica', file: 'Sube Excel XLS (< 4 MB)', action: 'Carga y valida publicaciones indexadas en Scopus y WoS.' },
    { actor: 'Coordinador', screen: 'Proyectos y Cierre', file: 'Revisa expediente completo', action: 'Verifica el 100% de completitud antes de autorizar el cierre formal.' }
  ];

  summaryRows.forEach((row) => {
    checkPageBreak(12);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderGrey);
    doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryBlue);
    doc.text(`${row.actor}  |  ${row.screen}`, margin + 3, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...darkText);
    doc.text(`Archivo: ${row.file}  ·  Acción: ${row.action}`, margin + 3, y + 7.5);

    y += 11.5;
  });

  y += 4;

  // Section 5: Reglas Inflexibles
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryBlue);
  doc.text('5. Reglas de Validación Inflexibles del Sistema', margin, y);
  y += 6;

  const rules = [
    '• Cierre Condicionado (Regla RN-10): Ningún proyecto puede cerrarse si falta un solo documento obligatorio (< 100%).',
    '• Eliminación Lógica Estricta (Regla RN-21/RN-22): Prohibido el borrado físico; toda baja exige motivo obligatorio para auditoría.',
    '• Congelamiento tras Envío (Regla RN-07/RN-12): El formulario se bloquea al enviar; solo Coordinación puede reabrirlo si emite observación.',
    '• Coherencia Temporal (Regla RN-19): Las evidencias deben coincidir con las fechas de ejecución del semestre activo.'
  ];

  rules.forEach((r) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(...darkText);
    doc.text(r, margin, y);
    y += 4.5;
  });

  y += 3;

  // Section 6: Prueba en 3 minutos
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryBlue);
  doc.text('6. Guía Rápida de 3 Minutos para Probarlo en la Pantalla', margin, y);
  y += 5.5;

  const demoPoints = [
    '1. Use el selector superior "Simular Rol" y elija "Futuro Director (Dra. Elena Villacís)" para ver cómo se formula una propuesta.',
    '2. Conmute a "Coordinador Telemática", abra la propuesta y presione "Aprobar". Verá el proyecto FCI-003 creado automáticamente.',
    '3. En "Proyectos FCI Activos", seleccione FCI-001 y presione "Verificar Cierre de Expediente": observará cómo el sistema bloquea el cierre.',
    '4. En "Motor de Reglas Activas", mueva el peso a 12 MB y ejecute la validación para presenciar el rechazo en tiempo real.'
  ];

  demoPoints.forEach((dp) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkText);
    doc.text(dp, margin, y);
    y += 4.2;
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mutedText);
    doc.text(
      `UG-Investiga FCI · Guía Rápida de Actores y Flujo · Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
  }

  if (!returnBlob) {
    doc.save('Guia_Flujo_Actores_Sistema_FCI_UG.pdf');
  }

  return doc;
}
