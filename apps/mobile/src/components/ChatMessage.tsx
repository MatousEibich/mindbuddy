import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BUBBLE_ASSIST, BUBBLE_USER, TEXT_BLACK } from '../theme/colors';

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
        message.role === 'user' ? styles.userBubble : styles.assistantBubble
      ]}
    >
      <Text style={styles.messageText}>
        {message.content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    borderRadius: 24,
    padding: 12,
    marginVertical: 6,
    maxWidth: '80%',
    // Shadow for iOS
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // Elevation for Android
    elevation: 2,
  },
  userBubble: {
    backgroundColor: BUBBLE_USER,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: BUBBLE_ASSIST,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: TEXT_BLACK,
  },
});

export default ChatMessage;
export type { Message }; 