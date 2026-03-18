"""
Cerebro AI — Pydantic Schemas

Request/response models for the API.
"""

from pydantic import BaseModel


# ── Chat ──────────────────────────────────────

class ChatRequest(BaseModel):
    company_id: str
    message: str


class ChatResponse(BaseModel):
    role: str
    content: str
    msg_type: str = "text"
    agent_data: dict | None = None


# ── Agent Provisioning ────────────────────────

class ProvisionRequest(BaseModel):
    company_id: str
    vision: str


class AgentOut(BaseModel):
    id: str
    name: str
    role: str
    title: str
    avatar: str
    status: str
    permissions: list[dict]
    tools: list[str]
    reports_to: str | None
    description: str


class ProvisionResponse(BaseModel):
    company_name: str
    agents: list[AgentOut]
    narrations: list[str]
    ready_message: str


# ── Company ───────────────────────────────────

class CompanyOut(BaseModel):
    id: str
    name: str
    vision: str
    status: str
    agents: list[AgentOut]


class ApproveRequest(BaseModel):
    company_id: str
    agents: list[AgentOut]


# ── Execution ─────────────────────────────────

class ExecuteRequest(BaseModel):
    company_id: str


class ExecutionLogOut(BaseModel):
    agent_id: str
    agent_name: str
    action: str
    detail: str
    status: str


class ExecutionResultOut(BaseModel):
    status: str
    articles: list[dict]
    draft_email: str
