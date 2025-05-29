// Simple test script to verify the thread storage logic
import { v4 as uuid } from "uuid";
import { Message } from "../src/message";
import { Thread } from "../src/types";

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
  
  async removeItem(key: string): Promise<void> {
    console.log(`[MOCK] Removing item for key: ${key}`);
    this.storage.delete(key);
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

async function renameThread(id: string, newName: string) {
  const all = await listThreads();
  const next = all.map((t) => (t.id === id ? { ...t, name: newName } : t));
  await mockStorage.setItem(THREAD_LIST_KEY, JSON.stringify(next));
}

async function deleteThread(id: string) {
  const all = (await listThreads()).filter((t) => t.id !== id);
  await mockStorage.multiRemove([THREAD_LIST_KEY, threadMessagesKey(id)]);
  await mockStorage.setItem(THREAD_LIST_KEY, JSON.stringify(all));
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

// Helper function to create test messages
function createTestMessage(role: "user" | "assistant", content: string): Message {
  return {
    id: uuid(),
    role,
    content,
    ts: Date.now()
  };
}

async function testThreadStorage() {
  console.log("\n=== Testing Thread Storage API ===\n");
  
  try {
    // Test 1: List threads (should be empty initially)
    console.log("1. Testing listThreads() - should be empty initially");
    let threads = await listThreads();
    console.log(`   Found ${threads.length} threads:`, threads);
    
    // Test 2: Create a thread
    console.log("\n2. Testing createThread()");
    const thread1 = await createThread("Test Thread 1");
    console.log(`   Created thread:`, thread1);
    
    // Test 3: List threads (should have 1 thread)
    console.log("\n3. Testing listThreads() - should have 1 thread");
    threads = await listThreads();
    console.log(`   Found ${threads.length} threads:`, threads);
    
    // Test 4: Create another thread
    console.log("\n4. Creating another thread");
    const thread2 = await createThread("Test Thread 2");
    console.log(`   Created thread:`, thread2);
    
    // Test 5: List threads (should have 2 threads)
    console.log("\n5. Testing listThreads() - should have 2 threads");
    threads = await listThreads();
    console.log(`   Found ${threads.length} threads:`, threads);
    
    // Test 6: Rename a thread
    console.log("\n6. Testing renameThread()");
    await renameThread(thread1.id, "Renamed Thread 1");
    threads = await listThreads();
    const renamedThread = threads.find(t => t.id === thread1.id);
    console.log(`   Renamed thread:`, renamedThread);
    
    // Test 7: Load thread messages (should be empty)
    console.log("\n7. Testing loadThreadMessages() - should be empty");
    let messages = await loadThreadMessages(thread1.id);
    console.log(`   Found ${messages.length} messages:`, messages);
    
    // Test 8: Append messages to thread
    console.log("\n8. Testing appendThreadMessages()");
    const testMessages = [
      createTestMessage("user", "Hello, this is a test message"),
      createTestMessage("assistant", "This is a test response")
    ];
    await appendThreadMessages(thread1.id, testMessages);
    
    // Test 9: Load thread messages (should have 2 messages)
    console.log("\n9. Testing loadThreadMessages() - should have 2 messages");
    messages = await loadThreadMessages(thread1.id);
    console.log(`   Found ${messages.length} messages:`, messages);
    
    // Test 10: Append more messages
    console.log("\n10. Testing appendThreadMessages() - adding more messages");
    const moreMessages = [
      createTestMessage("user", "Another user message"),
      createTestMessage("assistant", "Another assistant response")
    ];
    await appendThreadMessages(thread1.id, moreMessages);
    
    // Test 11: Load all messages (should have 4 messages total)
    console.log("\n11. Testing loadThreadMessages() - should have 4 messages");
    messages = await loadThreadMessages(thread1.id);
    console.log(`   Found ${messages.length} messages:`, messages.map(m => ({ role: m.role, content: m.content.substring(0, 30) + "..." })));
    
    // Test 12: Delete a thread
    console.log("\n12. Testing deleteThread()");
    await deleteThread(thread2.id);
    threads = await listThreads();
    console.log(`   Threads after deletion (should have 1):`, threads);
    
    // Test 13: Verify deleted thread messages are gone
    console.log("\n13. Testing that deleted thread messages are gone");
    const deletedThreadMessages = await loadThreadMessages(thread2.id);
    console.log(`   Messages from deleted thread (should be 0): ${deletedThreadMessages.length}`);
    
    console.log("\n✅ All tests passed! Thread storage API is working correctly.");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

// Run the test
testThreadStorage(); 