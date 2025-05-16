"""Command-line interface for MindBuddy."""

import sys

from .engine import build_engine


def run_repl():
    """Run MindBuddy in REPL mode."""
    # Build the chat engine and store
    chat_engine, chat_store = build_engine()
    
    print("Welcome to MindBuddy CLI!")
    print("Type 'exit' or press Ctrl+C to quit.\n")
    
    try:
        while True:
            user_input = input("You: ")
            if user_input.lower().strip() in ["exit", "quit"]:
                print("Goodbye!")
                break
                
            # Process the message and get a response
            response = chat_engine.chat(user_input)
            print(f"\nMindBuddy: {response}\n")
            
            # Save conversation
            chat_store.persist()
    except KeyboardInterrupt:
        print("\nGoodbye!")
        sys.exit(0)


def main():
    """Serve as the main entry point for the CLI."""
    run_repl()


if __name__ == "__main__":
    main()
