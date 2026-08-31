import React from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  Lightbulb,
  XCircle,
  Layers,
} from 'lucide-react';
import { Issue } from '../types/issue';

interface StatsOverviewProps {
  issues: Issue[];
  onCardClick?: (filters: { status?: string; priority?: string }) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ issues, onCardClick }) => {
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
      {/* 1. Total Issues */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'All', priority: 'All' })}
        title="Click to view all issues in Data Grid"
        className="rounded-xl bg-white dark:bg-slate-900/70 p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Total Issues
          </span>
          <Layers className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{total}</span>
          <span className="text-[11px] text-slate-400">tickets</span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          Live SQLite DB
        </div>
      </div>

      {/* 2. Resolved */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Done', priority: 'All' })}
        title="Click to view Resolved issues in Data Grid"
        className="rounded-xl bg-white dark:bg-slate-900/70 p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Resolved
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {doneCount}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-500/90">
            ({resolvedPercent}%)
          </span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          Completed fixes
        </div>
      </div>

      {/* 3. Urgent & High */}
      <div
        onClick={() => onCardClick && onCardClick({ priority: 'High', status: 'All' })}
        title="Click to view High Priority issues in Data Grid"
        className="rounded-xl bg-white dark:bg-slate-900/70 p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            Urgent & High
          </span>
          <Flame className="h-3.5 w-3.5 text-rose-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {openHighPriority}
          </span>
          <span className="text-[11px] text-slate-400">of {highPriority} total</span>
        </div>
        <div className="text-[11px] text-rose-500 dark:text-rose-400/90 font-medium mt-1 truncate">
          Pending triage
        </div>
      </div>

      {/* 4. Accepted Queue */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Accepted', priority: 'All' })}
        title="Click to view Accepted / In Pipeline issues in Data Grid"
        className="rounded-xl bg-white dark:bg-slate-900/70 p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            In Pipeline
          </span>
          <Clock className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {acceptedCount}
          </span>
          <span className="text-[11px] text-slate-400">accepted</span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          Scheduled for fix
        </div>
      </div>

      {/* 5. Feature & Requests */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Feature', priority: 'All' })}
        title="Click to view Feature Requests in Data Grid"
        className="rounded-xl bg-white dark:bg-slate-900/70 p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            Requests & Feat.
          </span>
          <Lightbulb className="h-3.5 w-3.5 text-sky-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
            {featureCount + requestCount}
          </span>
          <span className="text-[11px] text-slate-400">items</span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          {featureCount} feat, {requestCount} req
        </div>
      </div>

      {/* 6. Rejected / Closed */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Rejected', priority: 'All' })}
        title="Click to view Closed / Invalid issues in Data Grid"
        className="rounded-xl bg-white dark:bg-slate-900/70 p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            Closed / Invalid
          </span>
          <XCircle className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-slate-700 dark:text-slate-300">
            {rejectedCount}
          </span>
          <span className="text-[11px] text-slate-400">closed</span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
          Filtered non-bugs
        </div>
      </div>
    </div>
  );
};
