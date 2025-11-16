import { StyleSheet, View, Animated, Easing, Text, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatMessage } from './types';
import { Image } from 'expo-image';
import MarkdownText from './MarkdownText';

export default function MessageBubble({ message, onImagePress }: { message: ChatMessage, onImagePress?: (uri: string) => void }) {
  const colorScheme = useColorScheme();
  const isUser = message.role === 'user';
  const bg = isUser ? Colors[colorScheme ?? 'light'].tint : 'transparent';
  const textColor = isUser ? '#FFFFFF' : Colors[colorScheme ?? 'light'].text;
  const [baseText, setBaseText] = useState<string>(isUser ? (message.text ?? '') : '');
  const [chunk, setChunk] = useState<string>('');
  const fade = useRef(new Animated.Value(0)).current;
  const dx = useRef(new Animated.Value(-6)).current;
  const dy = useRef(new Animated.Value(-4)).current;
  const scale = useRef(new Animated.Value(0.99)).current;
  const lastStreamedId = useRef<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const fullText = message.text ?? '';
    const isNewBotText = !isUser && message.type === 'text' && (Date.now() - message.ts < 7000);
    if (isNewBotText && lastStreamedId.current !== message.id && fullText.trim().length > 0) {
      lastStreamedId.current = message.id;
      setIsStreaming(true);
      setBaseText('');
      setChunk('');
      const tokens = fullText.match(/(\s+|[^\s]+)/g) || [fullText];
      let i = 0;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const step = () => {
        if (i >= tokens.length) return;
        const take = Math.min(3, tokens.length - i);
        const add = tokens.slice(i, i + take).join('');
        i += take;
        setChunk(add);
        fade.setValue(0);
        dx.setValue(-6);
        dy.setValue(-4);
        scale.setValue(0.99);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(dx, { toValue: 0, duration: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(dy, { toValue: 0, duration: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start(({ finished }) => {
          if (finished) {
            setBaseText((prev) => prev + add);
            setChunk('');
            if (i < tokens.length) {
              const len = add.trim().length;
              const delay = len <= 2 ? 2 : len <= 6 ? 6 : 10;
              timer = setTimeout(step, delay);
            } else {
              setIsStreaming(false);
            }
          }
        });
      };
      timer = setTimeout(step, 80);
      return () => {
        if (timer) clearTimeout(timer);
        fade.stopAnimation();
        dx.stopAnimation();
        dy.stopAnimation();
        scale.stopAnimation();
      };
    } else {
      setBaseText(fullText);
      setChunk('');
      setIsStreaming(false);
    }
  }, [message.id]);

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      <View style={[styles.column, isUser ? styles.columnUser : styles.columnBot]}>
        {message.imageUri ? (
          <TouchableOpacity activeOpacity={0.8} onPress={() => onImagePress?.(message.imageUri!)}>
            <Image source={{ uri: message.imageUri }} style={styles.attachment} contentFit="cover" />
          </TouchableOpacity>
        ) : null}
        {(message.text ?? '').trim().length > 0 ? (
          isUser ? (
            <View style={styles.containerUser}>
              <View style={[styles.bubbleUser, { backgroundColor: bg }]}> 
                <MarkdownText content={baseText} color={textColor} />
              </View>
            </View>
          ) : (
            <View style={styles.containerBot}>
              <View style={styles.contentRow}>
                <View style={[styles.accentLine, { backgroundColor: colorScheme === 'dark' ? '#38383A' : '#E5E5EA' }]} />
                <View style={styles.transparentBubble}>
                  {isStreaming ? (
                    <Text style={{ color: textColor, letterSpacing: 0.2, lineHeight: 22 }}>
                      <Text>{baseText}</Text>
                      <Animated.Text style={{ opacity: fade, transform: [{ translateX: dx }, { translateY: dy }, { scale }] }}>{chunk}</Animated.Text>
                    </Text>
                  ) : (
                    <MarkdownText content={message.text!} color={textColor} />
                  )}
                </View>
              </View>
            </View>
          )
        ) : null}
      </View>
    </View>
  );
}

// TODO: refine message bubble aspect

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, marginVertical: 6, flexDirection: 'row' },
  rowUser: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },
  containerUser: { maxWidth: '100%', paddingLeft: "30%" },
  containerBot: { maxWidth: '100%', minWidth: '30%' },
  bubbleUser: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, flexShrink: 1, maxWidth: '100%' },
  transparentBubble: { paddingVertical: 8, paddingHorizontal: 8, flexShrink: 0 },
  contentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  accentLine: { width: 2, alignSelf: 'stretch', borderRadius: 1 },
  attachment: { width: 220, height: 220, borderRadius: 16, marginBottom: 6 },
  column: { flexDirection: 'column', gap: 0 }, // Prev: 6
  columnUser: { alignItems: 'flex-end' },
  columnBot: { alignItems: 'flex-start' },
});