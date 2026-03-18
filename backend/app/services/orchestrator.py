"""
Cerebro AI — Orchestrator Service

Handles chat conversation and agent provisioning using Gemini.
"""

import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from ..config import settings

# ── Agent Templates ────────────────────────────

AGENT_TEMPLATES = {
    "ceo": {
        "id": "agent-ceo", "name": "Atlas", "role": "ceo",
        "title": "Chief Executive Officer", "avatar": "👔", "status": "idle",
        "permissions": [
            {"id": "perm-ceo-1", "name": "Strategic Planning", "level": "execute", "approved": False},
            {"id": "perm-ceo-2", "name": "Agent Oversight", "level": "execute", "approved": False},
            {"id": "perm-ceo-3", "name": "Budget Approval", "level": "write", "approved": False},
        ],
        "tools": ["task-delegator", "report-aggregator"],
        "reports_to": None,
        "description": "Oversees all operations, sets strategic direction, and coordinates the C-Suite team.",
    },
    "cto": {
        "id": "agent-cto", "name": "Nova", "role": "cto",
        "title": "Chief Technology Officer", "avatar": "💻", "status": "idle",
        "permissions": [
            {"id": "perm-cto-1", "name": "Tech Stack Management", "level": "execute", "approved": False},
            {"id": "perm-cto-2", "name": "Code Repository Access", "level": "write", "approved": False},
            {"id": "perm-cto-3", "name": "API Integration", "level": "execute", "approved": False},
        ],
        "tools": ["code-analyzer", "api-connector", "system-monitor"],
        "reports_to": "agent-ceo",
        "description": "Manages all technology infrastructure and oversees technical agents.",
    },
    "cfo": {
        "id": "agent-cfo", "name": "Ledger", "role": "cfo",
        "title": "Chief Financial Officer", "avatar": "📊", "status": "idle",
        "permissions": [
            {"id": "perm-cfo-1", "name": "Financial Reports", "level": "read", "approved": False},
            {"id": "perm-cfo-2", "name": "Budget Tracking", "level": "write", "approved": False},
            {"id": "perm-cfo-3", "name": "Cost Analysis", "level": "read", "approved": False},
        ],
        "tools": ["spreadsheet-engine", "cost-tracker"],
        "reports_to": "agent-ceo",
        "description": "Tracks operational costs and provides financial insights.",
    },
    "cmo": {
        "id": "agent-cmo", "name": "Pulse", "role": "cmo",
        "title": "Chief Marketing Officer", "avatar": "📣", "status": "idle",
        "permissions": [
            {"id": "perm-cmo-1", "name": "Market Analysis", "level": "read", "approved": False},
            {"id": "perm-cmo-2", "name": "Content Creation", "level": "write", "approved": False},
            {"id": "perm-cmo-3", "name": "Social Media Access", "level": "write", "approved": False},
        ],
        "tools": ["content-generator", "analytics-reader"],
        "reports_to": "agent-ceo",
        "description": "Drives marketing strategy and coordinates outreach campaigns.",
    },
    "coo": {
        "id": "agent-coo", "name": "Relay", "role": "coo",
        "title": "Chief Operations Officer", "avatar": "⚙️", "status": "idle",
        "permissions": [
            {"id": "perm-coo-1", "name": "Workflow Management", "level": "execute", "approved": False},
            {"id": "perm-coo-2", "name": "Agent Coordination", "level": "execute", "approved": False},
            {"id": "perm-coo-3", "name": "Performance Monitoring", "level": "read", "approved": False},
        ],
        "tools": ["workflow-engine", "task-scheduler"],
        "reports_to": "agent-ceo",
        "description": "Manages day-to-day operations and coordinates worker agents.",
    },
    "webResearcher": {
        "id": "agent-web-researcher", "name": "Seeker", "role": "worker",
        "title": "Web Research Specialist", "avatar": "🔍", "status": "idle",
        "permissions": [
            {"id": "perm-wr-1", "name": "Web Access", "level": "read", "approved": False},
            {"id": "perm-wr-2", "name": "Data Scraping", "level": "execute", "approved": False},
            {"id": "perm-wr-3", "name": "Report Writing", "level": "write", "approved": False},
        ],
        "tools": ["google-search", "web-scraper", "content-summarizer"],
        "reports_to": "agent-cto",
        "description": "Searches Google, scrapes web pages, and summarizes content using AI.",
    },
    "emailOutreach": {
        "id": "agent-email-outreach", "name": "Herald", "role": "worker",
        "title": "Email Outreach Specialist", "avatar": "✉️", "status": "idle",
        "permissions": [
            {"id": "perm-eo-1", "name": "Email Compose", "level": "write", "approved": False},
            {"id": "perm-eo-2", "name": "Contact Database", "level": "read", "approved": False},
            {"id": "perm-eo-3", "name": "Email Send", "level": "execute", "approved": False},
        ],
        "tools": ["email-composer", "template-engine", "personalization-engine"],
        "reports_to": "agent-cmo",
        "description": "Crafts personalized outreach emails based on research intelligence.",
    },
}


def get_llm():
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.8,
    )


# ── Chat ──────────────────────────────────────

SYSTEM_PROMPT = """You are "The Orchestrator" — the AI chief-of-staff for Cerebro AI, a platform that assembles AI agent workforces.

Personality: Professional, warm, encouraging. Use bold markdown and occasional emojis. Keep responses concise (2-4 sentences)."""


def generate_welcome() -> str:
    """Generate a dynamic welcome message."""
    try:
        llm = get_llm()
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content="Write a welcome message introducing yourself and asking the user to describe their startup vision."),
        ]
        return llm.invoke(messages).content
    except Exception:
        return (
            "Welcome to **Cerebro AI** 🧠\n\n"
            "I'm **The Orchestrator** — your AI chief of staff. "
            "Tell me about your startup vision, and I'll assemble the perfect team."
        )


def generate_vision_ack(vision: str) -> str:
    """Acknowledge the user's vision."""
    try:
        llm = get_llm()
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f'The user described their vision: "{vision}"\nAcknowledge it enthusiastically in 2-3 sentences. Mention you\'ll now assemble their AI workforce.'),
        ]
        return llm.invoke(messages).content
    except Exception:
        return "Excellent vision! I can see the potential. Let me assemble the perfect AI workforce.\n\n*Initializing provisioning sequence...*"


def generate_agent_narration(agent: dict) -> str:
    """Generate a unique deployment narration for an agent."""
    try:
        llm = get_llm()
        messages = [
            SystemMessage(content="Write a 1-sentence exciting deployment message for an AI agent. Use bold markdown for the agent's title. Under 30 words. Vary phrasing."),
            HumanMessage(content=f"Agent: {agent['name']} — {agent['title']}. Description: {agent['description']}"),
        ]
        return llm.invoke(messages).content
    except Exception:
        return f"Deploying your **{agent['title']}**..."


def generate_ready_message(num_agents: int, company_name: str) -> str:
    """Generate the celebration message when all agents are provisioned."""
    try:
        llm = get_llm()
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f"The team of {num_agents} agents for '{company_name}' is assembled. Write a 3-sentence celebration. Use 🎉. Mention HITL security checkpoint. Emphasize nothing runs without explicit approval."),
        ]
        return llm.invoke(messages).content
    except Exception:
        return (
            f"🎉 **Your AI workforce is assembled!**\n\n"
            f"You now have **{num_agents} AI agents** ready for {company_name}. "
            f"Review the org chart — nothing runs without your approval."
        )


# ── Agent Provisioning ────────────────────────

PROVISIONER_PROMPT = """You are an AI team architect. Given a startup vision, decide which agents to provision.

Return JSON:
{"companyName": "short catchy name", "agents": ["ceo", "cto", "cfo", "cmo", "coo", "webResearcher", "emailOutreach"]}

Rules:
- ALWAYS include "ceo"
- Include at least 4 agents
- Only use keys: ceo, cto, cfo, cmo, coo, webResearcher, emailOutreach
- For research/lead-gen include webResearcher and emailOutreach"""


def provision_agents(vision: str) -> tuple[str, list[dict]]:
    """
    Use LLM to decide which agents to provision based on the vision.
    Returns (company_name, list_of_agent_dicts).
    """
    agent_keys = ["ceo", "cto", "cfo", "cmo", "coo", "webResearcher", "emailOutreach"]
    company_name = "AI Startup"

    try:
        llm = get_llm()
        messages = [
            SystemMessage(content=PROVISIONER_PROMPT),
            HumanMessage(content=f'Startup vision: "{vision}"'),
        ]
        response = llm.invoke(messages).content

        # Parse JSON
        text = response
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]

        result = json.loads(text.strip())
        if result.get("agents") and len(result["agents"]) >= 4:
            agent_keys = result["agents"]
        if result.get("companyName"):
            company_name = result["companyName"]

    except Exception as e:
        print(f"Provisioning LLM error: {e}")

    # Build agent list from templates
    agents = []
    for key in agent_keys:
        template = AGENT_TEMPLATES.get(key)
        if template:
            agents.append({**template})

    return company_name, agents
