import { useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import ChatWindow from '@/components/chat/ChatWindow';
import InputBar from '@/components/chat/InputBar';
import VoiceInputOverlay from '@/components/chat/VoiceInputOverlay';
import { ChatMessage } from '@/components/chat/types';
import { sendChat } from '@/utils/chat-api';
import { useUiBus } from '@/state/ui-bus';
import * as ImagePicker from 'expo-image-picker';

// Conditionally import speech recognition
let useSpeechRecognitionEvent: any;
let ExpoSpeechRecognitionModule: any;
let speechRecognitionAvailable = false;

try {
  const speechModule = require('expo-speech-recognition');
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  speechRecognitionAvailable = true;
} catch (e) {
  console.log('Speech recognition not available, using fallback');
}

function GuideScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const [attachmentUri, setAttachmentUri] = useState<string | undefined>();
  const { scan, poi } = useUiBus();

  // Handle speech recognition events
  if (speechRecognitionAvailable && useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent('start', () => {
      setRecognizing(true);
      setLiveTranscription('Listening...');
    });

    useSpeechRecognitionEvent('end', () => {
      setRecognizing(false);
    });

    useSpeechRecognitionEvent('result', (event: any) => {
      const transcript = event.results[0]?.transcript;
      if (transcript) {
        setLiveTranscription(transcript);
      }
    });

    useSpeechRecognitionEvent('error', (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setRecognizing(false);
      Alert.alert('Error', `Speech recognition failed: ${event.error}`);
    });
  }
  // Handle voice input toggle
  const handleToggleVoice = async () => {
    // Check if native speech recognition is available
    if (!speechRecognitionAvailable || !ExpoSpeechRecognitionModule) {
      Alert.alert(
        'Native Build Required',
        'Speech recognition requires a native build. Please run:\n\nnpx expo run:android\n\nor build with EAS:\n\neas build --profile development --platform android',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isListening) {
      // Stop listening
      setIsListening(false);
      
      try {
        ExpoSpeechRecognitionModule.stop();
        
        // Add the live transcription to input bar
        if (liveTranscription && liveTranscription !== 'Listening...') {
          setCurrentInput(prev => {
            return prev ? `${prev} ${liveTranscription}` : liveTranscription;
          });
        }
      } catch (error) {
        console.error('Failed to stop recognition', error);
      }
      
      setLiveTranscription('');
    } else {
      // Start listening
      try {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        
        if (!result.granted) {
          Alert.alert('Permission required', 'Please grant microphone access to use voice input');
          return;
        }

        // Start speech recognition
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          maxAlternatives: 1,
          continuous: false,
          requiresOnDeviceRecognition: false,
          addsPunctuation: true,
          contextualStrings: ['landmark', 'museum', 'cathedral', 'monument'],
          // Android specific options
          ...(Platform.OS === 'android' && {
            androidIntentOptions: {
              EXTRA_LANGUAGE_MODEL: 'free_form',
            },
            androidRecognitionServicePackage: 'com.google.android.googlequicksearchbox',
          }),
        });
        
        setIsListening(true);
        setLiveTranscription('Listening...');
        
      } catch (error) {
        console.error('Failed to start recognition', error);
        Alert.alert('Error', 'Failed to start speech recognition. Please try again.');
      }
    }
  };

  useEffect(() => {
    const unsubScan = scan.subscribe((result) => {
      if (result) {
        setMessages((prev) => [{ id: String(Date.now()), role: 'bot', type: 'text', text: `Identified: ${result?.title ?? 'Unknown'}`, ts: Date.now(), suggestions: ['Tell me more', 'Show on Map'] }, ...prev]);
      }
    });
    const unsubPoi = poi.subscribe((name) => {
      if (name) setCurrentInput(`Tell me about ${name}`);
    });
    
    // Cleanup speech recognition on unmount
    return () => {
      unsubScan();
      unsubPoi();
      if (recognizing) {
        try {
          ExpoSpeechRecognitionModule.stop();
        } catch (error) {
          console.error('Error stopping recognition on cleanup:', error);
        }
      }
    };
  }, [scan, poi, recognizing]);

  const onSend = async (text?: string) => {
    const content = (text ?? currentInput).trim();
    if (!content && !attachmentUri) return;
    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', type: 'text', text: content || undefined, imageUri: attachmentUri, ts: Date.now() };
    setMessages((prev) => [userMsg, ...prev]);
    setCurrentInput('');
    setAttachmentUri(undefined);
    setIsLoading(true);
    try {
      const reply = await sendChat(content || '', messages);
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'bot',
        type: reply.type === 'card' ? 'card' : 'text',
        text: reply.type !== 'card' ? String(reply.content ?? '') : undefined,
        card: reply.type === 'card' ? reply.content : undefined,
        suggestions: Array.isArray(reply.suggestions) ? reply.suggestions : [],
        ts: Date.now() + 1,
      };
      setMessages((prev) => [botMsg, ...prev]);
    } catch {
      const errMsg: ChatMessage = { id: String(Date.now() + 2), role: 'bot', type: 'text', text: `I'm sorry, I'm having trouble connecting. Please try again in a moment.`, ts: Date.now() + 2 };
      setMessages((prev) => [errMsg, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please grant camera access to take a photo');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: false,
        allowsEditing: true,
        exif: false,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAttachmentUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Camera error', e);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatWindow messages={messages} isLoading={isLoading} onChipPress={(s) => onSend(s)} />
        <InputBar 
          value={currentInput} 
          onChangeText={setCurrentInput} 
          onSend={() => onSend()} 
          isListening={isListening} 
          onToggleVoice={handleToggleVoice} 
          onOpenCamera={handleOpenCamera}
          attachmentUri={attachmentUri}
          onRemoveAttachment={() => setAttachmentUri(undefined)}
        />
      </KeyboardAvoidingView>
      <VoiceInputOverlay 
        visible={isListening} 
        transcription={liveTranscription} 
        onStop={handleToggleVoice} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default GuideScreen;