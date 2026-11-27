# Configuración de Supabase — UG-Investiga FCI

Este proyecto utiliza **Supabase** (PostgreSQL, Supabase Auth, Row Level Security y Supabase Storage) como infraestructura principal.

## Paso 1: Crear el proyecto en Supabase
1. Ingresa a [supabase.com](https://supabase.com) y crea un proyecto nuevo (por ejemplo `ug-investiga-fci`).
2. Copia las credenciales públicas desde **Project Settings → API**:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Publishable / anon key** → `VITE_SUPABASE_ANON_KEY`

> **IMPORTANTE DE SEGURIDAD:** Nunca coloques la clave `service_role` en el frontend ni en archivos `.env` públicos del cliente.

## Paso 2: Configurar Variables de Entorno
Agrega estas dos variables en tu entorno (`.env` local o Secrets del hosting):

```env
VITE_SUPABASE_URL="https://TU_PROYECTO.supabase.co"
VITE_SUPABASE_ANON_KEY="TU_CLAVE_ANON_O_PUBLISHABLE"
```

## Paso 3: Ejecutar las Migraciones SQL en Orden
En el **SQL Editor** de Supabase, ejecuta los archivos ubicados en `supabase/migrations/` en este orden exacto:

1. `001_schema.sql` — Crea las 19 tablas relacionales, claves primarias/foráneas, índices y restricciones `CHECK`.
2. `002_functions_triggers.sql` — Crea funciones `SECURITY DEFINER` para RLS, sincronización con `auth.users`, bloqueo de proyectos cerrados, RPC de aprobación automática de propuestas (`RF-11`) y baja lógica documental (`RN-22`).
3. `003_rls_policies.sql` — Habilita **Row Level Security (RLS)** en todas las tablas y define políticas granulares por rol y pertenencia al proyecto.
4. `004_storage.sql` — Crea el bucket privado `fci-documents` y sus políticas de acceso/subida en `storage.objects`.
5. `005_seed_data.sql` — Carga los datos piloto de la Carrera de Ingeniería en Telemática (11 usuarios, 2 proyectos FCI, 1 propuesta, 8 reportes individuales, producción científica, auditoría y parámetros).
6. `006_allow_any_email.sql` — *(Solo si ya habías corrido 001/002 antes)* Permite registro con cualquier correo válido.
7. `007_fix_permissions_and_sync_profiles.sql` — *(Solo si ya habías corrido 003 antes o aparece `permission denied for table profiles`)* Otorga permisos `GRANT` en `public` y sincroniza usuarios ya creados en `auth.users`.

## Paso 4: Crear los Primeros Usuarios en Supabase Auth
1. En **Authentication → Providers → Email**, asegúrate de tener **Email** habilitado (para pruebas rápidas puedes desactivar *Confirm email* temporalmente).
2. En **Authentication → Users → Add user**, puedes crear usuarios usando los mismos correos institucionales ya sembrados (el trigger `handle_new_user` los vinculará automáticamente con su perfil y roles):
   - Administrador: `carlos.mendoza@ug.edu.ec`
   - Coordinador de Carrera: `roberto.silva@ug.edu.ec`
   - Director FCI 001: `xavier.andrade@ug.edu.ec`
   - Futuro Director (Postulante): `elena.villacis@ug.edu.ec`
   - Docente Investigador: `gabriel.romero@ug.edu.ec`
   - Gestor de Conocimiento: `diana.paredes@ug.edu.ec`
3. También puedes registrarte directamente desde la pantalla de acceso de la aplicación usando cualquier correo electrónico válido.
