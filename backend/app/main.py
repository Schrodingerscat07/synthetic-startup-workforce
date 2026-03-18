"""
Cerebro AI — FastAPI Backend

Main application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .routers import chat, company, execution


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    init_db()
    print("🧠 Cerebro AI Backend started")
    print(f"   Gemini API key: {'✅ configured' if settings.GEMINI_API_KEY else '❌ MISSING — add GEMINI_API_KEY to .env'}")
    yield
    print("Cerebro AI Backend shutting down")


app = FastAPI(
    title="Cerebro AI",
    description="Production-grade AI Startup Workforce Portal — Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)
app.include_router(company.router)
app.include_router(execution.router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
    }
