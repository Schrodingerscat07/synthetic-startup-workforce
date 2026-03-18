/**
 * API Client
 *
 * Centralized client for communicating with the Python backend.
 * All LLM calls, agent execution, and data persistence go through here.
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

// ── Chat API ─────────────────────────────────

export interface ChatApiResponse {
  role: string;
  content: string;
  msg_type: string;
  agent_data: Record<string, unknown> | null;
}

export interface AgentData {
  id: string;
  name: string;
  role: string;
  title: string;
  avatar: string;
  status: string;
  permissions: { id: string; name: string; level: string; approved: boolean }[];
  tools: string[];
  reports_to: string | null;
  description: string;
}

export interface ProvisionApiResponse {
  company_name: string;
  agents: AgentData[];
  narrations: string[];
  ready_message: string;
}

export async function apiWelcome(): Promise<ChatApiResponse> {
  return apiFetch('/chat/welcome', { method: 'POST' });
}

export async function apiProvision(companyId: string, vision: string): Promise<ProvisionApiResponse> {
  return apiFetch('/chat/provision', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId, vision }),
  });
}

export async function apiChatMessage(companyId: string, message: string): Promise<ChatApiResponse> {
  return apiFetch('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId, message }),
  });
}

// ── Company API ──────────────────────────────

export interface CompanyData {
  id: string;
  name: string;
  vision: string;
  status: string;
  agents: AgentData[];
}

export async function apiGetCompany(companyId: string): Promise<CompanyData> {
  return apiFetch(`/company/${companyId}`);
}

export async function apiApproveCompany(companyId: string, agents: AgentData[]): Promise<void> {
  await apiFetch('/company/approve', {
    method: 'PUT',
    body: JSON.stringify({ company_id: companyId, agents }),
  });
}

// ── Execution API ────────────────────────────

export async function apiStartExecution(companyId: string): Promise<void> {
  await apiFetch('/execute/start', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId }),
  });
}

export interface ExecutionLogData {
  agent_id: string;
  agent_name: string;
  action: string;
  detail: string;
  status: string;
  timestamp?: string;
}

export interface ExecutionCompleteData {
  status: string;
  articles: {
    title: string;
    source: string;
    url: string;
    summary: string;
    scrapedAt?: string;
  }[];
  draft_email: string;
}

export type SSEMessage =
  | { type: 'log'; data: ExecutionLogData }
  | { type: 'complete'; data: ExecutionCompleteData }
  | { type: 'waiting'; message: string };

/**
 * Connect to the SSE execution stream.
 * Calls onMessage for each event.
 * Returns a cleanup function.
 */
export function streamExecution(
  companyId: string,
  onMessage: (msg: SSEMessage) => void,
  onError?: (error: Error) => void,
): () => void {
  const eventSource = new EventSource(`${API_BASE}/execute/stream/${companyId}`);

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as SSEMessage;
      onMessage(parsed);

      if (parsed.type === 'complete') {
        eventSource.close();
      }
    } catch (e) {
      console.error('SSE parse error:', e);
    }
  };

  eventSource.onerror = () => {
    onError?.(new Error('SSE connection error'));
    eventSource.close();
  };

  return () => eventSource.close();
}

export interface ExecutionResults {
  status: string;
  articles: { title: string; source: string; url: string; summary: string }[];
  draft_email: string;
}

export async function apiGetResults(companyId: string): Promise<ExecutionResults> {
  return apiFetch(`/execute/results/${companyId}`);
}
