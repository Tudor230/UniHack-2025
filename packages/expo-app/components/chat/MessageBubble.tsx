import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatMessage } from './types';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';

export default function MessageBubble({ message, onImagePress }: { message: ChatMessage, onImagePress?: (uri: string) => void }) {
  const colorScheme = useColorScheme();
  const isUser = message.role === 'user';
  const bg = isUser ? '#007AFF' : (colorScheme === 'dark' ? '#2C2C2E' : '#EFEFF4');
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
          <View style={[styles.bubble, { backgroundColor: bg }]}>
            <ThemedText style={{ color: textColor }}>{message.text}</ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, marginVertical: 6, flexDirection: 'row' },
  rowUser: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  attachment: { width: 220, height: 220, borderRadius: 16, marginBottom: 6 },
  column: { flexDirection: 'column', gap: 0 }, // Prev: 6
  columnUser: { alignItems: 'flex-end' },
  columnBot: { alignItems: 'flex-start' },
});