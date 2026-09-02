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
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  ExternalLink,
  Flame,
  UserCheck,
  Users,
  Sparkles,
} from 'lucide-react';
import { Issue } from '../types/issue';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { getChartPalette } from '../utils/themeTokens';
import { getCategoryStyle } from '../utils/categoryColors';
import { getStatusBadgeClass } from '../utils/statusColors';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
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
}) => {
  const { theme, palette } = useTheme();
  const { isEditor } = useAuth();
  const { resolveAgentName, agentMap, openAgentModal } = useAgent();
  const isDark = theme === 'dark';
  const chartTokens = getChartPalette(palette, isDark);

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
        backgroundColor: chartTokens.donutColors,
        borderColor: chartTokens.donutBorder,
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
        backgroundColor: sortedCategories.map(([name]) => getCategoryStyle(name).chartColor),
        hoverBackgroundColor: sortedCategories.map(([name]) => getCategoryStyle(name).chartHoverColor),
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
        <div className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Workflow Status</h3>
                <p className="text-xs text-[var(--text-muted)]">Resolution state of reported tickets</p>
              </div>
              <span className="rounded-md bg-[var(--surface-inner)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)]">
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
                        color: chartTokens.tickColor,
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
        <div className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-xs lg:col-span-2 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Category Distribution</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Issues clustered by plugin domain & feature area
                </p>
              </div>
              <span className="rounded-md bg-[var(--accent-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)] border border-[var(--border)]">
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
                      grid: { color: chartTokens.gridColor },
                      ticks: { color: chartTokens.tickColor, font: { size: 10 } },
                    },
                    y: {
                      grid: { display: false },
                      ticks: { color: chartTokens.tickColor, font: { size: 11 } },
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
        <div className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-xs lg:col-span-2 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">High Priority Action Queue</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Urgent customer-impacting bugs pending fix or verification
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500 border border-rose-500/20">
              {criticalHighlights.length} Urgent Items
            </span>
          </div>

          <div className="space-y-2.5">
            {criticalHighlights.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-muted)]">
                No high-priority issues currently open! 🎉
              </div>
            ) : (
              criticalHighlights.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--surface-inner)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-all group shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    <span className="mt-1.5 flex h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {issue.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[11px] font-semibold rounded-md px-1.5 py-0.5 border ${getCategoryStyle(issue.category).badge}`}>
                          {issue.category}
                        </span>
                        <span className="text-[var(--text-muted)] opacity-40">•</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{issue.createdTime}</span>
                        {issue.userImpactCount > 0 && (
                          <>
                            <span className="text-[var(--text-muted)] opacity-40">•</span>
                            <span className="text-[11px] text-amber-500 font-medium">
                              👥 {issue.userImpactCount} users impacted
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${getStatusBadgeClass(
                        issue.action
                      )}`}
                    >
                      {issue.action}
                    </span>
                    <ExternalLink className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Reporters Leaderboard */}
        <div className="rounded-2xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[var(--accent)]" />
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Reporters</h3>
                <p className="text-xs text-[var(--text-muted)]">Slack agents by logged workflow items</p>
              </div>
            </div>

            {isEditor && (
              <button
                onClick={openAgentModal}
                title="Edit Agent Names & Roles"
                className="flex items-center gap-1 rounded-lg bg-[var(--accent-subtle)] hover:opacity-90 text-[var(--accent)] border border-[var(--border)] px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer"
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
                  className={`flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--border)] transition-colors ${
                    isEditor ? 'hover:bg-[var(--surface-hover)] cursor-pointer group' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-subtle)] text-xs font-bold text-[var(--accent)] border border-[var(--border)] shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] block truncate">
                        {displayName}
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                        {role} {displayName !== reporter ? `• ${reporter}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{count}</span>
                    <span className="text-xs text-[var(--text-muted)]">issues</span>
                  </div>
                </div>
              );
            })}
          </div>

          {isEditor && (
            <div className="mt-4 p-3 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
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
