from pathlib import Path
from dotenv import load_dotenv; load_dotenv()

from llama_index.llms.openai import OpenAI
from llama_index.core.prompts import RichPromptTemplate
from llama_index.core.chat_engine import SimpleChatEngine
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.storage.chat_store import SimpleChatStore   # NEW

import os
import argparse

# 1 · load the prompt file
with open("prompts/main_prompt.md", "r", encoding="utf-8") as f:
    prompt_str = f.read()
main_prompt = RichPromptTemplate(prompt_str)

# 2 · model
llm = OpenAI(   
    model="gpt-4o",
    temperature=0,
    api_key=os.getenv("OPENAI_API_KEY")
)

# NEW 3 · tiny JSON chat-store on disk  ────────────────
STORE_PATH = Path.home() / ".mindbuddy_chat.json"          # e.g.  /home/user/.mindbuddy_chat.json
chat_store = SimpleChatStore.from_persist_path(str(STORE_PATH))

memory = ChatMemoryBuffer.from_defaults(
    token_limit=3000,              # ~3 k tokens of recent context
    chat_store=chat_store,         # <— makes it survive new runs
    chat_store_key="default"       # use one key; add more if you want per-user scopes
)

# 4 · build the chat engine
chat_engine = SimpleChatEngine.from_defaults(
    llm=llm,
    system_prompt=main_prompt,
    memory=memory
)

# ── REPL loop ─────────────────────────────────────────────────────
print("MindBuddy REPL – type 'quit' to exit.")
try:
    while True:
        msg = input("you> ").strip()
        if msg.lower() in {"quit", "exit"}:
            break
        reply = chat_engine.chat(msg)
        print("buddy>", reply)
        chat_store.persist()              # save after each turn
except KeyboardInterrupt:
    pass
finally:
    chat_store.persist()