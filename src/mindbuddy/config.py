"""
Configuration management for MindBuddy
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directory for the project
PROJECT_ROOT = Path(__file__).parents[2].resolve()

# API configuration
API_CONFIG = {
    "title": "MindBuddy API",
    "description": "Chat API for MindBuddy, a privacy-focused journaling buddy",
    "version": "0.1.0",
    "rate_limit": "30/minute",  # Default rate limit
    "cors_origins": ["*"],  # Tighten in production
}

# LLM configuration
LLM_CONFIG = {
    "model": os.getenv("OPENAI_MODEL", "gpt-4o"),
    "temperature": float(os.getenv("OPENAI_TEMPERATURE", "0")),
    "api_key": os.getenv("OPENAI_API_KEY"),
}

# Chat storage configuration
STORAGE_CONFIG = {
    "store_path": Path.home() / ".mindbuddy_chat.json",
    "token_limit": 3000,
    "default_chat_key": "default",
}

# Profile configuration
PROFILE_PATH = PROJECT_ROOT / "profile.json"


# Validate configuration
def validate_config():
    """Validate critical configuration settings"""
    if not LLM_CONFIG["api_key"]:
        raise RuntimeError("OPENAI_API_KEY not found in environment variables")

    if not PROFILE_PATH.exists():
        raise FileNotFoundError(f"Profile file not found at {PROFILE_PATH}")

    return True
