import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <View 
      style={[
        styles.messageBubble,
        message.role === 'user' ? styles.userBubble : styles.aiBubble
      ]}
    >
      <Text style={[
        styles.messageText,
        message.role === 'user' ? styles.userText : styles.aiText
      ]}>
        {message.content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#4a69bd',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#f2f2f2',
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
});

export default ChatMessage;
export type { Message }; 