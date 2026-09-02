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
  Zap,
  Lock,
  Unlock,
  Users,
} from 'lucide-react';
import { ViewMode } from '../types/issue';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
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
  const { openAgentModal } = useAgent();
  const [hasLiveSync, setHasLiveSync] = useState(false);

  useEffect(() => {
    setHasLiveSync(Boolean(googleSheetSyncService.getSavedUrl()));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-200/80 dark:border-[#152a4a]/80 bg-white/90 dark:bg-[#050d1f]/92 backdrop-blur-xl transition-colors duration-200 shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div
          onClick={() => onViewChange('analytics')}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="BugPulse Home (Analytics)"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 shadow-xs group-hover:scale-105 transition-transform">
            <Activity className="h-4 w-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-sky-900 dark:text-sky-50 leading-none block">
              BugPulse
            </span>
            <p className="hidden md:block text-[11px] text-sky-400/70 dark:text-[#3a5a7a] mt-0.5">
              Slack Support Workflow & Triage
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center rounded-xl bg-sky-50/90 dark:bg-[#0a1628]/90 p-1 border border-sky-200/80 dark:border-[#152a4a]">
          <button
            onClick={() => onViewChange('analytics')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-white dark:bg-cyan-600/90 text-cyan-700 dark:text-sky-50 shadow-sm font-semibold border border-sky-200 dark:border-transparent'
                : 'text-sky-600/80 dark:text-sky-400/60 hover:text-sky-900 dark:hover:text-sky-100 hover:bg-white/60 dark:hover:bg-[#0f2040]/60'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          {isEditor && (
            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-cyan-600/90 text-cyan-700 dark:text-sky-50 shadow-sm font-semibold border border-sky-200 dark:border-transparent'
                  : 'text-sky-600/80 dark:text-sky-400/60 hover:text-sky-900 dark:hover:text-sky-100 hover:bg-white/60 dark:hover:bg-[#0f2040]/60'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          )}

          <button
            onClick={() => onViewChange('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              currentView === 'table'
                ? 'bg-white dark:bg-cyan-600/90 text-cyan-700 dark:text-sky-50 shadow-sm font-semibold border border-sky-200 dark:border-transparent'
                : 'text-sky-600/80 dark:text-sky-400/60 hover:text-sky-900 dark:hover:text-sky-100 hover:bg-white/60 dark:hover:bg-[#0f2040]/60'
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
        <div className="flex items-center gap-1.5">
          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sky-400/70 dark:text-[#3a5a7a]" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 lg:w-48 rounded-lg bg-sky-50 dark:bg-[#0a1628] py-1.5 pl-8 pr-3 text-xs text-sky-900 dark:text-sky-50 placeholder-sky-400/70 dark:placeholder-[#3a5a7a] border border-sky-200 dark:border-[#152a4a] focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 dark:border-[#152a4a] bg-sky-50 dark:bg-[#0a1628] text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-[#0f2040] hover:text-sky-900 dark:hover:text-sky-50 transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-cyan-600" />
            )}
          </button>

          {/* Sync / CSV (Only for Editor) */}
          {isEditor && (
            <button
              onClick={onOpenImportExport}
              title={hasLiveSync ? 'Slack Live Sync Connected' : 'Connect Slack Sync / CSV'}
              className="flex items-center gap-1 rounded-lg border border-sky-200 dark:border-[#152a4a] bg-sky-50 dark:bg-[#0a1628] px-2 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-[#0f2040] transition-all cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">Sync</span>
            </button>
          )}

          {/* Team (Only for Editor) */}
          {isEditor && (
            <button
              onClick={openAgentModal}
              title="Slack Team Members & Agent Names"
              className="flex items-center gap-1 rounded-lg border border-sky-200 dark:border-[#152a4a] bg-sky-50 dark:bg-[#0a1628] px-2 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-[#0f2040] transition-all cursor-pointer"
            >
              <Users className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden xl:inline">Team</span>
            </button>
          )}

          {/* Auth Role Badge (Viewer / Editor) */}
          <button
            onClick={openPasskeyModal}
            title={isEditor ? 'Editor Mode Active (Click to manage)' : 'Viewer Mode (Click to unlock Editor)'}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
              isEditor
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-sky-50 dark:bg-[#0a1628] border-sky-200 dark:border-[#152a4a] text-sky-500 hover:text-sky-800 dark:hover:text-sky-100'
            }`}
          >
            {isEditor ? (
              <>
                <Unlock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Editor</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Viewer</span>
              </>
            )}
          </button>

          {/* Create Issue (Only visible in Editor mode!) */}
          {isEditor && (
            <button
              onClick={onOpenCreate}
              title="Create a new support issue"
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Issue</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
