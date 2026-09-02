import React from 'react';
import { Issue, IssueStatus } from '../types/issue';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Lightbulb,
  XCircle,
  AlertCircle,
  Link2,
  User,
  Flame,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';

interface KanbanViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onUpdateStatus: (id: number, status: IssueStatus) => void;
}

interface ColumnConfig {
  status: IssueStatus;
  title: string;
  icon: React.ElementType;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'New',
    title: 'New / Triage',
    icon: AlertCircle,
    badgeColor: 'bg-slate-200/80 dark:bg-sky-500/20 text-sky-700 dark:text-sky-200 border-slate-300 dark:border-slate-700',
    borderColor: 'border-sky-200 dark:border-[#132238]',
    bgColor: 'bg-sky-100/60 dark:bg-[#0a1628]/30',
  },
  {
    status: 'Accepted',
    title: 'Accepted / In Progress',
    icon: Clock,
    badgeColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    borderColor: 'border-amber-200/80 dark:border-amber-900/30',
    bgColor: 'bg-amber-50/40 dark:bg-amber-950/10',
  },
  {
    status: 'Feature',
    title: 'Feature Requests',
    icon: Lightbulb,
    badgeColor: 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/40',
    borderColor: 'border-sky-200/80 dark:border-sky-900/30',
    bgColor: 'bg-sky-50/40 dark:bg-sky-950/10',
  },
  {
    status: 'Request',
    title: 'Requests / Tweaks',
    icon: HelpCircle,
    badgeColor: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40',
    borderColor: 'border-cyan-200/80 dark:border-cyan-900/30',
    bgColor: 'bg-cyan-50/40 dark:bg-cyan-950/10',
  },
  {
    status: 'Done',
    title: 'Resolved / Done',
    icon: CheckCircle2,
    badgeColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    borderColor: 'border-emerald-200/80 dark:border-emerald-900/30',
    bgColor: 'bg-emerald-50/40 dark:bg-emerald-950/10',
  },
  {
    status: 'Rejected',
    title: 'Rejected / Invalid',
    icon: XCircle,
    badgeColor: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    borderColor: 'border-rose-200/80 dark:border-rose-900/30',
    bgColor: 'bg-rose-50/40 dark:bg-rose-950/10',
  },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  issues,
  onSelectIssue,
  onUpdateStatus,
}) => {
  const { isEditor, openPasskeyModal } = useAuth();
  const { resolveAgentName, getAgentAvatarBg } = useAgent();
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return (
          <span className="flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
            <Flame className="h-2.5 w-2.5 text-rose-500" /> High
          </span>
        );
      case 'Mid':
        return (
          <span className="rounded bg-amber-50 dark:bg-amber-950/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            Mid
          </span>
        );
      case 'Low':
        return (
          <span className="rounded bg-sky-100 dark:bg-[#0e1a2f] px-1.5 py-0.5 text-[10px] font-medium text-sky-600 dark:text-[#4a6a8a] border border-sky-200 dark:border-slate-700">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none">
      {COLUMNS.map((col) => {
        const colIssues = issues.filter((i) => i.action === col.status);
        const Icon = col.icon;

        return (
          <div
            key={col.status}
            className={`flex w-80 min-w-[320px] flex-col rounded-2xl border ${col.borderColor} ${col.bgColor} p-3 backdrop-blur shadow-2xs transition-colors`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
                <h4 className="text-xs font-semibold text-slate-800 dark:text-sky-100 tracking-wide">
                  {col.title}
                </h4>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold border ${col.badgeColor}`}
              >
                {colIssues.length}
              </span>
            </div>

            {/* Card List */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
              {colIssues.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-sky-200 dark:border-[#132238] text-xs text-slate-400 dark:text-[#42698f]">
                  No issues in this stage
                </div>
              ) : (
                colIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="group relative flex flex-col rounded-xl bg-white dark:bg-[#0e1a2f] p-3.5 border border-sky-200/80 dark:border-[#1a3150] hover:border-cyan-400 dark:hover:border-cyan-500/60 hover:shadow-xs shadow-2xs transition-all cursor-pointer"
                  >
                    {/* Header: Priority & Category */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getPriorityBadge(issue.priority)}
                        <span className="rounded bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/30">
                          {issue.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-[#42698f] font-mono">#{issue.id}</span>
                    </div>

                    {/* Title */}
                    <h5 className="text-xs font-semibold text-slate-900 dark:text-sky-50 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 leading-relaxed mb-2">
                      {issue.name || '(Untitled Issue)'}
                    </h5>

                    {/* Details Snippet */}
                    <p className="text-[11px] text-slate-600 dark:text-[#8ec8f2]/90 line-clamp-2 leading-relaxed mb-3">
                      {issue.details}
                    </p>

                    {/* Footer Info */}
                    <div className="mt-auto flex items-center justify-between border-t border-sky-100 dark:border-[#132238] pt-2 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0" title={`${resolveAgentName(issue.createdBy)} (${issue.createdBy})`}>
                        <div
                          className={`h-4 w-4 rounded-xs flex items-center justify-center font-bold text-[8px] shrink-0 ${getAgentAvatarBg(
                            resolveAgentName(issue.createdBy)
                          )}`}
                        >
                          {resolveAgentName(issue.createdBy).slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-sky-200 truncate max-w-[110px]">
                          {resolveAgentName(issue.createdBy)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {issue.extractedLinks.length > 0 && (
                          <span className="flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400">
                            <Link2 className="h-3 w-3" />
                            <span>{issue.extractedLinks.length}</span>
                          </span>
                        )}
                        {issue.userImpactCount > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            +{issue.userImpactCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Move Status Dropdown on Hover (Only for Editor) */}
                    {isEditor && (
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white/95 dark:bg-[#091120]/95 backdrop-blur rounded-lg p-0.5 border border-sky-200 dark:border-[#1a3150] shadow-md">
                        <select
                          value={issue.action}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(issue.id, e.target.value as IssueStatus);
                          }}
                          className="bg-transparent text-[10px] text-slate-700 dark:text-sky-100 border-none focus:ring-0 cursor-pointer py-0 px-1 font-semibold"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.status} value={c.status} className="bg-white dark:bg-[#091120] text-slate-800 dark:text-sky-50">
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
