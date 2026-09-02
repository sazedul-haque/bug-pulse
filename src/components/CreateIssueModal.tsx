import React, { useState, useEffect } from 'react';
import { IssueCategory, IssuePriority, IssueStatus } from '../types/issue';
import { detectCategory } from '../services/categorization';
import { X, Sparkles, PlusCircle, FilePlus2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    details: string;
    priority: IssuePriority;
    action: IssueStatus;
    category: IssueCategory;
    createdBy: string;
    userImpactCount: number;
    files: string;
    fixedVersion: string;
  }) => void;
}

const CATEGORIES: IssueCategory[] = [
  'Monetization & Payments',
  'Course Progression & Drip',
  'Quizzes & Grading',
  'Video & Media Player',
  'Translations & i18n',
  'Certificates & Badges',
  'Security & Auth',
  'Integrations & Addons',
  'Dashboard & UI/UX',
  'Email Notifications',
  'General & Other',
];

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { isEditor, openPasskeyModal } = useAuth();
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('Mid');
  const [action, setAction] = useState<IssueStatus>('New');
  const [category, setCategory] = useState<IssueCategory>('General & Other');
  const [createdBy, setCreatedBy] = useState('Support Agent');
  const [userImpactCount, setUserImpactCount] = useState(0);
  const [files, setFiles] = useState('');
  const [fixedVersion, setFixedVersion] = useState('');
  const [autoDetectedCategory, setAutoDetectedCategory] = useState<IssueCategory | null>(null);

  useEffect(() => {
    if (name || details) {
      const detected = detectCategory(name, details);
      setAutoDetectedCategory(detected);
      setCategory(detected);
    }
  }, [name, details]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditor) {
      openPasskeyModal();
      return;
    }
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      details: details.trim(),
      priority,
      action,
      category,
      createdBy: createdBy.trim() || 'Support Agent',
      userImpactCount: Number(userImpactCount) || 0,
      files: files.trim(),
      fixedVersion: fixedVersion.trim(),
    });

    // Reset form
    setName('');
    setDetails('');
    setPriority('Mid');
    setAction('New');
    setUserImpactCount(0);
    setFiles('');
    setFixedVersion('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-[#040812]/85 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#091120] border border-sky-200 dark:border-[#132238] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors cursor-default"
      >
        {/* Header */}
        <div className="border-b border-sky-200 dark:border-[#132238] p-5 bg-sky-50/80 dark:bg-[#040812]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-sky-900 dark:text-sky-50">Create New Workflow Issue</h3>
              <p className="text-xs text-sky-500/80 dark:text-[#4a6a8a]">
                Log a customer bug report or feature request into BugPulse
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
              Issue Title / Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WooCommerce subscription renewal failure on guest checkout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3.5 py-2 text-xs text-sky-900 dark:text-sky-50 placeholder-slate-400 dark:placeholder-[#3a5a7a] border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Details & Repro */}
          <div>
            <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
              Details, Steps to Reproduce & URLs
            </label>
            <textarea
              rows={4}
              placeholder="Paste the customer explanation, error logs, and links (Loom video, screenshots, test credentials)..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3.5 py-2 text-xs text-sky-900 dark:text-sky-50 placeholder-slate-400 dark:placeholder-[#3a5a7a] border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
            />
            {autoDetectedCategory && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto-categorized as: <strong>{autoDetectedCategory}</strong></span>
              </div>
            )}
          </div>

          {/* Grid Settings: Priority, Status, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3 py-2 text-xs text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                <option value="High" className="bg-white dark:bg-[#091120]">🔥 High Priority</option>
                <option value="Mid" className="bg-white dark:bg-[#091120]">⚡ Mid Priority</option>
                <option value="Low" className="bg-white dark:bg-[#091120]">🌱 Low Priority</option>
                <option value="Unassigned" className="bg-white dark:bg-[#091120]">Unassigned</option>
              </select>
            </div>

            {/* Workflow Action Status */}
            <div>
              <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
                Initial Status
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as IssueStatus)}
                className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3 py-2 text-xs text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                <option value="New" className="bg-white dark:bg-[#091120]">New / Triage</option>
                <option value="Accepted" className="bg-white dark:bg-[#091120]">Accepted (In Pipeline)</option>
                <option value="Feature" className="bg-white dark:bg-[#091120]">Feature Request</option>
                <option value="Request" className="bg-white dark:bg-[#091120]">Request / Tweak</option>
                <option value="Done" className="bg-white dark:bg-[#091120]">Done (Resolved)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3 py-2 text-xs text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-[#091120]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Row: Reporter, Impact Count, Target Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
                Reporter (Slack User ID)
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="e.g. U07ACRUL5N1"
                className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3 py-2 text-xs text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
                Customer Impact Count
              </label>
              <input
                type="number"
                min="0"
                value={userImpactCount}
                onChange={(e) => setUserImpactCount(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3 py-2 text-xs text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
                Target / Fixed Version
              </label>
              <input
                type="text"
                placeholder="e.g. 4.0.5"
                value={fixedVersion}
                onChange={(e) => setFixedVersion(e.target.value)}
                className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3 py-2 text-xs text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Files */}
          <div>
            <label className="block text-xs font-semibold text-sky-700 dark:text-sky-200 mb-1">
              File Attachment IDs (Slack / CDN)
            </label>
            <input
              type="text"
              placeholder="e.g. F0BG23JC80H, F0BHKS1TT6G"
              value={files}
              onChange={(e) => setFiles(e.target.value)}
              className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] px-3 py-2 text-xs text-sky-900 dark:text-sky-50 placeholder-slate-400 dark:placeholder-slate-600 border border-sky-200 dark:border-[#132238] focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-sky-200 dark:border-[#132238] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-sky-600 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-[#0e1a2f] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-purple-500 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Issue to SQLite DB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
