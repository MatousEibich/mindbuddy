import { BaseMemory } from "@langchain/core/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { v4 as uuid } from "uuid";
import { loadLastN, saveMessage } from "./storage";
import { Profile } from "./types";
import { Message as DBMessage } from "./message";

const LIMIT = 20; // most recent turns to inject

// Debug log function
const debug = (message: string, data?: any) => {
  const logMessage = data ? `${message}: ${JSON.stringify(data, null, 2)}` : message;
  console.log(`[MEMORY DEBUG] ${logMessage}`);
};

export class AsyncStorageMemory extends BaseMemory {
  constructor(private profile: Profile) { 
    super(); 
    debug("AsyncStorageMemory initialized with profile", { name: profile.name });
  }

  async loadMemoryVariables() {
    debug("Loading memory variables");
    const rows = await loadLastN(LIMIT);
    debug("Loaded messages from storage", { count: rows.length });
    
    const msgs = rows.map(r =>
      r.role === "user"
        ? new HumanMessage(r.content)
        : new AIMessage(r.content)
    );
    
    // Convert messages to string format
    const historyString = msgs.map(msg =>
      `${msg._getType() === 'human' ? this.profile.name || 'User' : 'MindBuddy'}: ${msg.content}`
    ).join('\n');
    
    debug("Constructed history string", { historyLength: historyString.length, messageCount: msgs.length });
    return { chat_history: historyString };
  }

  async saveContext(input: { query: string }, output: { text: string }) {
    debug("Saving context", { input: input.query, output: output.text });
    
    const t = Date.now();
    const userRow: DBMessage = { id: uuid(), role: "user", content: input.query, ts: t };
    const botRow: DBMessage = { id: uuid(), role: "assistant", content: output.text, ts: t + 1 };
    
    debug("Generated message objects", { userRow, botRow });
    
    await saveMessage(userRow);
    await saveMessage(botRow);
    
    debug("Messages saved to storage");
  }

  get memoryKeys() {
    return ["chat_history"];
  }
} 