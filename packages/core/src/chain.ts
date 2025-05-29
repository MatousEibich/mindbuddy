import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MINDBUDDY_TEMPLATE, STYLE_INSTRUCTIONS } from "./prompt";
import { Profile, CRISIS_HANDOFF } from "./types";
import { createLogger } from "./utils/logger";
import { LLM } from "./config";
import { ThreadMemory } from "./memory";

const logger = createLogger('CHAIN');

export async function buildMindBuddyChain(profile: Profile, threadId: string) {
  logger.debug("Building MindBuddy chain", { 
    profileName: profile.name, 
    threadId 
  });
  
  try {
    // Check if OpenAI API key is available
    logger.debug("Checking for OpenAI API key", { 
      hasProcess: typeof process !== 'undefined',
      hasEnv: typeof process !== 'undefined' && !!process.env,
      hasKey: typeof process !== 'undefined' && !!process.env.OPENAI_API_KEY,
      keyPrefix: typeof process !== 'undefined' && process.env.OPENAI_API_KEY ? 
        process.env.OPENAI_API_KEY.substring(0, 7) : undefined
    });
    
    // Initialize the LLM
    const llm = new ChatOpenAI({ 
      model: LLM.DEFAULT_MODEL, 
      temperature: LLM.DEFAULT_TEMPERATURE 
    });
    logger.debug("ChatOpenAI initialized");
    
    const outputParser = new StringOutputParser();
    
    // Initialize thread-specific memory
    const memory = new ThreadMemory(threadId, profile);
    logger.debug("ThreadMemory initialized", { threadId });

    // Create a custom formatter for the prompt
    const promptFormatter = (inputs: any) => {
      const { query, chat_history } = inputs;
      
      logger.debug("Formatting prompt with inputs", { 
        query_length: query?.length || 0,
        chat_history_length: chat_history?.length || 0,
        profile_name: profile.name,
        threadId
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
      
      logger.debug("Formatted prompt variables", {
        name: formattedPrompt.name,
        style: profile.style,
        has_style_instructions: !!formattedPrompt.style_instructions,
        core_facts_count: profile.core_facts.length,
        threadId
      });
      
      return formattedPrompt;
    };

    // Create the prompt template
    const prompt = PromptTemplate.fromTemplate(MINDBUDDY_TEMPLATE);
    logger.debug("Prompt template created");
    
    // Log the template for debugging
    logger.debug("Using prompt template:", { template: MINDBUDDY_TEMPLATE.substring(0, 200) + "..." });

    const chain = RunnableSequence.from([
      {
        query: (input) => {
          logger.debug("Processing input query", { query: input.query, threadId });
          return input.query;
        },
        chat_history: async () => {
          logger.debug("Loading chat history from thread memory", { threadId });
          const { chat_history } = await memory.loadMemoryVariables();
          logger.debug("Chat history loaded from thread", { 
            historyLength: chat_history?.length || 0,
            historyPreview: chat_history?.substring(0, 100) || "empty",
            threadId
          });
          return chat_history;
        }
      },
      promptFormatter,
      prompt,
      llm,
      outputParser
    ]);
    
    logger.debug("Chain sequence created for thread", { threadId });

    // Wrap the chain with custom invoke to handle memory saving
    const chainWithMemory = {
      invoke: async (input: { query: string }) => {
        logger.debug("Chain invoke called", { query: input.query, threadId });
        try {
          logger.debug("Calling LLM chain for thread", { threadId });
          const result = await chain.invoke(input);
          logger.debug("LLM response received for thread", { 
            result: result.substring(0, 100) + '...', 
            threadId 
          });
          
          logger.debug("Saving context to thread memory", { threadId });
          await memory.saveContext(input, { text: result });
          
          return { text: result };
        } catch (error) {
          logger.error("Error in chain invoke for thread", { error, threadId });
          throw error;
        }
      }
    };

    logger.debug("Chain with memory created successfully for thread", { threadId });
    return chainWithMemory;
  } catch (error) {
    logger.error("Error building MindBuddy chain for thread", { error, threadId });
    throw error;
  }
} 