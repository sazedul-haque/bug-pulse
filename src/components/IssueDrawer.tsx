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
import { getCategoryStyle } from '../utils/categoryColors';
import { getStatusBadgeClass } from '../utils/statusColors';

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
          <span className="inline-flex items-center rounded bg-sky-100 dark:bg-[#0e1a2f] px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-[#4a6a8a] border border-[var(--border)] dark:border-slate-700">
            Low
          </span>
        );
      default:
        return (
          <span className="rounded bg-sky-100 dark:bg-[#0e1a2f] px-2 py-0.5 text-xs text-slate-500">
            Unassigned
          </span>
        );
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusBadgeClass(status)}`}>
        {status}
      </span>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer"
    >
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-screen max-w-2xl bg-[var(--surface)] shadow-2xl border-l border-[var(--border)] flex flex-col justify-between transition-colors cursor-default"
        >
          {/* Header */}
          <div className="border-b border-[var(--border)] p-5 bg-[var(--surface-inner)]">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                  #{issue.id}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${getCategoryStyle(issue.category).badge}`}>
                  {issue.category}
                </span>
                {getStatusBadge(issue.action)}
                {getPriorityBadge(issue.priority)}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopySummary}
                  title="Copy formatted summary"
                  className="flex items-center gap-1 rounded-lg bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] border border-[var(--border)] transition-colors cursor-pointer"
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
                  className="rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inner)] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
              {issue.name || '(Untitled Issue)'}
            </h3>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions / Status Row (Editable only if isEditor) */}
            {isEditor && (
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--border)]">
                {/* Status */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Status
                  </label>
                  <select
                    value={issue.action}
                    onChange={(e) => onUpdateStatus(issue.id, e.target.value as IssueStatus)}
                    className="w-full rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
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
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Priority
                  </label>
                  <select
                    value={issue.priority}
                    onChange={(e) => onUpdatePriority(issue.id, e.target.value as IssuePriority)}
                    className="w-full rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
                  >
                    <option value="High">🔥 High / Urgent</option>
                    <option value="Mid">⚡ Mid</option>
                    <option value="Low">🌱 Low</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>

                {/* Users Impacted */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Users Impacted
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={issue.userImpactCount}
                      onChange={(e) => onUpdateImpact(issue.id, parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)]"
                    />
                    <button
                      onClick={() => onUpdateImpact(issue.id, issue.userImpactCount + 1)}
                      title="Increment count"
                      className="rounded-lg bg-[var(--surface-hover)] px-2 py-1 text-xs text-amber-500 hover:opacity-80 font-bold cursor-pointer border border-[var(--border)]"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Issue Description / Content */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                Issue Description & Logs
              </span>
              <div className="p-4 rounded-xl bg-[var(--surface-inner)] border border-[var(--border)] font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap break-words leading-relaxed">
                {issue.details || '(No description provided)'}
              </div>
            </div>

            {/* Captured Links & Attachments */}
            {issue.extractedLinks.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                  Captured Media & Attachments ({issue.extractedLinks.length})
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {issue.extractedLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-inner)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {link.type === 'loom' || link.type === 'youtube' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-500 shrink-0">
                            <Video className="h-4 w-4" />
                          </div>
                        ) : link.type === 'image' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] shrink-0">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">
                            {link.label}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] truncate">{link.url}</div>
                        </div>
                      </div>

                      <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Context & Metadata Grid */}
            <div className="space-y-3 pt-4 border-t border-[var(--border)]">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Workflow Details
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Author / Reporter */}
                <div className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px] font-medium">Reported By</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className={`h-4 w-4 rounded-xs flex items-center justify-center font-bold text-[8px] shrink-0 ${getAgentAvatarBg(
                        resolveAgentName(issue.createdBy)
                      )}`}
                    >
                      {resolveAgentName(issue.createdBy).slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-[var(--text-primary)] font-semibold truncate">
                      {resolveAgentName(issue.createdBy)}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px] font-medium">Logged Date</span>
                  <span className="text-[var(--text-primary)] font-medium block mt-1">
                    {issue.createdTime || 'N/A'}
                  </span>
                </div>

                {/* Impact */}
                <div className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px] font-medium">Customer Impact</span>
                  <span className="text-amber-500 font-semibold block mt-1">
                    {issue.userImpactCount > 0
                      ? `👥 ${issue.userImpactCount} users impacted`
                      : 'Single report'}
                  </span>
                </div>

                {/* Target Version */}
                {issue.fixedVersion && (
                  <div className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] font-medium">Target Version</span>
                    <span className="text-emerald-500 font-semibold block mt-1">
                      {issue.fixedVersion}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-[var(--border)] p-4 bg-[var(--surface-inner)] flex items-center justify-between">
            {isEditor ? (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete issue #${issue.id}?`)) {
                    onDelete(issue.id);
                    onClose();
                  }
                }}
                title="Delete this issue"
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Issue</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
