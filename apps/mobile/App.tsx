// must be first import in the bundle
import "react-native-get-random-values";
import { OPENAI_API_KEY } from "@env";
import ChatApp from "@mindbuddy/ui";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAdapter, setDefaultStorage } from "@mindbuddy/core";

// Debug log function
const debug = (message: string, data?: any) => {
  const logMessage = data ? `${message}: ${JSON.stringify(data, null, 2)}` : message;
  console.log(`[APP DEBUG] ${logMessage}`);
};

// Log API key status (safely)
debug("API Key status", { 
  exists: !!OPENAI_API_KEY, 
  prefix: OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 6) : 'none',
  length: OPENAI_API_KEY?.length || 0
});

// Initialize storage first - this is essential!
const storage = new AsyncStorageAdapter(AsyncStorage);
setDefaultStorage(storage);
debug("AsyncStorage adapter initialized and set as default");

// Set up a global process object for the core package
// Provide a fallback API key in case the import fails
globalThis.process = { 
  env: { 
    OPENAI_API_KEY: OPENAI_API_KEY || 'sk-test-key-123456789'  // Use test key as fallback
  } 
} as any;

// Test direct access to OpenAI
try {
  const { ChatOpenAI } = require("@langchain/openai");
  debug("Attempting to create OpenAI instance directly");
  const testModel = new ChatOpenAI({ 
    openAIApiKey: globalThis.process.env.OPENAI_API_KEY,
    model: "gpt-4o" 
  });
  debug("OpenAI test instance created successfully");
} catch (error) {
  debug("Failed to create OpenAI test instance", { 
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
}

debug("Global process environment set", { 
  has_process: !!globalThis.process,
  has_env: !!(globalThis.process && globalThis.process.env),
  has_key: !!(globalThis.process && globalThis.process.env && globalThis.process.env.OPENAI_API_KEY),
  key_prefix: globalThis.process?.env?.OPENAI_API_KEY?.substring(0, 6)
});

export default ChatApp;
