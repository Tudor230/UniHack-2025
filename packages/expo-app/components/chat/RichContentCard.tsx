import { Image } from 'expo-image';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChatAction, ChatCard } from './types';
import { router } from 'expo-router';

function handleAction(action: ChatAction) {
  if (action.type === 'showOnMap') {
    router.push('/(tabs)/map');
  } else if (action.type === 'book' && action.url) {
    Linking.openURL(action.url);
  }
}

export default function RichContentCard({ card }: { card: ChatCard }) {
  return (
    <View style={styles.card}>
      {card.imageUrl ? <Image source={{ uri: card.imageUrl }} style={styles.image} /> : null}
      <Text style={styles.title}>{card.title}</Text>
      {card.description ? <Text style={styles.desc}>{card.description}</Text> : null}
      <View style={styles.actions}>
        {(card.actions ?? []).map((a, i) => (
          <TouchableOpacity key={i} style={styles.btn} onPress={() => handleAction(a)}>
            <Text style={styles.btnText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, marginHorizontal: 12, marginVertical: 6, backgroundColor: '#FFFFFF' },
  image: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  desc: { fontSize: 14, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#FFFFFF' },
});