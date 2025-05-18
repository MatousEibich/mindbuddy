import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { renderPrompt, stringifyHistory } from "./renderPrompt";
import { Profile } from "./types";
import { Message } from "./message";
import { loadLastN, saveMessage } from "./db";

const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });

export async function chatOnce(
  profile: Profile,
  userInput: string
): Promise<string> {
  const userMsg: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content: userInput,
    ts: Date.now(),
  };

  const history = await loadLastN();
  const prompt = await renderPrompt(
    profile,
    stringifyHistory(history, profile),
    userInput
  );
  
  const reply = await llm.invoke(prompt);

  const botMsg: Message = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: reply.content as string,
    ts: Date.now(),
  };

  await saveMessage(userMsg);
  await saveMessage(botMsg);

  return reply.content as string;
} 