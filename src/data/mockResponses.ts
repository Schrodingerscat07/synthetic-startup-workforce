export interface OrchestratorResponse {
  content: string;
  delay: number; // ms before this message appears
  type: 'text' | 'agent-card' | 'transition' | 'system';
  agentKey?: string; // key from agentTemplates
}

export const welcomeMessages: OrchestratorResponse[] = [
  {
    content: "Welcome to **Cerebro AI** 🧠\n\nI'm **The Orchestrator** — your AI chief of staff. I'm here to help you build, staff, and deploy an entire AI-powered company.\n\nTell me about your startup vision, and I'll assemble the perfect team to make it happen.",
    delay: 800,
    type: 'text',
  },
];

export const visionAcknowledgement: OrchestratorResponse[] = [
  {
    content: "Excellent vision! A **B2B Market Research & Lead Generation Agency** — that's a high-value, scalable business model. I'll start assembling your executive team right away.\n\n*Initializing C-Suite provisioning sequence...*",
    delay: 1200,
    type: 'text',
  },
];

export const cSuiteMessages: OrchestratorResponse[] = [
  {
    content: '🚀 **Provisioning Executive Team**',
    delay: 600,
    type: 'system',
  },
  {
    content: 'Deploying your **Chief Executive Officer** to lead the operation...',
    delay: 1000,
    type: 'text',
  },
  {
    content: '',
    delay: 800,
    type: 'agent-card',
    agentKey: 'ceo',
  },
  {
    content: 'Standing up your **Chief Technology Officer** to manage technical infrastructure...',
    delay: 1200,
    type: 'text',
  },
  {
    content: '',
    delay: 800,
    type: 'agent-card',
    agentKey: 'cto',
  },
  {
    content: 'Bringing in your **Chief Financial Officer** for budget oversight...',
    delay: 1000,
    type: 'text',
  },
  {
    content: '',
    delay: 700,
    type: 'agent-card',
    agentKey: 'cfo',
  },
  {
    content: 'Deploying your **Chief Marketing Officer** to drive outreach strategy...',
    delay: 1000,
    type: 'text',
  },
  {
    content: '',
    delay: 700,
    type: 'agent-card',
    agentKey: 'cmo',
  },
  {
    content: 'And finally, your **Chief Operations Officer** to coordinate workflows...',
    delay: 1000,
    type: 'text',
  },
  {
    content: '',
    delay: 800,
    type: 'agent-card',
    agentKey: 'coo',
  },
  {
    content: '✅ **C-Suite fully operational.** Now let me deploy the specialist workers your agency needs...',
    delay: 1200,
    type: 'text',
  },
];

export const workerMessages: OrchestratorResponse[] = [
  {
    content: '🔧 **Provisioning Specialist Workers**',
    delay: 600,
    type: 'system',
  },
  {
    content: 'Your agency needs a **Web Research Specialist** equipped with browser automation to scrape industry intelligence. Deploying now...',
    delay: 1400,
    type: 'text',
  },
  {
    content: '',
    delay: 900,
    type: 'agent-card',
    agentKey: 'webResearcher',
  },
  {
    content: 'And an **Email Outreach Specialist** to draft and send personalized research reports. Deploying...',
    delay: 1200,
    type: 'text',
  },
  {
    content: '',
    delay: 900,
    type: 'agent-card',
    agentKey: 'emailOutreach',
  },
];

export const readyMessage: OrchestratorResponse[] = [
  {
    content: "🎉 **Your AI workforce is assembled!**\n\nYou now have a full team of **7 AI agents** ready to operate your B2B Research Agency. But before they go live, you need to review and approve their organizational hierarchy.\n\nThis is your **Human-in-the-Loop security checkpoint** — review each agent's permissions, tools, and chain of command. Nothing runs without your explicit approval.",
    delay: 1500,
    type: 'transition',
  },
];
