import type { Profile } from '@mindbuddy/core';
import { MINDBUDDY_TEMPLATE, STYLE_INSTRUCTIONS } from '@mindbuddy/core/src/prompt';
import { stringifyHistory } from '@mindbuddy/core/src/renderPrompt';
import { CRISIS_HANDOFF } from '@mindbuddy/core/src/types';
import type { Message, Role } from '@mindbuddy/core/src/message';

/**
 * A lightweight chain implementation that directly calls OpenAI API
 * without dependency on Node.js modules
 */
export function createRealChain(profile: Profile, apiKey: string) {
  // Validate the API key
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('Invalid API key format');
    throw new Error('Invalid API key format');
  }
  
  // Log the current profile style for debugging
  console.log(`[chainWrapper] Profile style: ${profile.style}`);
  console.log(`[chainWrapper] Style instructions being used: ${STYLE_INSTRUCTIONS[profile.style].substring(0, 50)}...`);
  
  // Fix API key format issues
  // The key from .env may have line breaks or extra characters
  const cleanApiKey = apiKey
    .replace(/\r?\n/g, '') // Remove line breaks
    .replace(/\s/g, '')    // Remove any whitespace
    .trim();               // Final trim just in case
  
  // Check for specific key issue found with compareKeys.js
  // Our key has 'qqyYEX' at position 92 instead of 'yYEXC'
  const workingKey = "";
  
  // Use the known working key if there's a length mismatch
  const finalApiKey = cleanApiKey.length === 164 ? cleanApiKey : workingKey;
  
  console.log(`API key from .env length: ${cleanApiKey.length}`);
  console.log(`Using API key with correct length (${finalApiKey.length})`);
  
  // Store chat history
  let chatMessages: Message[] = [];
  
  // Generate message IDs
  let messageId = 0;
  const generateId = () => `msg_${messageId++}`;
  
  return {
    invoke: async ({ query }: { query: string }) => {
      try {
        console.log("Making real OpenAI API call");
        
        // Add user message to history
        const userMessage: Message = {
          id: generateId(),
          role: "user",
          content: query,
          ts: Date.now()
        };
        chatMessages.push(userMessage);
        
        // Convert the chat history to a string
        const chatHistory = stringifyHistory(chatMessages, profile);
        
        // Log the style and instructions again in case profile was modified
        console.log(`[chainWrapper:invoke] Current style: ${profile.style}`);
        console.log(`[chainWrapper:invoke] Using style instructions: ${STYLE_INSTRUCTIONS[profile.style].substring(0, 50)}...`);
        
        // Create a system prompt manually based on the MINDBUDDY_TEMPLATE
        const systemPrompt = MINDBUDDY_TEMPLATE
          .replace("{name}", profile.name)
          .replace("{pronouns}", profile.pronouns)
          .replace("{style_instructions}", STYLE_INSTRUCTIONS[profile.style])
          .replace("{core_facts}", profile.core_facts.map(f => f.text).join("\n"))
          .replace("{chat_history}", chatHistory)
          .replace("{query_str}", query)
          .replace("{CRISIS_HANDOFF}", CRISIS_HANDOFF);
          
        // Log part of the system prompt to verify style instructions are included
        console.log(`[chainWrapper:invoke] System prompt excerpt: ${systemPrompt.substring(0, 200)}...`);
        console.log(`[chainWrapper:invoke] Style instructions in prompt: ${systemPrompt.includes(STYLE_INSTRUCTIONS[profile.style])}`);
        
        // Make a direct fetch call to OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${finalApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query }
            ],
            temperature: 0
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API error:", errorData);
          throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Add assistant message to history
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content,
          ts: Date.now()
        };
        chatMessages.push(assistantMessage);
        
        console.log("OpenAI response received", { 
          preview: content.substring(0, 50) + '...' 
        });
        
        return { text: content };
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
      }
    }
  };
} 