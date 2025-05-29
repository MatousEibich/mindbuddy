import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';

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
    <View style={styles.dock}>
      <AutoGrowingTextInput
        style={styles.input}
        placeholder="Type a message…"
        placeholderTextColor="#8E8E93"
        value={value}
        onChangeText={onChangeText}
        maxHeight={36 * 6}      // grow up to ~6 lines
        minHeight={36}
        enableScrollToCaret     // keeps caret visible when over maxHeight
        editable={!isLoading}
      />
      <TouchableOpacity 
        style={[styles.sendBtn, isDisabled && styles.disabledButton]} 
        onPress={onSend}
        disabled={isDisabled}
      >
        <Text style={styles.sendButtonText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dock: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
    minHeight: 52,
  },
  input: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000000',
  },
  sendBtn: {
    backgroundColor: '#000000',
    borderRadius: 24,
    width: 40,
    height: 40,
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