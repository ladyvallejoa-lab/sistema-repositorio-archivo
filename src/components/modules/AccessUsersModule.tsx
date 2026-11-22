import React, { useState } from 'react';
import { FciProject, UserProfile, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Key
} from 'lucide-react';

interface AccessUsersModuleProps {
  users: UserProfile[];
  projects: FciProject[];
  currentRole: UserRole;
  onCreateUser: (params: {
    name: string;
    email: string;
    roles: UserRole[];
    projectCode?: string;
  }) => Promise<void>;
  onToggleUserActive: (user: UserProfile) => Promise<void>;
  onResetUserPassword: (email: string) => Promise<void>;
}

export const AccessUsersModule: React.FC<AccessUsersModuleProps> = ({
  users,
  projects,
  currentRole,
  onCreateUser,
  onToggleUserActive,
  onResetUserPassword
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['DOCENTE_INVESTIGADOR_FCI']);
  const [projectCode, setProjectCode] = useState(projects[0]?.code || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canManage = currentRole === 'ADMINISTRADOR';

  const handleToggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return;
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleCreateUser = async () => {
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Ingrese una dirección de correo electrónico válida.');
      return;
    }

    setIsSaving(true);
    try {
      await onCreateUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        roles: selectedRoles,
        projectCode: projectCode || undefined
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setErrorMsg('');
      setBanner({
        type: 'success',
        msg: `Usuario ${name.trim()} registrado en PostgreSQL. Al iniciar/registrarse con ese correo en Supabase Auth se vinculará automáticamente.`
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al registrar usuario en PostgreSQL.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    setIsSaving(true);
    try {
      await onToggleUserActive(user);
      setBanner({
        type: 'success',
        msg: `Estado de cuenta de ${user.name} actualizado en Supabase a: ${!user.active ? 'Activo' : 'Inactivo'}.`
      });
    } catch (err: any) {
      setBanner({
        type: 'error',
        msg: err?.message || 'No se pudo cambiar el estado del usuario.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async (userEmail: string) => {
    setIsSaving(true);
    try {
      await onResetUserPassword(userEmail);
      setBanner({
        type: 'success',
        msg: `Enlace de restablecimiento enviado vía Supabase Auth al correo ${userEmail}.`
      });
    } catch (err: any) {
      setBanner({
        type: 'error',
        msg: err?.message || 'No se pudo enviar el correo de recuperación.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <Users className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 1 · CONTROL DE ACCESO, ROLES Y PERMISOS</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Gestión de Usuarios, Credenciales y Multi-Roles
          </h1>
          <p className="text-xs text-slate-500">
            Administración de cuentas de usuario, adscripción a proyectos FCI y matriz de privilegios RLS
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setErrorMsg('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Usuario</span>
          </button>
        )}
      </div>

      {banner && (
        <div
          className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{banner.msg}</span>
          <button onClick={() => setBanner(null)} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Usuarios Registrados en Telemática ({users.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Principio de menor privilegio aplicado por Row Level Security (RLS)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Usuario / Nombre</th>
                <th className="py-2.5 px-4">Correo Institucional</th>
                <th className="py-2.5 px-4">Roles Asignados (Multi-rol)</th>
                <th className="py-2.5 px-4">Proyectos Asignados</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {u.userCode || u.id}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {r.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {u.fciProjects.length > 0 ? (
                      <span className="text-blue-900 font-bold">
                        {u.fciProjects.join(', ')}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Sin proyecto adscrito</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {canManage && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={isSaving}
                          onClick={() => handleToggleActive(u)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium disabled:opacity-50"
                        >
                          {u.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          disabled={isSaving}
                          onClick={() => handleResetPassword(u.email)}
                          className="p-1 text-slate-500 hover:text-blue-900 rounded disabled:opacity-50"
                          title="Enviar enlace de restablecimiento de contraseña"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-300 max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Registrar Nuevo Usuario Institucional
            </h3>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombres y Apellidos</label>
              <input
                type="text"
                placeholder="Ej. MSc. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-slate-900 bg-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Selección de Roles (Soporte Multi-Rol)
              </label>
              <div className="space-y-1.5">
                {(
                  [
                    'COORDINADOR_CARRERA',
                    'GESTOR_CONOCIMIENTO',
                    'DIRECTOR_FCI',
                    'DOCENTE_INVESTIGADOR_FCI',
                    'FUTURO_DIRECTOR_FCI'
                  ] as UserRole[]
                ).map((role) => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleToggleRole(role)}
                      className="rounded border-slate-300 text-blue-900 focus:ring-blue-600"
                    />
                    <span className="text-slate-800 text-[11px] font-medium">
                      {role.replace(/_/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Proyecto Asignado Inicialmente
              </label>
              <select
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-slate-900 bg-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.code} ({p.title.slice(0, 32)}...)
                  </option>
                ))}
                <option value="">Ninguno (Postulante / Gestor)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                disabled={isSaving}
                onClick={handleCreateUser}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
