import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePins } from '@/state/pins';

export default function MapScreen() {
  const { state } = usePins();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">The Atlas</ThemedText>
      <ThemedText>{`Want-to-Go: ${state.wantToGo.length}`}</ThemedText>
      <ThemedText>{`History: ${state.history.length}`}</ThemedText>
      <ThemedText>{`Bookable: ${state.bookable.length}`}</ThemedText>
      <ThemedText>
        Map UI placeholder. Integration with react-native-maps will render pins and POIs.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
});