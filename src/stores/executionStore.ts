import { create } from 'zustand';
import type { ExecutionLog, ResearchArticle } from '../types';

interface ExecutionStore {
  logs: ExecutionLog[];
  articles: ResearchArticle[];
  draftEmail: string;
  isRunning: boolean;
  addLog: (log: ExecutionLog) => void;
  setArticles: (articles: ResearchArticle[]) => void;
  setDraftEmail: (email: string) => void;
  setRunning: (running: boolean) => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  logs: [],
  articles: [],
  draftEmail: '',
  isRunning: false,

  addLog: (log) =>
    set((state) => ({ logs: [...state.logs, log] })),

  setArticles: (articles) => set({ articles }),
  setDraftEmail: (email) => set({ draftEmail: email }),
  setRunning: (running) => set({ isRunning: running }),

  clearExecution: () =>
    set({ logs: [], articles: [], draftEmail: '', isRunning: false }),
}));
