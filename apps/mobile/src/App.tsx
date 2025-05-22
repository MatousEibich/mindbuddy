import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { OPENAI_API_KEY } from '@env';
// Import our real chain implementation
import { createRealChain } from './utils/chainWrapper';
import type { Profile } from '@mindbuddy/core';

// Import components
import ChatInput from './components/ChatInput';
import ChatMessage, { Message } from './components/ChatMessage';

// Import profile from the core package
import profileData from '@mindbuddy/core/src/profile.json';

// Helper function to clean the API key
function cleanApiKey(key: string): string {
  if (!key) return '';
  return key
    .replace(/\r?\n/g, '') // Remove line breaks
    .replace(/\s/g, '')    // Remove any whitespace
    .trim();               // Final trim just in case
}

// Configure global process.env shim for compatibility with the core package
const cleanedApiKey = cleanApiKey(OPENAI_API_KEY);
globalThis.process = {
  env: {
    OPENAI_API_KEY: cleanedApiKey,
  },
} as any;

// Use the imported profile data
const profile: Profile = {
  ...profileData,
  style: profileData.style as "mom" | "middle" | "neil"
};

// Simple ID generator
let messageIdCounter = 0;
const generateId = () => `msg_${messageIdCounter++}`;

/**
 * Main App component
 */
const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: 'Welcome to MindBuddy! How can I help you today?',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [chain, setChain] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize chain on first load
  useEffect(() => {
    try {
      // Create the real chain implementation
      const realChain = createRealChain(profile, cleanedApiKey);
      setChain(realChain);
    } catch (error) {
      console.error("Chain initialization failed:", error);
    }
  }, []);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    
    // Check if chain is available
    if (!chain) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: "I'm still getting ready. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call the LLM chain
      const result = await chain.invoke({ query: userMessage.content });
      
      // Create bot message from response
      const botMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: result.text ?? result.content ?? "",
        timestamp: Date.now(),
      };
      
      // Add bot message to chat
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("LLM call failed", err);
      
      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: "Oops, something went wrong. Try again?",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MindBuddy</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.messageContainer}
      >
        <ScrollView style={styles.messageList}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4a69bd" />
            </View>
          )}
        </ScrollView>
        
        <ChatInput
          value={input}
          onChangeText={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a69bd',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
});

export default App; 