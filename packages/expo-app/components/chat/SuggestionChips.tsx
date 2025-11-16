import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function SuggestionChips({ suggestions, onChipPress }: { suggestions: string[]; onChipPress: (s: string) => void }) {
  const textColor = '#FFFFFF';
  const backgroundColor = '#2563EB';
  if (!suggestions?.length) return null;
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {suggestions.map((s) => (
          <TouchableOpacity key={s} style={[styles.chip, { backgroundColor: backgroundColor }]} onPress={() => onChipPress(s)}>
            <Text style={[styles.chipText, { color: textColor }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 8 },
  row: { gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 14 },
});