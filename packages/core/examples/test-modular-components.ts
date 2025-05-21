// Test script to verify our modular components work correctly
import { Profile } from "../dist/types";
import { 
  LocalStorageAdapter, 
  setDefaultStorage,
  StorageMemory,
  createLogger,
  STORAGE
} from "../dist";

// Create a mock localStorage for testing in Node
const mockLocalStorage = {
  storage: new Map<string, string>(),
  getItem(key: string) {
    return this.storage.get(key) || null;
  },
  setItem(key: string, value: string) {
    this.storage.set(key, value);
  },
  clear() {
    this.storage.clear();
  }
};

// Set up logger
const logger = createLogger('TEST');

// Sample profile matching the default in apps/web/public/profile.json
const profile: Profile = {
  name: "Matouš",
  pronouns: "he/him",
  style: "neil",
  core_facts: [
    { id: 1, text: "I'm currently doing a mesocycle with calisthenics." },
    { id: 2, text: "I've got a dog named Rosie, she's the best." },
  ],
};

// Test our modular components
async function testModularComponents() {
  try {
    logger.info("Starting modular components test");
    
    // Step 1: Create and initialize localStorage adapter
    logger.info("Step 1: Testing storage adapter");
    const storageAdapter = new LocalStorageAdapter(mockLocalStorage);
    setDefaultStorage(storageAdapter);
    logger.info("Storage adapter initialized successfully");
    
    // Step 2: Test saving profile
    logger.info("Step 2: Testing profile save");
    await storageAdapter.saveProfile(profile);
    logger.info("Profile saved successfully");
    
    // Step 3: Test loading profile
    logger.info("Step 3: Testing profile load");
    const loadedProfile = await storageAdapter.loadProfile();
    
    if (!loadedProfile) {
      throw new Error("Failed to load profile");
    }
    
    logger.info(`Profile loaded successfully: ${loadedProfile.name}`);
    
    // Step 4: Test memory with storage
    logger.info("Step 4: Testing memory with storage");
    const memory = new StorageMemory(storageAdapter, profile);
    
    // Step 5: Test saving messages
    logger.info("Step 5: Testing message storage");
    
    // Sample conversation
    const messages = [
      { role: "user", content: "Hello there!" },
      { role: "assistant", content: "Hi! How can I help you today?" },
      { role: "user", content: "I'm just testing the modular components." }
    ];
    
    // Save messages to storage
    for (const msg of messages) {
      await memory.saveContext(
        { query: msg.role === "user" ? msg.content : "" },
        { text: msg.role === "assistant" ? msg.content : "" }
      );
    }
    
    logger.info("Messages saved successfully");
    
    // Step 6: Test loading messages
    logger.info("Step 6: Testing message loading");
    const vars = await memory.loadMemoryVariables();
    logger.info("Memory variables loaded successfully");
    logger.info(`Chat history: ${vars.chat_history.substring(0, 100)}...`);
    
    // Step 7: Test loading messages directly from storage
    logger.info("Step 7: Testing direct message loading from storage");
    const directMessages = await storageAdapter.loadLastN(STORAGE.DEFAULT_LOAD_COUNT);
    logger.info(`Loaded ${directMessages.length} messages directly from storage`);
    
    // Success!
    logger.info("All tests passed successfully!");
    return true;
  } catch (error) {
    logger.error("Test failed", error);
    return false;
  }
}

// Main function to run the tests
async function main() {
  console.log("\nMindBuddy Modular Components Test\n------------------------------");
  
  const success = await testModularComponents();
  
  if (success) {
    console.log("\n✅ All tests passed! The modular components are working correctly.\n");
  } else {
    console.log("\n❌ Tests failed. See error messages above for details.\n");
  }
}

// Run the tests
main(); 