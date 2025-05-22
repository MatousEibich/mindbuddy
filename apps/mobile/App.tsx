import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { OPENAI_API_KEY } from '@env';
// Import our real chain implementation
import { createRealChain } from './chainWrapper';
import type { Profile } from '@mindbuddy/core';

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
// Use the cleaned API key
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

// Log profile data for verification
console.log(`[App] Loaded profile: Name=${profile.name}, Style=${profile.style}`);
console.log(`[App] Core facts count: ${profile.core_facts.length}`);

// Simple ID generator
let messageIdCounter = 0;
const generateId = () => `msg_${messageIdCounter++}`;

// Message type definition
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

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

  // Optional: Add validation and warning for API key
  useEffect(() => {
    if (!cleanedApiKey || !cleanedApiKey.startsWith("sk-")) {
      console.warn("Missing or invalid OpenAI key.");
      // Optionally show UI alert
    } else {
      console.log("OpenAI API key loaded successfully:", cleanedApiKey.substring(0, 5) + '...');
      console.log("process.env.OPENAI_API_KEY:", process.env.OPENAI_API_KEY?.substring(0, 5) + '...');
    }
  }, []);

  // Initialize chain on first load
  useEffect(() => {
    try {
      console.log("Initializing OpenAI chain...");
      
      // Create the real chain implementation
      const realChain = createRealChain(profile, cleanedApiKey);
      console.log("✅ OpenAI chain initialized");
      setChain(realChain);
    } catch (error) {
      console.error("❌ Chain initialization failed:", error);
      // No fallback now, just show an error message in the UI when sending a message
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
      console.warn("Chain not initialized yet");
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
      console.warn("LLM call failed", err);
      
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
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.role === 'user' ? styles.userText : styles.aiText
              ]}>
                {msg.content}
              </Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4a69bd" />
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.disabledButton]} 
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
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
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#4a69bd',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#e9e9e9',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#4a69bd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
});

export default App;
