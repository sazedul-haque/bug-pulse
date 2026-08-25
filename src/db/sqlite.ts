import initSqlJs, { type Database } from 'sql.js';
// Vite native wasm import
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import Papa from 'papaparse';
import type { Issue, IssuePriority, IssueStatus } from '../types/issue';
import INITIAL_DATA from '../data/initialData.json';
import {
  detectCategory,
  extractMediaLinks,
  normalizePriority,
  normalizeStatus,
  parseDateToTimestamp,
} from '../services/categorization';

const STORAGE_KEY = 'bugpulse_sqlite_db_v3';

class DatabaseService {
  private db: Database | null = null;
  private isInitializing: Promise<void> | null = null;

  public async init(): Promise<Database> {
    if (this.db) return this.db;
    if (this.isInitializing) {
      await this.isInitializing;
      return this.db!;
    }

    this.isInitializing = (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: () => sqlWasmUrl || 'https://sql.js.org/dist/sql-wasm.wasm',
        });

        const savedDb = localStorage.getItem(STORAGE_KEY);
        if (savedDb) {
          try {
            const binary = Uint8Array.from(atob(savedDb), (c) => c.charCodeAt(0));
            this.db = new SQL.Database(binary);
            return;
          } catch (e) {
            console.warn('Failed to restore saved SQLite database, creating fresh one', e);
          }
        }

        this.db = new SQL.Database();
        this.createSchema();
        this.seedInitialData();
        this.persist();
      } catch (err) {
        console.error('Failed to initialize sql.js WASM:', err);
        // Fallback: try CDN if local wasm failed
        try {
          const SQL = await initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`,
          });
          this.db = new SQL.Database();
          this.createSchema();
          this.seedInitialData();
          this.persist();
        } catch (cdnErr) {
          console.error('Fatal: SQLite could not be loaded via WASM or CDN', cdnErr);
          throw cdnErr;
        }
      }
    })();

    await this.isInitializing;
    return this.db!;
  }

  private createSchema() {
    if (!this.db) return;
    this.db.run(`
      CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        details TEXT,
        files TEXT,
        action TEXT,
        fixed_version TEXT,
        created_by TEXT,
        last_edited_by TEXT,
        created_time TEXT,
        created_timestamp INTEGER,
        priority TEXT,
        raw_priority TEXT,
        user_impact_count INTEGER,
        category TEXT
      );
    `);
  }

  public seedInitialData() {
    if (!this.db) return;
    this.insertRawRows(INITIAL_DATA);
  }

  public insertRawRows(rows: any[]): number {
    if (!this.db || !rows || rows.length === 0) return 0;
    let count = 0;
    const stmt = this.db.prepare(`
      INSERT INTO issues (
        name, details, files, action, fixed_version, created_by,
        last_edited_by, created_time, created_timestamp, priority,
        raw_priority, user_impact_count, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of rows) {
      const name = (row['Name'] || row['name'] || '').trim();
      const details = (row['Details'] || row['details'] || '').trim();
      if (!name && !details) continue;

      const files = (row['Files'] || row['files'] || '').trim();
      const rawAction = (row['Action'] || row['action'] || 'New').trim();
      const action = normalizeStatus(rawAction);
      const fixedVersion = (row['Fixed Version'] || row['fixed_version'] || '').trim();
      const createdBy = (row['Created by'] || row['created_by'] || 'Support Agent').trim();
      const lastEditedBy = (row['Last edited by'] || row['last_edited_by'] || '').trim();
      const createdTime = (row['Created time'] || row['created_time'] || '').trim();
      const rawPriority = (row['Priority'] || row['priority'] || '').trim();
      const priority = normalizePriority(rawPriority);
      const userImpactCount = parseInt(
        row['How many user experienced'] || row['user_impact_count'] || '0',
        10
      ) || 0;
      const category = detectCategory(name, details);
      const timestamp = parseDateToTimestamp(createdTime);

      stmt.run([
        name,
        details,
        files,
        action,
        fixedVersion,
        createdBy,
        lastEditedBy,
        createdTime,
        timestamp,
        priority,
        rawPriority,
        userImpactCount,
        category,
      ]);
      count++;
    }

    stmt.free();
    this.persist();
    return count;
  }

  public importCsvData(csvText: string): number {
    if (!this.db) return 0;
    const parsed = Papa.parse<any>(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
    });
    return this.insertRawRows(parsed.data);
  }

  public getAllIssues(): Issue[] {
    if (!this.db) return [];
    const results = this.db.exec('SELECT * FROM issues ORDER BY id DESC');
    if (!results || results.length === 0) return [];

    const columns = results[0].columns;
    const values = results[0].values;

    return values.map((row) => {
      const item: any = {};
      columns.forEach((col, idx) => {
        item[col] = row[idx];
      });

      return {
        id: item.id,
        name: item.name || '',
        details: item.details || '',
        files: item.files || '',
        action: item.action as IssueStatus,
        fixedVersion: item.fixed_version || '',
        createdBy: item.created_by || '',
        lastEditedBy: item.last_edited_by || '',
        createdTime: item.created_time || '',
        createdTimestamp: item.created_timestamp || 0,
        priority: item.priority as IssuePriority,
        rawPriority: item.raw_priority || '',
        userImpactCount: item.user_impact_count || 0,
        category: item.category || 'General & Other',
        extractedLinks: extractMediaLinks(item.details || ''),
      };
    });
  }

  public insertIssue(issue: Omit<Issue, 'id' | 'extractedLinks' | 'createdTimestamp' | 'createdTime' | 'rawPriority'>): Issue {
    if (!this.db) throw new Error('Database not initialized');
    const timestamp = Date.now();
    const createdTime = new Date().toLocaleString();
    const category = issue.category || detectCategory(issue.name, issue.details);
    const priority = normalizePriority(issue.priority);

    this.db.run(
      `INSERT INTO issues (
        name, details, files, action, fixed_version, created_by,
        last_edited_by, created_time, created_timestamp, priority,
        raw_priority, user_impact_count, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        issue.name,
        issue.details,
        issue.files || '',
        issue.action || 'New',
        issue.fixedVersion || '',
        issue.createdBy || 'Support Agent',
        issue.lastEditedBy || '',
        createdTime,
        timestamp,
        priority,
        priority,
        issue.userImpactCount || 0,
        category,
      ]
    );

    const res = this.db.exec('SELECT last_insert_rowid() as id');
    const newId = res[0].values[0][0] as number;
    this.persist();

    return {
      id: newId,
      ...issue,
      rawPriority: priority,
      createdTime,
      createdTimestamp: timestamp,
      category,
      priority,
      extractedLinks: extractMediaLinks(issue.details),
    };
  }

  public updateIssue(issue: Issue): void {
    if (!this.db) return;
    this.db.run(
      `UPDATE issues SET 
        name = ?, details = ?, files = ?, action = ?, fixed_version = ?,
        created_by = ?, last_edited_by = ?, priority = ?,
        user_impact_count = ?, category = ?
      WHERE id = ?`,
      [
        issue.name,
        issue.details,
        issue.files,
        issue.action,
        issue.fixedVersion,
        issue.createdBy,
        issue.lastEditedBy,
        issue.priority,
        issue.userImpactCount,
        issue.category,
        issue.id,
      ]
    );
    this.persist();
  }

  public updateStatus(id: number, action: IssueStatus): void {
    if (!this.db) return;
    this.db.run('UPDATE issues SET action = ? WHERE id = ?', [action, id]);
    this.persist();
  }

  public deleteIssue(id: number): void {
    if (!this.db) return;
    this.db.run('DELETE FROM issues WHERE id = ?', [id]);
    this.persist();
  }

  public runCustomQuery(sql: string): { columns: string[]; values: any[][] } {
    if (!this.db) throw new Error('Database not initialized');
    const results = this.db.exec(sql);
    if (!results || results.length === 0) {
      return { columns: [], values: [] };
    }
    return {
      columns: results[0].columns,
      values: results[0].values,
    };
  }

  public exportSqliteBinary(): Uint8Array {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }

  public exportCsv(): string {
    const issues = this.getAllIssues();
    const rows = issues.map((i) => ({
      Name: i.name,
      Details: i.details,
      Files: i.files,
      Action: i.action,
      'Fixed Version': i.fixedVersion,
      'Created by': i.createdBy,
      'Last edited by': i.lastEditedBy,
      'Created time': i.createdTime,
      Priority: i.rawPriority || i.priority,
      'How many user experienced': i.userImpactCount,
    }));
    return Papa.unparse(rows);
  }

  public resetToDefault(): void {
    if (!this.db) return;
    this.db.run('DROP TABLE IF EXISTS issues');
    this.createSchema();
    this.seedInitialData();
    this.persist();
  }

  private persist() {
    if (!this.db) return;
    try {
      const binary = this.db.export();
      let binaryStr = '';
      const len = binary.byteLength;
      for (let i = 0; i < len; i++) {
        binaryStr += String.fromCharCode(binary[i]);
      }
      localStorage.setItem(STORAGE_KEY, btoa(binaryStr));
    } catch (e) {
      console.warn('LocalStorage limit exceeded or persistence error:', e);
    }
  }
}

export const dbService = new DatabaseService();
