import { create } from 'zustand';
import type { ChatMessage, ChatPhase } from '../types';

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  phase: ChatPhase;
  userHasSubmitted: boolean;
  error: string | null;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  setPhase: (phase: ChatPhase) => void;
  setUserHasSubmitted: (submitted: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  resetForReconfiguration: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isTyping: false,
  phase: 'intro',
  userHasSubmitted: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setTyping: (typing) => set({ isTyping: typing }),
  
  setPhase: (phase) => set({ phase }),
  
  setUserHasSubmitted: (submitted) => set({ userHasSubmitted: submitted }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [], phase: 'intro', userHasSubmitted: false, error: null }),

  resetForReconfiguration: () => 
    set({ phase: 'customizing', userHasSubmitted: false }),
}));
