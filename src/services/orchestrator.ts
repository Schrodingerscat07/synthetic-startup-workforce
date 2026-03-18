/**
 * Orchestrator Service — Backend-Connected
 *
 * All LLM calls now go through the Python backend API.
 * No more direct Gemini SDK calls from the frontend.
 */

import { useChatStore } from '../stores/chatStore';
import { useCompanyStore } from '../stores/companyStore';
import { apiWelcome, apiProvision, apiChatMessage } from './api';
import type { ChatMessage, Agent } from '../types';

let messageCounter = 0;
const COMPANY_ID = 'default-company'; // Single-company mode for now

function generateId(): string {
  return `msg-${Date.now()}-${messageCounter++}`;
}

function addOrchestratorMessage(content: string, type: ChatMessage['type'] = 'text', agent?: Agent) {
  useChatStore.getState().addMessage({
    id: generateId(),
    role: 'orchestrator',
    content,
    timestamp: new Date(),
    type,
    agentProvisioned: agent,
  });
}

function addSystemMessage(content: string) {
  useChatStore.getState().addMessage({
    id: generateId(),
    role: 'system',
    content,
    timestamp: new Date(),
    type: 'system',
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Convert backend agent data to frontend Agent type */
function toFrontendAgent(a: {
  id: string; name: string; role: string; title: string; avatar: string;
  status: string; permissions: { id: string; name: string; level: string; approved: boolean }[];
  tools: string[]; reports_to: string | null; description: string;
}): Agent {
  return {
    id: a.id,
    name: a.name,
    role: a.role as Agent['role'],
    title: a.title,
    avatar: a.avatar,
    status: a.status as Agent['status'],
    permissions: a.permissions.map(p => ({
      id: p.id,
      name: p.name,
      level: p.level as 'read' | 'write' | 'execute',
      approved: p.approved,
    })),
    tools: a.tools,
    reportsTo: a.reports_to,
    description: a.description,
  };
}

export function getCompanyId(): string {
  return COMPANY_ID;
}

export async function initializeChat(): Promise<void> {
  const chatStore = useChatStore.getState();
  chatStore.setTyping(true);

  try {
    const response = await apiWelcome();
    chatStore.setTyping(false);
    addOrchestratorMessage(response.content);
  } catch (error) {
    chatStore.setTyping(false);
    console.error('Welcome error:', error);
    chatStore.setError('Failed to connect to backend. Is the server running?');
    addOrchestratorMessage(
      "Welcome to **Cerebro AI** 🧠\n\nI'm **The Orchestrator** — your AI chief of staff. Tell me about your startup vision, and I'll assemble the perfect team.\n\n⚠️ *Note: Backend connection failed. Please ensure the server is running.*"
    );
  }
}

export async function processUserVision(userInput: string): Promise<void> {
  const chatStore = useChatStore.getState();
  const companyStore = useCompanyStore.getState();

  // 1. Add user message
  chatStore.addMessage({
    id: generateId(),
    role: 'user',
    content: userInput,
    timestamp: new Date(),
    type: 'text',
  });
  chatStore.setUserHasSubmitted(true);
  chatStore.setTyping(true);

  try {
    // 2. Call backend provision endpoint (does all LLM work server-side)
    const result = await apiProvision(COMPANY_ID, userInput);

    chatStore.setTyping(false);

    // 3. Display vision acknowledgement (first narration)
    addOrchestratorMessage(result.narrations[0]);
    await delay(400);

    // 4. Set company info
    companyStore.setCompanyVision(userInput);
    companyStore.setCompanyName(result.company_name);

    // 5. Provision C-Suite
    chatStore.setPhase('provisioning-csuite');
    addSystemMessage('🚀 **Provisioning Executive Team**');
    await delay(400);

    const executives = result.agents.filter(a =>
      ['ceo', 'cto', 'cfo', 'cmo', 'coo'].includes(a.role)
    );
    const workers = result.agents.filter(a =>
      !['ceo', 'cto', 'cfo', 'cmo', 'coo'].includes(a.role)
    );

    // Narrations start at index 1 (index 0 is vision ack)
    let narrationIdx = 1;

    for (const agentData of executives) {
      const agent = toFrontendAgent(agentData);
      if (result.narrations[narrationIdx]) {
        addOrchestratorMessage(result.narrations[narrationIdx]);
      }
      narrationIdx++;
      await delay(300);
      companyStore.addAgent(agent);
      addOrchestratorMessage('', 'agent-card', agent);
      await delay(200);
    }

    // 6. Provision Workers
    if (workers.length > 0) {
      chatStore.setPhase('provisioning-workers');
      addSystemMessage('🔧 **Provisioning Specialist Workers**');
      await delay(400);

      for (const agentData of workers) {
        const agent = toFrontendAgent(agentData);
        if (result.narrations[narrationIdx]) {
          addOrchestratorMessage(result.narrations[narrationIdx]);
        }
        narrationIdx++;
        await delay(300);
        companyStore.addAgent(agent);
        addOrchestratorMessage('', 'agent-card', agent);
        await delay(200);
      }
    }

    // 7. Ready message
    chatStore.setPhase('ready');
    await delay(300);
    addOrchestratorMessage(result.ready_message, 'transition');

  } catch (error) {
    chatStore.setTyping(false);
    console.error('Provision error:', error);
    chatStore.setError('Failed to provision agents. Check backend connection.');
    addOrchestratorMessage(
      '❌ **Error**: Could not connect to the backend server. Please ensure it\'s running:\n\n```\ncd backend && uvicorn app.main:app --reload\n```'
    );
  }
}

export async function processReconfiguration(userInput: string): Promise<void> {
  const chatStore = useChatStore.getState();

  chatStore.addMessage({
    id: generateId(),
    role: 'user',
    content: userInput,
    timestamp: new Date(),
    type: 'text',
  });
  chatStore.setUserHasSubmitted(true);
  chatStore.setTyping(true);

  try {
    const response = await apiChatMessage(COMPANY_ID, userInput);
    chatStore.setTyping(false);
    addOrchestratorMessage(response.content);
  } catch {
    chatStore.setTyping(false);
    addOrchestratorMessage("Understood. I've updated the team based on your feedback. Please review again.");
  }

  await delay(500);
  chatStore.setPhase('ready');
}
