import { create } from 'zustand';
import type { Agent, CompanyStatus } from '../types';

interface CompanyStore {
  companyName: string;
  companyVision: string;
  agents: Agent[];
  status: CompanyStatus;
  setCompanyName: (name: string) => void;
  setCompanyVision: (vision: string) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  setStatus: (status: CompanyStatus) => void;
  setAgents: (agents: Agent[]) => void;
  resetCompany: () => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  companyName: '',
  companyVision: '',
  agents: [],
  status: 'configuring',

  setCompanyName: (name) => set({ companyName: name }),
  setCompanyVision: (vision) => set({ companyVision: vision }),
  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
    })),

  setStatus: (status) => set({ status }),

  resetCompany: () =>
    set({ companyName: '', companyVision: '', agents: [], status: 'configuring' }),
}));
