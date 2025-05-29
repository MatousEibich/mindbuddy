import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
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
import { setDefaultStorage, saveMessage, loadLastN, loadProfile } from '@mindbuddy/core/src/storage';
import { loadThreadMessages } from '@mindbuddy/core';
import type { Message as CoreMessage } from '@mindbuddy/core/src/message';
import { STORAGE } from '@mindbuddy/core/src/config';

// Import components
import ChatInput from './components/ChatInput';
import ChatMessage, { Message as AppMessage } from './components/ChatMessage';

// Import React Navigation components
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import screens
import SettingsScreen from './screens/SettingsScreen';
import ThreadsScreen from './screens/ThreadsScreen';

// Import profile from the core package
import profileData from '@mindbuddy/core/src/profile.json';

// Define stack navigator type
type RootStackParamList = {
  Threads: undefined;
  Chat: { threadId: string; threadName: string };
  Settings: undefined;
};

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
  route: { params: { threadId: string; threadName: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
 * Chat Screen Component
 */
const ChatScreen = ({ navigation, route }: ChatScreenProps) => {
  const { threadId, threadName } = route.params;
  
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [input, setInput] = useState('');
  const [chain, setChain] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to end when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Reload profile and rebuild chain when screen comes into focus or threadId changes
  useFocusEffect(
    useCallback(() => {
      async function refreshProfile() {
        try {
          const loadedProfile = await loadProfile();
          if (loadedProfile) {
            setProfile(loadedProfile);
            const realChain = createRealChain(loadedProfile, cleanedApiKey, threadId);
            setChain(realChain);
          }
        } catch (error) {
          console.error("Failed to refresh profile:", error);
        }
      }
      
      refreshProfile();
      
      // Load thread-specific messages
      (async () => {
        try {
          const coreMessages = await loadThreadMessages(threadId);
          if (coreMessages && coreMessages.length > 0) {
            const appMessages = coreMessages.map(coreToAppMessage);
            setMessages(appMessages);
          } else {
            // Show welcome message for new/empty threads
            setMessages([{
              id: generateId(),
              role: 'assistant',
              content: `Welcome to ${threadName}! How can I help you today?`,
              timestamp: Date.now(),
            }]);
          }
        } catch (error) {
          console.error("Failed to load thread messages:", error);
          setMessages([{
            id: generateId(),
            role: 'assistant',
            content: 'Welcome to MindBuddy! How can I help you today?',
            timestamp: Date.now(),
          }]);
        }
      })();
    }, [threadId, threadName])
  );

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
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call the LLM chain (it handles saving to thread storage)
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
    } finally {
      setIsLoading(false);
    }
  };

  // Render function for FlatList items
  const renderMessage = ({ item }: { item: AppMessage }) => (
    <ChatMessage message={item} />
  );

  // Add loading indicator as a message item
  const messageData = [...messages];
  if (isLoading) {
    messageData.push({
      id: 'loading',
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* TopBar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.hamburgerButton}
          onPress={() => navigation.navigate('Threads')}
          activeOpacity={0.7}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {threadName || 'MindBuddy'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsText}>⚙︎</Text>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
      >
        {/* MessageList (FlatList) */}
        <FlatList
          ref={flatListRef}
          style={styles.messageList}
          data={messageData}
          renderItem={({ item }) => {
            if (item.id === 'loading') {
              return (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              );
            }
            return <ChatMessage message={item} />;
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageListContent}
          removeClippedSubviews={false}
        />
        
        {/* InputDock */}
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

/**
 * Main App component with navigation
 */
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Threads">
        <Stack.Screen
          name="Threads"
          component={ThreadsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Profile Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // TopBar styles
  topBar: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  hamburgerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerText: {
    fontSize: 24,
    color: '#000000',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  settingsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 24,
    color: '#000000',
  },
  // Chat container and message list
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
});

export default App; 