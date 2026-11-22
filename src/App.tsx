/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
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
  DocumentMetadata,
  ProjectMilestone
} from './types';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Sidebar, ActiveModuleId } from './components/Sidebar';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { NotificationModal } from './components/NotificationModal';
import {
  fetchAllWorkspaceData,
  createOrSubmitProposal,
  observeProposal,
  approveProposalAndCreateProjectRpc,
  finalizeProjectInDb,
  updateProjectMilestoneProgress,
  updateFciReport,
  updateResearcherReport,
  uploadScientificProductionBatch,
  logicalDeleteDocumentRpc,
  createInstitutionalUser,
  toggleUserActiveStatus,
  sendPasswordResetEmail,
  saveConfigurationChanges,
  markNotificationReadInDb,
  markAllNotificationsReadInDb
} from './services/supabaseService';

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
import { ClientUserManualModule } from './components/modules/ClientUserManualModule';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const {
    isConfigured,
    session,
    profile,
    assignedRoles,
    activeRole,
    setActiveRole,
    loading: authLoading,
    profileError,
    signOut
  } = useAuth();

  const [activeModule, setActiveModule] = useState<ActiveModuleId>('dashboard');

  // Application Data States loaded from Supabase PostgreSQL
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<FciProject[]>([]);
  const [proposals, setProposals] = useState<ProposalFCI[]>([]);
  const [fciReports, setFciReports] = useState<FciSemiAnnualReport[]>([]);
  const [researcherReports, setResearcherReports] = useState<ResearcherSemiAnnualReport[]>([]);
  const [productionBatches, setProductionBatches] = useState<ScientificProductionBatch[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [configParams, setConfigParams] = useState<ConfigParameter[]>([]);
  const [requiredDocRules, setRequiredDocRules] = useState<RequiredDocumentRule[]>([]);
  const [standaloneDocuments, setStandaloneDocuments] = useState<DocumentMetadata[]>([]);

  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Modals
  const [selectedDocForModal, setSelectedDocForModal] = useState<DocumentMetadata | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [targetedProjectIdForValidation, setTargetedProjectIdForValidation] = useState<string>('');

  const reloadData = useCallback(async () => {
    if (!profile?.id) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const dataset = await fetchAllWorkspaceData(profile.id);
      setUsers(dataset.users);
      setProjects(dataset.projects);
      setProposals(dataset.proposals);
      setFciReports(dataset.fciReports);
      setResearcherReports(dataset.researcherReports);
      setProductionBatches(dataset.productionBatches);
      setAuditLogs(dataset.auditLogs);
      setNotifications(dataset.notifications);
      setConfigParams(dataset.configParams);
      setRequiredDocRules(dataset.requiredDocRules);
      setStandaloneDocuments(dataset.standaloneDocuments);
    } catch (err: any) {
      setDataError(err?.message || 'Error al sincronizar datos desde Supabase PostgreSQL.');
    } finally {
      setDataLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (isConfigured && session && profile?.id) {
      reloadData();
    }
  }, [isConfigured, session, profile?.id, reloadData]);

  // Auth / Setup Gates
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-700 font-sans">
        <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
          UG
        </div>
        <p className="text-xs font-medium">Verificando sesión institucional en Supabase...</p>
      </div>
    );
  }

  if (!isConfigured || !session || !profile || profileError) {
    return <AuthScreen />;
  }

  const actor = {
    id: profile.id,
    name: profile.name,
    role: activeRole
  };

  // Deduplicated document repository list (project docs + proposal/production standalone docs)
  const docMap = new Map<string, DocumentMetadata>();
  for (const d of projects.flatMap((p) => p.documents)) {
    docMap.set(d.id, d);
  }
  for (const d of standaloneDocuments) {
    if (!docMap.has(d.id)) {
      docMap.set(d.id, d);
    }
  }
  const allDocumentsList: DocumentMetadata[] = Array.from(docMap.values());

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const pendingReviewsCount = fciReports.filter(
    (r) => r.status === 'EN_REVISION' || r.status === 'ENVIADO'
  ).length;

  // Handlers wired to Supabase PostgreSQL + Storage
  const handleSelectRole = (newRole: UserRole) => {
    setActiveRole(newRole);
  };

  const handleSaveOrSubmitProposal = async (params: {
    proposalId?: string;
    title: string;
    researchLine: string;
    summary: string;
    generalObjective: string;
    budgetRequested: number;
    status: 'BORRADOR' | 'ENVIADA';
    file?: File | null;
    maxSizeMb: number;
  }) => {
    await createOrSubmitProposal({ ...params, actor });
    await reloadData();
  };

  const handleObserveProposal = async (proposal: ProposalFCI, notes: string) => {
    await observeProposal({ proposal, notes, actor });
    await reloadData();
  };

  const handleApproveProposal = async (proposal: ProposalFCI) => {
    await approveProposalAndCreateProjectRpc(proposal.id);
    await reloadData();
  };

  const handleFinalizeProject = async (project: FciProject) => {
    await finalizeProjectInDb({ project, actor });
    await reloadData();
  };

  const handleUpdateMilestone = async (params: {
    milestoneId: string;
    projectCode: string;
    progressPercent: number;
    status: ProjectMilestone['status'];
  }) => {
    await updateProjectMilestoneProgress({ ...params, actor });
    await reloadData();
  };

  const handleSubmitOrSaveFciReport = async (params: {
    report: FciSemiAnnualReport;
    nextStatus: 'BORRADOR' | 'ENVIADO';
    summaryAdvances: string;
    encounteredObstacles: string;
    nextSteps: string;
    file?: File | null;
    maxSizeMb: number;
  }) => {
    await updateFciReport({ ...params, actor });
    await reloadData();
  };

  const handleReviewFciReport = async (params: {
    report: FciSemiAnnualReport;
    nextStatus: 'APROBADO' | 'OBSERVADO';
    reviewNotes?: string;
  }) => {
    await updateFciReport({
      report: params.report,
      nextStatus: params.nextStatus,
      summaryAdvances: params.report.summaryAdvances,
      encounteredObstacles: params.report.encounteredObstacles,
      nextSteps: params.report.nextSteps,
      reviewNotes: params.reviewNotes,
      maxSizeMb: 10,
      actor
    });
    await reloadData();
  };

  const handleSubmitOrSaveResearcherReport = async (params: {
    report: ResearcherSemiAnnualReport;
    nextStatus: 'BORRADOR' | 'ENVIADO';
    hoursDedicated: number;
    activitiesDescription: string;
    file?: File | null;
    maxSizeMb: number;
  }) => {
    await updateResearcherReport({ ...params, actor });
    await reloadData();
  };

  const handleReviewResearcherReport = async (params: {
    report: ResearcherSemiAnnualReport;
    nextStatus: 'APROBADO' | 'OBSERVADO';
    reviewNotes?: string;
  }) => {
    await updateResearcherReport({
      report: params.report,
      nextStatus: params.nextStatus,
      hoursDedicated: params.report.hoursDedicated,
      activitiesDescription: params.report.activitiesDescription,
      reviewNotes: params.reviewNotes,
      maxSizeMb: 5,
      actor
    });
    await reloadData();
  };

  const handleUploadProductionBatch = async (params: {
    period: string;
    file: File | null;
    fileName: string;
    fileSizeMb: number;
    nextVersion: number;
    itemsToImport: ScientificProductionBatch['items'];
    maxSizeMb: number;
  }) => {
    await uploadScientificProductionBatch({ ...params, actor });
    await reloadData();
  };

  const handleDeleteDocument = async (docId: string, reason: string) => {
    await logicalDeleteDocumentRpc(docId, reason);
    await reloadData();
  };

  const handleCreateUser = async (params: {
    name: string;
    email: string;
    roles: UserRole[];
    projectCode?: string;
  }) => {
    await createInstitutionalUser({ ...params, actor });
    await reloadData();
  };

  const handleToggleUserActive = async (user: UserProfile) => {
    await toggleUserActiveStatus({
      userId: user.id,
      nextActive: !user.active,
      userName: user.name,
      actor
    });
    await reloadData();
  };

  const handleResetUserPassword = async (email: string) => {
    await sendPasswordResetEmail(email);
  };

  const handleSaveConfig = async (params: ConfigParameter[], rules: RequiredDocumentRule[]) => {
    await saveConfigurationChanges({ parameters: params, rules, actor });
    await reloadData();
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
    await markNotificationReadInDb(notifId, profile.id);
  };

  const handleMarkAllNotificationsRead = async () => {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsReadInDb(ids, profile.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Institutional Top Bar */}
      <Header
        currentRole={activeRole}
        assignedRoles={assignedRoles}
        currentUser={profile}
        onSelectRole={handleSelectRole}
        onSignOut={signOut}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenSearch={() => setActiveModule('search')}
        onOpenDossier={() => setActiveModule('dossier')}
        isDossierActive={activeModule === 'dossier'}
        onOpenManual={() => setActiveModule('manual')}
        isManualActive={activeModule === 'manual'}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          currentRole={activeRole}
          pendingReviewsCount={pendingReviewsCount}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {dataError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{dataError}</span>
                </div>
                <button
                  onClick={reloadData}
                  className="px-3 py-1 bg-rose-700 text-white rounded font-semibold hover:bg-rose-800 shrink-0"
                >
                  Reintentar
                </button>
              </div>
            )}

            {dataLoading && projects.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2 text-xs text-slate-600">
                <RefreshCw className="w-6 h-6 text-blue-800 animate-spin mx-auto" />
                <p className="font-semibold text-slate-800">
                  Cargando expediente institucional desde Supabase PostgreSQL...
                </p>
              </div>
            ) : (
              <>
                {activeModule === 'dashboard' && (
                  <DashboardModule
                    projects={projects}
                    proposals={proposals}
                    fciReports={fciReports}
                    researcherReports={researcherReports}
                    currentRole={activeRole}
                    onNavigate={(mod) => setActiveModule(mod as ActiveModuleId)}
                    onViewDocument={(doc) => setSelectedDocForModal(doc)}
                  />
                )}

                {activeModule === 'proposals' && (
                  <ProposalsModule
                    proposals={proposals}
                    allDocuments={allDocumentsList}
                    configParams={configParams}
                    currentRole={activeRole}
                    onSaveOrSubmitProposal={handleSaveOrSubmitProposal}
                    onObserveProposal={handleObserveProposal}
                    onApproveProposal={handleApproveProposal}
                    onViewDocument={(doc) => setSelectedDocForModal(doc)}
                  />
                )}

                {activeModule === 'projects' && (
                  <ProjectsModule
                    projects={projects}
                    currentRole={activeRole}
                    onFinalizeProject={handleFinalizeProject}
                    onUpdateMilestone={handleUpdateMilestone}
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
                    allDocuments={allDocumentsList}
                    configParams={configParams}
                    currentRole={activeRole}
                    onSubmitOrSaveReport={handleSubmitOrSaveFciReport}
                    onReviewReport={handleReviewFciReport}
                    onViewDocument={(doc) => setSelectedDocForModal(doc)}
                  />
                )}

                {activeModule === 'researcher_reports' && (
                  <ResearcherReportsModule
                    reports={researcherReports}
                    allDocuments={allDocumentsList}
                    configParams={configParams}
                    currentRole={activeRole}
                    onSubmitOrSaveReport={handleSubmitOrSaveResearcherReport}
                    onReviewReport={handleReviewResearcherReport}
                    onViewDocument={(doc) => setSelectedDocForModal(doc)}
                  />
                )}

                {activeModule === 'scientific_production' && (
                  <ScientificProductionModule
                    batches={productionBatches}
                    allDocuments={allDocumentsList}
                    configParams={configParams}
                    currentRole={activeRole}
                    onUploadBatch={handleUploadProductionBatch}
                  />
                )}

                {activeModule === 'documents' && (
                  <DocumentRepositoryModule
                    documents={allDocumentsList}
                    currentRole={activeRole}
                    onViewDocument={(doc) => setSelectedDocForModal(doc)}
                    onDeleteDocument={handleDeleteDocument}
                  />
                )}

                {activeModule === 'validation_engine' && (
                  <ActiveValidationEngineModule
                    projects={projects}
                    rules={requiredDocRules}
                    configParams={configParams}
                    currentRole={activeRole}
                    selectedProjectId={targetedProjectIdForValidation}
                  />
                )}

                {activeModule === 'audit' && (
                  <AuditTraceabilityModule logs={auditLogs} currentRole={activeRole} />
                )}

                {activeModule === 'notifications' && (
                  <NotificationsModule
                    notifications={notifications}
                    currentRole={activeRole}
                    onMarkAsRead={handleMarkNotificationRead}
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
                    onNavigateToProject={() => {
                      setActiveModule('projects');
                    }}
                  />
                )}

                {activeModule === 'users' && (
                  <AccessUsersModule
                    users={users}
                    projects={projects}
                    currentRole={activeRole}
                    onCreateUser={handleCreateUser}
                    onToggleUserActive={handleToggleUserActive}
                    onResetUserPassword={handleResetUserPassword}
                  />
                )}

                {activeModule === 'config' && (
                  <ConfigModule
                    parameters={configParams}
                    rules={requiredDocRules}
                    currentRole={activeRole}
                    onSaveConfig={handleSaveConfig}
                  />
                )}

                {activeModule === 'dossier' && <FunctionalSpecificationModule />}
                {activeModule === 'manual' && <ClientUserManualModule />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <DocumentViewerModal
        document={selectedDocForModal}
        onClose={() => setSelectedDocForModal(null)}
        onDeleteDocument={handleDeleteDocument}
        currentRole={activeRole}
      />

      <NotificationModal
        notifications={notifications}
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onNavigateToModule={(mod) => setActiveModule(mod as ActiveModuleId)}
        currentRole={activeRole}
      />
    </div>
  );
}
