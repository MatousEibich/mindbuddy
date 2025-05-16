import axios from "axios";
import Constants from "expo-constants";

const api = axios.create({
  baseURL: (Constants.manifest as any).extra.API_URL
});

export async function chat(msg: string): Promise<string> {
  const { data } = await api.post("/chat", { msg });
  return data.reply;
} 