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
