import React, { useState } from 'react';
import { SystemNotification, UserRole } from '../types';
import {
  X,
  Bell,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';

interface NotificationModalProps {
  notifications: SystemNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToModule: (moduleName: string) => void;
  currentRole: UserRole;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToModule,
  currentRole
}) => {
  const [selectedEmail, setSelectedEmail] = useState<SystemNotification | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-800 rounded-lg">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Bandeja de Notificaciones y Alertas</h3>
              <p className="text-[11px] text-slate-400">
                Avisos institucionales automatizados y recordatorios de calendario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-300 hover:text-white transition-colors"
            >
              Marcar todas como leídas
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tienes notificaciones pendientes.
            </div>
          ) : (
            notifications.map((item) => {
              const iconMap = {
                RECORDATORIO: <Clock className="w-4 h-4 text-blue-600" />,
                VENCIMIENTO: <AlertTriangle className="w-4 h-4 text-amber-600" />,
                OBSERVACION: <AlertTriangle className="w-4 h-4 text-rose-600" />,
                APROBACION: <CheckCircle className="w-4 h-4 text-emerald-600" />,
                ENVIO: <FileText className="w-4 h-4 text-indigo-600" />,
                ALERTA_DOCUMENTAL: <AlertTriangle className="w-4 h-4 text-amber-600" />
              };

              return (
                <div
                  key={item.id}
                  onClick={() => onMarkAsRead(item.id)}
                  className={`p-3 rounded-lg transition-colors cursor-pointer flex items-start gap-3 ${
                    !item.read ? 'bg-blue-50/60 border border-blue-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{iconMap[item.type] || <Bell className="w-4 h-4 text-slate-500" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs ${
                          !item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                        } truncate`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-600 font-mono shrink-0">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                    <div className="flex items-center gap-3 mt-2">
                      {item.linkModule && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToModule(item.linkModule!);
                            onClose();
                          }}
                          className="text-[11px] font-medium text-blue-700 hover:text-blue-900 flex items-center gap-1"
                        >
                          <span>Ir al módulo</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      {item.emailSent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmail(item);
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Ver correo institucional simulado</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Simulated Email Modal Sub-dialog */}
      {selectedEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold">Simulador de Correo Institucional UG</span>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-800">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 font-mono text-[11px]">
                <p>
                  <strong>De:</strong> gestion.investigacion@ug.edu.ec (Sistema FCI Telemática)
                </p>
                <p>
                  <strong>Para:</strong> {currentRole.toLowerCase()}@ug.edu.ec
                </p>
                <p>
                  <strong>Asunto:</strong> [UG-FCI] {selectedEmail.title}
                </p>
                <p>
                  <strong>Fecha:</strong> {selectedEmail.date}
                </p>
              </div>

              <div className="pt-2 leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-900 mb-2">Estimado(a) Miembro Académico,</p>
                <p>{selectedEmail.message}</p>
                <p className="mt-3 text-[11px] text-slate-500">
                  Este es un mensaje institucional automatizado generado por el Sistema de Gestión
                  Documental y Seguimiento de Proyectos FCI de la Facultad de Ingeniería Industrial.
                </p>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-3 py-1 bg-slate-800 text-white text-xs font-medium rounded"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
