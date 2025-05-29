import { ChatOpenAI } from "@langchain/openai";
import { renderPrompt } from "./renderPrompt";
import { Profile } from "./types";
import { LLM } from "./config";
import { createLogger } from "./utils/logger";

const logger = createLogger('MINDBUDDY');
const llm = new ChatOpenAI({ 
  model: LLM.DEFAULT_MODEL, 
  temperature: LLM.DEFAULT_TEMPERATURE 
});

export async function runMindBuddy(
  profile: Profile,
  chatHistory: string,
  query: string
): Promise<string> {
  logger.debug("Running MindBuddy", { 
    profileName: profile.name, 
    historyLength: chatHistory.length,
    queryLength: query.length
  });
  
  const prompt = await renderPrompt(profile, chatHistory, query);
  logger.debug("Prompt rendered");
  
  const res = await llm.invoke(prompt);
  logger.debug("LLM response received");
  
  return res.content as string;
} 