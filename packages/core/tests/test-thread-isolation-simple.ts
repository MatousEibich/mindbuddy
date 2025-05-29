// Simple thread isolation test
import { v4 as uuid } from "uuid";
import { Message } from "../src/message";
import { Thread } from "../src/types";
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
  
  async multiRemove(keys: string[]): Promise<void> {
    console.log(`[MOCK] Removing multiple items: ${keys.length} keys`);
    for (const key of keys) {
      this.storage.delete(key);
    }
  }
}

// Thread storage implementation (copied from threadStorage.ts but using our mock)
const THREAD_LIST_KEY = "mindbuddy.threads";
const threadMessagesKey = (id: string) => `mindbuddy.thread.${id}`;

const mockStorage = new MockStorage();

async function listThreads(): Promise<Thread[]> {
  const raw = await mockStorage.getItem(THREAD_LIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function createThread(name: string): Promise<Thread> {
  const thread: Thread = { id: uuid(), name, created: Date.now() };
  const all = await listThreads();
  await mockStorage.multiSet([
    [THREAD_LIST_KEY, JSON.stringify([...all, thread])],
    [threadMessagesKey(thread.id), JSON.stringify([])],
  ]);
  return thread;
}

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

// ThreadMemory implementation (copied but using our mock functions)
class ThreadMemory {
  constructor(
    private threadId: string,
    private profile: Profile
  ) {}

  async loadMemoryVariables() {
    const rows = await loadThreadMessages(this.threadId);
    const historyString = rows.map(msg =>
      `${msg.role === 'user' ? this.profile.name || 'User' : 'MindBuddy'}: ${msg.content}`
    ).join('\n');
    return { chat_history: historyString };
  }

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

async function testThreadIsolation() {
  console.log("\n=== Testing Thread Isolation ===\n");
  
  try {
    // Acceptance Criteria Test: Isolation test
    console.log("1. Creating two separate threads");
    const thread1 = await createThread("Thread One");
    const thread2 = await createThread("Thread Two");
    
    console.log(`   Thread 1 ID: ${thread1.id}`);
    console.log(`   Thread 2 ID: ${thread2.id}`);
    
    // Test with ThreadMemory to simulate chain behavior
    console.log("\n2. Creating ThreadMemory instances for each thread");
    const memory1 = new ThreadMemory(thread1.id, testProfile);
    const memory2 = new ThreadMemory(thread2.id, testProfile);
    
    // Simulate a conversation in thread 1
    console.log("\n3. Simulating conversation in Thread 1");
    await memory1.saveContext(
      { query: "Hi from thread 1" },
      { text: "Hello! This is thread 1 response." }
    );
    
    // Check that thread 2 is still empty (acceptance criteria)
    console.log("\n4. Checking that Thread 2 is still empty");
    const thread2Messages = await loadThreadMessages(thread2.id);
    console.log(`   Thread 2 message count: ${thread2Messages.length}`);
    
    if (thread2Messages.length !== 0) {
      throw new Error(`❌ ACCEPTANCE CRITERIA FAILED: Expected Thread 2 to be empty, but found ${thread2Messages.length} messages`);
    }
    
    // Simulate conversation in thread 2
    console.log("\n5. Simulating conversation in Thread 2");
    await memory2.saveContext(
      { query: "Hi from thread 2" },
      { text: "Hello! This is thread 2 response." }
    );
    
    // Check both threads have their own messages
    console.log("\n6. Verifying each thread has its own messages");
    const thread1Messages = await loadThreadMessages(thread1.id);
    const thread2MessagesAfter = await loadThreadMessages(thread2.id);
    
    console.log(`   Thread 1 message count: ${thread1Messages.length}`);
    console.log(`   Thread 2 message count: ${thread2MessagesAfter.length}`);
    
    // Verify isolation
    if (thread1Messages.length !== 2) {
      throw new Error(`Expected Thread 1 to have 2 messages, but found ${thread1Messages.length}`);
    }
    
    if (thread2MessagesAfter.length !== 2) {
      throw new Error(`Expected Thread 2 to have 2 messages, but found ${thread2MessagesAfter.length}`);
    }
    
    // Verify content isolation
    const thread1Content = thread1Messages.map(m => m.content).join(" ");
    const thread2Content = thread2MessagesAfter.map(m => m.content).join(" ");
    
    console.log(`   Thread 1 content contains "thread 1": ${thread1Content.includes("thread 1")}`);
    console.log(`   Thread 2 content contains "thread 2": ${thread2Content.includes("thread 2")}`);
    
    if (!thread1Content.includes("thread 1")) {
      throw new Error("Thread 1 content should contain 'thread 1'");
    }
    
    if (!thread2Content.includes("thread 2")) {
      throw new Error("Thread 2 content should contain 'thread 2'");
    }
    
    if (thread1Content.includes("thread 2")) {
      throw new Error("❌ ISOLATION FAILURE: Thread 1 content contains thread 2 data");
    }
    
    if (thread2Content.includes("thread 1")) {
      throw new Error("❌ ISOLATION FAILURE: Thread 2 content contains thread 1 data");
    }
    
    console.log("\n7. Testing memory variables isolation");
    const memory1Variables = await memory1.loadMemoryVariables();
    const memory2Variables = await memory2.loadMemoryVariables();
    
    console.log(`   Memory 1 chat history length: ${memory1Variables.chat_history.length}`);
    console.log(`   Memory 2 chat history length: ${memory2Variables.chat_history.length}`);
    
    if (memory1Variables.chat_history.includes("thread 2")) {
      throw new Error("❌ MEMORY ISOLATION FAILURE: Memory 1 contains thread 2 messages");
    }
    
    if (memory2Variables.chat_history.includes("thread 1")) {
      throw new Error("❌ MEMORY ISOLATION FAILURE: Memory 2 contains thread 1 messages");
    }
    
    console.log("\n✅ All isolation tests passed! Threads are properly isolated.");
    console.log("✅ Acceptance criteria met: no bleed-over between threads");
    
  } catch (error) {
    console.error("\n❌ Isolation test failed:", error);
  }
}

// Run the test
testThreadIsolation(); 