import { BaseMemory } from "@langchain/core/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { db } from "./db";
import { Profile } from "./types";
import { Message as DBMessage } from "./message";

const LIMIT = 20;       // most recent turns to inject

export class DexieMemory extends BaseMemory {
  constructor(private profile: Profile) { super(); }

  async loadMemoryVariables() {
    const rows = await db.messages
      .orderBy("ts")
      .reverse()
      .limit(LIMIT)
      .toArray();
    const msgs = rows.reverse().map(r =>
      r.role === "user"
        ? new HumanMessage(r.content)
        : new AIMessage(r.content)
    );
    
    // Convert messages to string format
    const historyString = msgs.map(msg => 
      `${msg._getType() === 'human' ? this.profile.name || 'User' : 'MindBuddy'}: ${msg.content}`
    ).join('\n');
    
    return { chat_history: historyString };
  }

  async saveContext(input: { query: string }, output: { text: string }) {
    const t = Date.now();
    const messages: DBMessage[] = [
      { id: crypto.randomUUID(), role: "user", content: input.query, ts: t },
      { id: crypto.randomUUID(), role: "assistant", content: output.text, ts: t + 1 },
    ];
    await db.messages.bulkPut(messages);
    
    // hard-trim to 40 rows (same logic as before)
    const extra = await db.messages.count() - 40;
    if (extra > 0) await db.messages.orderBy("ts").limit(extra).delete();
  }

  get memoryKeys() {
    return ["chat_history"];
  }
} 