import React, { useEffect, useState } from 'react';
import { dbService } from '../db/sqlite';
import {
  X,
  Play,
  Terminal,
  Download,
  AlertCircle,
  Database,
} from 'lucide-react';
import Papa from 'papaparse';

interface SqlStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  {
    name: '🔥 High Priority Unresolved',
    sql: "SELECT id, name, category, created_by, created_time FROM issues WHERE priority = 'High' AND action != 'Done' AND action != 'Rejected' ORDER BY id DESC;",
  },
  {
    name: '📊 Category Breakdown',
    sql: 'SELECT category, count(*) AS total_count, SUM(CASE WHEN action = "Done" THEN 1 ELSE 0 END) as resolved_count FROM issues GROUP BY category ORDER BY total_count DESC;',
  },
  {
    name: '💳 Payment & WooCommerce Issues',
    sql: 'SELECT id, name, action, priority, created_time FROM issues WHERE category = "Monetization & Payments" ORDER BY id DESC;',
  },
  {
    name: '👥 Multi-User Impacted Issues',
    sql: 'SELECT id, name, user_impact_count, action, priority FROM issues WHERE user_impact_count > 0 ORDER BY user_impact_count DESC;',
  },
  {
    name: '🏆 Top Support Reporters',
    sql: 'SELECT created_by as slack_agent, count(*) as tickets_logged, SUM(CASE WHEN action = "Done" THEN 1 ELSE 0 END) as fixed FROM issues GROUP BY created_by ORDER BY tickets_logged DESC;',
  },
];

export const SqlStudioModal: React.FC<SqlStudioModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].sql);
  const [results, setResults] = useState<{ columns: string[]; values: any[][] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Close on Escape (must be before early return)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunQuery = () => {
    setError(null);
    const start = performance.now();
    try {
      const res = dbService.runCustomQuery(query);
      const elapsed = performance.now() - start;
      setResults(res);
      setExecutionTime(Math.round(elapsed * 100) / 100);
    } catch (err: any) {
      setError(err?.message || 'SQL Execution error');
      setResults(null);
    }
  };

  const handleExportCsv = () => {
    if (!results || results.columns.length === 0) return;
    const data = results.values.map((row) => {
      const obj: any = {};
      results.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql_query_result_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-[#040812]/85 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl rounded-2xl bg-[var(--surface)] bg-[var(--surface)] border border-[var(--border)] border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors cursor-default"
      >
        {/* Header */}
        <div className="border-b border-[var(--border)] border-[var(--border)] p-5 bg-sky-50/80 dark:bg-[#040812]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--text-primary)]">In-Browser SQLite Studio</h3>
                <span className="rounded bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                  WASM Engine
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Execute live SQL queries against the local `issues` table
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-sky-700 dark:hover:text-sky-50 hover:bg-sky-100 dark:hover:bg-[#0e1a2f] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Preset Queries */}
          <div>
            <span className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Preset Quick Queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset.sql);
                  }}
                  className="rounded-lg bg-sky-100 dark:bg-[#040812] px-2.5 py-1 text-xs text-sky-700 dark:text-sky-200 hover:text-sky-900 dark:hover:text-sky-50 hover:bg-slate-200 dark:hover:bg-[#0e1a2f] border border-[var(--border)] border-[var(--border)] transition-colors cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-sky-700 dark:text-sky-200 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>SQL Query (`table: issues`)</span>
              </label>

              <div className="flex items-center gap-2">
                {executionTime !== null && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    ⚡ Executed in {executionTime}ms
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-300 border border-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-inner"
                placeholder="SELECT * FROM issues LIMIT 10;"
              />
            </div>

            {/* Run Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-sky-400/70 dark:text-[#3a5a7a]">
                Schema: `id`, `name`, `details`, `category`, `priority`, `action`, `created_by`, `created_time`, `user_impact_count`
              </span>

              <button
                onClick={handleRunQuery}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-cyan-500 transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Execute Query</span>
              </button>
            </div>
          </div>

          {/* Query Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">SQL Syntax Error:</strong>
                <span className="font-mono text-[11px]">{error}</span>
              </div>
            </div>
          )}

          {/* Results Table */}
          {results && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-800 dark:text-sky-200">
                  Query Results ({results.values.length} rows returned)
                </span>

                {results.values.length > 0 && (
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1 text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-200 dark:border-cyan-800/40 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Results CSV</span>
                  </button>
                )}
              </div>

              <div className="rounded-xl bg-[var(--surface)] dark:bg-[#040812] border border-[var(--border)] border-[var(--border)] overflow-x-auto max-h-64 shadow-xs">
                {results.columns.length === 0 ? (
                  <div className="p-6 text-center text-xs text-sky-400/70 dark:text-[#3a5a7a]">
                    Query executed successfully with 0 rows returned.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border)] border-[var(--border)] bg-sky-50 dark:bg-[#0a1628] text-[11px] font-semibold uppercase text-sky-600 dark:text-[#4a6a8a]">
                        {results.columns.map((col, idx) => (
                          <th key={idx} className="py-2 px-3 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 dark:divide-slate-900 font-mono text-[11px]">
                      {results.values.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-sky-50 dark:hover:bg-slate-900/60">
                          {row.map((val, cIdx) => (
                            <td
                              key={cIdx}
                              className="py-2 px-3 text-sky-800 dark:text-sky-200 max-w-xs truncate"
                            >
                              {val === null || val === undefined ? (
                                <span className="text-slate-400 dark:text-[#3a5a7a] italic">NULL</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] border-[var(--border)] p-4 bg-sky-50/90 dark:bg-[#040812]/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-[#0e1a2f] hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-sky-800 dark:text-sky-50 transition-colors cursor-pointer"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
