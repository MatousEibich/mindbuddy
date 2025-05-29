import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  LogBox
} from 'react-native';
import type { Profile } from '../../core/src/types';
// Import the real chain instead of the mobile-friendly mock
import { buildMindBuddyChain } from '../../core/src/chain';
import { getDefaultStorage } from '../../core/src/storage';

// Declare global process for React Native
declare global {
  interface Window {
    process?: {
      env?: {
        OPENAI_API_KEY?: string;
      };
    };
  }
  
  var process: {
    env: {
      OPENAI_API_KEY?: string;
    };
  };
}

// Disable specific warnings for development
LogBox.ignoreLogs(['Require cycle:']);

// Sample profile matching profile.json
const defaultProfile: Profile = {
  name: "Matouš",
  pronouns: "he/him",
  style: "neil",
  core_facts: [
    { id: 1, text: "I'm currently doing a mesocycle with calisthenics." },
    { id: 2, text: "I've got a dog named Rosie, she's the best." },
  ],
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Debug log function
const debug = (message: string, data?: any) => {
  const logMessage = data ? `${message}: ${JSON.stringify(data, null, 2)}` : message;
  console.log(`[MINDBUDDY DEBUG] ${logMessage}`);
};

const ChatApp = () => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const chainRef = useRef<any>(null);
  const flatListRef = useRef<FlatList | null>(null);

  // Add a debug state to track chain initialization
  const [chainStatus, setChainStatus] = useState<'initializing' | 'success' | 'error'>('initializing');

  // First useEffect - load profile from storage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        debug("Loading profile from storage");
        const storage = getDefaultStorage();
        const storedProfile = await storage.loadProfile();
        
        if (storedProfile) {
          debug("Profile loaded from storage", { name: storedProfile.name });
          setProfile(storedProfile);
        } else {
          debug("No profile found in storage, using default");
          setProfile(defaultProfile);
          // Save default profile to storage
          await storage.saveProfile(defaultProfile);
        }
      } catch (error) {
        debug("Error loading profile", { 
          error: error instanceof Error ? error.message : String(error) 
        });
        setProfile(defaultProfile);
      }
    };
    
    loadProfile();
  }, []);

  // Second useEffect - initialize chain when profile is loaded
  useEffect(() => {
    if (!profile) return;
    
    // Initialize real chain
    debug("Creating mind buddy chain", { profileName: profile.name });
    
    // Verify process.env is available using type guards
    const hasProcess = typeof globalThis !== 'undefined' && !!globalThis.process;
    const hasEnv = hasProcess && !!globalThis.process.env;
    const apiKey = hasEnv ? globalThis.process.env.OPENAI_API_KEY : undefined;
    const keyPrefix = apiKey ? apiKey.substring(0, 5) : 'none';
    
    debug("Checking process.env", {
      hasProcess,
      hasEnv,
      hasKey: !!apiKey,
      keyPrefix
    });

    const threadId = "default";            // hard-coded placeholder
    buildMindBuddyChain(profile, threadId)
      .then((chain: any) => {
        chainRef.current = chain;
        setChainStatus('success');
        debug("Chain initialized successfully", { 
          hasInvoke: typeof chain.invoke === 'function'
        });
      })
      .catch((error: any) => {
        setChainStatus('error');
        debug("Chain initialization failed", { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      });
  }, [profile]);

  const sendMessage = async () => {
    if (!text.trim() || !profile) return;

    debug("Sending message", { text });
    
    // Create unique ID for this message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    // Add user message to UI
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const userInput = text;
    setText('');
    setIsLoading(true);
    
    try {
      debug("Checking chain reference", { 
        chainInitialized: !!chainRef.current,
        chainStatus
      });
      
      if (!chainRef.current) {
        debug("Chain reference is null or undefined");
        throw new Error("Chat system not initialized");
      }
      
      debug("Calling chain.invoke with query", { query: userInput });
      const response = await chainRef.current.invoke({ query: userInput });
      debug("Received response from chain", { response });
      
      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
      };
      
      debug("Adding assistant message to UI", { content: response.text });
      
      // Add bot message to UI
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      debug("Error in sendMessage", { 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Fallback response in case of error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that message. Please try again.",
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading indicator if profile is not loaded yet
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Hey {profile.name}, I'm here for you! What's on your mind?
        </Text>
        {chainStatus === 'error' && (
          <Text style={styles.errorText}>
            Error initializing AI. Please check your connection.
          </Text>
        )}
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item?.id || String(Date.now() + Math.random())}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            if (!item) return null;
            
            return (
              <View style={[
                styles.messageBubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble
              ]}>
                <Text style={styles.messageText}>{item.content || ''}</Text>
              </View>
            );
          }}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>MindBuddy is thinking...</Text>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type here..."
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !text.trim() && styles.disabledButton]}
            onPress={sendMessage}
            disabled={!text.trim() || isLoading || chainStatus === 'error'}
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
    backgroundColor: '#fff',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#e1f5fe',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  loadingContainer: {
    padding: 8,
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatApp; 