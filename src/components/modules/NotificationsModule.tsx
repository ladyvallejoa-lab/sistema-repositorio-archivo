import React from 'react';
import { SystemNotification, UserRole } from '../../types';
import {
  BellRing,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Mail,
  Send,
  ExternalLink
} from 'lucide-react';

interface NotificationsModuleProps {
  notifications: SystemNotification[];
  currentRole: UserRole;
  onMarkAsRead: (id: string) => void;
  onNavigate: (module: string) => void;
}

export const NotificationsModule: React.FC<NotificationsModuleProps> = ({
  notifications,
  currentRole,
  onMarkAsRead,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
            <BellRing className="w-4 h-4 text-blue-800" />
            <span>MÓDULO 11 · NOTIFICACIONES Y ALERTAS INSTITUCIONALES</span>
          </div>
          <h1 className="text-base font-bold text-slate-900">
            Centro de Notificaciones, Alertas y Mensajería
          </h1>
          <p className="text-xs text-slate-500">
            Avisos de vencimiento próximo, alertas de evidencias faltantes y trazabilidad de correos institucionales (@ug.edu.ec)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-blue-50 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold">
            {notifications.filter((n) => !n.read).length} no leídas
          </span>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => onMarkAsRead(item.id)}
            className={`p-4 transition-colors cursor-pointer flex items-start gap-4 ${
              !item.read ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'
            }`}
          >
            <div className="mt-1 shrink-0">
              {item.type === 'RECORDATORIO' ? (
                <Clock className="w-5 h-5 text-blue-600" />
              ) : item.type === 'VENCIMIENTO' || item.type === 'ALERTA_DOCUMENTAL' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : item.type === 'OBSERVACION' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <h3
                  className={`text-sm ${
                    !item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                  }`}
                >
                  {item.title}
                </h3>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">
                  {item.date}
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed text-xs">{item.message}</p>

              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-200/50">
                {item.linkModule && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(item.linkModule!);
                    }}
                    className="font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1 text-[11px]"
                  >
                    <span>Abrir módulo correspondiente</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                {item.emailSent && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>Disparado a correo institucional @ug.edu.ec</span>
                  </span>
                )}
              </div>
            </div>

            {!item.read && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
