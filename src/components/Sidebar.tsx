import React from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileSpreadsheet,
  FolderGit2,
  CalendarCheck,
  UserCheck2,
  FileCheck2,
  Files,
  ShieldAlert,
  History,
  BellRing,
  Search,
  BookMarked
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveModuleId =
  | 'dashboard'
  | 'users'
  | 'config'
  | 'proposals'
  | 'projects'
  | 'fci_reports'
  | 'researcher_reports'
  | 'scientific_production'
  | 'documents'
  | 'validation_engine'
  | 'audit'
  | 'notifications'
  | 'search'
  | 'dossier';

interface NavItem {
  id: ActiveModuleId;
  label: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  showOnly?: UserRole[];
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  activeModule: ActiveModuleId;
  onSelectModule: (module: ActiveModuleId) => void;
  currentRole: UserRole;
  pendingReviewsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  currentRole,
  pendingReviewsCount
}) => {
  const navSections: NavSection[] = [
    {
      title: 'RESUMEN Y MONITOREO',
      items: [
        {
          id: 'dashboard' as ActiveModuleId,
          label: 'Tableros y Reportes',
          code: 'M13',
          icon: LayoutDashboard
        },
        {
          id: 'search' as ActiveModuleId,
          label: 'Búsqueda y Ficha 360°',
          code: 'M12',
          icon: Search
        }
      ]
    },
    {
      title: 'CICLO DE VIDA FCI',
      items: [
        {
          id: 'proposals' as ActiveModuleId,
          label: 'Propuestas Convocatoria',
          code: 'M3',
          icon: FileSpreadsheet,
          badge: currentRole === 'COORDINADOR_CARRERA' ? '1' : undefined
        },
        {
          id: 'projects' as ActiveModuleId,
          label: 'Proyectos FCI Activos',
          code: 'M4',
          icon: FolderGit2,
          badge: '2 activos'
        },
        {
          id: 'fci_reports' as ActiveModuleId,
          label: 'Reportes Semestrales FCI',
          code: 'M5',
          icon: CalendarCheck,
          badge: currentRole === 'COORDINADOR_CARRERA' && pendingReviewsCount > 0 ? `${pendingReviewsCount}` : undefined
        },
        {
          id: 'researcher_reports' as ActiveModuleId,
          label: 'Reportes de Investigadores',
          code: 'M6',
          icon: UserCheck2,
          badge: '8 inv.'
        },
        {
          id: 'scientific_production' as ActiveModuleId,
          label: 'Producción Científica (XLS)',
          code: 'M7',
          icon: FileCheck2
        }
      ]
    },
    {
      title: 'EXPEDIENTES Y VALIDACIÓN',
      items: [
        {
          id: 'documents' as ActiveModuleId,
          label: 'Repositorio Documental',
          code: 'M8',
          icon: Files
        },
        {
          id: 'validation_engine' as ActiveModuleId,
          label: 'Motor de Reglas Activas',
          code: 'M9',
          icon: ShieldAlert
        },
        {
          id: 'audit' as ActiveModuleId,
          label: 'Trazabilidad y Auditoría',
          code: 'M10',
          icon: History
        }
      ]
    },
    {
      title: 'GOBIERNO Y SISTEMA',
      items: [
        {
          id: 'notifications' as ActiveModuleId,
          label: 'Notificaciones y Alertas',
          code: 'M11',
          icon: BellRing
        },
        {
          id: 'users' as ActiveModuleId,
          label: 'Usuarios y Roles',
          code: 'M1',
          icon: Users,
          showOnly: ['ADMINISTRADOR', 'COORDINADOR_CARRERA', 'GESTOR_CONOCIMIENTO']
        },
        {
          id: 'config' as ActiveModuleId,
          label: 'Configuración y Reglas',
          code: 'M2',
          icon: Settings,
          showOnly: ['ADMINISTRADOR', 'COORDINADOR_CARRERA']
        }
      ]
    },
    {
      title: 'ESPECIFICACIÓN FORMAL',
      items: [
        {
          id: 'dossier' as ActiveModuleId,
          label: 'Dossier Funcional (9 Ptos)',
          code: 'DOC',
          icon: BookMarked,
          highlight: true
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-57px)] border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">
            Piloto Activo
          </span>
          <p className="text-xs font-semibold text-white">Ingeniería en Telemática</p>
        </div>
        <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/60 px-1.5 py-0.5 rounded">
          UG 2026
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, sIdx) => {
          // Filter items based on current role permissions if specified
          const visibleItems = section.items.filter(
            (item) => !item.showOnly || item.showOnly.includes(currentRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
                {section.title}
              </span>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                      isActive
                        ? item.highlight
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'bg-blue-800 text-white font-semibold'
                        : item.highlight
                        ? 'text-amber-300 hover:bg-slate-800/80 hover:text-amber-200'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[9px] font-mono opacity-50">{item.code}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Universidad de Guayaquil</p>
        <p className="text-[10px] text-slate-500">Facultad de Ingeniería Industrial</p>
      </div>
    </aside>
  );
};
