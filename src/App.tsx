/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserRole,
  UserProfile,
  FciProject,
  ProposalFCI,
  FciSemiAnnualReport,
  ResearcherSemiAnnualReport,
  ScientificProductionBatch,
  AuditLogEntry,
  SystemNotification,
  ConfigParameter,
  RequiredDocumentRule,
  DocumentMetadata
} from './types';
import {
  USERS_DATA,
  CONFIG_PARAMETERS_DATA,
  REQUIRED_DOCUMENT_RULES_DATA,
  FCI_PROJECTS_DATA,
  PROPOSALS_DATA,
  FCI_REPORTS_DATA,
  RESEARCHER_REPORTS_DATA,
  SCIENTIFIC_PRODUCTION_BATCHES_DATA,
  AUDIT_LOG_DATA,
  SYSTEM_NOTIFICATIONS_DATA
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar, ActiveModuleId } from './components/Sidebar';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { NotificationModal } from './components/NotificationModal';

// Module Components
import { DashboardModule } from './components/modules/DashboardModule';
import { ProposalsModule } from './components/modules/ProposalsModule';
import { ProjectsModule } from './components/modules/ProjectsModule';
import { FciReportsModule } from './components/modules/FciReportsModule';
import { ResearcherReportsModule } from './components/modules/ResearcherReportsModule';
import { ScientificProductionModule } from './components/modules/ScientificProductionModule';
import { DocumentRepositoryModule } from './components/modules/DocumentRepositoryModule';
import { ActiveValidationEngineModule } from './components/modules/ActiveValidationEngineModule';
import { AuditTraceabilityModule } from './components/modules/AuditTraceabilityModule';
import { NotificationsModule } from './components/modules/NotificationsModule';
import { SearchModule } from './components/modules/SearchModule';
import { AccessUsersModule } from './components/modules/AccessUsersModule';
import { ConfigModule } from './components/modules/ConfigModule';
import { FunctionalSpecificationModule } from './components/modules/FunctionalSpecificationModule';

export default function App() {
  // Current active role and simulated user
  const [currentRole, setCurrentRole] = useState<UserRole>('COORDINADOR_CARRERA');
  const [activeModule, setActiveModule] = useState<ActiveModuleId>('dashboard');

  // Application Data States
  const [users, setUsers] = useState<UserProfile[]>(USERS_DATA);
  const [projects, setProjects] = useState<FciProject[]>(FCI_PROJECTS_DATA);
  const [proposals, setProposals] = useState<ProposalFCI[]>(PROPOSALS_DATA);
  const [fciReports, setFciReports] = useState<FciSemiAnnualReport[]>(FCI_REPORTS_DATA);
  const [researcherReports, setResearcherReports] = useState<ResearcherSemiAnnualReport[]>(
    RESEARCHER_REPORTS_DATA
  );
  const [productionBatches, setProductionBatches] = useState<ScientificProductionBatch[]>(
    SCIENTIFIC_PRODUCTION_BATCHES_DATA
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(AUDIT_LOG_DATA);
  const [notifications, setNotifications] = useState<SystemNotification[]>(SYSTEM_NOTIFICATIONS_DATA);
  const [configParams, setConfigParams] = useState<ConfigParameter[]>(CONFIG_PARAMETERS_DATA);
  const [requiredDocRules, setRequiredDocRules] = useState<RequiredDocumentRule[]>(
    REQUIRED_DOCUMENT_RULES_DATA
  );

  // Modals
  const [selectedDocForModal, setSelectedDocForModal] = useState<DocumentMetadata | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [targetedProjectIdForValidation, setTargetedProjectIdForValidation] = useState<string>('');

  // Find active user based on role
  const currentUser: UserProfile =
    users.find((u) => u.roles.includes(currentRole)) || users[1];

  // Handlers
  const handleSelectRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    // Add audit entry for role switch simulation
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: newRole,
      action: 'EDITAR',
      entity: 'CONFIGURACION',
      entityId: 'SESION_USUARIO',
      entityDescription: `Cambio de rol de simulación a: ${newRole}`,
      ipAddress: '190.15.142.88'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleUpdateProposal = (updated: ProposalFCI) => {
    setProposals(proposals.map((p) => (p.id === updated.id ? updated : p)));
    // Audit log
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: updated.status === 'APROBADA' ? 'APROBAR' : updated.status === 'OBSERVADA' ? 'OBSERVAR' : 'EDITAR',
      entity: 'PROPUESTA',
      entityId: updated.id,
      entityDescription: `${updated.code} - ${updated.title}`,
      newValue: `Estado cambiado a: ${updated.status}`,
      ipAddress: '190.15.142.88'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  // RF-11: Automatic project creation upon proposal approval
  const handleApproveAndCreateProject = (approvedProposal: ProposalFCI) => {
    const newProjectId = `FCI-2026-TEL-003`;
    const newProject: FciProject = {
      id: newProjectId,
      code: newProjectId,
      title: approvedProposal.title,
      description: approvedProposal.summary,
      generalObjective: approvedProposal.generalObjective,
      specificObjectives: approvedProposal.specificObjectives,
      keywords: ['Edge AI', 'Ciberseguridad', 'Sensores Telemáticos'],
      researchLine: approvedProposal.researchLine,
      career: approvedProposal.career,
      faculty: 'Facultad de Ingeniería Industrial',
      academicPeriod: '2026-2027',
      startDate: new Date().toISOString().split('T')[0],
      estimatedEndDate: '2027-11-30',
      status: 'APROBADO',
      budgetAssigned: approvedProposal.budgetRequested,
      budgetExecuted: 0,
      currentSemester: 1,
      totalSemesters: 3,
      documentCompletenessPercent: 40,
      participants: [
        {
          userId: approvedProposal.applicantId,
          name: approvedProposal.applicantName,
          email: approvedProposal.applicantEmail,
          institutionalRole: 'Docente Titular Agregado',
          projectRole: 'DIRECTOR',
          dedicationHoursWeekly: 10
        }
      ],
      milestones: [
        {
          id: 'M-201',
          title: 'Adquisición y calibración de microcontroladores de borde',
          description: 'Pruebas preliminares con placas ESP32 y transceptores.',
          targetDate: '2026-12-15',
          progressPercent: 0,
          status: 'PENDIENTE',
          linkedDocumentIds: []
        }
      ],
      documents: [
        {
          id: `DOC-${Date.now()}`,
          name: `Propuesta_Oficial_Aprobada_${newProjectId}.pdf`,
          originalFileName: approvedProposal.documentName || 'Propuesta_Aprobada.pdf',
          category: 'PROPUESTA',
          type: 'PDF',
          sizeMb: approvedProposal.documentSizeMb || 7.4,
          uploadDate: new Date().toISOString().split('T')[0],
          uploaderName: approvedProposal.applicantName,
          uploaderRole: 'FUTURO_DIRECTOR_FCI',
          projectId: newProjectId,
          version: '1.0',
          isLatest: true,
          confidentiality: 'PUBLICO_UG',
          active: true,
          validations: [
            {
              ruleCode: 'RN-VAL-01',
              ruleName: 'Formato',
              status: 'ACEPTADO',
              message: 'PDF oficial aprobado.',
              timestamp: 'Reciente'
            }
          ]
        }
      ]
    };

    setProjects([...projects, newProject]);

    // Send automatic notification
    const newNotif: SystemNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `Nuevo Proyecto Creado: ${newProjectId}`,
      message: `La propuesta ${approvedProposal.code} ha sido formalmente aprobada y ha generado automáticamente el proyecto ${newProjectId}.`,
      type: 'APROBACION',
      targetRoles: ['COORDINADOR_CARRERA', 'DIRECTOR_FCI', 'GESTOR_CONOCIMIENTO'],
      targetUserId: approvedProposal.applicantId,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      linkModule: 'projects',
      emailSent: true
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleUpdateProject = (updated: FciProject) => {
    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: updated.status === 'FINALIZADO' ? 'APROBAR' : 'EDITAR',
      entity: 'PROYECTO',
      entityId: updated.id,
      entityDescription: `${updated.code} - ${updated.title}`,
      newValue: `Actualización de proyecto. Estado: ${updated.status}`,
      ipAddress: '190.15.142.88'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleUpdateFciReport = (updated: FciSemiAnnualReport) => {
    setFciReports(fciReports.map((r) => (r.id === updated.id ? updated : r)));
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: updated.status === 'APROBADO' ? 'APROBAR' : updated.status === 'OBSERVADO' ? 'OBSERVAR' : 'ENVIAR',
      entity: 'REPORTE_FCI',
      entityId: updated.id,
      entityDescription: `Reporte Semestral FCI ${updated.projectCode} (${updated.period})`,
      newValue: `Estado cambiado a: ${updated.status}`,
      ipAddress: '190.15.142.88'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleUpdateResearcherReport = (updated: ResearcherSemiAnnualReport) => {
    setResearcherReports(
      researcherReports.map((r) => (r.id === updated.id ? updated : r))
    );
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: updated.status === 'APROBADO' ? 'APROBAR' : updated.status === 'OBSERVADO' ? 'OBSERVAR' : 'ENVIAR',
      entity: 'REPORTE_INVESTIGADOR',
      entityId: updated.id,
      entityDescription: `Reporte Individual ${updated.researcherName} (${updated.projectCode})`,
      newValue: `Estado: ${updated.status}`,
      ipAddress: '190.15.142.88'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleUploadProductionBatch = (newBatch: ScientificProductionBatch) => {
    setProductionBatches([newBatch, ...productionBatches]);
    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: 'CARGAR_ARCHIVO',
      entity: 'PRODUCCION_CIENTIFICA',
      entityId: newBatch.id,
      entityDescription: `${newBatch.fileName} (${newBatch.recordCount} registros)`,
      newValue: `Importación validada de lote v${newBatch.version}.0`,
      ipAddress: '190.15.142.95'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  // Rule RN-22: Logical deletion with mandatory reason
  const handleDeleteDocument = (docId: string, reason: string) => {
    const updatedProjects = projects.map((p) => ({
      ...p,
      documents: p.documents.map((d) =>
        d.id === docId
          ? {
              ...d,
              active: false,
              deletionReason: reason,
              deletedBy: currentUser.name,
              deletedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : d
      )
    }));
    setProjects(updatedProjects);

    const log: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: 'ELIMINAR_LOGICO',
      entity: 'DOCUMENTO',
      entityId: docId,
      entityDescription: `Documento dado de baja lógica`,
      newValue: `Motivo: ${reason}`,
      ipAddress: '190.15.142.88'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleAddUser = (newUser: UserProfile) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const allDocumentsList: DocumentMetadata[] = projects.flatMap((p) => p.documents);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const pendingReviewsCount = fciReports.filter(
    (r) => r.status === 'EN_REVISION' || r.status === 'ENVIADO'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Institutional Top Bar */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenSearch={() => setActiveModule('search')}
        onOpenDossier={() => setActiveModule('dossier')}
        isDossierActive={activeModule === 'dossier'}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          currentRole={currentRole}
          pendingReviewsCount={pendingReviewsCount}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeModule === 'dashboard' && (
              <DashboardModule
                projects={projects}
                proposals={proposals}
                fciReports={fciReports}
                researcherReports={researcherReports}
                currentRole={currentRole}
                onNavigate={(mod) => setActiveModule(mod as ActiveModuleId)}
                onViewDocument={(doc) => setSelectedDocForModal(doc)}
              />
            )}

            {activeModule === 'proposals' && (
              <ProposalsModule
                proposals={proposals}
                currentRole={currentRole}
                onUpdateProposal={handleUpdateProposal}
                onApproveAndCreateProject={handleApproveAndCreateProject}
                onViewDocument={(doc) => setSelectedDocForModal(doc)}
              />
            )}

            {activeModule === 'projects' && (
              <ProjectsModule
                projects={projects}
                currentRole={currentRole}
                onUpdateProject={handleUpdateProject}
                onViewDocument={(doc) => setSelectedDocForModal(doc)}
                onNavigateToValidation={(projId) => {
                  setTargetedProjectIdForValidation(projId);
                  setActiveModule('validation_engine');
                }}
              />
            )}

            {activeModule === 'fci_reports' && (
              <FciReportsModule
                reports={fciReports}
                currentRole={currentRole}
                onUpdateReport={handleUpdateFciReport}
                onViewDocument={(doc) => setSelectedDocForModal(doc)}
              />
            )}

            {activeModule === 'researcher_reports' && (
              <ResearcherReportsModule
                reports={researcherReports}
                currentRole={currentRole}
                onUpdateReport={handleUpdateResearcherReport}
                onViewDocument={(doc) => setSelectedDocForModal(doc)}
              />
            )}

            {activeModule === 'scientific_production' && (
              <ScientificProductionModule
                batches={productionBatches}
                currentRole={currentRole}
                onUploadBatch={handleUploadProductionBatch}
              />
            )}

            {activeModule === 'documents' && (
              <DocumentRepositoryModule
                documents={allDocumentsList}
                currentRole={currentRole}
                onViewDocument={(doc) => setSelectedDocForModal(doc)}
                onDeleteDocument={handleDeleteDocument}
              />
            )}

            {activeModule === 'validation_engine' && (
              <ActiveValidationEngineModule
                projects={projects}
                rules={requiredDocRules}
                currentRole={currentRole}
                selectedProjectId={targetedProjectIdForValidation}
              />
            )}

            {activeModule === 'audit' && (
              <AuditTraceabilityModule logs={auditLogs} currentRole={currentRole} />
            )}

            {activeModule === 'notifications' && (
              <NotificationsModule
                notifications={notifications}
                currentRole={currentRole}
                onMarkAsRead={(id) => {
                  setNotifications(
                    notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
                  );
                }}
                onNavigate={(mod) => setActiveModule(mod as ActiveModuleId)}
              />
            )}

            {activeModule === 'search' && (
              <SearchModule
                projects={projects}
                users={users}
                documents={allDocumentsList}
                researcherReports={researcherReports}
                productionBatches={productionBatches}
                onViewDocument={(doc) => setSelectedDocForModal(doc)}
                onNavigateToProject={(projId) => {
                  setActiveModule('projects');
                }}
              />
            )}

            {activeModule === 'users' && (
              <AccessUsersModule
                users={users}
                currentRole={currentRole}
                onUpdateUser={handleUpdateUser}
                onAddUser={handleAddUser}
              />
            )}

            {activeModule === 'config' && (
              <ConfigModule
                parameters={configParams}
                rules={requiredDocRules}
                currentRole={currentRole}
                onUpdateParameter={(param) => {
                  setConfigParams(
                    configParams.map((p) => (p.id === param.id ? param : p))
                  );
                }}
                onUpdateRule={(rule) => {
                  setRequiredDocRules(
                    requiredDocRules.map((r) => (r.id === rule.id ? rule : r))
                  );
                }}
              />
            )}

            {activeModule === 'dossier' && <FunctionalSpecificationModule />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <DocumentViewerModal
        document={selectedDocForModal}
        onClose={() => setSelectedDocForModal(null)}
        onDeleteDocument={handleDeleteDocument}
        currentRole={currentRole}
      />

      <NotificationModal
        notifications={notifications}
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onMarkAsRead={(id) => {
          setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onMarkAllAsRead={() => {
          setNotifications(notifications.map((n) => ({ ...n, read: true })));
        }}
        onNavigateToModule={(mod) => setActiveModule(mod as ActiveModuleId)}
        currentRole={currentRole}
      />
    </div>
  );
}
