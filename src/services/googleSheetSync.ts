import { dbService } from '../db/sqlite';

export interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  total: number;
  timestamp: string;
  error?: string;
}

const STORAGE_SYNC_URL_KEY = 'bugpulse_google_sheet_url';
const STORAGE_LAST_SYNC_KEY = 'bugpulse_last_sync_time';
const STORAGE_AUTO_SYNC_KEY = 'bugpulse_auto_sync_enabled';

/**
 * Normalizes any Google Sheets URL into a valid public CSV export URL
 */
export function normalizeGoogleSheetUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Already a published CSV URL
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return trimmed;
  }

  // Published web link without output=csv
  if (trimmed.includes('/pubhtml') || trimmed.includes('/pub?')) {
    const base = trimmed.split('?')[0].replace('/pubhtml', '/pub');
    return `${base}?output=csv`;
  }

  // Standard edit/view link: https://docs.google.com/spreadsheets/d/<ID>/edit...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
  }

  return trimmed;
}

export const googleSheetSyncService = {
  getSavedUrl(): string {
    return localStorage.getItem(STORAGE_SYNC_URL_KEY) || '';
  },

  saveUrl(url: string): void {
    localStorage.setItem(STORAGE_SYNC_URL_KEY, url.trim());
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_LAST_SYNC_KEY);
  },

  isAutoSyncEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_AUTO_SYNC_KEY);
    return val === 'true';
  },

  setAutoSyncEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_AUTO_SYNC_KEY, String(enabled));
  },

  async syncLiveSheet(url?: string): Promise<SyncResult> {
    const targetUrl = normalizeGoogleSheetUrl(url || this.getSavedUrl());
    if (!targetUrl) {
      return {
        success: false,
        added: 0,
        updated: 0,
        total: 0,
        timestamp: new Date().toLocaleTimeString(),
        error: 'No Google Sheet URL provided',
      };
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          Accept: 'text/csv,text/plain,*/*',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Google Sheet (${response.status}: ${response.statusText}). Make sure the sheet is shared or published to web.`
        );
      }

      const csvContent = await response.text();
      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error('Received empty CSV data from Google Sheet.');
      }

      // Check if Google returned an HTML login page instead of CSV
      if (csvContent.includes('<!DOCTYPE html>') || csvContent.includes('<html')) {
        throw new Error(
          'Google Sheet requires public access. In Google Sheets, click File → Share → Publish to web → select CSV, or set General access to "Anyone with the link can view".'
        );
      }

      const syncStats = dbService.syncCsvData(csvContent);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      localStorage.setItem(STORAGE_LAST_SYNC_KEY, timestamp);
      this.saveUrl(targetUrl);

      return {
        success: true,
        added: syncStats.added,
        updated: syncStats.updated,
        total: syncStats.total,
        timestamp,
      };
    } catch (err: any) {
      console.error('Google Sheet Sync Error:', err);
      return {
        success: false,
        added: 0,
        updated: 0,
        total: 0,
        timestamp: new Date().toLocaleTimeString(),
        error: err?.message || 'Failed to sync with Google Sheet',
      };
    }
  },
};
