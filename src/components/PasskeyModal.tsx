import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Unlock,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';

export const PasskeyModal: React.FC = () => {
  const {
    isEditor,
    login,
    logout,
    changePasskey,
    isPasskeyModalOpen,
    closePasskeyModal,
  } = useAuth();

  const [passkeyInput, setPasskeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPasskey, setShowPasskey] = useState(false);
  const [isManagingKey, setIsManagingKey] = useState(false);

  // Change passkey form state
  const [oldKey, setOldKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');

  // Close on Escape (must be before early return)
  useEffect(() => {
    if (!isPasskeyModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePasskeyModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPasskeyModalOpen, closePasskeyModal]);

  if (!isPasskeyModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!passkeyInput.trim()) {
      setErrorMsg('Please enter the team passkey');
      return;
    }

    const ok = login(passkeyInput.trim());
    if (ok) {
      setPasskeyInput('');
      closePasskeyModal();
    } else {
      setErrorMsg('Incorrect passkey. Please try again.');
    }
  };

  const handleChangeKey = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newKey !== confirmKey) {
      setErrorMsg('New passkeys do not match.');
      return;
    }
    if (newKey.length < 4) {
      setErrorMsg('New passkey must be at least 4 characters long.');
      return;
    }

    const ok = changePasskey(oldKey, newKey);
    if (ok) {
      setSuccessMsg('Team passkey successfully updated!');
      setOldKey('');
      setNewKey('');
      setConfirmKey('');
      setTimeout(() => {
        setIsManagingKey(false);
        setSuccessMsg(null);
      }, 1500);
    } else {
      setErrorMsg('Current passkey was incorrect.');
    }
  };

  return (
    <div
      onClick={closePasskeyModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-colors cursor-default"
      >
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                isEditor
                  ? 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30'
              }`}
            >
              {isEditor ? <ShieldCheck className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditor ? 'Editor Session Active' : 'Unlock Editor Mode'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditor
                  ? 'You have write access to create, edit & triage issues'
                  : 'Enter team passkey to enable CRUD & triage operations'}
              </p>
            </div>
          </div>

          <button
            onClick={closePasskeyModal}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isEditor ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Team Passkey
                </label>
                <div className="relative">
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    placeholder="Enter passkey..."
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Prevents unauthorized visitors from modifying tickets or deleting issues.
                </p>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock Editor</span>
                </button>
              </div>
            </form>
          ) : !isManagingKey ? (
            /* Authenticated Status View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Editor Privileges Enabled</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    You can create new issues, update statuses, change priorities, and push two-way updates to Google Sheets and Slack.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsManagingKey(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Change Passkey</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    closePasskeyModal();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Lock Editor Mode</span>
                </button>
              </div>
            </div>
          ) : (
            /* Change Passkey Form */
            <form onSubmit={handleChangeKey} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Current Passkey
                </label>
                <input
                  type="password"
                  placeholder="Current passkey..."
                  value={oldKey}
                  onChange={(e) => setOldKey(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  New Passkey
                </label>
                <input
                  type="password"
                  placeholder="New passkey (min 4 chars)..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Passkey
                </label>
                <input
                  type="password"
                  placeholder="Confirm new passkey..."
                  value={confirmKey}
                  onChange={(e) => setConfirmKey(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsManagingKey(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Save New Passkey
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
