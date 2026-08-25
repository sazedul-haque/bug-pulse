export type IssuePriority = 'High' | 'Mid' | 'Low' | 'Unassigned';
export type IssueStatus = 'Done' | 'Accepted' | 'Request' | 'Feature' | 'Rejected' | 'New';

export type IssueCategory =
  | 'Monetization & Payments'
  | 'Course Progression & Drip'
  | 'Quizzes & Grading'
  | 'Video & Media Player'
  | 'Translations & i18n'
  | 'Certificates & Badges'
  | 'Security & Auth'
  | 'Integrations & Addons'
  | 'Dashboard & UI/UX'
  | 'Email Notifications'
  | 'General & Other';

export interface ExtractedLink {
  url: string;
  type: 'loom' | 'youtube' | 'streamable' | 'image' | 'google-drive' | 'ticket' | 'external';
  label: string;
}

export interface Issue {
  id: number;
  name: string;
  details: string;
  files: string;
  action: IssueStatus;
  fixedVersion: string;
  createdBy: string;
  lastEditedBy: string;
  createdTime: string;
  createdTimestamp: number;
  priority: IssuePriority;
  rawPriority: string;
  userImpactCount: number;
  category: IssueCategory;
  extractedLinks: ExtractedLink[];
}

export interface FilterState {
  search: string;
  status: IssueStatus | 'All';
  priority: IssuePriority | 'All';
  category: IssueCategory | 'All';
  reporter: string | 'All';
  dateRange: 'all' | '30d' | '90d' | '2026' | '2025';
}

export type ViewMode = 'analytics' | 'kanban' | 'table' | 'sql';
