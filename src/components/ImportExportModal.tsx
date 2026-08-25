import React, { useState, useEffect } from 'react';
import { dbService } from '../db/sqlite';
import { googleSheetSyncService, SyncResult } from '../services/googleSheetSync';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Clock,
  Layers,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

type ModalTab = 'live_sync' | 'manual_csv' | 'export_backup';

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('live_sync');
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncResult | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Manual CSV State
  const [csvText, setCsvText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSheetUrl(googleSheetSyncService.getSavedUrl());
      setAutoSync(googleSheetSyncService.isAutoSyncEnabled());
      setLastSyncTime(googleSheetSyncService.getLastSyncTime());
      setImportMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLiveSync = async () => {
    if (!sheetUrl.trim()) return;
    setIsSyncing(true);
    setSyncStatus(null);

    const result = await googleSheetSyncService.syncLiveSheet(sheetUrl.trim());
    setIsSyncing(false);
    setSyncStatus(result);

    if (result.success) {
      setLastSyncTime(result.timestamp);
      onDataChanged();
    }
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSync(enabled);
    googleSheetSyncService.setAutoSyncEnabled(enabled);
  };

  const handleExportCsv = () => {
    const csv = dbService.exportCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bugpulse_slack_workflow_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleExportSqlite = () => {
    const binary = dbService.exportSqliteBinary();
    const blob = new Blob([binary as any], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bugpulse_${new Date().toISOString().slice(0, 10)}.sqlite`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const count = dbService.importCsvData(content);
        setImportMessage(`Successfully imported and merged ${count} issues into SQLite!`);
        onDataChanged();
      } catch (err: any) {
        setImportMessage(`Import error: ${err?.message || 'Invalid file format'}`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    if (!csvText.trim()) return;
    setIsProcessing(true);
    try {
      const count = dbService.importCsvData(csvText);
      setImportMessage(`Successfully imported ${count} issues from CSV text!`);
      setCsvText('');
      onDataChanged();
    } catch (err: any) {
      setImportMessage(`Import error: ${err?.message || 'Invalid CSV data'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset the database to the initial Slack seed dataset? Any local modifications will be restored to defaults.'
      )
    ) {
      dbService.resetToDefault();
      setImportMessage('Database reset to original seed dataset successfully.');
      onDataChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Slack & Data Sync Hub</h3>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect live Slack Workflow Google Sheets or import/export SQLite data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('live_sync')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'live_sync'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Google Sheet Live Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_csv')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual_csv'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Manual CSV File</span>
          </button>

          <button
            onClick={() => setActiveTab('export_backup')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'export_backup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Export & Backup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Live Google Sheet Sync */}
          {activeTab === 'live_sync' && (
            <div className="space-y-5">
              {/* Sync Status Banner */}
              {syncStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    syncStatus.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {syncStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    {syncStatus.success ? (
                      <>
                        <span className="font-bold block">
                          Sync Complete ({syncStatus.timestamp}):
                        </span>
                        <span>
                          Synced <strong>{syncStatus.total}</strong> total issues —{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400">+{syncStatus.added} new</strong>,{' '}
                          <strong className="text-indigo-600 dark:text-indigo-400">{syncStatus.updated} updated</strong> in SQLite.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold block">Sync Failed:</span>
                        <span>{syncStatus.error}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Published Google Sheet CSV URL</span>
                  </label>
                  {lastSyncTime && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" /> Last synced: {lastSyncTime}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                    value={sheetUrl}
                    onChange={(e) => {
                      setSheetUrl(e.target.value);
                      googleSheetSyncService.saveUrl(e.target.value);
                    }}
                    className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none"
                  />

                  <button
                    onClick={handleLiveSync}
                    disabled={!sheetUrl.trim() || isSyncing}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Accepts Google Sheet Share Links or Published CSV links. Smart upsert will update existing tickets and insert new ones automatically.
                </p>
              </div>

              {/* Auto Sync Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Auto-Sync on Application Launch
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automatically fetch the latest issues from Slack / Google Sheets whenever you open BugPulse
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => handleAutoSyncToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Step-by-step Setup Guide */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>How to connect your Slack Workflow in 2 steps:</span>
                </div>
                <ol className="text-[11px] text-indigo-950/80 dark:text-indigo-200/90 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    In your Google Sheet, click <strong>File → Share → Publish to web</strong>, choose <strong>CSV</strong>, and copy the link.
                  </li>
                  <li>
                    In Slack Workflow Builder, add step <strong>Google Sheets: Add row</strong> to your bug report workflow so new reports append to that sheet.
                  </li>
                  <li>
                    Paste the CSV link above and click <strong>Sync Now</strong>!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Manual CSV Upload */}
          {activeTab === 'manual_csv' && (
            <div className="space-y-4">
              {importMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{importMessage}</span>
                </div>
              )}

              {/* File drop / select */}
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 rounded-xl p-6 bg-slate-50/70 dark:bg-slate-950/50 cursor-pointer transition-colors group">
                  <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2 transition-colors" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                    Click to select exported Slack CSV file
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Supports files exported directly from Slack Lists or Slack workflow channels
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Raw Text Paste fallback */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Or Paste Raw CSV Text:
                </label>
                <textarea
                  rows={4}
                  placeholder="Name,Details,Files,Action,Fixed Version,Created by,..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5 font-mono text-[11px] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    disabled={!csvText.trim() || isProcessing}
                    onClick={handleTextImport}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Import Pasted CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Export & Backup */}
          {activeTab === 'export_backup' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CSV Export */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Export Slack CSV</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      Download complete dataset formatted for spreadsheet imports.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-600/20 hover:bg-emerald-200 dark:hover:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-500/30 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .CSV</span>
                  </button>
                </div>

                {/* SQLite Export */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Export SQLite File</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      Download full standalone `.sqlite` binary DB to open in DBeaver or SQLite tools.
                    </p>
                  </div>
                  <button
                    onClick={handleExportSqlite}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/30 text-purple-800 dark:text-purple-300 border border-purple-300/80 dark:border-purple-500/30 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .SQLite</span>
                  </button>
                </div>
              </div>

              {/* Reset Database */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 block">
                    Reset to Seed Dataset
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restore the default initial Slack workflow issues
                  </span>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/90 dark:bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
