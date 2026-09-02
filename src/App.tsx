import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { PasskeyModal } from './components/PasskeyModal';
import { AgentMappingModal } from './components/AgentMappingModal';
import { googleSheetSyncService } from './services/googleSheetSync';
import { useAuth } from './context/AuthContext';
import { Activity, Loader2, Database } from 'lucide-react';

const getInitialUrlState = () => {
  const params = new URLSearchParams(window.location.search);
  const view = (params.get('view') as ViewMode) || 'analytics';
  const search = params.get('search') || '';
  const status = params.get('status') || 'All';
  const priority = params.get('priority') || 'All';
  const category = params.get('category') || 'All';
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  const pageSize = parseInt(params.get('pageSize') || '15', 10);
  return { view, search, status, priority, category, page, pageSize };
};

export const App: React.FC = () => {
  const { isEditor } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  
  // URL Query Parameters State
  const initial = useMemo(() => getInitialUrlState(), []);
  const [currentView, setCurrentView] = useState<ViewMode>(initial.view);
  const [searchQuery, setSearchQuery] = useState(initial.search);
  const [statusFilter, setStatusFilter] = useState<string>(initial.status);
  const [priorityFilter, setPriorityFilter] = useState<string>(initial.priority);
  const [categoryFilter, setCategoryFilter] = useState<string>(initial.category);
  const [currentPage, setCurrentPage] = useState<number>(initial.page);
  const [pageSize, setPageSize] = useState<number>(initial.pageSize);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Sync state to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentView !== 'analytics') params.set('view', currentView);
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (priorityFilter !== 'All') params.set('priority', priorityFilter);
    if (categoryFilter !== 'All') params.set('category', categoryFilter);
    if (currentPage > 1) params.set('page', String(currentPage));
    if (pageSize !== 15) params.set('pageSize', String(pageSize));

    const queryString = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', queryString);
  }, [currentView, searchQuery, statusFilter, priorityFilter, categoryFilter, currentPage, pageSize]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialUrlState();
      setCurrentView(state.view);
      setSearchQuery(state.search);
      setStatusFilter(state.status);
      setPriorityFilter(state.priority);
      setCategoryFilter(state.category);
      setCurrentPage(state.page);
      setPageSize(state.pageSize);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fallback to analytics if in Viewer mode while on Kanban view
  useEffect(() => {
    if (!isEditor && currentView === 'kanban') {
      setCurrentView('analytics');
    }
  }, [isEditor, currentView]);

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

  // Filter issues for Analytics & Kanban (TableView has its own internal filtering connected to filters)
  const displayedIssues = useMemo(() => {
    return issues.filter((i) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = i.name.toLowerCase().includes(q);
        const matchDetails = i.details.toLowerCase().includes(q);
        const matchReporter = (i.createdBy || '').toLowerCase().includes(q);
        const matchCategory = (i.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDetails && !matchReporter && !matchCategory) {
          return false;
        }
      }
      if (statusFilter !== 'All' && i.action !== statusFilter) return false;
      if (priorityFilter !== 'All' && i.priority !== priorityFilter) return false;
      if (categoryFilter !== 'All' && i.category !== categoryFilter) return false;
      return true;
    });
  }, [issues, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[var(--canvas)] text-[var(--text-primary)] transition-colors">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-sky-500 shadow-xl mb-4 animate-pulse">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span>Loading BugPulse</span>
          <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-2 font-mono flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Mounting SQLite WASM Database Engine & Slack Dataset...</span>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent)] selection:text-white transition-colors duration-200">
      {/* Top Clean Sticky Navigation */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'analytics') {
            setStatusFilter('All');
            setPriorityFilter('All');
            setCategoryFilter('All');
            setCurrentPage(1);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
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
        {/* Clickable KPI Metric Overview Cards */}
        <StatsOverview
          issues={issues}
          onCardClick={({ status, priority }) => {
            setCurrentView('table');
            setCurrentPage(1);
            if (status !== undefined) setStatusFilter(status);
            if (priority !== undefined) setPriorityFilter(priority);
          }}
        />

        {/* View Content */}
        {currentView === 'analytics' && (
          <AnalyticsView
            issues={displayedIssues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onFilterCategory={(cat) => {
              setCurrentView('table');
              setCurrentPage(1);
              setCategoryFilter(cat);
            }}
            onFilterStatus={(st) => {
              setCurrentView('table');
              setCurrentPage(1);
              setStatusFilter(st);
            }}
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
            issues={issues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onUpdateStatus={handleUpdateStatus}
            searchTerm={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(st) => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={(pr) => {
              setPriorityFilter(pr);
              setCurrentPage(1);
            }}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={(cat) => {
              setCategoryFilter(cat);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-sky-200/80 dark:border-[#152a4a]/80 bg-white/80 dark:bg-[#050d1f]/85 py-4 px-6 text-center text-xs text-slate-500 transition-colors">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sky-700 dark:text-[#4a6a8a]">BugPulse</span>
            <span>•</span>
            <span>Client-side SQLite WASM</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">GitHub Pages Ready</span>
          </div>
          <div className="text-[11px] text-sky-500/80 dark:text-[#4a6a8a]">
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

      <PasskeyModal />

      <AgentMappingModal issues={issues} />
    </div>
  );
};

export default App;
