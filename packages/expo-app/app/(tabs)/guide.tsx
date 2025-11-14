import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function GuideScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">The Guide</ThemedText>
      <ThemedText>
        Chat UI shell is ready. Messages will be sent to n8n chat webhook.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
});