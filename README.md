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

### Running the front-end

To run the React Native front-end:

```bash
cd frontend
npm start    # or expo start
```

The Expo dev menu will open in your browser and the app can be loaded on a simulator/device using the QR code.

### Running on device

To test the app on a physical device with the backend:

1. Start the FastAPI server on all interfaces:
   ```bash
   python run_api.py   # Already configured to use host 0.0.0.0
   ```

2. Find your LAN IP address:
   - Windows: `ipconfig` 
   - macOS/Linux: `ipconfig getifaddr en0` or `hostname -I`

3. Update the hardcoded API URLs in the frontend code with your LAN IP:
   - Edit `frontend/src/utils/api.js` (or `api.ts`)
   - Edit `frontend/app/screens/HomeScreen.js`
   - Edit `frontend/app/screens/ConnectivityScreen.js`
   
   Replace `192.168.10.112` with your actual IP address.

4. Start Expo from the frontend directory:
   ```bash
   cd frontend
   npx expo start        # then scan QR with Expo Go
   ```

5. If same-WiFi connection fails, try using a tunnel:
   ```bash
   # Start Expo with tunneling
   cd frontend
   npx expo start --tunnel
   ```
   
   Or use ngrok:
   ```bash
   # Install ngrok globally
   npm i -g ngrok
   
   # Expose your local backend
   ngrok http 8000
   ```
   
   Then update the hardcoded API URLs with the ngrok URL.

See `frontend/DEVICE_TESTING.md` for more detailed information.

### Ping backend from front-end

To test communication between frontend and backend:

```bash
# Run the backend API server from another terminal
cd frontend
node scripts/ping.mjs
```

Alternatively, start the Expo web server and use the "Ping API" button on the home screen:

```bash
npm run web
```

## Project Structure

```
mindbuddy/
├── .env                     # Environment variables (not in git)
├── profile.json             # User profile data
├── pyproject.toml           # Project metadata and dependencies
├── run_api.py               # Script to run the API server
├── run_cli.py               # Script to run the CLI
├── frontend/                # React Native / Expo frontend
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