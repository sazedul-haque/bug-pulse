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
        className="rounded-xl bg-[var(--surface)] p-3.5 border border-[var(--border)] shadow-2xs hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1.5">
          <span className="text-xs font-medium group-hover:text-[var(--accent)] transition-colors">
            Total Issues
          </span>
          <Layers className="h-3.5 w-3.5 text-[var(--accent)]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{total}</span>
          <span className="text-[11px] text-[var(--text-muted)]">tickets</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
          Live SQLite DB
        </div>
      </div>

      {/* 2. Resolved */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Done', priority: 'All' })}
        title="Click to view Resolved issues in Data Grid"
        className="rounded-xl bg-[var(--surface)] p-3.5 border border-[var(--border)] shadow-2xs hover:border-emerald-500 hover:bg-emerald-500/10 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1.5">
          <span className="text-xs font-medium group-hover:text-emerald-500 transition-colors">
            Resolved
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-emerald-500">
            {doneCount}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            ({resolvedPercent}%)
          </span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
          Completed fixes
        </div>
      </div>

      {/* 3. Urgent & High */}
      <div
        onClick={() => onCardClick && onCardClick({ priority: 'High', status: 'All' })}
        title="Click to view High Priority issues in Data Grid"
        className="rounded-xl bg-[var(--surface)] p-3.5 border border-[var(--border)] shadow-2xs hover:border-rose-500 hover:bg-rose-500/10 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1.5">
          <span className="text-xs font-medium group-hover:text-rose-500 transition-colors">
            Urgent & High
          </span>
          <Flame className="h-3.5 w-3.5 text-rose-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-rose-500">
            {openHighPriority}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">of {highPriority} total</span>
        </div>
        <div className="text-[11px] text-rose-500 font-medium mt-1 truncate">
          Pending triage
        </div>
      </div>

      {/* 4. Accepted Queue */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Accepted', priority: 'All' })}
        title="Click to view Accepted / In Pipeline issues in Data Grid"
        className="rounded-xl bg-[var(--surface)] p-3.5 border border-[var(--border)] shadow-2xs hover:border-amber-500 hover:bg-amber-500/10 hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1.5">
          <span className="text-xs font-medium group-hover:text-amber-500 transition-colors">
            In Pipeline
          </span>
          <Clock className="h-3.5 w-3.5 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-amber-500">
            {acceptedCount}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">accepted</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
          Scheduled for fix
        </div>
      </div>

      {/* 5. Feature & Requests */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Feature', priority: 'All' })}
        title="Click to view Feature Requests in Data Grid"
        className="rounded-xl bg-[var(--surface)] p-3.5 border border-[var(--border)] shadow-2xs hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1.5">
          <span className="text-xs font-medium group-hover:text-[var(--accent)] transition-colors">
            Requests & Feat.
          </span>
          <Lightbulb className="h-3.5 w-3.5 text-[var(--accent)]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-[var(--accent)]">
            {featureCount + requestCount}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">items</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
          {featureCount} feat, {requestCount} req
        </div>
      </div>

      {/* 6. Rejected / Closed */}
      <div
        onClick={() => onCardClick && onCardClick({ status: 'Rejected', priority: 'All' })}
        title="Click to view Closed / Invalid issues in Data Grid"
        className="rounded-xl bg-[var(--surface)] p-3.5 border border-[var(--border)] shadow-2xs hover:border-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:shadow-xs transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-[var(--text-secondary)] mb-1.5">
          <span className="text-xs font-medium group-hover:text-[var(--text-primary)] transition-colors">
            Closed / Invalid
          </span>
          <XCircle className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-[var(--text-secondary)]">
            {rejectedCount}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">closed</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
          Filtered non-bugs
        </div>
      </div>
    </div>
  );
};
