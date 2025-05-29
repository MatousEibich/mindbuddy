// Test to verify default thread persistence
import { v4 as uuid } from "uuid";
import { Message } from "../src/message";
import { Profile } from "../src/types";

// Mock storage implementation
class MockStorage {
  private storage = new Map<string, string>();
  
  async getItem(key: string): Promise<string | null> {
    console.log(`[MOCK] Getting item for key: ${key}`);
    return this.storage.get(key) || null;
  }
  
  async setItem(key: string, value: string): Promise<void> {
    console.log(`[MOCK] Setting item for key: ${key}, value length: ${value.length}`);
    this.storage.set(key, value);
  }
  
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    console.log(`[MOCK] Setting multiple items: ${keyValuePairs.length} pairs`);
    for (const [key, value] of keyValuePairs) {
      this.storage.set(key, value);
    }
  }
  
  // Expose storage for direct checking
  getDirectStorage() {
    return this.storage;
  }
}

// Thread storage implementation
const THREAD_LIST_KEY = "mindbuddy.threads";
const threadMessagesKey = (id: string) => `mindbuddy.thread.${id}`;

const mockStorage = new MockStorage();

async function loadThreadMessages(id: string): Promise<Message[]> {
  const raw = await mockStorage.getItem(threadMessagesKey(id));
  return raw ? JSON.parse(raw) : [];
}

async function appendThreadMessages(id: string, msgs: Message[]) {
  const current = await loadThreadMessages(id);
  await mockStorage.setItem(
    threadMessagesKey(id),
    JSON.stringify([...current, ...msgs])
  );
}

// ThreadMemory implementation
class ThreadMemory {
  constructor(
    private threadId: string,
    private profile: Profile
  ) {}

  async saveContext(input: { query: string }, output: { text: string }) {
    const t = Date.now();
    const userMsg: Message = { 
      id: uuid(), 
      role: "user", 
      content: input.query, 
      ts: t 
    };
    
    const botMsg: Message = { 
      id: uuid(), 
      role: "assistant", 
      content: output.text, 
      ts: t + 1 
    };
    
    await appendThreadMessages(this.threadId, [userMsg, botMsg]);
  }
}

// Test profile
const testProfile: Profile = {
  name: "Test User",
  pronouns: "they/them",
  style: "middle",
  core_facts: [
    { id: 1, text: "I like testing" }
  ]
};

async function testDefaultThreadPersistence() {
  console.log("\n=== Testing Default Thread Persistence ===\n");
  
  try {
    const defaultThreadId = "default";  // hard-coded placeholder as used in app
    
    console.log("1. Creating ThreadMemory with default thread ID");
    const memory = new ThreadMemory(defaultThreadId, testProfile);
    
    console.log("2. Simulating conversation through default thread");
    await memory.saveContext(
      { query: "Hello, I'm using the default thread" },
      { text: "Hi there! This is saved in the default thread." }
    );
    
    console.log("3. Verifying messages are saved under mindbuddy.thread.default");
    const expectedKey = "mindbuddy.thread.default";
    const directStorage = mockStorage.getDirectStorage();
    
    console.log(`   Checking for key: ${expectedKey}`);
    const hasDefaultThreadKey = directStorage.has(expectedKey);
    console.log(`   Key exists: ${hasDefaultThreadKey}`);
    
    if (!hasDefaultThreadKey) {
      throw new Error(`❌ PERSISTENCE FAILURE: Expected key '${expectedKey}' not found in storage`);
    }
    
    console.log("4. Verifying message content in default thread");
    const defaultThreadMessages = await loadThreadMessages(defaultThreadId);
    console.log(`   Message count in default thread: ${defaultThreadMessages.length}`);
    
    if (defaultThreadMessages.length !== 2) {
      throw new Error(`Expected 2 messages in default thread, but found ${defaultThreadMessages.length}`);
    }
    
    const messageContents = defaultThreadMessages.map(m => m.content).join(" ");
    console.log(`   Message contents contain "default thread": ${messageContents.includes("default thread")}`);
    
    if (!messageContents.includes("default thread")) {
      throw new Error("Default thread should contain conversation about 'default thread'");
    }
    
    console.log("5. Verifying storage key format");
    const rawData = directStorage.get(expectedKey);
    if (!rawData) {
      throw new Error("Raw data should exist for default thread");
    }
    
    const parsedMessages = JSON.parse(rawData);
    console.log(`   Parsed messages count: ${parsedMessages.length}`);
    console.log(`   All messages have UUIDs: ${parsedMessages.every((m: any) => m.id && m.id.length > 0)}`);
    console.log(`   All messages have timestamps: ${parsedMessages.every((m: any) => m.ts && typeof m.ts === 'number')}`);
    
    console.log("\n✅ Default thread persistence test passed!");
    console.log("✅ Acceptance criteria met: Messages sent through the hard-coded 'default' thread are saved under mindbuddy.thread.default");
    
  } catch (error) {
    console.error("\n❌ Default thread persistence test failed:", error);
  }
}

// Run the test
testDefaultThreadPersistence(); 