import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { MapItem, ChatMessage } from './types';
import MessageBubble from './MessageBubble';
import { usePins } from '@/state/pins';
import { router } from 'expo-router';

function computeRegion(items: MapItem[]): Region | null {
  const coords = (items || []).map((i) => i.coords).filter((c): c is { latitude: number; longitude: number } => !!c);
  if (coords.length === 0) return null;
  if (coords.length === 1) {
    const c = coords[0]!;
    return { latitude: c.latitude, longitude: c.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
  }
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latDelta = Math.max(maxLat - minLat, 0.01) * 1.4;
  const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.4;
  return { latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
}

export default function MapPreviewCard({ items }: { items: MapItem[] }) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = Colors[colorScheme].text;
  const region = computeRegion(items);
  const { addPin } = usePins();
  const tint = Colors[colorScheme].tint;

  const title = items.length === 1 ? (items[0]?.landmarkName || 'Location') : `${items[0]?.landmarkName || 'Locations'} and ${items.length - 1} more`;

  const infoText = items
    .map((item) => {
      const lines: string[] = [];
      lines.push(item.landmarkName);
      if (item.publicAccess) lines.push(`Public Access: ${item.publicAccess}`);
      if (item.openingHours) lines.push(`Hours: ${item.openingHours}`);
      if (item.ticketPrices) lines.push(`Tickets: ${item.ticketPrices}`);
      if (item.website) lines.push(`Website: ${item.website}`);
      if (item.about) lines.push(item.about);
      return lines.join('\n');
    })
    .join('\n\n');

  const bubbleMessage: ChatMessage = {
    id: `map-info-${Date.now()}`,
    role: 'bot',
    type: 'text',
    text: infoText,
    ts: Date.now(),
  };

  const handleSave = () => {
    const first = items[0];
    if (first?.coords) {
      addPin({
        id: `chat-${Date.now()}`,
        type: 'want',
        coords: { latitude: first.coords.latitude, longitude: first.coords.longitude },
        title: first.landmarkName || 'Pinned Location',
        createdAt: Date.now(),
      });
    }
    router.push('/(tabs)/map');
  };

  const handleShow = () => {
    const first = items[0];
    if (first?.coords) {
      const { latitude, longitude } = first.coords;
      router.push({ pathname: '/(tabs)/map', params: { lat: String(latitude), lon: String(longitude) } });
    } else {
      router.push('/(tabs)/map');
    }
  };

  return (
    <View>
      <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#38383A' : '#E5E5EA' }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
        <View style={styles.mapContainer}>
          {region ? (
            <MapView
              style={styles.map}
              initialRegion={region}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              pointerEvents="none"
            >
              {items.map((item, idx) => (
                item.coords ? (
                  <Marker key={idx} coordinate={item.coords} title={item.landmarkName} />
                ) : null
              ))}
            </MapView>
          ) : (
            <View style={[styles.mapFallback, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7' }] }>
              <Text style={[styles.title, { color: textColor }]}>No location data</Text>
            </View>
          )}
        </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: tint }]} onPress={handleShow}>
          <Text style={styles.btnText}>Show on Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: tint }]} onPress={handleSave}>
          <Text style={styles.btnText}>Save to Want to Go</Text>
        </TouchableOpacity>
      </View>
      </View>
      <MessageBubble message={bubbleMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, marginHorizontal: 12, marginVertical: 6 },
  headerTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  mapContainer: { borderRadius: 8, overflow: 'hidden' },
  map: { width: '100%', height: 200 },
  mapFallback: { width: '100%', height: 200, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', display: 'flex', gap: 8, marginTop: 10, width: '100%' },
  btn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  btnSecondary: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  btnText: { color: '#FFFFFF', fontWeight: '600' },
});