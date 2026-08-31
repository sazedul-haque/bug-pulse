import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Issue } from '../types/issue';
import { useTheme } from '../context/ThemeContext';
import { useAgent } from '../context/AgentContext';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  UserCheck,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

interface AnalyticsViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onFilterCategory?: (category: string) => void;
  onFilterStatus?: (status: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  issues,
  onSelectIssue,
  onFilterCategory,
  onFilterStatus,
}) => {
  const { theme } = useTheme();
  const { isEditor } = useAuth();
  const { resolveAgentName, agentMap, openAgentModal } = useAgent();
  const isDark = theme === 'dark';

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  issues.forEach((i) => {
    statusCounts[i.action] = (statusCounts[i.action] || 0) + 1;
  });

  const doughnutData = {
    labels: ['Done', 'Accepted', 'Request', 'Feature', 'Rejected'],
    datasets: [
      {
        data: [
          statusCounts['Done'] || 0,
          statusCounts['Accepted'] || 0,
          statusCounts['Request'] || 0,
          statusCounts['Feature'] || 0,
          statusCounts['Rejected'] || 0,
        ],
        backgroundColor: [
          '#10b981', // emerald
          '#f59e0b', // amber
          '#0ea5e9', // sky
          '#6366f1', // indigo
          '#94a3b8', // slate
        ],
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  issues.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  const barData = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [
      {
        label: 'Issues Count',
        data: sortedCategories.map(([, count]) => count),
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.85)' : 'rgba(99, 102, 241, 0.75)',
        hoverBackgroundColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(79, 70, 229, 1)',
        borderRadius: 6,
      },
    ],
  };

  // Reporter breakdown
  const reporterCounts: Record<string, number> = {};
  issues.forEach((i) => {
    const reporter = i.createdBy || 'Unknown';
    reporterCounts[reporter] = (reporterCounts[reporter] || 0) + 1;
  });
  const topReporters = Object.entries(reporterCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Critical / High Impact Highlights
  const criticalHighlights = issues
    .filter(
      (i) =>
        i.priority === 'High' &&
        (i.action === 'Accepted' || i.action === 'New' || i.action === 'Request')
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Visualizations Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Distribution */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Workflow Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Resolution state of reported tickets</p>
              </div>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                {issues.length} total
              </span>
            </div>
            <div className="h-60 flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: isDark ? '#94a3b8' : '#475569',
                        font: { size: 11 },
                        padding: 12,
                        boxWidth: 12,
                      },
                    },
                  },
                  cutout: '65%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs lg:col-span-2 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Category Distribution</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Issues clustered by plugin domain & feature area
                </p>
              </div>
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                {sortedCategories.length} Domains
              </span>
            </div>
            <div className="h-64">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.raw} issues`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                      ticks: { color: '#64748b', font: { size: 10 } },
                    },
                    y: {
                      grid: { display: false },
                      ticks: { color: isDark ? '#cbd5e1' : '#334155', font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Critical Attention Queue + Top Support Reporters */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Critical & Accepted Attention Items */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs lg:col-span-2 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">High Priority Action Queue</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Urgent customer-impacting bugs pending fix or verification
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              {criticalHighlights.length} Urgent Items
            </span>
          </div>

          <div className="space-y-2.5">
            {criticalHighlights.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                No high-priority issues currently open! 🎉
              </div>
            ) : (
              criticalHighlights.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-500/40 cursor-pointer transition-all group shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    <span className="mt-1.5 flex h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                        {issue.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                          {issue.category}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{issue.createdTime}</span>
                        {issue.userImpactCount > 0 && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              👥 {issue.userImpactCount} users impacted
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        issue.action === 'Accepted'
                          ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                          : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                      }`}
                    >
                      {issue.action}
                    </span>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Reporters Leaderboard */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Top Reporters</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Slack agents by logged workflow items</p>
              </div>
            </div>

            {isEditor && (
              <button
                onClick={openAgentModal}
                title="Edit Agent Names & Roles"
                className="flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Manage Names</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {topReporters.map(([reporter, count], idx) => {
              const displayName = resolveAgentName(reporter);
              const info = agentMap[reporter];
              const role = info?.role || 'Support Agent';

              return (
                <div
                  key={reporter}
                  onClick={() => {
                    if (isEditor) openAgentModal();
                  }}
                  title={isEditor ? 'Click to edit agent display name' : undefined}
                  className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 transition-colors ${
                    isEditor ? 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/90 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block truncate">
                        {displayName}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono truncate">
                        {role} {displayName !== reporter ? `• ${reporter}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">issues</span>
                  </div>
                </div>
              );
            })}
          </div>

          {isEditor && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p>
                Click <strong>Manage Names</strong> to map your team's Slack IDs to their real display names.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
