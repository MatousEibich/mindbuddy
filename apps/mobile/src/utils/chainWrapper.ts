import type { Profile } from '@mindbuddy/core';
import { MINDBUDDY_TEMPLATE, STYLE_INSTRUCTIONS } from '@mindbuddy/core/src/prompt';
import { stringifyHistory } from '@mindbuddy/core/src/renderPrompt';
import { CRISIS_HANDOFF } from '@mindbuddy/core/src/types';
import type { Message } from '@mindbuddy/core/src/message';

/**
 * A lightweight chain implementation that directly calls OpenAI API
 * without dependency on Node.js modules
 */
export function createRealChain(profile: Profile, apiKey: string) {
  // Validate the API key
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('Invalid API key format');
  }
  
  // Fix API key format issues that might come from .env
  const cleanApiKey = apiKey
    .replace(/\r?\n/g, '') // Remove line breaks
    .replace(/\s/g, '')    // Remove any whitespace
    .trim();               // Final trim just in case
  
  // Store chat history
  let chatMessages: Message[] = [];
  
  // Generate message IDs
  let messageId = 0;
  const generateId = () => `msg_${messageId++}`;
  
  return {
    invoke: async ({ query }: { query: string }) => {
      try {
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
        
        // Create a system prompt manually based on the MINDBUDDY_TEMPLATE
        const systemPrompt = MINDBUDDY_TEMPLATE
          .replace("{name}", profile.name)
          .replace("{pronouns}", profile.pronouns)
          .replace("{style_instructions}", STYLE_INSTRUCTIONS[profile.style])
          .replace("{core_facts}", profile.core_facts.map(f => f.text).join("\n"))
          .replace("{chat_history}", chatHistory)
          .replace("{query_str}", query)
          .replace("{CRISIS_HANDOFF}", CRISIS_HANDOFF);
        
        // Make a direct fetch call to OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanApiKey}`
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
        
        return { text: content };
      } catch (error) {
        throw error;
      }
    }
  };
} 