import { BaseMemory } from "@langchain/core/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { v4 as uuid } from "uuid";
import { StorageInterface } from "../storage/StorageInterface";
import { Profile } from "../types";
import { Message as DBMessage } from "../message";
import { STORAGE } from "../config";
import { createLogger } from "../utils/logger";

const logger = createLogger('MEMORY');

/**
 * LangChain memory implementation that uses our StorageInterface
 */
export class StorageMemory extends BaseMemory {
  constructor(
    private storage: StorageInterface,
    private profile: Profile
  ) { 
    super(); 
    logger.debug("StorageMemory initialized with profile", { name: profile.name });
  }

  async loadMemoryVariables() {
    logger.debug("Loading memory variables");
    const rows = await this.storage.loadLastN(STORAGE.DEFAULT_LOAD_COUNT);
    logger.debug("Loaded messages from storage", { count: rows.length });
    
    const msgs = rows.map(r =>
      r.role === "user"
        ? new HumanMessage(r.content)
        : new AIMessage(r.content)
    );
    
    // Convert messages to string format
    const historyString = msgs.map(msg =>
      `${msg._getType() === 'human' ? this.profile.name || 'User' : 'MindBuddy'}: ${msg.content}`
    ).join('\n');
    
    logger.debug("Constructed history string", { 
      historyLength: historyString.length, 
      messageCount: msgs.length 
    });
    
    return { chat_history: historyString };
  }

  async saveContext(input: { query: string }, output: { text: string }) {
    logger.debug("Saving context", { input: input.query, output: output.text });
    
    const t = Date.now();
    const userMsg: DBMessage = { 
      id: uuid(), 
      role: "user", 
      content: input.query, 
      ts: t 
    };
    
    const botMsg: DBMessage = { 
      id: uuid(), 
      role: "assistant", 
      content: output.text, 
      ts: t + 1 
    };
    
    logger.debug("Generated message objects");
    
    await this.storage.saveMessage(userMsg);
    await this.storage.saveMessage(botMsg);
    
    logger.debug("Messages saved to storage");
  }

  get memoryKeys() {
    return ["chat_history"];
  }
} 