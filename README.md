# MindBuddy

A privacy-focused journaling buddy that helps everyday users reflect on stress, habits, and moods without pretending to be a clinician.

## Key Features

- All conversation data encrypted and stored on-device
- Cloud LLM calls only for generation via LlamaIndex
- Automatic deflection of crisis-level content to professional hotlines
- Transparent, version-controlled prompts
- Clean Python/uv stack with minimal dependencies
- REST API for frontend integration

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

2. Set up a virtual environment and install the package with dependencies:
   ```
   uv venv
   uv pip install -e .
   ```

3. Configure your API keys in `.env` (create this file):
   ```
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-4o
   OPENAI_TEMPERATURE=0
   ```

## Usage

### Command Line Interface

You can run MindBuddy in the terminal using either:

```bash
python run_cli.py
# or with the entry point
mindbuddy-cli
```

### API Server

Run the FastAPI server using either:

```bash
python run_api.py
# or with the entry point
mindbuddy-api
```

The server will be available at http://localhost:8000.

#### API Endpoints

- `GET /health` - Health check endpoint
- `GET /profile` - Get the current user profile
- `POST /chat` - Send a message to MindBuddy
  - Request body: `{ "msg": "Your message here" }`
  - Response: `{ "reply": "MindBuddy's response" }`

API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
mindbuddy/
├── .env                     # Environment variables (not in git)
├── profile.json             # User profile data
├── pyproject.toml           # Project metadata and dependencies
├── run_api.py               # Script to run the API server
├── run_cli.py               # Script to run the CLI
└── src/
    └── mindbuddy/
        ├── __init__.py
        ├── api.py           # FastAPI implementation
        ├── cli.py           # Command-line interface
        ├── config.py        # Configuration management
        ├── engine.py        # Chat engine implementation
        └── prompts/         # Prompt templates
```

## Development

The project follows a clean architecture pattern. All dependencies are managed in `pyproject.toml`.

## License

MIT License 