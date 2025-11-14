import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatMessage } from './types';

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const colorScheme = useColorScheme();
  const isUser = message.role === 'user';
  const bg = isUser ? '#007AFF' : (colorScheme === 'dark' ? '#2C2C2E' : '#EFEFF4');
  const textColor = isUser ? '#FFFFFF' : Colors[colorScheme ?? 'light'].text;

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
      <View style={[styles.bubble, { backgroundColor: bg }]}>
        <ThemedText style={{ color: textColor }}>{message.text ?? ''}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, marginVertical: 6, flexDirection: 'row' },
  rowUser: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
});