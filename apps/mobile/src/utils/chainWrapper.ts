import type { Profile } from '@mindbuddy/core';
import { MINDBUDDY_TEMPLATE, STYLE_INSTRUCTIONS } from '@mindbuddy/core/src/prompt';
import { stringifyHistory } from '@mindbuddy/core/src/renderPrompt';
import { CRISIS_HANDOFF } from '@mindbuddy/core/src/types';
import type { Message } from '@mindbuddy/core/src/message';
import { loadThreadMessages, appendThreadMessages } from '@mindbuddy/core/src/threadStorage';

// Simple ID generator for React Native (avoiding Node.js crypto)
let messageIdCounter = 0;
const generateId = () => `msg_mobile_${Date.now()}_${messageIdCounter++}`;

/**
 * A lightweight chain implementation that directly calls OpenAI API
 * and uses thread storage for persistence
 */
export function createRealChain(profile: Profile, apiKey: string, threadId: string = "default") {
  // Validate the API key
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('Invalid API key format');
  }
  
  // Fix API key format issues that might come from .env
  const cleanApiKey = apiKey
    .replace(/\r?\n/g, '') // Remove line breaks
    .replace(/\s/g, '')    // Remove any whitespace
    .trim();               // Final trim just in case
  
  return {
    invoke: async ({ query }: { query: string }) => {
      try {
        // Load existing chat history from thread storage
        const chatMessages = await loadThreadMessages(threadId);
        
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
        
        // Create user and assistant messages
        const t = Date.now();
        const userMessage: Message = {
          id: generateId(),
          role: "user",
          content: query,
          ts: t
        };
        
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content,
          ts: t + 1
        };
        
        // Save both messages to thread storage
        await appendThreadMessages(threadId, [userMessage, assistantMessage]);
        
        return { text: content };
      } catch (error) {
        throw error;
      }
    }
  };
} 