import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SuggestionChips({ suggestions, onChipPress }: { suggestions: string[]; onChipPress: (s: string) => void }) {
  if (!suggestions?.length) return null;
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {suggestions.map((s) => (
          <TouchableOpacity key={s} style={styles.chip} onPress={() => onChipPress(s)}>
            <Text style={styles.chipText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 8 },
  row: { gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#F0F0F0' },
  chipText: { fontSize: 14 },
});