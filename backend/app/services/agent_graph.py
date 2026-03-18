"""
Cerebro AI — LangGraph Agent Execution Graph

A real multi-agent system where:
1. CEO (Supervisor) plans and delegates tasks
2. Seeker (Worker) uses real tools: Google Search → Scrape → Summarize
3. Herald (Worker) uses Gemini to draft personalized emails
4. Every step emits logs for real-time dashboard streaming
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import TypedDict, Annotated

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from ..config import settings
from ..tools.search import search_google
from ..tools.scraper import scrape_multiple
from ..tools.summarizer import summarize_content
from ..tools.email_writer import compose_email


# ──────────────────────────────────────────────
# State Definition
# ──────────────────────────────────────────────

class AgentState(TypedDict):
    company_name: str
    company_vision: str
    agents: list[dict]
    research_query: str
    search_results: list[dict]
    scraped_content: list[dict]
    articles: list[dict]
    draft_email: str
    logs: Annotated[list[dict], lambda a, b: a + b]  # Accumulate logs
    status: str


def make_log(agent_name: str, agent_id: str, action: str, detail: str, status: str = "running") -> dict:
    return {
        "id": str(uuid.uuid4()),
        "agent_id": agent_id,
        "agent_name": agent_name,
        "action": action,
        "detail": detail,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def get_llm():
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.7,
    )


# ──────────────────────────────────────────────
# Agent Nodes
# ──────────────────────────────────────────────

def ceo_plan(state: AgentState) -> dict:
    """CEO analyzes the vision and creates a research plan."""
    llm = get_llm()

    messages = [
        SystemMessage(content=(
            "You are Atlas, the CEO of an AI startup. Given a company vision, "
            "create a focused research query (1 sentence) that the Web Research Specialist "
            "should search for to find relevant market intelligence. "
            "Return ONLY the search query, nothing else."
        )),
        HumanMessage(content=f"Company: {state['company_name']}\nVision: {state['company_vision']}"),
    ]

    response = llm.invoke(messages)
    query = response.content.strip().strip('"')

    return {
        "research_query": query,
        "logs": [
            make_log("Atlas", "agent-ceo", "Strategic Planning", f"Analyzing vision for {state['company_name']}"),
            make_log("Atlas", "agent-ceo", "Task Delegation", f'Research directive: "{query}"'),
        ],
    }


def seeker_search(state: AgentState) -> dict:
    """Seeker performs real Google searches."""
    query = state["research_query"]

    logs = [make_log("Seeker", "agent-web-researcher", "Initializing Search Engine", f"Querying Google: \"{query}\"")]

    results = search_google(query, num_results=5)

    logs.append(make_log("Seeker", "agent-web-researcher", "Search Complete", f"Found {len(results)} results"))

    return {"search_results": results, "logs": logs}


def seeker_scrape(state: AgentState) -> dict:
    """Seeker scrapes the web pages found in search."""
    urls = [r["url"] for r in state["search_results"] if r.get("url")]

    logs = [make_log("Seeker", "agent-web-researcher", "Scraping Pages", f"Extracting content from {len(urls)} URLs...")]

    scraped = scrape_multiple(urls, max_per_page=2000)
    successful = [s for s in scraped if s.get("success")]

    logs.append(make_log(
        "Seeker", "agent-web-researcher", "Extraction Complete",
        f"Successfully extracted content from {len(successful)}/{len(scraped)} pages"
    ))

    return {"scraped_content": scraped, "logs": logs}


def seeker_summarize(state: AgentState) -> dict:
    """Seeker uses Gemini to summarize each scraped page into a research finding."""
    scraped = [s for s in state["scraped_content"] if s.get("success") and len(s.get("content", "")) > 100]

    logs = [make_log("Seeker", "agent-web-researcher", "Analyzing Content", f"Summarizing {len(scraped)} articles with AI...")]

    articles = []
    for page in scraped[:5]:  # Limit to 5
        result = summarize_content(page["url"], page["title"], page["content"])
        if result.get("title") and result.get("summary"):
            result["scrapedAt"] = datetime.now(timezone.utc).isoformat()
            articles.append(result)

    logs.append(make_log(
        "Seeker", "agent-web-researcher", "Research Complete",
        f"Compiled {len(articles)} qualified research findings",
        "completed"
    ))

    return {"articles": articles, "logs": logs}


def herald_draft(state: AgentState) -> dict:
    """Herald composes a personalized email based on the research findings."""
    articles = state["articles"]

    logs = [
        make_log("Herald", "agent-email-outreach", "Reading Research Context", f"Ingesting {len(articles)} articles from Seeker"),
        make_log("Herald", "agent-email-outreach", "Drafting Email", "Composing executive intelligence brief..."),
    ]

    email = compose_email(state["company_name"], state["company_vision"], articles)

    logs.append(make_log(
        "Herald", "agent-email-outreach", "Email Drafted",
        "Executive intelligence brief generated and awaits human review",
        "completed"
    ))

    return {"draft_email": email, "logs": logs}


def ceo_review(state: AgentState) -> dict:
    """CEO aggregates results and marks execution as complete."""
    num_articles = len(state["articles"])
    has_email = bool(state["draft_email"])

    return {
        "status": "completed",
        "logs": [
            make_log(
                "Atlas", "agent-ceo", "Execution Complete",
                f"All tasks finished. {num_articles} research findings compiled, email {'drafted' if has_email else 'pending'}.",
                "completed"
            ),
        ],
    }


# ──────────────────────────────────────────────
# Build the LangGraph
# ──────────────────────────────────────────────

def build_agent_graph() -> StateGraph:
    """Build and compile the multi-agent execution graph."""

    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("ceo_plan", ceo_plan)
    graph.add_node("seeker_search", seeker_search)
    graph.add_node("seeker_scrape", seeker_scrape)
    graph.add_node("seeker_summarize", seeker_summarize)
    graph.add_node("herald_draft", herald_draft)
    graph.add_node("ceo_review", ceo_review)

    # Wire edges: CEO → Seeker pipeline → Herald → CEO review
    graph.set_entry_point("ceo_plan")
    graph.add_edge("ceo_plan", "seeker_search")
    graph.add_edge("seeker_search", "seeker_scrape")
    graph.add_edge("seeker_scrape", "seeker_summarize")
    graph.add_edge("seeker_summarize", "herald_draft")
    graph.add_edge("herald_draft", "ceo_review")
    graph.add_edge("ceo_review", END)

    return graph.compile()


# Singleton compiled graph
_compiled_graph = None


def get_agent_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_agent_graph()
    return _compiled_graph


def run_agent_pipeline(company_name: str, company_vision: str, agents: list[dict]) -> AgentState:
    """
    Run the full agent pipeline synchronously.
    Returns the final state with articles, email, and logs.
    """
    graph = get_agent_graph()

    initial_state: AgentState = {
        "company_name": company_name,
        "company_vision": company_vision,
        "agents": agents,
        "research_query": "",
        "search_results": [],
        "scraped_content": [],
        "articles": [],
        "draft_email": "",
        "logs": [],
        "status": "running",
    }

    final_state = graph.invoke(initial_state)
    return final_state
