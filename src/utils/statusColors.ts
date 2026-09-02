import { IssueStatus } from '../types/issue';

export const getStatusBadgeClass = (status: IssueStatus | string): string => {
  switch (status) {
    case 'Done':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
    case 'Accepted':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
    case 'Feature':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
    case 'Request':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25';
    case 'Rejected':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
    case 'New':
    default:
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
  }
};
