import type { Profile } from '../../core/src/types';

/**
 * A simple mock implementation of the buildMindBuddyChain function
 * that doesn't rely on Node.js-specific APIs like crypto
 */
export function buildMobileFriendlyChain(profile: Profile) {
  // Create a simple mock chain
  return {
    invoke: async ({ query }: { query: string }) => {
      // Generate a basic response based on the query
      let response = "";
      
      // Add some simple patterns to make responses more dynamic
      if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
        response = `Hello ${profile.name}! How can I help you today?`;
      } else if (query.toLowerCase().includes('how are you')) {
        response = "I'm here and ready to chat with you. What's on your mind?";
      } else if (query.toLowerCase().includes('feeling')) {
        response = "It sounds like you're experiencing some emotions. Would you like to talk more about that?";
      } else if (query.toLowerCase().includes('help')) {
        response = "I'm here to listen and chat. What's going on with you?";
      } else {
        response = `I hear what you're saying about "${query}". Would you like to tell me more?`;
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { text: response };
    }
  };
} 