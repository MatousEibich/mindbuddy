import axios from "axios";
import Constants from "expo-constants";

const api = axios.create({
  baseURL: (Constants.manifest?.extra?.API_URL)
});

export async function chat(msg) {
  const { data } = await api.post("/chat", { msg });
  return data.reply;
} 