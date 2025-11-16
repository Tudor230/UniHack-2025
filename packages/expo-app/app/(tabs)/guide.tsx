import { useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, Alert, View, Pressable, Dimensions, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import ChatWindow from '@/components/chat/ChatWindow';
import StartingChat from '@/components/chat/StartingChat';
import InputBar from '@/components/chat/InputBar';
import VoiceInputOverlay from '@/components/chat/VoiceInputOverlay';
import { ChatMessage } from '@/components/chat/types';
import { sendChat } from '@/utils/chat-api';
import { useUiBus } from '@/state/ui-bus';
import { useChatHistory } from '@/state/chat-history';
import RecentChatsSidebar from '@/components/chat/RecentChatsSidebar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatTestHarness from '@/components/chat/ChatTestHarness';

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

export default function GuideScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [recognizing, setRecognizing] = useState(false);
  const [attachmentUri, setAttachmentUri] = useState<string | undefined>();
  const [lightboxUri, setLightboxUri] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const { scan, poi } = useUiBus();
  const { createSession, appendMessage, trySyncSession, loadSession, getSession, adoptSessionId } = useChatHistory();
  const colorScheme = useColorScheme();
  const screen = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const MIN_SCALE = 0.9;
  const MAX_SCALE = 4;
  const baseScale = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const clamp = (v: number, min: number, max: number) => {
    'worklet';
    return Math.max(min, Math.min(max, v));
  };
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      scale.value = baseScale.value;
    })
    .onUpdate((e) => {
      const next = clamp(baseScale.value * e.scale, MIN_SCALE, MAX_SCALE);
      scale.value = next;
    })
    .onEnd((e) => {
      baseScale.value = clamp(baseScale.value * e.scale, MIN_SCALE, MAX_SCALE);
      scale.value = baseScale.value;
    });
  const pan = Gesture.Pan()
    .onBegin(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = offsetX.value + e.translationX;
      translateY.value = offsetY.value + e.translationY;
    })
    .onEnd(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    });
  const composed = Gesture.Simultaneous(pinch, pan);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  const resetTransforms = () => {
    baseScale.value = withTiming(1);
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    offsetX.value = 0;
    offsetY.value = 0;
  };

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
    if (!currentSessionId) {
      const sid = createSession(userMsg);
      setCurrentSessionId(sid);
      trySyncSession(sid);
    } else {
      appendMessage(currentSessionId, userMsg);
      trySyncSession(currentSessionId);
    }
    setCurrentInput('');
    setAttachmentUri(undefined);
    setIsLoading(true);
    try {
      const reply = await sendChat(content || '', messages);
      let botMsg: ChatMessage;
      if (Array.isArray(reply) && reply.length && typeof reply[0] === 'object' && 'responseText' in reply[0]) {
        const first = reply[0] as any;
        const remoteId = first.sessionId ? String(first.sessionId) : undefined;
        const botText = String(first.responseText ?? '');
        botMsg = {
          id: String(Date.now() + 1),
          role: 'bot',
          type: 'text',
          text: botText,
          suggestions: [],
          ts: Date.now() + 1,
        };
        if (remoteId) {
          if (currentSessionId) adoptSessionId(currentSessionId, remoteId);
          setCurrentSessionId(remoteId);
        }
      } else if (Array.isArray(reply) && reply.length && typeof reply[0] === 'object' && 'landmarkName' in reply[0]) {
        const items = reply.map((r: any) => {
          let coordsObj: { latitude: number; longitude: number } | undefined;
          try {
            const parsed = typeof r.coords === 'string' ? JSON.parse(r.coords) : r.coords;
            if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
              coordsObj = { latitude: parsed.latitude, longitude: parsed.longitude };
            }
          } catch {}
          return {
            landmarkName: String(r.landmarkName ?? ''),
            publicAccess: r.publicAccess ? String(r.publicAccess) : undefined,
            coords: coordsObj,
            about: r.about ? String(r.about) : undefined,
            openingHours: r.openingHours ? String(r.openingHours) : undefined,
            ticketPrices: r.ticketPrices ? String(r.ticketPrices) : undefined,
            website: r.website ? String(r.website) : undefined,
            id: r.id,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          };
        });
        botMsg = {
          id: String(Date.now() + 1),
          role: 'bot',
          type: 'map',
          mapItems: items,
          suggestions: ['Open in Map', 'More details'],
          ts: Date.now() + 1,
        };
      } else {
         throw new Error('Invalid JSON response from server');
      }
      setMessages((prev) => [botMsg, ...prev]);
      if (currentSessionId) {
        appendMessage(currentSessionId, botMsg);
        trySyncSession(currentSessionId);
      }
    } catch {
      const errMsg: ChatMessage = { id: String(Date.now() + 2), role: 'bot', type: 'text', text: `I'm sorry, I'm having trouble connecting. Please try again in a moment.`, ts: Date.now() + 2 };
      setMessages((prev) => [errMsg, ...prev]);
      if (currentSessionId) {
        appendMessage(currentSessionId, errMsg);
        trySyncSession(currentSessionId);
      }
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
    <ThemedView style={[styles.container] }>
      {!isSidebarOpen ? (
        <View style={{ position: 'absolute', top: insets.top + 16, left: insets.left + 20, zIndex: 1000 }}>
          <Pressable
            onPress={() => setIsSidebarOpen(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
              borderWidth: 1.5,
              borderColor: colorScheme === 'dark' ? '#38383A' : '#E5E5EA',
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="time-outline" size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#333333'} />
          </Pressable>
        </View>
      ) : null}
      {currentSessionId && !isSidebarOpen ? (
        <View style={{ position: 'absolute', top: insets.top + 16, left: insets.left + 0, right: insets.right + 0, alignItems: 'center', zIndex: 900 }}>
          <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#38383A' : '#E5E5EA' }}>
            <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontSize: 16, fontWeight: '600' }}>{getSession(currentSessionId)?.title ?? ''}</Text>
          </View>
        </View>
      ) : null}
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={!isSidebarOpen}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {!currentSessionId ? (
          <StartingChat onTemplateSelect={(s) => onSend(s)} />
        ) : (
          <ChatWindow messages={messages} isLoading={isLoading} onChipPress={(s) => onSend(s)} onImageOpen={(uri) => { setLightboxUri(uri); resetTransforms(); }} />
        )}
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
      <RecentChatsSidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={async (id) => {
          const s = await loadSession(id);
          if (s) {
            setMessages(s.messages);
            setCurrentSessionId(s.id);
          }
          setIsSidebarOpen(false);
        }}
        onNewChat={() => {
          setMessages([]);
          setCurrentSessionId(undefined);
          setIsSidebarOpen(false);
        }}
        currentSessionId={currentSessionId}
        onDeleteCurrent={() => {
          setMessages([]);
          setCurrentSessionId(undefined);
          setIsSidebarOpen(false);
        }}
      />
      <VoiceInputOverlay 
        visible={isListening} 
        transcription={liveTranscription} 
        onStop={handleToggleVoice} 
      />
      {lightboxUri ? (
        <GestureHandlerRootView style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 2000 }}>
          <BlurView style={{ ...StyleSheet.absoluteFillObject }} intensity={100} tint="dark" />
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#000000CC' }} />
          <Pressable style={{ ...StyleSheet.absoluteFillObject, zIndex: 1 }} onPress={() => setLightboxUri(undefined)} />
          <View style={{ position: 'absolute', top: insets.top + 12, right: insets.right + 12, zIndex: 2 }}>
            <Pressable onPress={() => setLightboxUri(undefined)} style={{ backgroundColor: '#00000088', borderRadius: 20, padding: 8 }}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <GestureDetector gesture={composed}>
              <Animated.View style={[animatedStyle, { zIndex: 2 }]}> 
                <Image
                  source={{ uri: lightboxUri }}
                  style={{ width: screen.width * 0.9, height: screen.height * 0.6, borderRadius: 16 }}
                  contentFit="contain"
                />
              </Animated.View>
            </GestureDetector>
          </View>
        </GestureHandlerRootView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
