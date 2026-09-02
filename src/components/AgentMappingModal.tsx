import React, { useState, useEffect } from 'react';
import { useAgent, AgentMappingRecord } from '../context/AgentContext';
import { Issue } from '../types/issue';
import {
  Users,
  X,
  CheckCircle2,
  Sparkles,
  Save,
  Search,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

interface AgentMappingModalProps {
  issues: Issue[];
}

export const AgentMappingModal: React.FC<AgentMappingModalProps> = ({ issues }) => {
  const {
    agentMap,
    saveAgentMappings,
    isAgentModalOpen,
    closeAgentModal,
    getAgentAvatarBg,
  } = useAgent();

  const [localMap, setLocalMap] = useState<AgentMappingRecord>(agentMap);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute unique agents and their issue counts
  const agentStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    issues.forEach((i) => {
      const by = i.createdBy || 'Unknown';
      counts[by] = (counts[by] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        id,
        count,
        currentName: localMap[id]?.name || '',
        currentRole: localMap[id]?.role || 'Support Agent',
      }));
  }, [issues, localMap]);

  useEffect(() => {
    if (isAgentModalOpen) {
      setLocalMap(agentMap);
      setSavedSuccess(false);
    }
  }, [isAgentModalOpen, agentMap]);

  // Close on Escape (must be before early return)
  useEffect(() => {
    if (!isAgentModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAgentModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAgentModalOpen, closeAgentModal]);

  if (!isAgentModalOpen) return null;

  const handleNameChange = (id: string, newName: string) => {
    setLocalMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        name: newName,
        role: prev[id]?.role || 'Support Agent',
      },
    }));
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setLocalMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        name: prev[id]?.name || id,
        role: newRole,
      },
    }));
  };

  const handleSave = () => {
    saveAgentMappings(localMap);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeAgentModal();
    }, 1200);
  };

  const filteredStats = agentStats.filter(
    (a) =>
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.currentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.currentRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      onClick={closeAgentModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-[#050d1f]/85 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#061220] border border-sky-200 dark:border-[#152a4a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors cursor-default"
      >
        {/* Header */}
        <div className="border-b border-sky-200 dark:border-[#152a4a] p-5 bg-sky-50/80 dark:bg-[#050d1f]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-600/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-sky-900 dark:text-sky-50">
                Slack Team & Agent Names
              </h3>
              <p className="text-xs text-sky-500/80 dark:text-[#4a6a8a]">
                Map raw Slack user IDs to team member display names & roles
              </p>
            </div>
          </div>

          <button
            onClick={closeAgentModal}
            className="rounded-lg p-1.5 text-slate-400 hover:text-sky-700 dark:hover:text-sky-50 hover:bg-sky-100 dark:hover:bg-[#0f2040] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="border-b border-sky-200 dark:border-[#152a4a] px-6 py-3 bg-sky-50/40 dark:bg-[#050d1f]/30 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Slack ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-[#050d1f] pl-8 pr-3 py-1.5 text-xs text-sky-800 dark:text-sky-100 placeholder-slate-400 border border-sky-200 dark:border-[#152a4a] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {agentStats.length} Unique Agents
          </span>
        </div>

        {/* Body / Agent List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Agent names and roles updated successfully across all views!</span>
            </div>
          )}

          <div className="space-y-2.5">
            {filteredStats.map((agent) => {
              const displayName = localMap[agent.id]?.name || '';
              const avatarBg = getAgentAvatarBg(displayName || agent.id);
              const initials = displayName
                ? displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : agent.id.slice(0, 2);

              return (
                <div
                  key={agent.id}
                  className="p-3.5 rounded-xl bg-sky-50 dark:bg-[#050d1f]/70 border border-sky-200 dark:border-[#152a4a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  {/* Left: Avatar & ID */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${avatarBg} shrink-0`}
                    >
                      {initials}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-sky-900 dark:text-sky-50 block">
                        {agent.id}
                      </span>
                      <span className="text-[11px] text-sky-500/80 dark:text-[#4a6a8a]">
                        {agent.count} issues logged
                      </span>
                    </div>
                  </div>

                  {/* Right: Inputs */}
                  <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Real Name (e.g. Sazedul Haque)"
                        value={localMap[agent.id]?.name || ''}
                        onChange={(e) => handleNameChange(agent.id, e.target.value)}
                        className="w-full rounded-lg bg-white dark:bg-[#061220] px-3 py-1.5 text-xs text-sky-900 dark:text-sky-50 border border-sky-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div className="w-36">
                      <input
                        type="text"
                        placeholder="Role / Title"
                        value={localMap[agent.id]?.role || ''}
                        onChange={(e) => handleRoleChange(agent.id, e.target.value)}
                        className="w-full rounded-lg bg-white dark:bg-[#061220] px-2.5 py-1.5 text-xs text-sky-700 dark:text-sky-200 border border-sky-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-sky-200 dark:border-[#152a4a] p-4 bg-sky-50/90 dark:bg-[#050d1f]/70 flex items-center justify-between">
          <p className="text-[11px] text-sky-500/80 dark:text-[#4a6a8a]">
            Names will instantly update on Leaderboards, Data Grid, Kanban, and Drawers.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={closeAgentModal}
              className="rounded-xl px-4 py-2 text-xs font-medium text-sky-600 dark:text-sky-200 hover:bg-slate-200 dark:hover:bg-[#0f2040] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-purple-500 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
