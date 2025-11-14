import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function LoadingIndicator() {
  return (
    <View style={styles.container}>
      <ThemedText>Guide is typing…</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8, paddingHorizontal: 12 },
});