/**
 * LLM-Powered Orchestrator Service
 *
 * Replaces the hardcoded scripted responses with real Gemini-powered conversation.
 * The orchestrator understands the user's actual startup vision and dynamically
 * provisions relevant agents.
 */

import { useChatStore } from '../stores/chatStore';
import { useCompanyStore } from '../stores/companyStore';
import { generateTextStream, generateJSON } from './gemini';
import { getAgentTemplate } from '../data/agents';
import type { ChatMessage, Agent } from '../types';

let messageCounter = 0;

function generateId(): string {
  return `msg-${Date.now()}-${messageCounter++}`;
}

// ──────────────────────────────────────────────
// System Prompts
// ──────────────────────────────────────────────

const ORCHESTRATOR_SYSTEM_PROMPT = `You are "The Orchestrator" — the AI chief-of-staff for Cerebro AI, a platform that assembles AI agent workforces for entrepreneurs.

Your personality:
- Professional yet warm and encouraging
- Confidently knowledgeable about AI agents and business operations
- You use bold markdown for emphasis and occasional emojis for key moments
- Keep responses concise (2-4 sentences max per message)

Your current task: Welcome the user and understand their startup vision.

IMPORTANT RULES:
- Do NOT list agents or propose a team in this response
- Simply acknowledge their vision with genuine enthusiasm
- Mention that you'll now assemble their AI workforce
- End by saying you're starting the provisioning sequence
- Use markdown formatting (bold, italic) for emphasis`;

const AGENT_PROVISIONER_PROMPT = `You are an AI team architect. Given a startup vision, you must decide which AI agents to provision for this company.

You MUST return a JSON object with this exact structure:
{
  "companyName": "A short, catchy company name based on the vision",
  "analysis": "One sentence explaining why you chose these agents",
  "agents": ["ceo", "cto", "cfo", "cmo", "coo", "webResearcher", "emailOutreach"]
}

Rules:
- ALWAYS include "ceo" — every company needs a CEO
- ALWAYS include at least 4 agents
- Available agent keys: "ceo", "cto", "cfo", "cmo", "coo", "webResearcher", "emailOutreach"
- Only use keys from the list above, no custom agents
- For a research/lead-gen business, include webResearcher and emailOutreach
- For a tech-focused business, include cto
- For a marketing-focused business, include cmo and emailOutreach
- Order them logically: executives first, then workers`;

const PROVISION_NARRATION_PROMPT = `You are "The Orchestrator" narrating the deployment of an AI agent.

You receive the agent's name, title, role, and description. Write a SHORT (1 sentence) exciting deployment message.

Rules:
- Use bold markdown for the agent's title
- Sound professional and confident
- Keep it under 30 words
- Don't use emojis except occasionally
- Vary your phrasing — don't start every message the same way`;

const READY_MESSAGE_PROMPT = `You are "The Orchestrator" for Cerebro AI. The full AI workforce has just been assembled.

Write a short celebration message (3-4 sentences) that:
- Celebrates the team being ready (use 🎉 emoji once)
- Mentions the total number of agents: {agentCount}
- Tells the user they must review the org chart (the Human-in-the-Loop security checkpoint)
- Emphasizes that nothing runs without their explicit approval
- Uses bold markdown for emphasis`;

const RECONFIGURATION_PROMPT = `You are "The Orchestrator" for Cerebro AI. The user wants changes to their AI agent team.

Respond briefly (1-2 sentences) acknowledging their feedback and confirming you've updated the team. Sound helpful and cooperative. Use markdown bold for emphasis.`;

// ──────────────────────────────────────────────
// Helper: add a message to the store
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export async function initializeChat(): Promise<void> {
  const chatStore = useChatStore.getState();
  chatStore.setTyping(true);

  try {
    let welcomeText = '';
    await generateTextStream(
      ORCHESTRATOR_SYSTEM_PROMPT,
      'The user just opened Cerebro AI for the first time. Write a welcome message introducing yourself and asking them to describe their startup vision.',
      (_chunk, accumulated) => {
        welcomeText = accumulated;
      },
    );

    chatStore.setTyping(false);
    addOrchestratorMessage(welcomeText);
  } catch (error) {
    chatStore.setTyping(false);
    console.error('Orchestrator init error:', error);
    // Fallback message if Gemini is unavailable
    addOrchestratorMessage(
      "Welcome to **Cerebro AI** 🧠\n\nI'm **The Orchestrator** — your AI chief of staff. I'm here to help you build, staff, and deploy an entire AI-powered company.\n\nTell me about your startup vision, and I'll assemble the perfect team to make it happen."
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

  // 2. Generate vision acknowledgement via LLM
  chatStore.setTyping(true);
  try {
    let ackText = '';
    await generateTextStream(
      ORCHESTRATOR_SYSTEM_PROMPT,
      `The user just described their startup vision: "${userInput}"\n\nAcknowledge their vision with genuine enthusiasm. Mention you'll now assemble their AI workforce. Keep it to 2-3 sentences.`,
      (_chunk, accumulated) => {
        ackText = accumulated;
      },
    );
    chatStore.setTyping(false);
    addOrchestratorMessage(ackText);
  } catch {
    chatStore.setTyping(false);
    addOrchestratorMessage(
      `Excellent vision! I can see the potential here. Let me assemble the perfect AI workforce to bring this to life.\n\n*Initializing provisioning sequence...*`
    );
  }

  await delay(600);

  // 3. Use LLM to decide which agents to provision
  let agentKeys: string[] = ['ceo', 'cto', 'cfo', 'cmo', 'coo', 'webResearcher', 'emailOutreach'];
  let companyName = 'AI Startup';

  try {
    const result = await generateJSON<{
      companyName: string;
      analysis: string;
      agents: string[];
    }>(
      AGENT_PROVISIONER_PROMPT,
      `Startup vision: "${userInput}"`,
    );

    if (result.agents && result.agents.length >= 4) {
      agentKeys = result.agents;
    }
    if (result.companyName) {
      companyName = result.companyName;
    }
  } catch {
    // Fallback to defaults
  }

  companyStore.setCompanyVision(userInput);
  companyStore.setCompanyName(companyName);

  // 4. Separate executives from workers
  const executiveKeys = agentKeys.filter(k => ['ceo', 'cto', 'cfo', 'cmo', 'coo'].includes(k));
  const workerKeys = agentKeys.filter(k => !['ceo', 'cto', 'cfo', 'cmo', 'coo'].includes(k));

  // 5. Provision C-Suite
  chatStore.setPhase('provisioning-csuite');
  addSystemMessage('🚀 **Provisioning Executive Team**');
  await delay(500);

  for (const key of executiveKeys) {
    const agent = getAgentTemplate(key);
    if (!agent) continue;

    // Generate narration via LLM
    chatStore.setTyping(true);
    try {
      let narration = '';
      await generateTextStream(
        PROVISION_NARRATION_PROMPT,
        `Agent being deployed: ${agent.name} — ${agent.title}. Description: ${agent.description}`,
        (_chunk, accumulated) => {
          narration = accumulated;
        },
      );
      chatStore.setTyping(false);
      addOrchestratorMessage(narration);
    } catch {
      chatStore.setTyping(false);
      addOrchestratorMessage(`Deploying your **${agent.title}**...`);
    }

    await delay(400);

    // Add the agent card
    companyStore.addAgent(agent);
    addOrchestratorMessage('', 'agent-card', agent);
    await delay(300);
  }

  // 6. Provision Workers
  if (workerKeys.length > 0) {
    chatStore.setPhase('provisioning-workers');
    addSystemMessage('🔧 **Provisioning Specialist Workers**');
    await delay(500);

    for (const key of workerKeys) {
      const agent = getAgentTemplate(key);
      if (!agent) continue;

      chatStore.setTyping(true);
      try {
        let narration = '';
        await generateTextStream(
          PROVISION_NARRATION_PROMPT,
          `Worker being deployed: ${agent.name} — ${agent.title}. Description: ${agent.description}. This agent has specialized tools: ${agent.tools.join(', ')}`,
          (_chunk, accumulated) => {
            narration = accumulated;
          },
        );
        chatStore.setTyping(false);
        addOrchestratorMessage(narration);
      } catch {
        chatStore.setTyping(false);
        addOrchestratorMessage(`Deploying your **${agent.title}**...`);
      }

      await delay(400);
      companyStore.addAgent(agent);
      addOrchestratorMessage('', 'agent-card', agent);
      await delay(300);
    }
  }

  // 7. Ready message
  chatStore.setPhase('ready');
  chatStore.setTyping(true);
  const totalAgents = useCompanyStore.getState().agents.length;

  try {
    let readyText = '';
    await generateTextStream(
      READY_MESSAGE_PROMPT.replace('{agentCount}', String(totalAgents)),
      `The workforce of ${totalAgents} agents has been assembled for a company called "${companyName}". Write the celebration message.`,
      (_chunk, accumulated) => {
        readyText = accumulated;
      },
    );
    chatStore.setTyping(false);
    addOrchestratorMessage(readyText, 'transition');
  } catch {
    chatStore.setTyping(false);
    addOrchestratorMessage(
      `🎉 **Your AI workforce is assembled!**\n\nYou now have a full team of **${totalAgents} AI agents** ready to operate ${companyName}. But before they go live, you need to review and approve their organizational hierarchy.\n\nThis is your **Human-in-the-Loop security checkpoint** — nothing runs without your explicit approval.`,
      'transition'
    );
  }
}

export async function processReconfiguration(userInput: string): Promise<void> {
  const chatStore = useChatStore.getState();

  // Add user message
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
    let responseText = '';
    await generateTextStream(
      RECONFIGURATION_PROMPT,
      `The user says: "${userInput}"`,
      (_chunk, accumulated) => {
        responseText = accumulated;
      },
    );
    chatStore.setTyping(false);
    addOrchestratorMessage(responseText);
  } catch {
    chatStore.setTyping(false);
    addOrchestratorMessage(
      "Understood. I've updated the agents' permissions and toolsets based on your feedback. Please review the team again."
    );
  }

  await delay(500);
  chatStore.setPhase('ready');
}
