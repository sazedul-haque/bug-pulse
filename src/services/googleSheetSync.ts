import { dbService } from '../db/sqlite';
import { Issue } from '../types/issue';

export interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  total: number;
  timestamp: string;
  error?: string;
}

const STORAGE_SYNC_URL_KEY = 'bugpulse_google_sheet_url';
const STORAGE_WEBHOOK_URL_KEY = 'bugpulse_apps_script_url';
const STORAGE_LAST_SYNC_KEY = 'bugpulse_last_sync_time';
const STORAGE_AUTO_SYNC_KEY = 'bugpulse_auto_sync_enabled';

/**
 * Normalizes any Google Sheets URL into a valid public CSV export URL
 */
export function normalizeGoogleSheetUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Google Apps Script Web App URL (doGet returns JSON)
  if (trimmed.includes('script.google.com') && trimmed.includes('/exec')) {
    return trimmed;
  }

  // Already a published CSV URL
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return trimmed;
  }

  // Published web link without output=csv (e.g. /pub or /pubhtml)
  if (trimmed.includes('/pubhtml') || (trimmed.includes('/pub') && !trimmed.includes('output=csv'))) {
    const base = trimmed.split('?')[0].replace('/pubhtml', '/pub');
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `${base}?output=csv${gidParam}`;
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

async function fetchCsvContent(url: string): Promise<string> {
  const cacheBuster = `_t=${Date.now()}`;
  const separator = url.includes('?') ? '&' : '?';
  const liveUrl = `${url}${separator}${cacheBuster}`;

  // 1. First attempt: Direct fetch
  try {
    const res = await fetch(liveUrl, { redirect: 'follow', cache: 'no-cache' });
    if (res.ok) {
      const text = await res.text();
      // Check if response is actually an HTML error/login page (must START with html tags)
      const trimmedText = text.trim().toLowerCase();
      if (!trimmedText.startsWith('<!doctype html') && !trimmedText.startsWith('<html')) {
        return text;
      }
    }
  } catch (directErr) {
    console.warn('Direct Google Sheet fetch failed, trying CORS proxy fallback...', directErr);
  }

  // 2. Second attempt: Fallback via high-speed public CORS proxy with cache busting
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(liveUrl)}`;
  const proxyRes = await fetch(proxyUrl, { cache: 'no-cache' });
  if (!proxyRes.ok) {
    throw new Error(
      `Could not retrieve Google Sheet (${proxyRes.status}: ${proxyRes.statusText}). Please check that the sheet is shared or published to web.`
    );
  }

  const proxyText = await proxyRes.text();
  const trimmedProxyText = proxyText.trim().toLowerCase();
  if (trimmedProxyText.startsWith('<!doctype html') || trimmedProxyText.startsWith('<html')) {
    throw new Error(
      'Google Sheet returned an HTML sign-in page. Please make sure the sheet is published (File → Share → Publish to web → CSV) or set to "Anyone with the link can view".'
    );
  }

  return proxyText;
}

export const DEFAULT_GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeoT0oS8Xp-VgHYUDiSyK6-mrwO7CAyWZK_I6lhVEVOvwv5QqaSsvqrSvjs-WXbWcDlA-d_xmO0VDk/pub?output=csv';

export const googleSheetSyncService = {
  getSavedUrl(): string {
    return localStorage.getItem(STORAGE_SYNC_URL_KEY) || DEFAULT_GOOGLE_SHEET_URL;
  },

  saveUrl(url: string): void {
    localStorage.setItem(STORAGE_SYNC_URL_KEY, url.trim());
  },

  getSavedWebhookUrl(): string {
    return localStorage.getItem(STORAGE_WEBHOOK_URL_KEY) || '';
  },

  saveWebhookUrl(url: string): void {
    localStorage.setItem(STORAGE_WEBHOOK_URL_KEY, url.trim());
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(STORAGE_LAST_SYNC_KEY);
  },

  isAutoSyncEnabled(): boolean {
    const val = localStorage.getItem(STORAGE_AUTO_SYNC_KEY);
    // Defaults to true for all users on launch unless explicitly set to 'false'
    return val !== 'false';
  },

  setAutoSyncEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_AUTO_SYNC_KEY, String(enabled));
  },

  /**
   * Push a created or updated issue directly to the Google Sheet via Apps Script Webhook
   */
  async pushIssueToSheet(issue: Partial<Issue> & { name: string }): Promise<{ success: boolean; action?: string; error?: string }> {
    const webhookUrl = this.getSavedWebhookUrl() || (this.getSavedUrl().includes('script.google.com') ? this.getSavedUrl() : '');
    if (!webhookUrl) {
      // No two-way webhook configured
      return { success: false, error: 'No Two-Way Apps Script Webhook URL configured' };
    }

    try {
      const payload = {
        name: issue.name,
        details: issue.details,
        files: issue.files || '',
        action: issue.action,
        fixedVersion: issue.fixedVersion || '',
        createdBy: issue.createdBy || 'Support Agent',
        lastEditedBy: issue.lastEditedBy || 'BugPulse User',
        createdTime: issue.createdTime,
        priority: issue.priority,
        userImpactCount: issue.userImpactCount || 0,
      };

      // Google Apps Script requires text/plain or no-cors / standard POST to prevent preflight errors
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script returned status ${response.status}`);
      }

      const resJson = await response.json();
      return {
        success: resJson.success !== false,
        action: resJson.action || 'saved',
      };
    } catch (err: any) {
      console.warn('Failed to push update to Google Sheet webhook:', err);
      return {
        success: false,
        error: err?.message || 'Failed to push to Google Sheet',
      };
    }
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
      // Check if target is a Google Apps Script Web App (doGet)
      if (targetUrl.includes('script.google.com') && targetUrl.includes('/exec')) {
        const res = await fetch(targetUrl, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Apps Script returned ${res.status}`);
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          const syncStats = dbService.insertRawRows(json.data);
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          localStorage.setItem(STORAGE_LAST_SYNC_KEY, timestamp);
          this.saveUrl(targetUrl);
          this.saveWebhookUrl(targetUrl);
          return {
            success: true,
            added: syncStats,
            updated: 0,
            total: json.data.length,
            timestamp,
          };
        }
      }

      const csvContent = await fetchCsvContent(targetUrl);
      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error('Received empty data from Google Sheet.');
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
