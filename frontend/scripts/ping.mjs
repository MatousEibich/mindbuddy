import axios from 'axios';

// Direct implementation instead of import to avoid ESM path issues
async function chat(msg) {
  try {
    // Try to read API_URL from .env file or use default
    const API_URL = process.env.API_URL || 'http://localhost:8000';
    console.log(`Connecting to API at: ${API_URL}`);
    
    const { data } = await axios.post(`${API_URL}/chat`, { msg });
    return data.reply;
  } catch (error) {
    throw error;
  }
}

async function pingApi() {
  try {
    console.log("Sending test message to MindBuddy API...");
    const reply = await chat("Hello API");
    console.log("MindBuddy:", reply);
  } catch (error) {
    console.error("Error pinging API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    console.error("\nMake sure the backend API is running with: uvicorn backend.api:app --reload --port 8000");
  }
}

pingApi(); 