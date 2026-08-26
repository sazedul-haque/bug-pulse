import React from 'react';
import { Issue, IssuePriority, IssueStatus } from '../types/issue';
import {
  X,
  ExternalLink,
  Video,
  Image as ImageIcon,
  FileText,
  Trash2,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
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
  const { isEditor, openPasskeyModal } = useAuth();
  const { resolveAgentName, getAgentAvatarBg } = useAgent();
  const [copied, setCopied] = React.useState(false);

  if (!issue) return null;

  const handleCopySummary = () => {
    const text = `[BugPulse #${issue.id}] ${issue.name}\nStatus: ${issue.action} | Priority: ${issue.priority} | Category: ${issue.category}\n${issue.details}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDetails = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Code snippet or stack trace
      if (line.startsWith('`') || line.includes('Fatal error') || line.includes('Stack trace:')) {
        return (
          <div
            key={idx}
            className="my-2 rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-amber-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap"
          >
            {line.replace(/^`+|`+$/g, '')}
          </div>
        );
      }

      // Bullets
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs text-slate-700 dark:text-slate-300 pl-2">
            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
            <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
          </div>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between transition-colors">
          {/* Drawer Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-950/50">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950 px-2 py-1 font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                  #{issue.id}
                </span>
                <span className="rounded-md bg-slate-200/80 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {issue.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  title="Copy formatted summary"
                  className="flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800/80 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {issue.name || '(Untitled Issue)'}
            </h2>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Action Bar (Status & Priority Toggles) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              {/* Status */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Status</span>
                  {!isEditor && <Lock className="h-3 w-3 text-slate-400" />}
                </label>
                {isEditor ? (
                  <select
                    value={issue.action}
                    onChange={(e) => onUpdateStatus(issue.id, e.target.value as IssueStatus)}
                    className="w-full rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Done">Done (Resolved)</option>
                    <option value="Accepted">Accepted (In Progress)</option>
                    <option value="Feature">Feature Request</option>
                    <option value="Request">Request / Tweak</option>
                    <option value="Rejected">Rejected / Invalid</option>
                    <option value="New">New / Triage</option>
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={openPasskeyModal}
                    title="Unlock Editor Mode to modify status"
                    className="w-full text-left rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{issue.action}</span>
                    <Lock className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                  <span>Priority</span>
                  {!isEditor && <Lock className="h-3 w-3 text-slate-400" />}
                </label>
                {isEditor ? (
                  <select
                    value={issue.priority}
                    onChange={(e) => onUpdatePriority(issue.id, e.target.value as IssuePriority)}
                    className="w-full rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="High">🔥 High / Urgent</option>
                    <option value="Mid">⚡ Mid</option>
                    <option value="Low">🌱 Low</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={openPasskeyModal}
                    title="Unlock Editor Mode to modify priority"
                    className="w-full text-left rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{issue.priority}</span>
                    <Lock className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>

              {/* User Impact Count */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Users Impacted
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    disabled={!isEditor}
                    value={issue.userImpactCount}
                    onChange={(e) => onUpdateImpact(issue.id, parseInt(e.target.value, 10) || 0)}
                    className="w-20 rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                  />
                  {isEditor && (
                    <button
                      onClick={() => onUpdateImpact(issue.id, issue.userImpactCount + 1)}
                      title="Increment customer count"
                      className="rounded-lg bg-slate-200 dark:bg-slate-800 px-2 py-1 text-xs text-amber-700 dark:text-amber-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold cursor-pointer"
                    >
                      +1
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Issue Description / Content */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Issue Description & Reproduction Steps
              </h4>
              <div className="rounded-xl bg-slate-50/80 dark:bg-slate-950/50 p-4 border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                {formatDetails(issue.details)}
              </div>
            </div>

            {/* Media & External Links */}
            {issue.extractedLinks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Attached Media & Reproduction Links ({issue.extractedLinks.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {issue.extractedLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {link.type === 'loom' || link.type === 'youtube' || link.type === 'streamable' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
                            <Video className="h-4 w-4" />
                          </div>
                        ) : link.type === 'image' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 shrink-0">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                            {link.label}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{link.url}</div>
                        </div>
                      </div>

                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Workflow Metadata
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Created By</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center font-bold text-[9px] shrink-0 ${getAgentAvatarBg(
                        resolveAgentName(issue.createdBy)
                      )}`}
                    >
                      {resolveAgentName(issue.createdBy).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-800 dark:text-slate-200 font-semibold block truncate">
                        {resolveAgentName(issue.createdBy)}
                      </span>
                      {resolveAgentName(issue.createdBy) !== issue.createdBy && (
                        <span className="font-mono text-[10px] text-slate-400 block truncate">
                          {issue.createdBy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Date Logged</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium block mt-0.5">{issue.createdTime || 'N/A'}</span>
                </div>

                {issue.lastEditedBy && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Last Edited By</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold block mt-0.5">
                      {resolveAgentName(issue.lastEditedBy)}
                    </span>
                  </div>
                )}

                {issue.fixedVersion && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Target / Fixed Version</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{issue.fixedVersion}</span>
                  </div>
                )}

                {issue.files && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 col-span-2">
                    <span className="text-slate-500 block text-[10px]">Slack Attachment File IDs</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px] break-all">
                      {issue.files}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/90 dark:bg-slate-950/60 flex items-center justify-between">
            <button
              onClick={() => {
                if (!isEditor) {
                  openPasskeyModal();
                  return;
                }
                if (confirm(`Are you sure you want to delete issue #${issue.id}?`)) {
                  onDelete(issue.id);
                  onClose();
                }
              }}
              title={isEditor ? 'Delete this issue' : 'Unlock Editor Mode to delete issues'}
              className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-2 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/30 cursor-pointer"
            >
              {isEditor ? <Trash2 className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
              <span>Delete Issue</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-white transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
