import { BaseMemory } from "@langchain/core/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { loadThreadMessages, appendThreadMessages } from "../threadStorage";
import { Profile } from "../types";
import { Message as DBMessage } from "../message";
import { createLogger } from "../utils/logger";

// React Native compatible UUID generator (avoiding Node.js crypto)
let msgIdCounter = 0;
const generateMsgId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `msg_${timestamp}_${random}_${msgIdCounter++}`;
};

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
      id: generateMsgId(), 
      role: "user", 
      content: input.query, 
      ts: t 
    };
    
    const botMsg: DBMessage = { 
      id: generateMsgId(), 
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