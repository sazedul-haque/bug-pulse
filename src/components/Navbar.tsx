import React from 'react';
import {
  Activity,
  BarChart3,
  Kanban,
  Table as TableIcon,
  Terminal,
  Plus,
  Upload,
  Search,
  Sun,
  Moon,
  Database,
} from 'lucide-react';
import { ViewMode } from '../types/issue';
import { useTheme } from '../context/ThemeContext';

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
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100/70 dark:hover:bg-purple-950/50 transition-all ml-0.5"
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-200 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Import / Export */}
          <button
            onClick={onOpenImportExport}
            title="Import/Export CSV or SQLite Backup"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden xl:inline">Sync / CSV</span>
          </button>

          {/* Create Issue */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">New Issue</span>
          </button>
        </div>
      </div>
    </header>
  );
};
