import { FlatList, View, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ChatMessage } from './types';
import MessageBubble from './MessageBubble';
import RichContentCard from './RichContentCard';
import LoadingIndicator from './LoadingIndicator';
import SuggestionChips from './SuggestionChips';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';

export default function ChatWindow({ messages, isLoading, onChipPress }: {
  messages: ChatMessage[];
  isLoading: boolean;
  onChipPress: (s: string) => void;
}) {
  const [lightboxUri, setLightboxUri] = useState<string | undefined>();
  const lastBot = [...messages].reverse().find((m) => m.role === 'bot');
  const suggestions = lastBot?.suggestions ?? [];
  const screen = Dimensions.get('window');
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

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) =>
          item.type === 'card' && item.card ? (
            <RichContentCard card={item.card} />
          ) : (
            <MessageBubble message={item} onImagePress={(uri) => { setLightboxUri(uri); resetTransforms(); }} />
          )
        }
        inverted
      />
      {isLoading ? <LoadingIndicator /> : null}
      <SuggestionChips suggestions={suggestions} onChipPress={onChipPress} />
      {lightboxUri ? (
        <GestureHandlerRootView style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 1000 }}>
          <BlurView style={{ ...StyleSheet.absoluteFillObject }} intensity={99} tint="dark" />
          <Pressable style={{ ...StyleSheet.absoluteFillObject, zIndex: 1 }} onPress={() => setLightboxUri(undefined)} />
          <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
            <Pressable onPress={() => setLightboxUri(undefined)} style={{ backgroundColor: '#00000088', borderRadius: 20, padding: 8, marginTop: 25 }}>
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
    </View>
  );
}