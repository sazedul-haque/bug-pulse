import React, { useEffect, useState, useCallback } from 'react';
import { dbService } from './db/sqlite';
import { Issue, IssuePriority, IssueStatus, ViewMode } from './types/issue';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { AnalyticsView } from './components/AnalyticsView';
import { KanbanView } from './components/KanbanView';
import { TableView } from './components/TableView';
import { IssueDrawer } from './components/IssueDrawer';
import { CreateIssueModal } from './components/CreateIssueModal';
import { SqlStudioModal } from './components/SqlStudioModal';
import { ImportExportModal } from './components/ImportExportModal';
import { googleSheetSyncService } from './services/googleSheetSync';
import { Activity, Loader2, Database } from 'lucide-react';

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSqlOpen, setIsSqlOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Refresh issues from SQLite DB
  const reloadData = useCallback(() => {
    const all = dbService.getAllIssues();
    setIssues(all);

    // Update selected issue if open
    if (selectedIssue) {
      const updated = all.find((i) => i.id === selectedIssue.id);
      setSelectedIssue(updated || null);
    }
  }, [selectedIssue]);

  // Initial DB load & Auto-sync check
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await dbService.init();
        if (mounted) {
          reloadData();
          setIsLoading(false);

          // Check if Auto-Sync with Google Sheets is enabled
          if (googleSheetSyncService.isAutoSyncEnabled() && googleSheetSyncService.getSavedUrl()) {
            googleSheetSyncService.syncLiveSheet().then((res) => {
              if (res.success && mounted) {
                reloadData();
              }
            });
          }
        }
      } catch (err) {
        console.error('Failed to initialize SQLite:', err);
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Update Status
  const handleUpdateStatus = (id: number, action: IssueStatus) => {
    dbService.updateStatus(id, action);
    reloadData();

    const updated = dbService.getAllIssues().find((i) => i.id === id);
    if (updated) {
      googleSheetSyncService.pushIssueToSheet(updated);
    }
  };

  // Update Priority
  const handleUpdatePriority = (id: number, priority: IssuePriority) => {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    const updated = { ...issue, priority };
    dbService.updateIssue(updated);
    reloadData();
    googleSheetSyncService.pushIssueToSheet(updated);
  };

  // Update Impact Count
  const handleUpdateImpact = (id: number, count: number) => {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    const updated = { ...issue, userImpactCount: count };
    dbService.updateIssue(updated);
    reloadData();
    googleSheetSyncService.pushIssueToSheet(updated);
  };

  // Delete Issue
  const handleDeleteIssue = (id: number) => {
    dbService.deleteIssue(id);
    setSelectedIssue(null);
    reloadData();
  };

  // Create Issue
  const handleCreateIssue = (data: any) => {
    const newIssue = dbService.insertIssue(data);
    reloadData();
    googleSheetSyncService.pushIssueToSheet(newIssue);
  };

  // Filter issues by quick search if applicable
  const displayedIssues = issues.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      i.details.toLowerCase().includes(q) ||
      i.createdBy.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/20 mb-4 animate-pulse">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Loading BugPulse</span>
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>Mounting SQLite WASM Database Engine & Slack Dataset...</span>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Clean Sticky Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenSql={() => setIsSqlOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onResetDb={() => {
          dbService.resetToDefault();
          reloadData();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* KPI Metric Overview */}
        <StatsOverview issues={issues} />

        {/* View Content */}
        {currentView === 'analytics' && (
          <AnalyticsView
            issues={displayedIssues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />
        )}

        {currentView === 'kanban' && (
          <KanbanView
            issues={displayedIssues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentView === 'table' && (
          <TableView
            issues={displayedIssues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 transition-colors">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-400">BugPulse</span>
            <span>•</span>
            <span>Client-side SQLite WASM</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">GitHub Pages Ready</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Powered by WebAssembly SQLite & React
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <IssueDrawer
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
        onUpdateImpact={handleUpdateImpact}
        onDelete={handleDeleteIssue}
      />

      <CreateIssueModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateIssue}
      />

      <SqlStudioModal
        isOpen={isSqlOpen}
        onClose={() => setIsSqlOpen(false)}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onDataChanged={reloadData}
      />
    </div>
  );
};

export default App;
