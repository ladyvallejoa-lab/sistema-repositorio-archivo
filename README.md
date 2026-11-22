# Sistema Web UG-Investiga FCI
## Guía Rápida y Manual de Flujo de Actores
**Facultad de Ingeniería Industrial — Universidad de Guayaquil**  
**Carrera Piloto:** Ingeniería en Telemática  
**Volumen Inicial:** 2 Proyectos FCI Activos · 8 Investigadores Activos · 1 Propuesta Anual en Convocatoria  

---

## 1. Primero lo Básico: ¿Cuáles son los 4 Archivos que maneja el Sistema?

El sistema no es un repositorio pasivo ni un Google Drive desordenado. Todo el ciclo de vida del proyecto se gestiona a través de **4 archivos concretos con reglas activas de validación**:

| Archivo | ¿Quién lo sube? | ¿Con qué frecuencia? | Formato y Peso Máximo | Propósito Institucional |
|---|---|---|---|---|
| **1. Propuesta de Proyecto FCI** | Docente Postulante (Futuro Director) | 1 vez al año | PDF (< 10 MB) | Es el plan formal y presupuesto del proyecto postulado a concurso de financiamiento. |
| **2. Reporte Semestral del FCI** | Director del proyecto activo | 2 veces al año | PDF (< 10 MB) | Informe técnico consolidado del proyecto con bitácoras, fotos y pruebas de laboratorio. |
| **3. Reporte Semestral Individual** | Cada uno de los 8 investigadores | 2 veces al año | PDF (< 5 MB) | Justificación individual de horas dedicadas (ej. 128h) y tareas técnicas ejecutadas. |
| **4. Reporte de Producción Científica** | Gestor de Conocimiento | Trimestral o Semestral | Excel XLS/XLSX (< 4 MB) | Registro de artículos publicados en revistas Scopus, WoS, Latindex o ponencias. |

---

## 2. ¿Con qué actor debo empezar? El Flujo Cronológico en 7 Pasos

Este es el orden exacto en el que ocurren los hechos en la vida real de la universidad:

```
[PASO 1: Administrador]
   │  Ing. Carlos Mendoza prepara el terreno:
   │  Abre el calendario 2026-CI, define los límites de peso (<10 MB, <5 MB)
   │  y crea las cuentas de los docentes con correo @ug.edu.ec.
   ▼
[PASO 2: Futuro Director / Postulante]
   │  Dra. Elena Villacís postula su idea en la convocatoria abierta:
   │  Llena objetivos, resumen, presupuesto y sube el PDF de la Propuesta (< 10 MB).
   ▼
[PASO 3: Coordinador de Carrera]
   │  Dr. Roberto Silva revisa la propuesta en su bandeja:
   │  Si le falta algo la "Observa"; si está correcta la "Aprueba".
   │  ¡Efecto inmediato!: El sistema crea de forma automática el Proyecto FCI activo
   │  (FCI-2026-TEL-003) y nombra Directora a la Dra. Villacís.
   ▼
[PASO 4: Docente Investigador FCI]
   │  Durante la ejecución, cada uno de los 8 investigadores:
   │  Registra sus horas (ej. 128h), describe sus tareas y sube su PDF individual (< 5 MB).
   ▼
[PASO 5: Director de FCI Activo]
   │  MSc. Xavier Andrade supervisa que su equipo haya reportado,
   │  redacta el avance técnico general y sube el PDF de evidencias del FCI (< 10 MB).
   ▼
[PASO 6: Gestor de Conocimiento]
   │  MSc. Diana Paredes sube el archivo Excel de publicaciones científicas.
   │  El sistema valida las 10 columnas obligatorias y certifica la filiación a la UG.
   ▼
[PASO 7: Coordinador de Carrera - Control y Cierre]
      Dr. Roberto Silva monitorea los semáforos de cumplimiento, aprueba los informes
      y ejecuta la verificación de cierre de expediente: si no está al 100%, el sistema
      BLOQUEA el cierre; si está al 100%, archiva el proyecto en Modo Solo Lectura.
```

---

## 3. Detalle de cada Actor: Accesos y Acciones

### Paso 1: Administrador del Sistema (Ing. Carlos Mendoza)
* **Rol:** Configurar parámetros y gobernar las cuentas.
* **Menú que utiliza:** `Usuarios y Roles (M1)` y `Configuración y Reglas (M2)`.
* **Acciones principales:**
  1. Habilita el periodo académico vigente (`2026-CI`) y las fechas de apertura y cierre de convocatorias.
  2. Ajusta los límites de megabytes permitidos (10 MB para propuesta y reporte FCI, 5 MB para reporte individual, 4 MB para producción).
  3. Crea y activa usuarios; el sistema exige obligatoriamente que el correo sea institucional con dominio `@ug.edu.ec` (Regla RN-01).

---

### Paso 2: Futuro Director de FCI / Postulante (Dra. Elena Villacís)
* **Rol:** Docente que postula un proyecto a fondos competitivos.
* **Menú que utiliza:** `Propuestas Convocatoria (M3)`.
* **Archivos que maneja:** **PDF de la Propuesta FCI** (< 10 MB).
* **Acciones principales:**
  1. Entra a *Propuestas Convocatoria* y hace clic en **"Nueva Postulación FCI"**.
  2. Llena título, objetivos general y específicos, línea de investigación y presupuesto referencial.
  3. Sube el PDF de la propuesta técnica.
  4. Puede guardar en **Borrador** para editarlo cuantas veces quiera.
  5. Cuando esté listo, presiona **"Enviar Propuesta Definitiva"**. El formulario se congela para evitar alteraciones y pasa a revisión del Coordinador.

---

### Paso 3: Coordinador de Carrera (Dr. Roberto Silva, PhD) - Fase Propuestas
* **Rol:** Autoridad académica que evalúa las postulaciones de Telemática.
* **Menú que utiliza:** `Propuestas Convocatoria (M3)`.
* **Acciones principales:**
  1. Abre la propuesta `PROP-2026-TEL-003` y revisa el formulario y el PDF adjunto.
  2. Si tiene correcciones: presiona **"Observar"** y escribe el motivo. La propuesta se le desbloquea al postulante para que corrija y reenvíe.
  3. Si cumple con los requisitos: presiona **"Aprobar Propuesta"**.
  4. **Creación Automática:** El sistema crea de inmediato el proyecto activo `FCI-2026-TEL-003`, copia todos los datos y el PDF como versión v1.0, y designa a la Dra. Villacís como Directora.

---

### Paso 4: Docente Investigador FCI (Ing. Gabriel Romero)
* **Rol:** Profesor que investiga en laboratorio y debe justificar su carga horaria.
* **Menú que utiliza:** `Reportes de Investigadores (M6)`.
* **Archivos que maneja:** **PDF del Reporte Individual** (< 5 MB).
* **Acciones principales:**
  1. Ingresa a *Reportes de Investigadores* y busca su nombre.
  2. Presiona **"Editar Informe Individual"**.
  3. Escribe las horas efectivas dedicadas en el semestre (ej. 128 horas).
  4. Describe sus tareas: *"Calibración de 12 sensores de corriente y mediciones de enlace LoRaWAN en planta"*.
  5. Adjunta el PDF con sus bitácoras (< 5 MB).
  6. Presiona **"Enviar Informe Individual"**.

---

### Paso 5: Director de FCI Activo (MSc. Xavier Andrade)
* **Rol:** Docente responsable de un proyecto activo (`FCI-2025-TEL-001`).
* **Menú que utiliza:** `Proyectos FCI Activos (M4)` y `Reportes Semestrales FCI (M5)`.
* **Archivos que maneja:** **PDF del Reporte Semestral del FCI** (< 10 MB).
* **Acciones principales:**
  1. En *Proyectos FCI Activos*, consulta el avance de hitos de su cronograma y el presupuesto ejecutado.
  2. En *Reportes de Investigadores*, comprueba quiénes de su equipo ya enviaron su informe individual.
  3. En *Reportes Semestrales FCI*, presiona **"Completar / Editar Reporte"**, describe los avances técnicos del proyecto, obstáculos encontrados y los siguientes pasos.
  4. Sube el compendio general de evidencias en PDF (< 10 MB).
  5. Presiona **"Enviar Reporte y Bloquear Edición"**.

---

### Paso 6: Gestor de Conocimiento de la Carrera (MSc. Diana Paredes)
* **Rol:** Encargada del registro y custodia de la producción científica.
* **Menú que utiliza:** `Producción Científica (XLS) (M7)`.
* **Archivos que maneja:** **Archivo Excel XLS/XLSX** (< 4 MB).
* **Acciones principales:**
  1. Ingresa a *Producción Científica (XLS)* y presiona **"Cargar Nuevo Archivo XLS"**.
  2. Selecciona el Excel con las publicaciones del periodo.
  3. El motor del sistema analiza el archivo en tiempo real:
     * Valida que no supere 4 MB.
     * Comprueba la presencia de las 10 columnas obligatorias (*Código_FCI, Título_Publicación, Tipo_Producción, Autores_UG, Filiación_Institucional, Revista_Editorial, ISSN_ISBN, Indexación, DOI_URL y Fecha_Publicación*).
     * Certifica que al menos un autor posea filiación declarada a la **Universidad de Guayaquil**.
  4. Muestra una tabla interactiva con artículos Scopus Q1/Q2, Web of Science, Latindex y ponencias vinculadas a cada proyecto.

---

### Paso 7: Coordinador de Carrera (Dr. Roberto Silva) - Control y Cierre
* **Rol:** Supervisión final del cumplimiento y cierre de expedientes.
* **Menú que utiliza:** `Tableros y Reportes (M13)` y `Proyectos FCI Activos (M4)`.
* **Acciones principales:**
  1. **Semáforos de Cumplimiento:** En el tablero principal, revisa los colores del periodo `2026-CI`: verde (aprobados), ámbar (observados) y gris (pendientes).
  2. **Aprobar Reportes:** Revisa y aprueba los informes semestrales del Director y de los 8 investigadores.
  3. **Verificación de Cierre de Expediente (Regla RN-10):**
     * En la ficha de un proyecto que culmina su vigencia, presiona **"Verificar Cierre de Expediente"**.
     * Si el expediente tiene documentos pendientes o incompletos (< 100%), el sistema **BLOQUEA EL CIERRE EN ROJO** e indica la lista exacta de documentos faltantes.
     * Si el expediente está al 100% aprobado, autoriza la transición a estado **FINALIZADO** y el proyecto queda congelado de forma permanente en **Modo Solo Lectura**.

---

## 4. Matriz Resumen "Quién hace Qué"

| Actor | Pantalla / Módulo | Archivo que Gestiona | Acción Principal |
|---|---|---|---|
| **1. Administrador** | *Configuración y Usuarios* | Ninguno (configura el sistema) | Fija límites de peso en MB, calendarios y crea cuentas `@ug.edu.ec`. |
| **2. Futuro Director** | *Propuestas Convocatoria* | Sube **PDF Propuesta (< 10 MB)** | Postula el proyecto a concurso anual. |
| **3. Coordinador** | *Propuestas y Tableros* | Revisa el PDF de propuesta | **Aprueba la propuesta** y el sistema crea el proyecto activo. |
| **4. Investigador** | *Reportes de Investigadores* | Sube **PDF Individual (< 5 MB)** | Reporta sus horas trabajadas (ej. 128h) y actividades. |
| **5. Director FCI** | *Reportes Semestrales FCI* | Sube **PDF General (< 10 MB)** | Reporta el avance técnico general del proyecto ante la Facultad. |
| **6. Gestor Conocimiento** | *Producción Científica* | Sube **Excel XLS (< 4 MB)** | Carga y parsea artículos indexados en Scopus y WoS. |
| **7. Coordinador** | *Proyectos y Cierre* | Revisa todo el expediente | Verifica el 100% de completitud antes de autorizar el cierre formal. |

---

## 5. Reglas de Validación Inflexibles del Sistema

1. **Eliminación Lógica Estricta (Regla RN-21 y RN-22):** Ningún archivo puede borrarse físicamente. Al dar de baja un documento, se exige un motivo obligatorio y el archivo anterior permanece resguardado en la auditoría como histórico.
2. **Congelamiento tras el Envío (Regla RN-07 y RN-12):** Al enviar cualquier formulario, se bloquea contra edición para evitar que el autor cambie los datos a espaldas del revisor.
3. **Coherencia Temporal (Regla RN-19):** Las evidencias técnicas deben tener fechas correspondientes al periodo semestral activo y al cronograma del proyecto.
4. **Cierre Condicionado (Regla RN-10):** Ningún proyecto puede cerrarse si falta una sola evidencia de cualquiera de sus etapas.

---

## 6. Prueba Rápida en el Prototipo Web (3 Minutos)

1. En la barra superior, use el selector **"Simular Rol"** y elija **"Futuro Director (Dra. Elena Villacís)"**. Vaya a *Propuestas Convocatoria* y vea cómo se postula un proyecto.
2. Cambie el rol a **"Coordinador Telemática (Dr. Roberto Silva)"**, abra la propuesta y presione **"Aprobar Propuesta"**. Vaya a *Proyectos FCI Activos* y verá el nuevo proyecto creado automáticamente.
3. En *Proyectos FCI Activos*, seleccione el proyecto `FCI-2025-TEL-001` y presione **"Verificar Cierre de Expediente"** para ver cómo el sistema bloquea el cierre cuando el expediente no está al 100%.
4. En *Motor de Reglas Activas*, mueva la barra de tamaño a 12 MB y presione **"Ejecutar Validación Activa"** para presenciar el rechazo en tiempo real.
5. Para descargar el manual oficial formateado, presione el botón dorado **"Descargar Manual en PDF"** en la barra superior.
