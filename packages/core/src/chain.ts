import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MINDBUDDY_TEMPLATE } from "./prompt";
import { Profile } from "./types";
import { DexieMemory } from "./DexieMemory";

export async function buildMindBuddyChain(profile: Profile) {
  const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });
  const outputParser = new StringOutputParser();
  const memory = new DexieMemory(profile);

  const prompt = PromptTemplate.fromTemplate(MINDBUDDY_TEMPLATE);

  const chain = RunnableSequence.from([
    {
      query: (input) => input.query,
      chat_history: async () => {
        const { chat_history } = await memory.loadMemoryVariables();
        return chat_history;
      }
    },
    prompt,
    llm,
    outputParser
  ]);

  // Wrap the chain with custom invoke to handle memory saving
  const chainWithMemory = {
    invoke: async (input: { query: string }) => {
      const result = await chain.invoke(input);
      await memory.saveContext(input, { text: result });
      return { text: result };
    }
  };

  return chainWithMemory;
} 