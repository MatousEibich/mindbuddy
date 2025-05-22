// Test script to verify the storage system
import { createLogger } from "../src/utils/logger";
import { Profile } from "../src/types";
import { StorageInterface } from "../src/storage/StorageInterface";
import { LocalStorageAdapter, SimpleStorage } from "../src/storage/LocalStorageAdapter";
import { StorageMemory } from "../src/memory/StorageMemory";
import { setDefaultStorage } from "../src/storage/index";
import { v4 as uuid } from "uuid";
import { Message } from "../src/message";
import { DEBUG } from "../src/config";

// Force enable debug logging
DEBUG.ENABLED = true;

const logger = createLogger('STORAGE-TEST');

// Create a mock storage implementation
class MockStorage implements SimpleStorage {
  private storage = new Map<string, string>();
  
  getItem(key: string): string | null {
    console.log(`[MOCK-STORAGE] Getting item for key: ${key}`);
    return this.storage.get(key) || null;
  }
  
  setItem(key: string, value: string): void {
    console.log(`[MOCK-STORAGE] Setting item for key: ${key}, value length: ${value.length}`);
    this.storage.set(key, value);
  }
}

// Create a test profile
const testProfile: Profile = {
  name: "Storage Test User",
  pronouns: "they/them",
  style: "middle",
  core_facts: [
    { id: 1, text: "This is a test fact for storage" }
  ]
};

// Helper function to create a properly typed message
function createTestMessage(role: "user" | "assistant", content: string): Message {
  return {
    id: uuid(),
    role,
    content,
    ts: Date.now()
  };
}

// Main test function
async function testStorage() {
  console.log("\n[TEST] Starting storage system test");
  
  try {
    // Create our mock storage
    console.log("[TEST] Creating mock storage");
    const mockStorage = new MockStorage();
    
    // 1. Create a storage adapter with mock storage
    console.log("[TEST] Creating LocalStorageAdapter with mock storage");
    const storage = new LocalStorageAdapter(mockStorage);
    console.log("[TEST] Setting default storage");
    setDefaultStorage(storage);
    
    // 2. Save a profile
    console.log("[TEST] Saving profile");
    await storage.saveProfile(testProfile);
    
    // 3. Load the profile
    console.log("[TEST] Loading profile");
    const loadedProfile = await storage.loadProfile();
    
    if (!loadedProfile) {
      throw new Error("Failed to load profile");
    }
    
    console.log(`[TEST] Loaded profile - name: ${loadedProfile.name}`);
    
    // 4. Create a memory system
    console.log("[TEST] Creating memory system");
    const memory = new StorageMemory(storage, testProfile);
    
    // 5. Create some sample messages
    console.log("[TEST] Saving sample messages directly to storage");
    await storage.saveMessage(createTestMessage("user", "Hello, this is a direct test message"));
    await storage.saveMessage(createTestMessage("assistant", "This is a direct test response"));
    
    // 6. Now save some messages through the memory system
    console.log("[TEST] Saving messages through memory system");
    await memory.saveContext(
      { query: "This is a memory test query" },
      { text: "This is a memory test response" }
    );
    
    // 7. Load messages from memory
    console.log("[TEST] Loading chat history from memory");
    const { chat_history } = await memory.loadMemoryVariables();
    
    // Ensure we handle the case where chat_history might be undefined
    const historyText = chat_history || '';
    
    console.log(`[TEST] Chat history loaded, length: ${historyText.length}`);
    console.log(`[TEST] Chat history: ${historyText}`);
    
    // 8. Load messages directly from storage
    console.log("[TEST] Loading messages directly from storage");
    const messages = await storage.loadLastN(10);
    
    console.log(`[TEST] Loaded ${messages.length} messages from storage`);
    
    for (const msg of messages) {
      console.log(`[TEST] Message - role: ${msg.role}, content: ${msg.content}`);
    }
    
    console.log("[TEST] Storage test completed successfully!");
    return true;
  } catch (error) {
    console.error("[TEST ERROR]", error);
    return false;
  }
}

// Run the test
console.log("\nMindBuddy Storage System Test\n---------------------------");
testStorage()
  .then(success => {
    if (success) {
      console.log("\n✅ Storage tests passed successfully!\n");
    } else {
      console.log("\n❌ Storage tests failed! See logs above for details.\n");
    }
  }); 