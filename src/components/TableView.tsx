import React, { useState, useMemo } from 'react';
import { Issue, IssuePriority, IssueStatus } from '../types/issue';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { getCategoryStyle } from '../utils/categoryColors';
import { getStatusBadgeClass } from '../utils/statusColors';
import {
  ArrowUpDown,
  Search,
  Flame,
  Link2,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface TableViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onUpdateStatus: (id: number, status: IssueStatus) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (val: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (val: string) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

type SortField = 'id' | 'name' | 'priority' | 'category' | 'action' | 'createdTimestamp' | 'userImpactCount';
type SortOrder = 'asc' | 'desc';

export const TableView: React.FC<TableViewProps> = ({
  issues,
  onSelectIssue,
  onUpdateStatus,
  searchTerm: propSearchTerm,
  onSearchChange,
  statusFilter: propStatusFilter,
  onStatusFilterChange,
  priorityFilter: propPriorityFilter,
  onPriorityFilterChange,
  categoryFilter: propCategoryFilter,
  onCategoryFilterChange,
  currentPage: propCurrentPage,
  onPageChange,
  pageSize: propPageSize,
  onPageSizeChange,
}) => {
  const { isEditor } = useAuth();
  const { resolveAgentName, getAgentAvatarBg } = useAgent();

  const [internalSearch, setInternalSearch] = useState('');
  const [internalStatus, setInternalStatus] = useState<string>('All');
  const [internalPriority, setInternalPriority] = useState<string>('All');
  const [internalCategory, setInternalCategory] = useState<string>('All');
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(15);

  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : internalSearch;
  const statusFilter = propStatusFilter !== undefined ? propStatusFilter : internalStatus;
  const priorityFilter = propPriorityFilter !== undefined ? propPriorityFilter : internalPriority;
  const categoryFilter = propCategoryFilter !== undefined ? propCategoryFilter : internalCategory;
  const currentPage = propCurrentPage !== undefined ? propCurrentPage : internalPage;
  const pageSize = propPageSize !== undefined ? propPageSize : internalPageSize;

  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handlePageChange = (page: number) => {
    if (onPageChange) onPageChange(page);
    else setInternalPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) onPageSizeChange(size);
    else setInternalPageSize(size);
    handlePageChange(1);
  };

  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    else setInternalSearch(val);
    handlePageChange(1);
  };

  const handleStatusChange = (val: string) => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    else setInternalStatus(val);
    handlePageChange(1);
  };

  const handlePriorityChange = (val: string) => {
    if (onPriorityFilterChange) onPriorityFilterChange(val);
    else setInternalPriority(val);
    handlePageChange(1);
  };

  const handleCategoryChange = (val: string) => {
    if (onCategoryFilterChange) onCategoryFilterChange(val);
    else setInternalCategory(val);
    handlePageChange(1);
  };

  // Extract unique categories & reporters
  const categories = useMemo(() => {
    return Array.from(new Set(issues.map((i) => i.category))).sort();
  }, [issues]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitle = issue.name.toLowerCase().includes(q);
        const matchDetails = issue.details.toLowerCase().includes(q);
        const matchReporter = issue.createdBy.toLowerCase().includes(q);
        const matchCategory = issue.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDetails && !matchReporter && !matchCategory) {
          return false;
        }
      }
      // Status
      if (statusFilter !== 'All' && issue.action !== statusFilter) return false;
      // Priority
      if (priorityFilter !== 'All' && issue.priority !== priorityFilter) return false;
      // Category
      if (categoryFilter !== 'All' && issue.category !== categoryFilter) return false;

      return true;
    });
  }, [issues, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'priority') {
        const weights: Record<string, number> = { High: 3, Mid: 2, Low: 1, Unassigned: 0 };
        valA = weights[a.priority] || 0;
        valB = weights[b.priority] || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredIssues, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedIssues.length / pageSize) || 1;
  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedIssues.slice(start, start + pageSize);
  }, [sortedIssues, currentPage, pageSize]);

  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
            <Flame className="h-3 w-3 text-rose-500" /> High
          </span>
        );
      case 'Mid':
        return (
          <span className="inline-flex items-center rounded bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            Mid
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center rounded bg-sky-100 dark:bg-[#0e1a2f] px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-[#4a6a8a] border border-[var(--border)] dark:border-slate-700">
            Low
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">-</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] p-3.5 border border-[var(--border)] shadow-xs transition-colors">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search title, details, reporter..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl bg-[var(--surface-inner)] py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-xl bg-[var(--surface-inner)] py-1.5 px-3 text-xs text-[var(--text-secondary)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[var(--surface)] text-[var(--text-primary)]">All Statuses</option>
            <option value="Done" className="bg-[var(--surface)] text-[var(--text-primary)]">Done</option>
            <option value="Accepted" className="bg-[var(--surface)] text-[var(--text-primary)]">Accepted</option>
            <option value="Feature" className="bg-[var(--surface)] text-[var(--text-primary)]">Feature</option>
            <option value="Request" className="bg-[var(--surface)] text-[var(--text-primary)]">Request</option>
            <option value="Rejected" className="bg-[var(--surface)] text-[var(--text-primary)]">Rejected</option>
            <option value="New" className="bg-[var(--surface)] text-[var(--text-primary)]">New</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="rounded-xl bg-[var(--surface-inner)] py-1.5 px-3 text-xs text-[var(--text-secondary)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[var(--surface)] text-[var(--text-primary)]">All Priorities</option>
            <option value="High" className="bg-[var(--surface)] text-[var(--text-primary)]">High / Urgent</option>
            <option value="Mid" className="bg-[var(--surface)] text-[var(--text-primary)]">Mid</option>
            <option value="Low" className="bg-[var(--surface)] text-[var(--text-primary)]">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-xl bg-[var(--surface-inner)] py-1.5 px-3 text-xs text-[var(--text-secondary)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none max-w-[200px] cursor-pointer"
          >
            <option value="All" className="bg-[var(--surface)] text-[var(--text-primary)]">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[var(--surface)] text-[var(--text-primary)]">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span>Showing</span>
          <span className="font-semibold text-[var(--text-primary)]">{filteredIssues.length}</span>
          <span>of</span>
          <span className="font-semibold text-[var(--text-primary)]">{issues.length}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-inner)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 w-14 cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Issue Title & Description</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-2.5 w-36 lg:w-44 whitespace-nowrap cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-2.5 w-24 lg:w-28 whitespace-nowrap cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('action')}
                  className="py-3 px-2.5 w-28 lg:w-32 whitespace-nowrap cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-2.5 w-32 lg:w-36 whitespace-nowrap">Reporter</th>
                <th
                  onClick={() => handleSort('createdTimestamp')}
                  className="py-3 px-2.5 w-28 lg:w-36 whitespace-nowrap cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date Logged</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap w-16">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs">
              {paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--text-muted)]">
                    No issues match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-[var(--surface-hover)] cursor-pointer transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-2.5 px-3 font-mono text-[var(--text-muted)] group-hover:text-[var(--accent)] font-semibold whitespace-nowrap">
                      #{issue.id}
                    </td>

                    {/* Title & Preview (With strict truncation so long content never pushes other columns) */}
                    <td className="py-2.5 px-3 max-w-0">
                      <div className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {issue.name || '(Untitled Issue)'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {issue.details}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium border truncate inline-block max-w-full ${getCategoryStyle(issue.category).badge}`}>
                        {issue.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {getPriorityBadge(issue.priority)}
                    </td>

                    {/* Status Dropdown / Badge */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {isEditor ? (
                        <select
                          value={issue.action}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(issue.id, e.target.value as IssueStatus);
                          }}
                          className={`rounded-lg px-2 py-0.5 text-xs font-semibold border cursor-pointer ${getStatusBadgeClass(
                            issue.action
                          )} focus:outline-none`}
                        >
                          <option value="Done" className="bg-[var(--surface)] text-[var(--text-primary)]">
                            Done
                          </option>
                          <option value="Accepted" className="bg-[var(--surface)] text-[var(--text-primary)]">
                            Accepted
                          </option>
                          <option value="Feature" className="bg-[var(--surface)] text-[var(--text-primary)]">
                            Feature
                          </option>
                          <option value="Request" className="bg-[var(--surface)] text-[var(--text-primary)]">
                            Request
                          </option>
                          <option value="Rejected" className="bg-[var(--surface)] text-[var(--text-primary)]">
                            Rejected
                          </option>
                          <option value="New" className="bg-[var(--surface)] text-[var(--text-primary)]">
                            New
                          </option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${getStatusBadgeClass(
                            issue.action
                          )}`}
                        >
                          {issue.action}
                        </span>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`h-4.5 w-4.5 rounded flex items-center justify-center font-bold text-[8.5px] shadow-2xs shrink-0 ${getAgentAvatarBg(
                            resolveAgentName(issue.createdBy)
                          )}`}
                        >
                          {resolveAgentName(issue.createdBy).slice(0, 2).toUpperCase()}
                        </div>
                        <span
                          className="text-[var(--text-secondary)] font-medium text-xs truncate max-w-[110px]"
                          title={`${resolveAgentName(issue.createdBy)} (${issue.createdBy})`}
                        >
                          {resolveAgentName(issue.createdBy)}
                        </span>
                      </div>
                    </td>

                    {/* Date Logged */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-[var(--text-muted)] text-[11px] truncate">
                      {issue.createdTime}
                    </td>

                    {/* Links count */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {issue.extractedLinks.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[var(--accent)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded-full border border-[var(--border)] text-[10.5px]">
                          <Link2 className="h-2.5 w-2.5" />
                          <span>{issue.extractedLinks.length}</span>
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] opacity-40">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3 bg-[var(--surface-inner)] text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg bg-[var(--surface)] py-1 px-2 text-xs text-[var(--text-secondary)] border border-[var(--border)] cursor-pointer"
            >
              <option value={10} className="bg-[var(--surface)] text-[var(--text-primary)]">10</option>
              <option value={15} className="bg-[var(--surface)] text-[var(--text-primary)]">15</option>
              <option value={25} className="bg-[var(--surface)] text-[var(--text-primary)]">25</option>
              <option value={50} className="bg-[var(--surface)] text-[var(--text-primary)]">50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className="rounded-lg bg-[var(--surface)] p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed border border-[var(--border)] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className="rounded-lg bg-[var(--surface)] p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed border border-[var(--border)] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
