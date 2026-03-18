"""
Cerebro AI — Database Models
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


def new_id():
    return str(uuid.uuid4())


class CompanyModel(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(200), default="")
    vision: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="configuring")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    agents: Mapped[list["AgentModel"]] = relationship(back_populates="company", cascade="all, delete-orphan")
    messages: Mapped[list["ChatMessageModel"]] = relationship(back_populates="company", cascade="all, delete-orphan")
    executions: Mapped[list["ExecutionModel"]] = relationship(back_populates="company", cascade="all, delete-orphan")


class AgentModel(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"))
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(200))
    avatar: Mapped[str] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(50), default="idle")
    permissions: Mapped[dict] = mapped_column(JSON, default=list)
    tools: Mapped[list] = mapped_column(JSON, default=list)
    reports_to: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")

    company: Mapped["CompanyModel"] = relationship(back_populates="agents")


class ChatMessageModel(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"))
    role: Mapped[str] = mapped_column(String(50))
    content: Mapped[str] = mapped_column(Text)
    msg_type: Mapped[str] = mapped_column(String(50), default="text")
    agent_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    company: Mapped["CompanyModel"] = relationship(back_populates="messages")


class ExecutionModel(Base):
    __tablename__ = "executions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    company_id: Mapped[str] = mapped_column(ForeignKey("companies.id"))
    status: Mapped[str] = mapped_column(String(50), default="running")
    articles: Mapped[list] = mapped_column(JSON, default=list)
    draft_email: Mapped[str] = mapped_column(Text, default="")
    logs: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    company: Mapped["CompanyModel"] = relationship(back_populates="executions")
