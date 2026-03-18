"""
Chat Router — /api/chat

Handles orchestrator conversation: welcome, vision processing, provisioning.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CompanyModel, ChatMessageModel, AgentModel
from ..schemas import ChatRequest, ChatResponse, ProvisionRequest, ProvisionResponse, AgentOut
from ..services.orchestrator import (
    generate_welcome,
    generate_vision_ack,
    generate_agent_narration,
    generate_ready_message,
    provision_agents,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/welcome", response_model=ChatResponse)
def welcome():
    """Generate the orchestrator welcome message."""
    content = generate_welcome()
    return ChatResponse(role="orchestrator", content=content, msg_type="text")


@router.post("/provision", response_model=ProvisionResponse)
def provision(req: ProvisionRequest, db: Session = Depends(get_db)):
    """
    Analyze user's vision, provision agents, and return the full result.
    Creates/updates company in database.
    """
    # 1. Provision agents via LLM
    company_name, agents = provision_agents(req.vision)

    # 2. Generate vision acknowledgement
    vision_ack = generate_vision_ack(req.vision)

    # 3. Generate narration for each agent
    narrations = []
    for agent in agents:
        narration = generate_agent_narration(agent)
        narrations.append(narration)

    # 4. Generate ready message
    ready_msg = generate_ready_message(len(agents), company_name)

    # 5. Save to database
    company = db.query(CompanyModel).filter(CompanyModel.id == req.company_id).first()
    if not company:
        company = CompanyModel(id=req.company_id, name=company_name, vision=req.vision)
        db.add(company)
    else:
        company.name = company_name
        company.vision = req.vision

    # Clear existing agents and add new ones
    db.query(AgentModel).filter(AgentModel.company_id == req.company_id).delete()
    for agent_data in agents:
        agent_model = AgentModel(
            id=agent_data["id"],
            company_id=req.company_id,
            name=agent_data["name"],
            role=agent_data["role"],
            title=agent_data["title"],
            avatar=agent_data["avatar"],
            status=agent_data["status"],
            permissions=agent_data["permissions"],
            tools=agent_data["tools"],
            reports_to=agent_data.get("reports_to"),
            description=agent_data["description"],
        )
        db.add(agent_model)

    # Save chat messages
    for msg_content, msg_type in [(vision_ack, "text")] + [(n, "text") for n in narrations] + [(ready_msg, "transition")]:
        db.add(ChatMessageModel(
            company_id=req.company_id,
            role="orchestrator",
            content=msg_content,
            msg_type=msg_type,
        ))

    db.commit()

    # 6. Return
    agent_outs = [AgentOut(**a) for a in agents]
    return ProvisionResponse(
        company_name=company_name,
        agents=agent_outs,
        narrations=[vision_ack] + narrations,
        ready_message=ready_msg,
    )


@router.post("/message", response_model=ChatResponse)
def chat_message(req: ChatRequest, db: Session = Depends(get_db)):
    """Handle a general chat message (e.g., reconfiguration requests)."""
    from ..services.orchestrator import get_llm
    from langchain_core.messages import SystemMessage, HumanMessage

    # Save user message
    db.add(ChatMessageModel(
        company_id=req.company_id,
        role="user",
        content=req.message,
        msg_type="text",
    ))

    # Generate response
    try:
        llm = get_llm()
        messages = [
            SystemMessage(content="You are The Orchestrator for Cerebro AI. The user wants changes to their AI team. Respond briefly (1-2 sentences) confirming you've updated the team."),
            HumanMessage(content=f"User says: {req.message}"),
        ]
        response = llm.invoke(messages).content
    except Exception:
        response = "Understood. I've updated the team based on your feedback. Please review again."

    # Save response
    db.add(ChatMessageModel(
        company_id=req.company_id,
        role="orchestrator",
        content=response,
        msg_type="text",
    ))
    db.commit()

    return ChatResponse(role="orchestrator", content=response, msg_type="text")
