"""
Company Router — /api/company

CRUD for company state and HITL approval.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CompanyModel, AgentModel
from ..schemas import CompanyOut, AgentOut, ApproveRequest

router = APIRouter(prefix="/api/company", tags=["company"])


@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: str, db: Session = Depends(get_db)):
    """Get the current company state with all agents."""
    company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    agents = db.query(AgentModel).filter(AgentModel.company_id == company_id).all()
    agent_list = [
        AgentOut(
            id=a.id, name=a.name, role=a.role, title=a.title,
            avatar=a.avatar, status=a.status, permissions=a.permissions,
            tools=a.tools, reports_to=a.reports_to, description=a.description,
        )
        for a in agents
    ]

    return CompanyOut(
        id=company.id,
        name=company.name,
        vision=company.vision,
        status=company.status,
        agents=agent_list,
    )


@router.put("/approve")
def approve_company(req: ApproveRequest, db: Session = Depends(get_db)):
    """HITL Approval Gate — mark company as approved and update agents."""
    company = db.query(CompanyModel).filter(CompanyModel.id == req.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company.status = "approved"

    # Update agents with any edits from the org chart
    for agent_data in req.agents:
        agent = db.query(AgentModel).filter(AgentModel.id == agent_data.id).first()
        if agent:
            agent.permissions = [p if isinstance(p, dict) else p.model_dump() for p in agent_data.permissions]
            agent.tools = agent_data.tools
            agent.reports_to = agent_data.reports_to

    db.commit()
    return {"status": "approved", "message": "Company approved for execution"}
