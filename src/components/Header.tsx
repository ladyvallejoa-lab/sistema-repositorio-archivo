import React from 'react';
import { UserRole, UserProfile } from '../types';
import { USERS_DATA } from '../data/mockData';
import { Bell, BookOpen, Search, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  currentUser: UserProfile;
  onSelectRole: (role: UserRole) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenDossier: () => void;
  isDossierActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUser,
  onSelectRole,
  unreadCount,
  onOpenNotifications,
  onOpenSearch,
  onOpenDossier,
  isDossierActive
}) => {
  const roleLabels: Record<UserRole, { label: string; user: string; color: string }> = {
    ADMINISTRADOR: {
      label: 'Administrador General',
      user: 'Ing. Carlos Mendoza',
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    },
    COORDINADOR_CARRERA: {
      label: 'Coordinador Telemática',
      user: 'Dr. Roberto Silva, PhD',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    GESTOR_CONOCIMIENTO: {
      label: 'Gestor de Conocimiento',
      user: 'MSc. Diana Paredes',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    DIRECTOR_FCI: {
      label: 'Director de FCI (001)',
      user: 'MSc. Xavier Andrade',
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    FUTURO_DIRECTOR_FCI: {
      label: 'Futuro Director (Postulante)',
      user: 'Dra. Elena Villacís',
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    DOCENTE_INVESTIGADOR_FCI: {
      label: 'Docente Investigador FCI',
      user: 'Ing. Gabriel Romero',
      color: 'text-teal-700 bg-teal-50 border-teal-200'
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
            UG
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-900 tracking-tight leading-tight">
              UG-Investiga FCI
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Facultad de Ingeniería Industrial · Carrera de Telemática
            </span>
          </div>
        </div>

        {/* Center Zone: Role Switcher Simulation */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-600">
            <UserCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Simular Rol:</span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => onSelectRole(e.target.value as UserRole)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="COORDINADOR_CARRERA">Coordinador Telemática (Dr. Roberto Silva)</option>
            <option value="DIRECTOR_FCI">Director de FCI (MSc. Xavier Andrade)</option>
            <option value="DOCENTE_INVESTIGADOR_FCI">Docente Investigador (Ing. Gabriel Romero)</option>
            <option value="GESTOR_CONOCIMIENTO">Gestor de Conocimiento (MSc. Diana Paredes)</option>
            <option value="FUTURO_DIRECTOR_FCI">Futuro Director FCI (Dra. Elena Villacís)</option>
            <option value="ADMINISTRADOR">Administrador Sistema (Ing. Carlos Mendoza)</option>
          </select>
        </div>

        {/* Action Controls & User Identity */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Dossier Button */}
          <button
            onClick={onOpenDossier}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isDossierActive
                ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Ver Documento Completo de Análisis Funcional (9 Entregables)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dossier Funcional (9 Entregables)</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Búsqueda global y consultas"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notificaciones y alertas"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-300">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-blue-700 font-medium truncate max-w-[140px]">
                {roleLabels[currentRole]?.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
