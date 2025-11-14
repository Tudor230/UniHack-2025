import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PlannerScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">The Travel Planner</ThemedText>
      <ThemedText>
        Planner placeholder. In Phase 3, this will read pins and organize trips.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
});