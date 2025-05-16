# Testing the API Connection

There are multiple ways to test the connection between the frontend and the backend API:

## Method 1: Using the HomeScreen UI Button (Recommended for Expo)

1. Start the backend server:
   ```bash
   # From the project root
   uvicorn backend.api:app --reload --port 8000
   ```

2. Make sure the `.env` file in the `frontend` directory contains:
   ```
   API_URL=http://localhost:8000
   ```

3. Start the Expo web server:
   ```bash
   # From the frontend directory
   npx expo start --web
   ```

4. In the web browser, click the "Ping API" button on the home screen.

## Method 2: Using PowerShell Script (Recommended for Windows)

This method works reliably without needing Node.js or npm:

1. Start the backend server:
   ```bash
   # From the project root
   uvicorn backend.api:app --reload --port 8000
   ```

2. Run the PowerShell test script:
   ```powershell
   # From the frontend directory
   powershell -ExecutionPolicy Bypass -File .\test-api.ps1
   ```

## Method 3: Using Node.js (if available)

If you have Node.js installed, you can run the ping script directly:

1. Start the backend server:
   ```bash
   # From the project root
   uvicorn backend.api:app --reload --port 8000
   ```

2. Make sure the `.env` file in the `frontend` directory contains:
   ```
   API_URL=http://localhost:8000
   ```

3. Run the ping script:
   ```bash
   # From the frontend directory
   node scripts/ping.mjs
   ```

## Troubleshooting

If you encounter an error:

1. Verify that the backend API server is running on port 8000
2. Check that the API URL is correct in your .env file
3. If using the UI button, make sure axios is installed:
   ```bash
   cd frontend
   npm install axios
   ```
4. The PowerShell method (Method 2) is the most reliable for Windows users
5. If all else fails, use the HomeScreen UI "Ping API" button via Expo Web 