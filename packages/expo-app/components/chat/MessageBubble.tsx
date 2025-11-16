import { Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatMessage } from './types';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';
import MarkdownText from './MarkdownText';

export default function MessageBubble({ message, onImagePress }: { message: ChatMessage, onImagePress?: (uri: string) => void }) {
  const colorScheme = useColorScheme();
  const isUser = message.role === 'user';
  const bg = isUser ? Colors[colorScheme ?? 'light'].tint : 'transparent';
  const textColor = isUser ? '#FFFFFF' : Colors[colorScheme ?? 'light'].text;

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
                <MarkdownText content={message.text!} color={textColor} />
              </View>
            </View>
          ) : (
            <View style={styles.containerBot}>
              <View style={styles.contentRow}>
                <View style={[styles.accentLine, { backgroundColor: colorScheme === 'dark' ? '#38383A' : '#E5E5EA' }]} />
                <View style={styles.transparentBubble}>
                  <MarkdownText content={message.text!} color={textColor} />
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
  containerUser: { maxWidth: '85%', minWidth: '30%' },
  containerBot: { maxWidth: '100%', minWidth: '30%' },
  bubbleUser: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, flexShrink: 0 },
  transparentBubble: { paddingVertical: 8, paddingHorizontal: 8, flexShrink: 0 },
  contentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  accentLine: { width: 2, alignSelf: 'stretch', borderRadius: 1 },
  attachment: { width: 220, height: 220, borderRadius: 16, marginBottom: 6 },
  column: { flexDirection: 'column', gap: 0 }, // Prev: 6
  columnUser: { alignItems: 'flex-end' },
  columnBot: { alignItems: 'flex-start' },
});