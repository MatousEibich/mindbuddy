import axios from "axios";

// Hardcoded API URL - this is the most reliable approach for Expo Go
const apiUrl = "http://192.168.10.112:8000";
console.log("Using hardcoded API URL:", apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000
});

// Test connectivity at startup
(async function testApiConnection() {
  try {
    console.log("Testing API connection...");
    const response = await api.get("/health");
    console.log("API connection successful:", response.data);
  } catch (error) {
    console.error("API connection failed:", error);
    console.warn("Make sure the backend is running and accessible at", apiUrl);
  }
})();

export async function chat(msg: string): Promise<string> {
  try {
    console.log(`Sending request to ${apiUrl}/chat`);
    const { data } = await api.post("/chat", { msg });
    return data.reply;
  } catch (error) {
    console.error("API Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
} 