import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AgentInfo {
  name: string;
  role?: string;
}

export type AgentMappingRecord = Record<string, AgentInfo>;

interface AgentContextType {
  agentMap: AgentMappingRecord;
  resolveAgentName: (slackId: string) => string;
  setAgentName: (slackId: string, name: string, role?: string) => void;
  saveAgentMappings: (mappings: AgentMappingRecord) => void;
  isAgentModalOpen: boolean;
  openAgentModal: () => void;
  closeAgentModal: () => void;
  getAgentAvatarBg: (slackIdOrName: string) => string;
}

const STORAGE_AGENT_MAP_KEY = 'bugpulse_slack_agent_mappings_v1';

// Initial sensible default placeholders for the top IDs
const DEFAULT_MAPPINGS: AgentMappingRecord = {
  U07ACRUL5N1: { name: 'Support Lead (U07ACRUL5N1)', role: 'Senior Support' },
  U07AFKF2R19: { name: 'Triage Specialist (U07AFKF2R19)', role: 'Support Agent' },
  U07B4GNP7RN: { name: 'Technical Support (U07B4GNP7RN)', role: 'Support Agent' },
  U029V6VAVSP: { name: 'QA Engineer (U029V6VAVSP)', role: 'QA & Triage' },
  U07AFNXBB98: { name: 'Support Agent (U07AFNXBB98)', role: 'Support Agent' },
  U07A949N6VC: { name: 'Customer Success (U07A949N6VC)', role: 'Support' },
  U02E6EEM2KW: { name: 'Support Rep (U02E6EEM2KW)', role: 'Support' },
  UP0RS7KFC: { name: 'Developer (UP0RS7KFC)', role: 'Core Dev' },
  U018QTESVGC: { name: 'Product Lead (U018QTESVGC)', role: 'Product Manager' },
};

const AVATAR_COLORS = [
  'bg-indigo-500 text-white',
  'bg-purple-500 text-white',
  'bg-pink-500 text-white',
  'bg-emerald-500 text-white',
  'bg-teal-500 text-white',
  'bg-sky-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
];

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentMap, setAgentMap] = useState<AgentMappingRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AGENT_MAP_KEY);
      if (saved) {
        return { ...DEFAULT_MAPPINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load agent mappings from localStorage', e);
    }
    return DEFAULT_MAPPINGS;
  });

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  const saveAgentMappings = (newMappings: AgentMappingRecord) => {
    setAgentMap(newMappings);
    localStorage.setItem(STORAGE_AGENT_MAP_KEY, JSON.stringify(newMappings));
  };

  const setAgentName = (slackId: string, name: string, role?: string) => {
    const updated = {
      ...agentMap,
      [slackId]: {
        name: name.trim(),
        role: role || agentMap[slackId]?.role || 'Support Agent',
      },
    };
    saveAgentMappings(updated);
  };

  const resolveAgentName = (slackId: string): string => {
    if (!slackId) return 'Unassigned';
    const trimmed = slackId.trim();
    if (agentMap[trimmed]?.name) {
      return agentMap[trimmed].name;
    }
    return trimmed;
  };

  const getAgentAvatarBg = (slackIdOrName: string): string => {
    let hash = 0;
    for (let i = 0; i < slackIdOrName.length; i++) {
      hash = slackIdOrName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const openAgentModal = () => setIsAgentModalOpen(true);
  const closeAgentModal = () => setIsAgentModalOpen(false);

  return (
    <AgentContext.Provider
      value={{
        agentMap,
        resolveAgentName,
        setAgentName,
        saveAgentMappings,
        isAgentModalOpen,
        openAgentModal,
        closeAgentModal,
        getAgentAvatarBg,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
