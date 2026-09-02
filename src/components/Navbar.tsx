import React, { useEffect, useState, useRef } from 'react';
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
  Palette as PaletteIcon,
  Check,
} from 'lucide-react';
import { ViewMode } from '../types/issue';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { PALETTES, Palette } from '../utils/themeTokens';
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
  const { theme, palette, toggleTheme, setPalette } = useTheme();
  const { isEditor, openPasskeyModal } = useAuth();
  const { openAgentModal } = useAgent();
  const [hasLiveSync, setHasLiveSync] = useState(false);
  const [isPaletteMenuOpen, setIsPaletteMenuOpen] = useState(false);
  const paletteMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasLiveSync(Boolean(googleSheetSyncService.getSavedUrl()));
  }, []);

  // Close palette dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target as Node)) {
        setIsPaletteMenuOpen(false);
      }
    };
    if (isPaletteMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isPaletteMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl transition-colors duration-200 shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div
          onClick={() => onViewChange('analytics')}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="BugPulse Home (Analytics)"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--accent)] to-sky-500 shadow-xs group-hover:scale-105 transition-transform">
            <Activity className="h-4 w-4 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"></span>
            </span>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-[var(--text-primary)] leading-none block">
              BugPulse
            </span>
            <p className="hidden md:block text-[11px] text-[var(--text-muted)] mt-0.5">
              Slack Support Workflow & Triage
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center rounded-xl bg-[var(--surface-inner)] p-1 border border-[var(--border)]">
          <button
            onClick={() => onViewChange('analytics')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              currentView === 'analytics'
                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs font-semibold border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
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
                  ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs font-semibold border border-[var(--border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
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
                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs font-semibold border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/60'
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
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 lg:w-48 rounded-lg bg-[var(--surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition-all"
            />
          </div>

          {/* Theme Palette Dropdown */}
          <div className="relative" ref={paletteMenuRef}>
            <button
              onClick={() => setIsPaletteMenuOpen(!isPaletteMenuOpen)}
              title={`Color Theme: ${PALETTES.find((p) => p.id === palette)?.name}`}
              className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <PaletteIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span
                className="h-2.5 w-2.5 rounded-full shadow-xs shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            </button>

            {isPaletteMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Color Palette
                </div>
                <div className="space-y-0.5">
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPalette(p.id as Palette);
                        setIsPaletteMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                        palette === p.id
                          ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-inner)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: p.iconColor }}
                        />
                        <span>{p.name}</span>
                      </div>
                      {palette === p.id && (
                        <Check className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-[var(--accent)]" />
            )}
          </button>

          {/* Sync / CSV (Only for Editor) */}
          {isEditor && (
            <button
              onClick={onOpenImportExport}
              title={hasLiveSync ? 'Slack Live Sync Connected' : 'Connect Slack Sync / CSV'}
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden xl:inline">Sync</span>
            </button>
          )}

          {/* Team (Only for Editor) */}
          {isEditor && (
            <button
              onClick={openAgentModal}
              title="Slack Team Members & Agent Names"
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <Users className="h-3.5 w-3.5 text-[var(--accent)]" />
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
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isEditor ? (
              <>
                <Unlock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Editor</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Viewer</span>
              </>
            )}
          </button>

          {/* Create Issue (Only visible in Editor mode!) */}
          {isEditor && (
            <button
              onClick={onOpenCreate}
              title="Create a new support issue"
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
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
