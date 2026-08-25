import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb,
  XCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { Issue } from '../types/issue';

interface StatsOverviewProps {
  issues: Issue[];
  onFilterStatus?: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ issues }) => {
  const total = issues.length;
  const doneCount = issues.filter((i) => i.action === 'Done').length;
  const acceptedCount = issues.filter((i) => i.action === 'Accepted').length;
  const requestCount = issues.filter((i) => i.action === 'Request').length;
  const featureCount = issues.filter((i) => i.action === 'Feature').length;
  const rejectedCount = issues.filter((i) => i.action === 'Rejected').length;

  const highPriority = issues.filter((i) => i.priority === 'High').length;
  const openHighPriority = issues.filter(
    (i) => i.priority === 'High' && i.action !== 'Done' && i.action !== 'Rejected'
  ).length;

  const resolvedPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
      {/* Total Reported */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Issues</span>
          <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Slack tickets</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>Live SQLite DB</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500/60"></div>
      </div>

      {/* Resolved Rate */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Resolved</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{doneCount}</span>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-500/90">({resolvedPercent}%)</span>
        </div>
        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${resolvedPercent}%` }}
          ></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500/60"></div>
      </div>

      {/* Critical / High Priority Unresolved */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-900/50 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Urgent & High</span>
          <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{openHighPriority}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">of {highPriority} total</span>
        </div>
        <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400/90 font-medium">
          Requires immediate triage
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500/60"></div>
      </div>

      {/* In Progress / Accepted */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-amber-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Accepted Queue</span>
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{acceptedCount}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">in pipeline</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Scheduled for fix/release
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500/60"></div>
      </div>

      {/* Feature & Requests */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-sky-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Requests & Feat.</span>
          <Lightbulb className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{featureCount + requestCount}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">ideas/requests</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {featureCount} feature, {requestCount} requests
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500/60"></div>
      </div>

      {/* User Impact Volume */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Rejected / Closed</span>
          <XCircle className="h-4 w-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{rejectedCount}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">closed/invalid</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Filtered non-bugs
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-400/60"></div>
      </div>
    </div>
  );
};
