import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Kanban,
  Table as TableIcon,
  Terminal,
  Plus,
  Search,
  Sun,
  Moon,
  Database,
  Zap,
  Lock,
  Unlock,
} from 'lucide-react';
import { ViewMode } from '../types/issue';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { googleSheetSyncService } from '../services/googleSheetSync';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreate: () => void;
  onOpenSql: () => void;
  onOpenImportExport: () => void;
  onResetDb?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onOpenCreate,
  onOpenSql,
  onOpenImportExport,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isEditor, openPasskeyModal } = useAuth();
  const [hasLiveSync, setHasLiveSync] = useState(false);

  useEffect(() => {
    setHasLiveSync(Boolean(googleSheetSyncService.getSavedUrl()));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/20">
            <Activity className="h-4.5 w-4.5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                BugPulse
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/40">
                <Database className="h-3 w-3" />
                SQLite WASM
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
              Slack Support Workflow & Triage
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center rounded-xl bg-slate-100/90 dark:bg-slate-900/90 p-1 border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => onViewChange('analytics')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={() => onViewChange('kanban')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              currentView === 'kanban'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>

          <button
            onClick={() => onViewChange('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              currentView === 'table'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Data Grid</span>
          </button>

          <button
            onClick={onOpenSql}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-purple-950/50 transition-all ml-0.5 cursor-pointer"
            title="SQL Query Studio"
          >
            <Terminal className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden lg:inline">SQL Studio</span>
          </button>
        </nav>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 lg:w-52 rounded-lg bg-slate-100 dark:bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Sync / CSV Trigger */}
          <button
            onClick={onOpenImportExport}
            title={hasLiveSync ? 'Slack Live Sync Connected' : 'Connect Slack Sync / CSV'}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs cursor-pointer"
          >
            <div className="relative flex items-center">
              <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {hasLiveSync && (
                <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              )}
            </div>
            <span className="hidden xl:inline">Sync / CSV</span>
          </button>

          {/* Auth Role Badge (Viewer / Editor) */}
          <button
            onClick={openPasskeyModal}
            title={isEditor ? 'Editor Mode Active (Click to manage)' : 'Viewer Mode (Click to unlock Editor)'}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all cursor-pointer shadow-2xs ${
              isEditor
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isEditor ? (
              <>
                <Unlock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden lg:inline">Editor</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span className="hidden lg:inline">Viewer</span>
              </>
            )}
          </button>

          {/* Create Issue */}
          <button
            onClick={() => {
              if (!isEditor) {
                openPasskeyModal();
              } else {
                onOpenCreate();
              }
            }}
            title={isEditor ? 'Create a new support issue' : 'Unlock Editor to create issues'}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40 active:scale-98 transition-all cursor-pointer"
          >
            {isEditor ? <Plus className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            <span className="whitespace-nowrap">New Issue</span>
          </button>
        </div>
      </div>
    </header>
  );
};
