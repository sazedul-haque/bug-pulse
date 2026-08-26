import React, { useState, useMemo } from 'react';
import { Issue, IssuePriority, IssueStatus } from '../types/issue';
import { useAuth } from '../context/AuthContext';
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
}

type SortField = 'id' | 'name' | 'priority' | 'category' | 'action' | 'createdTimestamp' | 'userImpactCount';
type SortOrder = 'asc' | 'desc';

export const TableView: React.FC<TableViewProps> = ({
  issues,
  onSelectIssue,
  onUpdateStatus,
}) => {
  const { isEditor, openPasskeyModal } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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
          <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Low
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">-</span>;
    }
  };

  const getStatusBadgeClass = (status: IssueStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
      case 'Accepted':
        return 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
      case 'Feature':
        return 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/40';
      case 'Request':
        return 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search title, details, reporter..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-50 dark:bg-slate-950 py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
            <option value="Done" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Done</option>
            <option value="Accepted" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Accepted</option>
            <option value="Feature" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Feature</option>
            <option value="Request" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Request</option>
            <option value="Rejected" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Rejected</option>
            <option value="New" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">New</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-50 dark:bg-slate-950 py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Priorities</option>
            <option value="High" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">High / Urgent</option>
            <option value="Mid" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mid</option>
            <option value="Low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl bg-slate-50 dark:bg-slate-950 py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none max-w-[200px] cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredIssues.length}</span>
          <span>of</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{issues.length}</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors min-w-[280px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Issue Title & Description</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('action')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Reporter</th>
                <th
                  onClick={() => handleSort('createdTimestamp')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date Logged</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No issues match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-slate-50/90 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold">
                      #{issue.id}
                    </td>

                    {/* Title & Preview */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {issue.name || '(Untitled Issue)'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {issue.details}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/30">
                        {issue.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(issue.priority)}
                    </td>

                    {/* Status Dropdown / Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isEditor ? (
                        <select
                          value={issue.action}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(issue.id, e.target.value as IssueStatus);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-pointer ${getStatusBadgeClass(
                            issue.action
                          )} focus:outline-none`}
                        >
                          <option value="Done" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            Done
                          </option>
                          <option value="Accepted" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            Accepted
                          </option>
                          <option value="Feature" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            Feature
                          </option>
                          <option value="Request" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            Request
                          </option>
                          <option value="Rejected" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            Rejected
                          </option>
                          <option value="New" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            New
                          </option>
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPasskeyModal();
                          }}
                          title="Click to unlock Editor Mode"
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${getStatusBadgeClass(
                            issue.action
                          )}`}
                        >
                          <span>{issue.action}</span>
                          <Lock className="h-3 w-3 opacity-60" />
                        </button>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {issue.createdBy}
                    </td>

                    {/* Date Logged */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                      {issue.createdTime}
                    </td>

                    {/* Links count */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {issue.extractedLinks.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/30 text-[11px]">
                          <Link2 className="h-3 w-3" />
                          <span>{issue.extractedLinks.length}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800 px-4 py-3 bg-slate-50/80 dark:bg-slate-950/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg bg-white dark:bg-slate-900 py-1 px-2 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <option value={10} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">10</option>
              <option value={15} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">15</option>
              <option value={25} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">25</option>
              <option value={50} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg bg-white dark:bg-slate-900 p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg bg-white dark:bg-slate-900 p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 cursor-pointer"
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
