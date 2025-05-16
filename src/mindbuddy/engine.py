"""
Core chat engine for MindBuddy
"""
import json
from llama_index.llms.openai import OpenAI
from llama_index.core.chat_engine import SimpleChatEngine
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.storage.chat_store import SimpleChatStore

from .config import LLM_CONFIG, STORAGE_CONFIG, PROFILE_PATH, validate_config
from .prompts.mindbuddy_template import create_prompt_from_profile

def load_profile():
    """Load user profile data from the profile file"""
    with open(PROFILE_PATH, "r") as f:
        return json.load(f)

def build_engine():
    """
    Build and configure the chat engine with memory
    
    Returns:
        tuple: (chat_engine, chat_store) - The configured chat engine and its storage
    """
    # Validate configuration before proceeding
    validate_config()
    
    # Load profile data
    profile_data = load_profile()

    # Create the prompt with profile data
    prompt = create_prompt_from_profile(profile_data)

    # Configure LLM
    llm = OpenAI(   
        model=LLM_CONFIG["model"],
        temperature=LLM_CONFIG["temperature"],
        api_key=LLM_CONFIG["api_key"]
    )

    # Configure chat storage
    chat_store = SimpleChatStore.from_persist_path(
        str(STORAGE_CONFIG["store_path"])
    )

    # Configure memory
    memory = ChatMemoryBuffer.from_defaults(
        token_limit=STORAGE_CONFIG["token_limit"],
        chat_store=chat_store,
        chat_store_key=STORAGE_CONFIG["default_chat_key"]
    )

    # Build the chat engine
    chat_engine = SimpleChatEngine.from_defaults(
        llm=llm,
        system_prompt=prompt,
        memory=memory
    )
    
    return chat_engine, chat_store 