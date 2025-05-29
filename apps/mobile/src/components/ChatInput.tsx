import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChangeText, 
  onSend, 
  isLoading 
}) => {
  const isDisabled = isLoading || !value.trim();
  
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Type a message…"
        placeholderTextColor="#999"
        multiline
        editable={!isLoading}
      />
      <TouchableOpacity 
        style={[styles.sendButton, isDisabled && styles.disabledButton]} 
        onPress={onSend}
        disabled={isDisabled}
      >
        <Text style={styles.sendButtonText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    minHeight: 36,
    maxHeight: 100,
    fontSize: 16,
    color: '#000000',
  },
  sendButton: {
    width: 36,
    height: 36,
    backgroundColor: '#000000',
    borderRadius: 24,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.3,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatInput; 