import { StyleSheet, View, Text, Linking, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { MapItem } from './types';
import { router } from 'expo-router';
import { usePins } from '@/state/pins';

export default function MapMessage({ item }: { item: MapItem }) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = Colors[colorScheme].text;
  const borderColor = colorScheme === 'dark' ? '#38383A' : '#E5E5EA';
  const surfaceCard = colorScheme === 'dark' ? '#2C2C2E' : '#F9F9F9';
  const tint = Colors[colorScheme].tint;
  const { state, addPin } = usePins();

  const lat = item.coords?.lat ?? 0;
  const lon = item.coords?.long ?? 0;
  try { console.log('MapMessage item', item); } catch {}

  const url = (item.website ?? '').replace(/`/g, '').trim();
  try { console.log('MapMessage fields', { landmarkName: item.landmarkName, publicAccess: item.publicAccess, hasAbout: !!item.about, hasOpeningHours: !!item.openingHours, hasTicketPrices: !!item.ticketPrices, url, coords: item.coords }); } catch {}

  const handleShowOnMap = () => {
    if (item.coords) router.push({ pathname: '/(tabs)/map', params: { lat: String(lat), lon: String(lon) } });
    else router.push('/(tabs)/map');
  };

  const alreadySaved = !!(item.coords && state.wantToGo.some(p => {
    const sameCoords = Math.abs(p.coords.latitude - lat) < 1e-6 && Math.abs(p.coords.longitude - lon) < 1e-6;
    const sameTitle = p.title.trim().toLowerCase() === (item.landmarkName ?? '').trim().toLowerCase();
    return sameCoords || sameTitle;
  }));

  const handleSaveWantToGo = () => {
    if (!item.coords) return;
    if (!alreadySaved) {
      addPin({
        id: String(item.id ?? Date.now()),
        type: 'want',
        coords: { latitude: lat, longitude: lon },
        title: item.landmarkName,
        createdAt: Date.now(),
        eventDate: undefined,
      });
    }
    router.push('/(tabs)/planner');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: surfaceCard }] }>
        <Text style={[styles.title, { color: textColor }]}>{item.landmarkName}</Text>
        {item.coords ? (
        <MapView
          style={styles.map}
          initialRegion={{ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          pointerEvents="none"
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          showsCompass={false}
        >
          <Marker coordinate={{ latitude: lat, longitude: lon }} title={item.landmarkName} />
        </MapView>
        ) : (
          <View style={[styles.mapPlaceholder, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E7EB' }] }>
            <Text style={{ color: colorScheme === 'dark' ? '#9BA1A6' : '#6B7280' }}>No location data</Text>
          </View>
        )}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: tint }]} onPress={handleShowOnMap}>
            <Text style={styles.btnText}>Show on Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: item.coords && !alreadySaved ? tint : colorScheme === 'dark' ? '#2C2C2E' : '#E5E7EB' }]}
            onPress={handleSaveWantToGo}
            disabled={!item.coords || alreadySaved}
          >
            <Text style={[styles.btnText, { color: item.coords && !alreadySaved ? '#FFFFFF' : textColor }]}>Save to Want to Go</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={[styles.accentLine, { backgroundColor: borderColor }]} />
        <View style={styles.infoCol}>
          <Text style={[styles.infoTitle, { color: textColor }]}>{item.landmarkName}</Text>
          {item.publicAccess ? (
            <Text style={[styles.meta, { color: textColor }]}>Public Access: {item.publicAccess}</Text>
          ) : null}
          {url ? (
            <Text style={[styles.link, { color: Colors[colorScheme].tint }]} onPress={() => Linking.openURL(url)}>
              Website: {url}
            </Text>
          ) : null}
          {item.about ? <Text style={[styles.body, { color: textColor }]}>{item.about}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, marginVertical: 6 },
  card: { borderRadius: 12, padding: 12 },
  map: { height: 160, borderRadius: 12, marginTop: 8 },
  mapPlaceholder: { height: 160, borderRadius: 12, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 },
  accentLine: { width: 2, alignSelf: 'stretch', borderRadius: 1 },
  infoCol: { flex: 1 },
  infoTitle: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13 },
  body: { marginTop: 4, fontSize: 14 },
  link: { marginTop: 4, fontSize: 14 },
});