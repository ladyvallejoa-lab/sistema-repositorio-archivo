import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Key,
  Edit2,
  Lock,
  Mail
} from 'lucide-react';

interface AccessUsersModuleProps {
  users: UserProfile[];
  currentRole: UserRole;
  onUpdateUser: (updated: UserProfile) => void;
  onAddUser: (newUser: UserProfile) => void;
}

export const AccessUsersModule: React.FC<AccessUsersModuleProps> = ({
  users,
  currentRole,
  onUpdateUser,
  onAddUser
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['DOCENTE_INVESTIGADOR_FCI']);
  const [projectCode, setProjectCode] = useState('FCI-2025-TEL-001');
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const canManage = currentRole === 'ADMINISTRADOR';

  const handleToggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return; // Keep at least one
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleCreateUser = () => {
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    // Rule RN-01: Must be @ug.edu.ec
    if (!email.toLowerCase().endsWith('@ug.edu.ec')) {
      setErrorMsg('Regla RN-01 Bloqueante: Todo usuario debe poseer correo institucional con dominio @ug.edu.ec.');
      return;
    }

    const newUser: UserProfile = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name,
      email,
      career: 'Ingeniería en Telemática',
      faculty: 'Facultad de Ingeniería Industrial',
      roles: selectedRoles,
      active: true,
      fciProjects: projectCode ? [projectCode] : []
    };

    onAddUser(newUser);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setErrorMsg('');
    setSuccessBanner(`Usuario ${newUser.name} registrado con éxito con roles asignados.`);
  };

  const handleToggleActive = (user: UserProfile) => {
    const updated = { ...user, active: !user.active };
    onUpdateUser(updated);
    setSuccessBanner(`Estado de cuenta de ${user.name} actualizado a: ${updated.active ? 'Activo' : 'Inactivo'}.`);
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
            Administración de cuentas institucionales (@ug.edu.ec), adscripción a proyectos FCI y matriz de privilegios
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Usuario</span>
          </button>
        )}
      </div>

      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex justify-between items-center">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner('')} className="font-bold">
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
            Principio de menor privilegio aplicado por proyecto
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
                    <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
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
                          onClick={() => handleToggleActive(u)}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                        >
                          {u.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => alert(`Enviando enlace de restablecimiento de contraseña a ${u.email}...`)}
                          className="p-1 text-slate-500 hover:text-blue-900 rounded"
                          title="Restablecer contraseña"
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
                Correo Institucional (@ug.edu.ec)
              </label>
              <input
                type="email"
                placeholder="juan.perez@ug.edu.ec"
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
                <option value="FCI-2025-TEL-001">FCI-2025-TEL-001 (Plataforma IoT)</option>
                <option value="FCI-2025-TEL-002">FCI-2025-TEL-002 (Seguridad SDN)</option>
                <option value="">Ninguno (Postulante)</option>
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
                onClick={handleCreateUser}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-2xs"
              >
                Guardar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
