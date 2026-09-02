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
  Code2,
  Copy,
  Check,
  ArrowRightLeft,
  Send,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

type ModalTab = 'live_sync' | 'two_way_webhook' | 'manual_csv' | 'export_backup';

const APPS_SCRIPT_CODE = `/**
 * BugPulse — Google Apps Script for Two-Way Google Sheets Sync
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    
    var nameCol = headers.indexOf('Name');
    var detailsCol = headers.indexOf('Details');
    var filesCol = headers.indexOf('Files');
    var actionCol = headers.indexOf('Action');
    var fixedVerCol = headers.indexOf('Fixed Version');
    var createdByCol = headers.indexOf('Created by');
    var lastEditedByCol = headers.indexOf('Last edited by');
    var createdTimeCol = headers.indexOf('Created time');
    var priorityCol = headers.indexOf('Priority');
    var userImpactCol = headers.indexOf('How many user experienced');
    
    if (nameCol === -1) nameCol = 0;
    if (detailsCol === -1) detailsCol = 1;
    if (filesCol === -1) filesCol = 2;
    if (actionCol === -1) actionCol = 3;
    if (fixedVerCol === -1) fixedVerCol = 4;
    if (createdByCol === -1) createdByCol = 5;
    if (lastEditedByCol === -1) lastEditedByCol = 6;
    if (createdTimeCol === -1) createdTimeCol = 7;
    if (priorityCol === -1) priorityCol = 8;
    if (userImpactCol === -1) userImpactCol = 9;
    
    var targetName = (data.name || '').trim();
    var rowIndex = -1;
    
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][nameCol]).trim().toLowerCase() === targetName.toLowerCase()) {
        rowIndex = i + 1;
        break;
      }
    }
    
    var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "M/d/yy, h:mm a");
    
    if (rowIndex > 0) {
      if (data.details !== undefined && detailsCol !== -1) sheet.getRange(rowIndex, detailsCol + 1).setValue(data.details);
      if (data.files !== undefined && filesCol !== -1) sheet.getRange(rowIndex, filesCol + 1).setValue(data.files);
      if (data.action !== undefined && actionCol !== -1) sheet.getRange(rowIndex, actionCol + 1).setValue(data.action);
      if (data.fixedVersion !== undefined && fixedVerCol !== -1) sheet.getRange(rowIndex, fixedVerCol + 1).setValue(data.fixedVersion);
      if (data.priority !== undefined && priorityCol !== -1) sheet.getRange(rowIndex, priorityCol + 1).setValue(data.priority);
      if (data.userImpactCount !== undefined && userImpactCol !== -1) sheet.getRange(rowIndex, userImpactCol + 1).setValue(data.userImpactCount);
      if (lastEditedByCol !== -1) sheet.getRange(rowIndex, lastEditedByCol + 1).setValue(data.lastEditedBy || 'BugPulse Web App');
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: 'updated',
        row: rowIndex
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      var newRow = [];
      var maxCols = Math.max(headers.length, 10);
      for (var c = 0; c < maxCols; c++) newRow.push('');
      
      newRow[nameCol] = targetName;
      if (detailsCol !== -1) newRow[detailsCol] = data.details || '';
      if (filesCol !== -1) newRow[filesCol] = data.files || '';
      if (actionCol !== -1) newRow[actionCol] = data.action || 'New';
      if (fixedVerCol !== -1) newRow[fixedVerCol] = data.fixedVersion || '';
      if (createdByCol !== -1) newRow[createdByCol] = data.createdBy || 'BugPulse User';
      if (lastEditedByCol !== -1) newRow[lastEditedByCol] = data.lastEditedBy || 'BugPulse Web App';
      if (createdTimeCol !== -1) newRow[createdTimeCol] = data.createdTime || nowStr;
      if (priorityCol !== -1) newRow[priorityCol] = data.priority || 'Unassigned';
      if (userImpactCol !== -1) newRow[userImpactCol] = data.userImpactCount || 0;
      
      sheet.appendRow(newRow);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: 'created',
        row: sheet.getLastRow()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) rowObj[headers[j]] = values[i][j];
    rows.push(rowObj);
  }
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: rows
  })).setMimeType(ContentService.MimeType.JSON);
}`;

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('live_sync');
  const [sheetUrl, setSheetUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncResult | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);
  const [isTestingPush, setIsTestingPush] = useState(false);

  // Manual CSV State
  const [csvText, setCsvText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSheetUrl(googleSheetSyncService.getSavedUrl());
      setWebhookUrl(googleSheetSyncService.getSavedWebhookUrl());
      setAutoSync(googleSheetSyncService.isAutoSyncEnabled());
      setLastSyncTime(googleSheetSyncService.getLastSyncTime());
      setImportMessage(null);
      setTestPushStatus(null);
    }
  }, [isOpen]);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestTwoWay = async () => {
    if (!webhookUrl.trim()) return;
    setIsTestingPush(true);
    setTestPushStatus(null);
    googleSheetSyncService.saveWebhookUrl(webhookUrl.trim());

    const issues = dbService.getAllIssues();
    const testIssue = issues[0] || {
      name: 'Test Connectivity Ping',
      details: 'Testing Two-way sync connection from BugPulse',
      action: 'Done',
      priority: 'Low',
    };

    const res = await googleSheetSyncService.pushIssueToSheet(testIssue);
    setIsTestingPush(false);
    if (res.success) {
      setTestPushStatus('✓ Two-Way Write Success! Your Google Sheet responded and received updates.');
    } else {
      setTestPushStatus(`✗ Failed to write to Google Sheet: ${res.error}`);
    }
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-[#040812]/85 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-[var(--surface)] bg-[var(--surface)] border border-[var(--border)] border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors cursor-default"
      >
        {/* Header */}
        <div className="border-b border-[var(--border)] border-[var(--border)] p-5 bg-sky-50/80 dark:bg-[#040812]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Slack & Data Sync Hub</h3>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  Two-Way Sync Ready
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Connect live Slack Workflow Google Sheets or import/export SQLite data
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[var(--border)] border-[var(--border)] bg-sky-50/50 dark:bg-[#040812]/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('live_sync')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'live_sync'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 dark:border-cyan-400'
                : 'border-transparent text-slate-500 hover:text-sky-800 dark:hover:text-slate-300'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Google Sheet Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('two_way_webhook')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'two_way_webhook'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 dark:border-cyan-400'
                : 'border-transparent text-slate-500 hover:text-sky-800 dark:hover:text-slate-300'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Two-Way Write Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_csv')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual_csv'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 dark:border-cyan-400'
                : 'border-transparent text-slate-500 hover:text-sky-800 dark:hover:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Manual CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('export_backup')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'export_backup'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 dark:border-cyan-400'
                : 'border-transparent text-slate-500 hover:text-sky-800 dark:hover:text-slate-300'
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
                          <strong className="text-cyan-600 dark:text-cyan-400">{syncStatus.updated} updated</strong> in SQLite.
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
                  <label className="text-xs font-semibold text-sky-700 dark:text-sky-200 flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Google Sheet CSV Link or Web App URL</span>
                  </label>
                  {lastSyncTime && (
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
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
                    className="flex-1 rounded-xl bg-sky-50 dark:bg-[#040812] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[#3a5a7a] border border-[var(--border)] border-[var(--border)] focus:border-cyan-500 focus:bg-[var(--surface)] dark:focus:bg-slate-950 focus:outline-none font-mono"
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
                <p className="text-[11px] text-[var(--text-muted)]">
                  Accepts Google Sheet Share Links, Published CSV links, or Apps Script URLs.
                </p>
              </div>

              {/* Auto Sync Toggle */}
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-[#040812]/70 border border-[var(--border)] border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-sky-800 dark:text-sky-100 block">
                    Auto-Sync on Application Launch
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
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
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--surface)] after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              {/* Notice to setup two-way write */}
              <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-cyan-900 dark:text-cyan-300 block">
                      Want website edits to save back to Google Sheets?
                    </span>
                    <span className="text-[11px] text-cyan-950/80 dark:text-cyan-200/80">
                      Enable Two-Way write sync with a free Google Apps Script in 2 minutes.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('two_way_webhook')}
                  className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0 ml-2"
                >
                  Setup Write Sync
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Two-Way Write Webhook Setup */}
          {activeTab === 'two_way_webhook' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-300 leading-relaxed">
                <span className="font-bold block mb-1">⚡ Enable Two-Way Real-time Sync:</span>
                Whenever you change a status, edit details, or create an issue in BugPulse, this script writes the change straight back to your Google Sheet so it never gets overwritten!
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-sky-700 dark:text-sky-200 flex items-center gap-1.5">
                  <Send className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>Google Apps Script Web App URL (ends with /exec)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={webhookUrl}
                    onChange={(e) => {
                      setWebhookUrl(e.target.value);
                      googleSheetSyncService.saveWebhookUrl(e.target.value);
                    }}
                    className="flex-1 rounded-xl bg-sky-50 dark:bg-[#040812] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-slate-400 dark:placeholder-[#3a5a7a] border border-[var(--border)] border-[var(--border)] focus:border-purple-500 focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleTestTwoWay}
                    disabled={!webhookUrl.trim() || isTestingPush}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 px-3.5 py-2 text-xs font-bold text-white transition-all cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isTestingPush ? 'animate-spin' : ''}`} />
                    <span>{isTestingPush ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
                {testPushStatus && (
                  <p className={`text-xs font-medium ${testPushStatus.startsWith('✓') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {testPushStatus}
                  </p>
                )}
              </div>

              {/* 3-Step Setup Instructions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-100">
                    Step-by-Step Instructions:
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Script Copied!' : 'Copy Script Code'}</span>
                  </button>
                </div>

                <ol className="text-xs text-sky-600 dark:text-[#4a6a8a] space-y-2 list-decimal list-inside p-3.5 rounded-xl bg-sky-50 dark:bg-[#040812]/70 border border-[var(--border)] border-[var(--border)] leading-relaxed">
                  <li>
                    Open your <strong>Google Sheet</strong> and click <strong>Extensions → Apps Script</strong>.
                  </li>
                  <li>
                    Delete any existing code, click <strong>"Copy Script Code"</strong> above, and paste it.
                  </li>
                  <li>
                    Click the blue <strong>Deploy</strong> button (top right) → <strong>New deployment</strong>.
                  </li>
                  <li>
                    Select type: <strong>Web app</strong> (gear icon). Set <em>Execute as</em> to <strong>Me</strong> and <em>Who has access</em> to <strong>Anyone</strong>.
                  </li>
                  <li>
                    Click <strong>Deploy</strong>, authorize Google permissions, copy the generated <strong>Web App URL</strong>, and paste it above!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Manual CSV Upload */}
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
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] border-[var(--border)] hover:border-cyan-500/60 dark:hover:border-cyan-500/60 rounded-xl p-6 bg-sky-50/70 dark:bg-[#040812]/50 cursor-pointer transition-colors group">
                  <Upload className="h-8 w-8 text-sky-400/70 dark:text-[#3a5a7a] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 mb-2 transition-colors" />
                  <span className="text-xs font-semibold text-sky-700 dark:text-sky-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
                    Click to select exported Slack CSV file
                  </span>
                  <span className="text-[11px] text-sky-400/70 dark:text-[#3a5a7a] mt-1">
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
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                  Or Paste Raw CSV Text:
                </label>
                <textarea
                  rows={4}
                  placeholder="Name,Details,Files,Action,Fixed Version,Created by,..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full rounded-xl bg-sky-50 dark:bg-[#040812] p-2.5 font-mono text-[11px] text-sky-800 dark:text-sky-200 border border-[var(--border)] border-[var(--border)] focus:border-cyan-500 focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    disabled={!csvText.trim() || isProcessing}
                    onClick={handleTextImport}
                    className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Import Pasted CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Export & Backup */}
          {activeTab === 'export_backup' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CSV Export */}
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-[#040812]/70 border border-[var(--border)] border-[var(--border)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Export Slack CSV</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mb-4 leading-relaxed">
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
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-[#040812]/70 border border-[var(--border)] border-[var(--border)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Export SQLite File</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mb-4 leading-relaxed">
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
              <div className="pt-4 border-t border-[var(--border)] border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-sky-800 dark:text-sky-200 block">
                    Reset to Seed Dataset
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Restore the default initial Slack workflow issues
                  </span>
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-100 dark:bg-[#0e1a2f]/80 hover:bg-slate-200 dark:hover:bg-[#0e1a2f] text-sky-700 dark:text-sky-200 px-3 py-2 text-xs font-medium border border-[var(--border)] dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] border-[var(--border)] p-4 bg-sky-50/90 dark:bg-[#040812]/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-[#0e1a2f] hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-sky-800 dark:text-sky-50 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
