import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageBubbleProps {
  message: string;
  role: 'user' | 'buddy';
  timestamp?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, role, timestamp }) => {
  const isUser = role === 'user';
  
  return (
    <View style={[
      styles.container, 
      isUser ? styles.userContainer : styles.buddyContainer
    ]}>
      <Text style={[
        styles.messageText,
        isUser ? styles.userText : styles.buddyText
      ]}>
        {message}
      </Text>
      {timestamp && (
        <Text style={styles.timestamp}>{timestamp}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  buddyContainer: {
    backgroundColor: '#E9E9EB',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: 'white',
  },
  buddyText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
});

export default MessageBubble; 