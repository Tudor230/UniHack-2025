import { StyleSheet, View, Text, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { MapItem } from './types';

export default function MapMessage({ item }: { item: MapItem }) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = Colors[colorScheme].text;
  const borderColor = colorScheme === 'dark' ? '#38383A' : '#E5E5EA';

  const lat = item.coords?.lat ?? 0;
  const lon = item.coords?.long ?? 0;
  try { console.log('MapMessage item', item); } catch {}

  const url = (item.website ?? '').replace(/`/g, '').trim();
  try { console.log('MapMessage fields', { landmarkName: item.landmarkName, publicAccess: item.publicAccess, hasAbout: !!item.about, hasOpeningHours: !!item.openingHours, hasTicketPrices: !!item.ticketPrices, url, coords: item.coords }); } catch {}

  return (
    <View style={styles.container}>
      {item.coords ? (
        <MapView
          style={styles.map}
          initialRegion={{ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          pointerEvents="none"
        >
          <Marker coordinate={{ latitude: lat, longitude: lon }} title={item.landmarkName} />
        </MapView>
      ) : null}
      <View style={[styles.details, { borderColor }] }>
        <Text style={[styles.title, { color: textColor }]}>{item.landmarkName}</Text>
        {item.publicAccess ? <Text style={[styles.meta, { color: textColor }]}>Access: {item.publicAccess}</Text> : null}
        {item.about ? <Text style={[styles.body, { color: textColor }]}>{item.about}</Text> : null}
        {item.openingHours ? <Text style={[styles.meta, { color: textColor }]}>Hours: {item.openingHours}</Text> : null}
        {item.ticketPrices ? <Text style={[styles.meta, { color: textColor }]}>Tickets: {item.ticketPrices}</Text> : null}
        {url ? (
          <Text
            style={[styles.link, { color: Colors[colorScheme].tint }]}
            onPress={() => Linking.openURL(url)}
          >
            {url}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, marginVertical: 6 },
  map: { height: 180, borderRadius: 12 },
  details: { marginTop: 8, borderWidth: 1, borderRadius: 12, padding: 10 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13 },
  body: { marginTop: 4, fontSize: 14 },
  link: { marginTop: 4, fontSize: 14 },
});