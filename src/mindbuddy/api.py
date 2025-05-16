"""FastAPI implementation for MindBuddy."""

from typing import Any

import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

from .config import API_CONFIG
from .engine import build_engine, load_profile

# Initialize chat engine and store
engine, store = build_engine()


# Data models
class ChatRequest(BaseModel):
    """Chat request model."""

    msg: str = Field(..., description="User message to send to the AI")


class ChatResponse(BaseModel):
    """Chat response model."""

    reply: str = Field(..., description="AI response to the user message")


class ProfileData(BaseModel):
    """User profile model."""

    name: str
    pronouns: str
    style: str
    core_facts: list[dict[str, Any]]


# Error handler
class ErrorResponse(BaseModel):
    """API error response model."""

    detail: str


# Application setup
app = FastAPI(
    title=API_CONFIG["title"],
    description=API_CONFIG["description"],
    version=API_CONFIG["version"],
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=API_CONFIG["cors_origins"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Configure rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)


# Custom error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )


# API endpoints
@app.get("/health", response_model=dict[str, str])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/chat", response_model=ChatResponse)
@limiter.limit(API_CONFIG["rate_limit"])
async def chat(request: Request, req: ChatRequest):
    """Send a message to MindBuddy and get a response.

    The conversation history is maintained between requests
    """
    if not req.msg.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty message")

    try:
        reply = engine.chat(req.msg)
        store.persist()
        return {"reply": str(reply)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing message: {str(e)}",
        ) from e


@app.get("/profile", response_model=ProfileData)
async def get_profile():
    """Get the current user profile."""
    try:
        profile = load_profile()
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading profile: {str(e)}",
        ) from e


def run_server():
    """Run the FastAPI server."""
    uvicorn.run(
        "src.mindbuddy.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
