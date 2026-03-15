import type { Agent } from '../types';

export const agentTemplates: Record<string, Agent> = {
  ceo: {
    id: 'agent-ceo',
    name: 'Atlas',
    role: 'ceo',
    title: 'Chief Executive Officer',
    avatar: '👔',
    status: 'idle',
    permissions: [
      { id: 'perm-ceo-1', name: 'Strategic Planning', level: 'execute', approved: false },
      { id: 'perm-ceo-2', name: 'Agent Oversight', level: 'execute', approved: false },
      { id: 'perm-ceo-3', name: 'Budget Approval', level: 'write', approved: false },
    ],
    tools: ['task-delegator', 'report-aggregator'],
    reportsTo: null,
    description: 'Oversees all operations, sets strategic direction, and coordinates the C-Suite team to execute the company vision.',
  },
  cto: {
    id: 'agent-cto',
    name: 'Nova',
    role: 'cto',
    title: 'Chief Technology Officer',
    avatar: '💻',
    status: 'idle',
    permissions: [
      { id: 'perm-cto-1', name: 'Tech Stack Management', level: 'execute', approved: false },
      { id: 'perm-cto-2', name: 'Code Repository Access', level: 'write', approved: false },
      { id: 'perm-cto-3', name: 'API Integration', level: 'execute', approved: false },
    ],
    tools: ['code-analyzer', 'api-connector', 'system-monitor'],
    reportsTo: 'agent-ceo',
    description: 'Manages all technology infrastructure, oversees technical agents, and ensures system reliability and security.',
  },
  cfo: {
    id: 'agent-cfo',
    name: 'Ledger',
    role: 'cfo',
    title: 'Chief Financial Officer',
    avatar: '📊',
    status: 'idle',
    permissions: [
      { id: 'perm-cfo-1', name: 'Financial Reports', level: 'read', approved: false },
      { id: 'perm-cfo-2', name: 'Budget Tracking', level: 'write', approved: false },
      { id: 'perm-cfo-3', name: 'Cost Analysis', level: 'read', approved: false },
    ],
    tools: ['spreadsheet-engine', 'cost-tracker'],
    reportsTo: 'agent-ceo',
    description: 'Tracks operational costs, manages budgets, and provides financial insights to optimize resource allocation.',
  },
  cmo: {
    id: 'agent-cmo',
    name: 'Pulse',
    role: 'cmo',
    title: 'Chief Marketing Officer',
    avatar: '📣',
    status: 'idle',
    permissions: [
      { id: 'perm-cmo-1', name: 'Market Analysis', level: 'read', approved: false },
      { id: 'perm-cmo-2', name: 'Content Creation', level: 'write', approved: false },
      { id: 'perm-cmo-3', name: 'Social Media Access', level: 'write', approved: false },
    ],
    tools: ['content-generator', 'analytics-reader'],
    reportsTo: 'agent-ceo',
    description: 'Drives marketing strategy, analyzes market trends, and coordinates outreach campaigns for lead generation.',
  },
  coo: {
    id: 'agent-coo',
    name: 'Relay',
    role: 'coo',
    title: 'Chief Operations Officer',
    avatar: '⚙️',
    status: 'idle',
    permissions: [
      { id: 'perm-coo-1', name: 'Workflow Management', level: 'execute', approved: false },
      { id: 'perm-coo-2', name: 'Agent Coordination', level: 'execute', approved: false },
      { id: 'perm-coo-3', name: 'Performance Monitoring', level: 'read', approved: false },
    ],
    tools: ['workflow-engine', 'task-scheduler'],
    reportsTo: 'agent-ceo',
    description: 'Manages day-to-day operations, coordinates worker agents, and ensures smooth workflow across all departments.',
  },
  webResearcher: {
    id: 'agent-web-researcher',
    name: 'Seeker',
    role: 'worker',
    title: 'Web Research Specialist',
    avatar: '🔍',
    status: 'idle',
    permissions: [
      { id: 'perm-wr-1', name: 'Web Access', level: 'read', approved: false },
      { id: 'perm-wr-2', name: 'Data Scraping', level: 'execute', approved: false },
      { id: 'perm-wr-3', name: 'Report Writing', level: 'write', approved: false },
    ],
    tools: ['puppeteer-browser', 'web-scraper', 'data-formatter'],
    reportsTo: 'agent-cto',
    description: 'Autonomously scrapes and aggregates industry news, research papers, and market intelligence from the web.',
  },
  emailOutreach: {
    id: 'agent-email-outreach',
    name: 'Herald',
    role: 'worker',
    title: 'Email Outreach Specialist',
    avatar: '✉️',
    status: 'idle',
    permissions: [
      { id: 'perm-eo-1', name: 'Email Compose', level: 'write', approved: false },
      { id: 'perm-eo-2', name: 'Contact Database', level: 'read', approved: false },
      { id: 'perm-eo-3', name: 'Email Send', level: 'execute', approved: false },
    ],
    tools: ['email-client', 'template-engine', 'personalization-engine'],
    reportsTo: 'agent-cmo',
    description: 'Crafts personalized outreach emails and research reports based on intelligence gathered by the Web Researcher.',
  },
};

export const cSuiteOrder: (keyof typeof agentTemplates)[] = ['ceo', 'cto', 'cfo', 'cmo', 'coo'];
export const workerOrder: (keyof typeof agentTemplates)[] = ['webResearcher', 'emailOutreach'];

export function getAgentTemplate(key: string): Agent {
  return { ...agentTemplates[key], permissions: agentTemplates[key].permissions.map(p => ({ ...p })) };
}
