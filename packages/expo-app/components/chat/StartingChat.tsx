import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const templates = [
  'What can you do?',
  'Plan my visit',
  'Show nearby attractions',
];

export default function StartingChat({ onTemplateSelect }: { onTemplateSelect: (q: string) => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.headerIconWrap}>
        {/* <View style={[styles.headerIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderColor: isDark ? '#38383A' : '#E5E5EA' }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
        </View> */}
      </View>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Welcome</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#666666' }]}>How can I help you today?</Text>
      <View style={styles.templatesWrap}>
        {templates.map(t => (
          <Pressable key={t} onPress={() => onTemplateSelect(t)} style={[styles.templateBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', borderColor: isDark ? '#38383A' : '#E5E5EA' }]}>
            <Text style={[styles.templateText, { color: Colors[colorScheme ?? 'light'].text }]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  headerIconWrap: { marginBottom: 12 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 6 },
  templatesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, justifyContent: 'center' },
  templateBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  templateText: { fontSize: 14, fontWeight: '500' },
});