import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { renderPrompt } from "./renderPrompt";
import { Profile } from "./types";

const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

export async function runMindBuddy(
  profile: Profile,
  chatHistory: string,
  query: string
): Promise<string> {
  const prompt = await renderPrompt(profile, chatHistory, query);
  const res = await llm.invoke(prompt);
  return res.content as string;
} 