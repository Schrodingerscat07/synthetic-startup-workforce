"""
Execution Router — /api/execute

Triggers the LangGraph agent pipeline and streams results via SSE.
"""

import json
import asyncio
from threading import Thread

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db, SessionLocal
from ..models import CompanyModel, AgentModel, ExecutionModel
from ..schemas import ExecuteRequest, ExecutionResultOut
from ..services.agent_graph import run_agent_pipeline

router = APIRouter(prefix="/api/execute", tags=["execution"])

# In-memory store for execution streaming
# In production, use Redis or similar
_execution_state: dict[str, dict] = {}


def _run_pipeline_thread(company_id: str, company_name: str, vision: str, agents: list[dict]):
    """Run the agent pipeline in a background thread and store results."""
    _execution_state[company_id] = {"status": "running", "logs": [], "articles": [], "draft_email": ""}

    try:
        final_state = run_agent_pipeline(company_name, vision, agents)

        _execution_state[company_id] = {
            "status": "completed",
            "logs": final_state.get("logs", []),
            "articles": final_state.get("articles", []),
            "draft_email": final_state.get("draft_email", ""),
        }

        # Save to database
        db = SessionLocal()
        try:
            execution = ExecutionModel(
                company_id=company_id,
                status="completed",
                articles=final_state.get("articles", []),
                draft_email=final_state.get("draft_email", ""),
                logs=final_state.get("logs", []),
            )
            db.add(execution)

            # Update company status
            company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
            if company:
                company.status = "completed"
            db.commit()
        finally:
            db.close()

    except Exception as e:
        print(f"Pipeline error: {e}")
        _execution_state[company_id] = {
            "status": "error",
            "logs": _execution_state.get(company_id, {}).get("logs", []) + [
                {"agent_name": "System", "agent_id": "system", "action": "Error",
                 "detail": str(e), "status": "error"}
            ],
            "articles": [],
            "draft_email": "",
        }


@router.post("/start")
def start_execution(req: ExecuteRequest, db: Session = Depends(get_db)):
    """Start the LangGraph agent pipeline in the background."""
    company = db.query(CompanyModel).filter(CompanyModel.id == req.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    agents = db.query(AgentModel).filter(AgentModel.company_id == req.company_id).all()
    agent_dicts = [
        {"id": a.id, "name": a.name, "role": a.role, "title": a.title}
        for a in agents
    ]

    # Update company status
    company.status = "running"
    db.commit()

    # Launch in background thread
    thread = Thread(
        target=_run_pipeline_thread,
        args=(req.company_id, company.name, company.vision, agent_dicts),
        daemon=True,
    )
    thread.start()

    return {"status": "started", "message": "Agent pipeline initiated"}


@router.get("/stream/{company_id}")
async def stream_execution(company_id: str):
    """SSE endpoint — streams execution logs in real-time."""

    async def event_generator():
        last_log_count = 0

        while True:
            state = _execution_state.get(company_id)

            if state is None:
                yield f"data: {json.dumps({'type': 'waiting', 'message': 'Waiting for execution to start...'})}\n\n"
                await asyncio.sleep(1)
                continue

            logs = state.get("logs", [])
            new_logs = logs[last_log_count:]

            for log in new_logs:
                yield f"data: {json.dumps({'type': 'log', 'data': log})}\n\n"

            last_log_count = len(logs)

            if state.get("status") in ("completed", "error"):
                # Send final results
                yield f"data: {json.dumps({'type': 'complete', 'data': {'status': state['status'], 'articles': state.get('articles', []), 'draft_email': state.get('draft_email', '')}})}\n\n"
                break

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/results/{company_id}", response_model=ExecutionResultOut)
def get_results(company_id: str, db: Session = Depends(get_db)):
    """Get the latest execution results for a company."""
    execution = (
        db.query(ExecutionModel)
        .filter(ExecutionModel.company_id == company_id)
        .order_by(ExecutionModel.created_at.desc())
        .first()
    )

    if not execution:
        # Check in-memory state
        state = _execution_state.get(company_id)
        if state:
            return ExecutionResultOut(
                status=state.get("status", "unknown"),
                articles=state.get("articles", []),
                draft_email=state.get("draft_email", ""),
            )
        raise HTTPException(status_code=404, detail="No execution found")

    return ExecutionResultOut(
        status=execution.status,
        articles=execution.articles,
        draft_email=execution.draft_email,
    )
