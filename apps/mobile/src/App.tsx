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
  TouchableOpacity,
  Alert,
} from 'react-native';
import { OPENAI_API_KEY } from '@env';
// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import our real chain implementation
import { createRealChain } from './utils/chainWrapper';
import type { Profile } from '@mindbuddy/core';
// Import storage methods from core
import { AsyncStorageAdapter } from '@mindbuddy/core/src/storage/AsyncStorageAdapter';
import { setDefaultStorage, saveMessage, loadLastN } from '@mindbuddy/core/src/storage';
import type { Message as CoreMessage } from '@mindbuddy/core/src/message';
import { STORAGE } from '@mindbuddy/core/src/config';

// Import components
import ChatInput from './components/ChatInput';
import ChatMessage, { Message as AppMessage } from './components/ChatMessage';

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

// Helper functions to convert between core and app message types
const coreToAppMessage = (coreMsg: CoreMessage): AppMessage => ({
  id: coreMsg.id,
  role: coreMsg.role,
  content: coreMsg.content,
  timestamp: coreMsg.ts
});

const appToCoreMessage = (appMsg: AppMessage): CoreMessage => ({
  id: appMsg.id,
  role: appMsg.role,
  content: appMsg.content,
  ts: appMsg.timestamp
});

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

// Initialize AsyncStorage adapter
const storageAdapter = new AsyncStorageAdapter(AsyncStorage);
setDefaultStorage(storageAdapter);

// Simple ID generator
let messageIdCounter = 0;
const generateId = () => `msg_${messageIdCounter++}`;

/**
 * Main App component
 */
const App = () => {
  const [messages, setMessages] = useState<AppMessage[]>([
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

  // Initialize chain on first load and load previous messages
  useEffect(() => {
    try {
      // Create the real chain implementation
      const realChain = createRealChain(profile, cleanedApiKey);
      setChain(realChain);
      
      // Load previous messages
      (async () => {
        const coreMessages = await loadLastN(40);
        if (coreMessages && coreMessages.length > 0) {
          const appMessages = coreMessages.map(coreToAppMessage);
          setMessages(appMessages);
        }
      })();
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  }, []);

  // Clear chat history
  const clearHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to clear all chat history? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem(STORAGE.MSG_KEY);
              
              // Reset UI state
              setMessages([{
                id: generateId(),
                role: 'assistant',
                content: 'Chat history has been cleared. How can I help you today?',
                timestamp: Date.now(),
              }]);
              
              // Save the welcome message
              const welcomeMessage: CoreMessage = {
                id: generateId(),
                role: 'assistant',
                content: 'Chat history has been cleared. How can I help you today?',
                ts: Date.now(),
              };
              await saveMessage(welcomeMessage);
            } catch (error) {
              console.error("Failed to clear history:", error);
              Alert.alert("Error", "Failed to clear chat history. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: AppMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to storage
    await saveMessage(appToCoreMessage(userMessage));
    
    // Clear input
    setInput('');
    
    // Check if chain is available
    if (!chain) {
      const errorMessage: AppMessage = {
        id: generateId(),
        role: 'assistant',
        content: "I'm still getting ready. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to storage
      await saveMessage(appToCoreMessage(errorMessage));
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call the LLM chain
      const result = await chain.invoke({ query: userMessage.content });
      
      // Create bot message from response
      const botMessage: AppMessage = {
        id: generateId(),
        role: 'assistant',
        content: result.text ?? result.content ?? "",
        timestamp: Date.now(),
      };
      
      // Add bot message to chat
      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to storage
      await saveMessage(appToCoreMessage(botMessage));
    } catch (err) {
      console.error("LLM call failed", err);
      
      // Add error message
      const errorMessage: AppMessage = {
        id: generateId(),
        role: 'assistant',
        content: "Oops, something went wrong. Try again?",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to storage
      await saveMessage(appToCoreMessage(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MindBuddy</Text>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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