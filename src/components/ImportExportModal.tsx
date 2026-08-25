import React, { useState } from 'react';
import { dbService } from '../db/sqlite';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [csvText, setCsvText] = useState('');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

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
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Import & Export Center</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync data with Slack workflow CSV or export SQLite database
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {importMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{importMessage}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Export Database
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CSV Export */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Export Slack CSV</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Download complete dataset formatted for Slack Workflow and spreadsheet imports.
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
          </div>

          {/* Import New Workflow CSV */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Import Slack Workflow CSV
            </h4>

            {/* File drop / select */}
            <div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 rounded-xl p-6 bg-slate-50/70 dark:bg-slate-950/50 cursor-pointer transition-colors group">
                <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2 transition-colors" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                  Click to select updated Slack CSV file
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Supports files exported directly from Slack channels or list workflows
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
                rows={3}
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

          {/* Reset Database */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 block">
                Reset to Seed Dataset
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Restore the default ~100 issues from the initial Slack workflow
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
