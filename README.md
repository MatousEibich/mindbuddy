# MindBuddy

A privacy-focused journaling buddy that helps everyday users reflect on stress, habits, and moods without pretending to be a clinician.

## Key Features

- All conversation data encrypted and stored on-device
- Cloud LLM calls only for generation via LlamaIndex
- Automatic deflection of crisis-level content to professional hotlines
- Transparent, version-controlled prompts
- Clean Python/uv stack with minimal dependencies

## Project Status

This project is in early development.

## Getting Started

### Prerequisites

- Python 3.9 or higher
- [uv](https://github.com/astral-sh/uv) for dependency management

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mindbuddy.git
   cd mindbuddy
   ```

2. Set up a virtual environment and install dependencies with uv:
   ```
   uv venv
   uv pip sync
   ```

3. Configure your API keys in `.env` (create this file):
   ```
   OPENAI_API_KEY=your_key_here
   ```

## Development

The project follows a clean architecture pattern:

- `mindbuddy/prompts/` - Contains all prompts as version-controlled .md files
- `mindbuddy/utils/` - Utility functions for the application
- `mindbuddy/llm.py` - Thin wrapper around LlamaIndex for LLM interactions

## License

MIT License 