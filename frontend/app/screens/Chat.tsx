import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import MessageBubble from '../components/MessageBubble';
import { chat } from '../../src/utils/api';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'buddy';
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Automatically scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isLoading) return;

    // Generate a unique ID for the message
    const timestamp = new Date().toISOString();
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      text: trimmedText,
      role: 'user',
      timestamp,
    };

    // Clear input and add user message immediately
    setInputText('');
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      // Call the API
      const reply = await chat(trimmedText);
      
      // Add buddy's response
      const buddyMessage: Message = {
        id: `buddy-${Date.now()}`,
        text: reply,
        role: 'buddy',
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prevMessages) => [...prevMessages, buddyMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: '⚠️ MindBuddy could not reply (network error)',
        role: 'buddy',
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.text}
              role={message.role}
            />
          ))}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Send a message to start chatting with MindBuddy
              </Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            editable={!isLoading}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ACCEF7',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    opacity: 0.5,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default ChatScreen; 