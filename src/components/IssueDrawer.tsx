import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Link2,
  Video,
  Image as ImageIcon,
  FileText,
  Clock,
  User,
  Trash2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Users,
} from 'lucide-react';
import { Issue, IssuePriority, IssueStatus } from '../types/issue';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';

interface IssueDrawerProps {
  issue: Issue | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: IssueStatus) => void;
  onUpdatePriority: (id: number, priority: IssuePriority) => void;
  onUpdateImpact: (id: number, count: number) => void;
  onDelete: (id: number) => void;
}

export const IssueDrawer: React.FC<IssueDrawerProps> = ({
  issue,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateImpact,
  onDelete,
}) => {
  const { isEditor } = useAuth();
  const { resolveAgentName, getAgentAvatarBg } = useAgent();
  const [copied, setCopied] = useState(false);

  // Close on Escape key press (must be before early return)
  useEffect(() => {
    if (!issue) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [issue, onClose]);

  if (!issue) return null;

  const handleCopySummary = () => {
    const text = `[BugPulse #${issue.id}] ${issue.name}\nStatus: ${issue.action} | Priority: ${issue.priority} | Category: ${issue.category}\nReporter: ${resolveAgentName(issue.createdBy)}\n\n${issue.details}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
            <Flame className="h-3 w-3 text-rose-500" /> High
          </span>
        );
      case 'Mid':
        return (
          <span className="inline-flex items-center rounded bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            Mid
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center rounded bg-sky-100 dark:bg-[#0f2040] px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-[#4a6a8a] border border-sky-200 dark:border-slate-700">
            Low
          </span>
        );
      default:
        return (
          <span className="rounded bg-sky-100 dark:bg-[#0f2040] px-2 py-0.5 text-xs text-slate-500">
            Unassigned
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return (
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 text-xs font-semibold">
            Done
          </span>
        );
      case 'Accepted':
        return (
          <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2.5 py-0.5 text-xs font-semibold">
            Accepted
          </span>
        );
      case 'Feature':
        return (
          <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 px-2.5 py-0.5 text-xs font-semibold">
            Feature
          </span>
        );
      case 'Request':
        return (
          <span className="rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 px-2.5 py-0.5 text-xs font-semibold">
            Request
          </span>
        );
      case 'Rejected':
        return (
          <span className="rounded-full bg-sky-100 dark:bg-[#0f2040] text-slate-500 border border-sky-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium">
            Rejected
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 px-2.5 py-0.5 text-xs font-semibold">
            New
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer"
    >
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-screen max-w-2xl bg-white dark:bg-[#061220] shadow-2xl border-l border-sky-200 dark:border-[#152a4a] flex flex-col justify-between transition-colors cursor-default"
        >
          {/* Header */}
          <div className="border-b border-sky-200 dark:border-[#152a4a] p-5 bg-sky-50/70 dark:bg-[#050d1f]/50">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-sky-400/70 dark:text-[#3a5a7a]">
                  #{issue.id}
                </span>
                <span className="rounded-md bg-cyan-50 dark:bg-cyan-950/80 px-2 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                  {issue.category}
                </span>
                {getStatusBadge(issue.action)}
                {getPriorityBadge(issue.priority)}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopySummary}
                  title="Copy formatted summary"
                  className="flex items-center gap-1 rounded-lg bg-white dark:bg-[#0f2040] px-2.5 py-1 text-xs text-sky-600 dark:text-sky-200 hover:text-sky-900 dark:hover:text-sky-50 border border-sky-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-100 hover:bg-slate-200/60 dark:hover:bg-[#0f2040] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-sky-900 dark:text-sky-50 leading-snug">
              {issue.name || '(Untitled Issue)'}
            </h3>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions / Status Row (Editable only if isEditor) */}
            {isEditor && (
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-sky-50 dark:bg-[#050d1f]/70 border border-sky-200 dark:border-[#152a4a]">
                {/* Status */}
                <div>
                  <label className="block text-[11px] font-medium text-sky-500/80 dark:text-[#4a6a8a] mb-1">
                    Status
                  </label>
                  <select
                    value={issue.action}
                    onChange={(e) => onUpdateStatus(issue.id, e.target.value as IssueStatus)}
                    className="w-full rounded-lg bg-white dark:bg-[#061220] px-2.5 py-1.5 text-xs font-semibold text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Done">Done (Resolved)</option>
                    <option value="Accepted">Accepted (In Progress)</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Request">Request / Tweak</option>
                    <option value="Rejected">Rejected / Invalid</option>
                    <option value="New">New / Triage</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-medium text-sky-500/80 dark:text-[#4a6a8a] mb-1">
                    Priority
                  </label>
                  <select
                    value={issue.priority}
                    onChange={(e) => onUpdatePriority(issue.id, e.target.value as IssuePriority)}
                    className="w-full rounded-lg bg-white dark:bg-[#061220] px-2.5 py-1.5 text-xs font-semibold text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="High">🔥 High / Urgent</option>
                    <option value="Mid">⚡ Mid</option>
                    <option value="Low">🌱 Low</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>

                {/* Users Impacted */}
                <div>
                  <label className="block text-[11px] font-medium text-sky-500/80 dark:text-[#4a6a8a] mb-1">
                    Users Impacted
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={issue.userImpactCount}
                      onChange={(e) => onUpdateImpact(issue.id, parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-lg bg-white dark:bg-[#061220] px-2.5 py-1.5 text-xs font-semibold text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-slate-700"
                    />
                    <button
                      onClick={() => onUpdateImpact(issue.id, issue.userImpactCount + 1)}
                      title="Increment count"
                      className="rounded-lg bg-slate-200 dark:bg-[#0f2040] px-2 py-1 text-xs text-amber-700 dark:text-amber-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold cursor-pointer"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Issue Description / Content */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-200 uppercase tracking-wider block">
                Issue Description & Logs
              </span>
              <div className="p-4 rounded-xl bg-sky-50/80 dark:bg-[#050d1f]/50 border border-sky-200/80 dark:border-[#152a4a] font-mono text-xs text-sky-800 dark:text-sky-100 whitespace-pre-wrap break-words leading-relaxed">
                {issue.details || '(No description provided)'}
              </div>
            </div>

            {/* Captured Links & Attachments */}
            {issue.extractedLinks.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-sky-700 dark:text-sky-200 uppercase tracking-wider block">
                  Captured Media & Attachments ({issue.extractedLinks.length})
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {issue.extractedLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-[#050d1f]/70 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-sky-200 dark:border-[#152a4a] hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {link.type === 'loom' || link.type === 'youtube' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                            <Video className="h-4 w-4" />
                          </div>
                        ) : link.type === 'image' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-sky-800 dark:text-sky-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">
                            {link.label}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{link.url}</div>
                        </div>
                      </div>

                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-700 dark:group-hover:text-slate-200 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Context & Metadata Grid */}
            <div className="space-y-3 pt-4 border-t border-sky-200 dark:border-[#152a4a]">
              <span className="text-xs font-bold text-sky-500/80 dark:text-[#4a6a8a] uppercase tracking-wider block">
                Workflow Details
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Author / Reporter */}
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-[#050d1f]/40 border border-sky-200 dark:border-[#152a4a]">
                  <span className="text-slate-400 block text-[10px] font-medium">Reported By</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className={`h-4 w-4 rounded-xs flex items-center justify-center font-bold text-[8px] shrink-0 ${getAgentAvatarBg(
                        resolveAgentName(issue.createdBy)
                      )}`}
                    >
                      {resolveAgentName(issue.createdBy).slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-sky-800 dark:text-sky-100 font-semibold truncate">
                      {resolveAgentName(issue.createdBy)}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-[#050d1f]/40 border border-sky-200 dark:border-[#152a4a]">
                  <span className="text-slate-400 block text-[10px] font-medium">Logged Date</span>
                  <span className="text-sky-800 dark:text-sky-100 font-medium block mt-1">
                    {issue.createdTime || 'N/A'}
                  </span>
                </div>

                {/* Impact */}
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-[#050d1f]/40 border border-sky-200 dark:border-[#152a4a]">
                  <span className="text-slate-400 block text-[10px] font-medium">Customer Impact</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                    {issue.userImpactCount > 0
                      ? `👥 ${issue.userImpactCount} users impacted`
                      : 'Single report'}
                  </span>
                </div>

                {/* Target Version */}
                {issue.fixedVersion && (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-[#050d1f]/40 border border-sky-200 dark:border-[#152a4a]">
                    <span className="text-slate-400 block text-[10px] font-medium">Target Version</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                      {issue.fixedVersion}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-sky-200 dark:border-[#152a4a] p-4 bg-sky-50/80 dark:bg-[#050d1f]/50 flex items-center justify-between">
            {isEditor ? (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete issue #${issue.id}?`)) {
                    onDelete(issue.id);
                    onClose();
                  }
                }}
                title="Delete this issue"
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Issue</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="rounded-lg bg-sky-100 dark:bg-[#0f2040] hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-sky-800 dark:text-sky-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
