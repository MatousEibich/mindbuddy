import { BaseMemory } from "@langchain/core/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { v4 as uuid } from "uuid";
import { loadThreadMessages, appendThreadMessages } from "../threadStorage";
import { Profile } from "../types";
import { Message as DBMessage } from "../message";
import { createLogger } from "../utils/logger";

const logger = createLogger('THREAD-MEMORY');

/**
 * LangChain memory implementation that uses thread-specific storage
 */
export class ThreadMemory extends BaseMemory {
  constructor(
    private threadId: string,
    private profile: Profile
  ) { 
    super(); 
    logger.debug("ThreadMemory initialized", { 
      threadId, 
      profileName: profile.name 
    });
  }

  async loadMemoryVariables() {
    logger.debug("Loading memory variables for thread", { threadId: this.threadId });
    const rows = await loadThreadMessages(this.threadId);
    logger.debug("Loaded messages from thread storage", { 
      threadId: this.threadId, 
      count: rows.length 
    });
    
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
      threadId: this.threadId,
      historyLength: historyString.length, 
      messageCount: msgs.length 
    });
    
    return { chat_history: historyString };
  }

  async saveContext(input: { query: string }, output: { text: string }) {
    logger.debug("Saving context to thread", { 
      threadId: this.threadId,
      input: input.query, 
      output: output.text 
    });
    
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
    
    logger.debug("Generated message objects for thread", { threadId: this.threadId });
    
    await appendThreadMessages(this.threadId, [userMsg, botMsg]);
    
    logger.debug("Messages saved to thread storage", { threadId: this.threadId });
  }

  get memoryKeys() {
    return ["chat_history"];
  }
} 