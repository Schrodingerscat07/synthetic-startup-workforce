/* ========== Types ========== */

export type AgentRole = 'ceo' | 'cto' | 'cfo' | 'cmo' | 'coo' | 'worker';
export type AgentStatus = 'provisioning' | 'idle' | 'working' | 'completed' | 'error';

export interface Permission {
  id: string;
  name: string;
  level: 'read' | 'write' | 'execute';
  approved: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  title: string;
  avatar: string;
  status: AgentStatus;
  permissions: Permission[];
  tools: string[];
  reportsTo: string | null;
  description: string;
}

export type CompanyStatus = 'configuring' | 'approved' | 'running' | 'paused' | 'completed';

export interface CompanyState {
  id: string;
  name: string;
  vision: string;
  agents: Agent[];
  status: CompanyStatus;
  createdAt: Date;
}

export type ChatMessageType = 'text' | 'agent-card' | 'transition' | 'system';

export interface ChatMessage {
  id: string;
  role: 'user' | 'orchestrator' | 'system';
  content: string;
  timestamp: Date;
  agentProvisioned?: Agent;
  type: ChatMessageType;
}

export type ChatPhase = 'intro' | 'provisioning-csuite' | 'provisioning-workers' | 'customizing' | 'ready';

export interface ExecutionLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  detail: string;
  timestamp: Date;
  status: 'running' | 'completed' | 'error';
}

export interface ResearchArticle {
  title: string;
  source: string;
  url: string;
  summary: string;
  scrapedAt: Date;
}
