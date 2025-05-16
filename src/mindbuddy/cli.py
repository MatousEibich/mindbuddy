"""
Command-line interface for MindBuddy
"""
import sys
from .engine import build_engine

def run_repl():
    """Run MindBuddy in REPL mode"""
    # Build the chat engine and store
    chat_engine, chat_store = build_engine()

    print("MindBuddy REPL – type 'quit' to exit.")
    try:
        while True:
            msg = input("you> ").strip()
            if msg.lower() in {"quit", "exit"}:
                break
            reply = chat_engine.chat(msg)
            print("buddy>", reply)
            chat_store.persist()  # save after each turn
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        chat_store.persist()
        print("Conversation saved.")

def main():
    """Main entry point for the CLI"""
    run_repl()

if __name__ == "__main__":
    sys.exit(main()) 