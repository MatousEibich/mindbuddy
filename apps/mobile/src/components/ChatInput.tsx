import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Alert, Animated } from 'react-native';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';

// Import Voice conditionally to handle Expo Go environment
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (error) {
  console.warn('Voice module not available:', error);
}

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
  const [isRecording, setIsRecording] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);
  
  const showMic = !value.trim() && !isLoading; // Always show mic when input is empty, regardless of voice availability
  const isDisabled = isLoading || (showMic ? false : !value.trim()); // Mic enabled when empty, send disabled when empty

  // Check voice availability and setup
  useEffect(() => {
    const setupVoice = async () => {
      if (!Voice) {
        console.warn('Voice module not available in this environment');
        return;
      }

      try {
        const available = await Voice.isAvailable();
        setIsVoiceAvailable(available);
        
        if (available) {
          Voice.onSpeechResults = (e: any) => {
            const best = e.value?.[0] ?? "";
            onChangeText(best);
          };
          
          Voice.onSpeechEnd = () => handleStopRecording();
          Voice.onSpeechError = (e: any) => {
            console.warn('Speech error:', e);
            handleStopRecording();
            // Only show error if permissions were denied
            const errorMessage = e.error?.message || e.error || '';
            if (typeof errorMessage === 'string' && (errorMessage.includes('permission') || errorMessage.includes('denied'))) {
              Alert.alert('Permission Required', 'Voice input not available. Please grant microphone permission in settings.');
            }
          };
        }
      } catch (error) {
        console.warn('Voice setup error:', error);
        setIsVoiceAvailable(false);
      }
    };

    setupVoice();
    
    return () => {
      if (Voice && isVoiceAvailable) {
        Voice.destroy().then(() => Voice.removeAllListeners());
      }
    };
  }, [onChangeText, isVoiceAvailable]);

  // 60-second auto-stop guard
  useEffect(() => {
    if (!isRecording) return;
    
    const timeout = setTimeout(() => {
      handleStopRecording();
    }, 60000); // 60 seconds
    
    return () => clearTimeout(timeout);
  }, [isRecording]);

  // Animate mic button while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isRecording, scaleAnim]);

  const handleMicToggle = async () => {
    if (!Voice || !isVoiceAvailable) {
      Alert.alert('Voice Not Available', 'Voice input is not available in this environment. Please use a development build or physical device.');
      return;
    }

    if (isRecording) {
      handleStopRecording();
      return;
    }

    try {
      // Voice.start() automatically requests permissions and starts recording
      await Voice.start('en-US');
      setIsRecording(true);
    } catch (error) {
      console.warn('Voice start error:', error);
      Alert.alert('Error', 'Voice input not available.');
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      if (Voice && isVoiceAvailable) {
        await Voice.stop();
      }
    } catch (error) {
      console.warn('Voice stop error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleButtonPress = () => {
    if (showMic) {
      handleMicToggle();
    } else {
      onSend();
    }
  };
  
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
        editable={!isLoading && !isRecording}
      />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          style={[
            styles.sendBtn, 
            isDisabled && styles.disabledButton,
            isRecording && styles.recordingButton
          ]} 
          onPress={handleButtonPress}
          disabled={isDisabled}
        >
          <Text style={styles.sendButtonText}>
            {showMic ? '🎤' : '➤'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
  recordingButton: {
    backgroundColor: '#FF3333', // Red background while recording
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatInput; 