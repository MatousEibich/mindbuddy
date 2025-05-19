import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MINDBUDDY_TEMPLATE, STYLE_INSTRUCTIONS } from "./prompt";
import { Profile, CRISIS_HANDOFF } from "./types";
import { renderPrompt } from "./renderPrompt";

// Debug log function
const debug = (message: string, data?: any) => {
  const logMessage = data ? `${message}: ${JSON.stringify(data, null, 2)}` : message;
  console.log(`[CHAIN DEBUG] ${logMessage}`);
};

export async function buildMindBuddyChain(profile: Profile) {
  debug("Building MindBuddy chain", { profileName: profile.name });
  
  try {
    // Check if OpenAI API key is available
    debug("Checking for OpenAI API key", { 
      hasProcess: typeof process !== 'undefined',
      hasEnv: typeof process !== 'undefined' && !!process.env,
      hasKey: typeof process !== 'undefined' && !!process.env.OPENAI_API_KEY,
      keyPrefix: typeof process !== 'undefined' && process.env.OPENAI_API_KEY ? 
        process.env.OPENAI_API_KEY.substring(0, 7) : undefined
    });
    
    const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });
    debug("ChatOpenAI initialized");
    
    const outputParser = new StringOutputParser();
    
    // Use standard memory
    const memory = {
      loadMemoryVariables: async () => {
        try {
          // Import dynamically to avoid circular dependencies
          const { loadLastN } = await import("./storage");
          const messages = await loadLastN(20);
          debug("Loaded messages from storage", { count: messages.length });
          
          // Convert to string
          const historyString = messages.map(m => 
            `${m.role === "user" ? profile.name || "User" : "MindBuddy"}: ${m.content}`
          ).join('\n');
          
          debug("Constructed chat history", { 
            historyLength: historyString.length,
            messageCount: messages.length,
            historyPreview: historyString.substring(0, 100) + "..."
          });
          
          return { chat_history: historyString };
        } catch (error) {
          debug("Error loading memory variables", { error: String(error) });
          return { chat_history: "" };
        }
      },
      
      saveContext: async (input: { query: string }, output: { text: string }) => {
        try {
          // Import dynamically to avoid circular dependencies
          const { saveMessage } = await import("./storage");
          const { v4: uuid } = await import("uuid");
          
          const t = Date.now();
          debug("Saving context", { input: input.query, output: output.text });
          
          await saveMessage({ 
            id: uuid(), 
            role: "user", 
            content: input.query, 
            ts: t 
          });
          
          await saveMessage({ 
            id: uuid(), 
            role: "assistant", 
            content: output.text, 
            ts: t + 1 
          });
          
          debug("Context saved successfully");
        } catch (error) {
          debug("Error saving context", { error: String(error) });
        }
      }
    };
    
    debug("Memory handler created");

    // Create a custom formatter that uses renderPrompt
    const promptFormatter = (inputs: any) => {
      const { query, chat_history } = inputs;
      
      debug("Formatting prompt with inputs", { 
        query_length: query?.length || 0,
        chat_history_length: chat_history?.length || 0,
        profile_name: profile.name
      });
      
      // Format the complete prompt with all required variables
      const formattedPrompt = {
        ...profile,
        style_instructions: STYLE_INSTRUCTIONS[profile.style],
        core_facts: profile.core_facts.map(f => f.text).join("\n"),
        chat_history: chat_history || "",
        query_str: query,
        CRISIS_HANDOFF
      };
      
      debug("Formatted prompt variables", {
        name: formattedPrompt.name,
        style: profile.style,
        has_style_instructions: !!formattedPrompt.style_instructions,
        core_facts_count: profile.core_facts.length
      });
      
      return formattedPrompt;
    };

    // Create the prompt template
    const prompt = PromptTemplate.fromTemplate(MINDBUDDY_TEMPLATE);
    debug("Prompt template created");
    
    // Log the template for debugging
    debug("Using prompt template:", { template: MINDBUDDY_TEMPLATE.substring(0, 200) + "..." });

    const chain = RunnableSequence.from([
      {
        query: (input) => {
          debug("Processing input query", { query: input.query });
          return input.query;
        },
        chat_history: async () => {
          debug("Loading chat history from memory");
          const { chat_history } = await memory.loadMemoryVariables();
          debug("Chat history loaded", { 
            historyLength: chat_history?.length || 0,
            historyPreview: chat_history?.substring(0, 100) || "empty"
          });
          return chat_history;
        }
      },
      promptFormatter,
      prompt,
      llm,
      outputParser
    ]);
    
    debug("Chain sequence created");

    // Wrap the chain with custom invoke to handle memory saving
    const chainWithMemory = {
      invoke: async (input: { query: string }) => {
        debug("Chain invoke called", { query: input.query });
        try {
          debug("Calling LLM chain");
          const result = await chain.invoke(input);
          debug("LLM response received", { result: result.substring(0, 100) + '...' });
          
          debug("Saving context to memory");
          await memory.saveContext(input, { text: result });
          
          return { text: result };
        } catch (error) {
          debug("Error in chain invoke", { 
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          throw error;
        }
      }
    };

    debug("Chain with memory created successfully");
    return chainWithMemory;
  } catch (error) {
    debug("Error building MindBuddy chain", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
} 