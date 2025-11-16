import React, { useState, useEffect, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { 
  StyleSheet, 
  Modal, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform
} from 'react-native';
import MapView, { LongPressEvent, LatLng, Region, Marker } from 'react-native-maps';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemedView } from '@/components/themed-view';
import { PinMarkers } from '@/components/map/PinMarkers';
import { usePins } from '@/state/pins';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
 
export default function MapScreen() {
  const { state, addPin} = usePins();
  const accentColor = "#2563EB";
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = Colors[colorScheme].icon;
  const palette = Colors[colorScheme];

  const [modalVisible, setModalVisible] = useState(false);
  const [newPinCoords, setNewPinCoords] = useState<LatLng | null>(null);
  const [pinName, setPinName] = useState('');
  const [pinDate, setPinDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCoord, setSelectedCoord] = useState<LatLng | null>(null);
  const params = useLocalSearchParams<{ lat?: string; lon?: string }>();

  const [followsUser, setFollowsUser] = useState(true); // Follows by default
  const [currentUserLocation, setCurrentUserLocation] = useState<LatLng | null>(null);
  const mapRef = useRef<MapView>(null); // Ref to control the map
  const locationSubscription = useRef<Location.LocationSubscription | null>(null); // To store the watcher

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');

        setInitialRegion({
          latitude: 37.33182,
          longitude: -122.03118,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        return;
      }

      // 4a. Get *initial* location
      let location = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setInitialRegion(region);
      setCurrentUserLocation(location.coords); // Also set current location

      const lat = params.lat ? parseFloat(String(params.lat)) : undefined;
      const lon = params.lon ? parseFloat(String(params.lon)) : undefined;
      if (typeof lat === 'number' && typeof lon === 'number' && !Number.isNaN(lat) && !Number.isNaN(lon)) {
        setFollowsUser(false);
        setSelectedCoord({ latitude: lat, longitude: lon });
        mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 300);
      }

      // 4b. Start *watching* the user's position
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setCurrentUserLocation(newLocation.coords); // Continuously update location
        }
      );
    })();

    // 4c. Cleanup function to stop watching when component unmounts
    return () => {
      locationSubscription.current?.remove();
    };
  }, []); // Runs once on mount

  // This effect runs whenever the user's location updates
  useEffect(() => {
    if (followsUser && currentUserLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentUserLocation.latitude,
          longitude: currentUserLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300 // Animate over 300ms
      );
    }
  }, [currentUserLocation, followsUser]); // Depends on these two values

  const handleMapLongPress = (event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setNewPinCoords(coordinate);
    setModalVisible(true);
  };

  const handleSavePin = () => {
    if (!pinName || !newPinCoords) {
      alert('Please enter a name for the pin.');
      return;
    }

    const newPin: any = {
      id: new Date().toISOString(),
      type: 'want',
      coords: {
        latitude: newPinCoords.latitude,
        longitude: newPinCoords.longitude,
      },
      title: pinName,
      notes: pinDate ? `Scheduled for: ${pinDate.toLocaleString()}` : 'No date set',
      source: 'user',
      createdAt: Date.now(),
      eventDate: pinDate ? pinDate.getTime() : undefined,
    };
    
    addPin(newPin);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setNewPinCoords(null);
    setPinName('');
    setPinDate(null);
  };

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleDateConfirm = (date: Date) => {
    setPinDate(date);
    hideDatePicker();
  };

  // When user drags the map, stop following
  const handlePanDrag = () => {
    if (followsUser) {
      setFollowsUser(false);
    }
  };

  // When user presses the "Recenter" button
  const handleRecenter = () => {
    setFollowsUser(true); // Re-enable following
    // The useEffect [currentUserLocation, followsUser] will take care of the animation
  };

  if (!initialRegion) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText>{errorMsg || 'Finding your location...'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onLongPress={handleMapLongPress}
        onPress={handleCloseModal}
        onPanDrag={handlePanDrag}
        initialRegion={initialRegion} // Use the location from state
        showsUserLocation={true} // Shows the blue "you are here" dot

      >
        <PinMarkers
          key={state.wantToGo.length + state.events.length}
          wantToGo={state.wantToGo}
          events={state.events}
        />
        {selectedCoord ? (
          <Marker coordinate={selectedCoord} title="Selected Location" />
        ) : null}
      </MapView>

      {/* This button only appears if 'followsUser' is false */}
      {!followsUser && (
        <TouchableOpacity style={[styles.recenterButton, {backgroundColor:palette.background}]} onPress={handleRecenter}>
          <Ionicons name="navigate" size={24} color={accentColor} />
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleCloseModal}
          />
          
          <View onStartShouldSetResponder={() => true}>
            <View style={[styles.modalContent, { backgroundColor, shadowColor: '#000' }] }>
              <ThemedText type="subtitle" style={styles.modalTitle}>Add New Pin</ThemedText>
              
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                placeholder="Pin Name (e.g., 'Coffee Shop')"
                placeholderTextColor={Colors[colorScheme].icon}
                value={pinName}
                onChangeText={setPinName}
              />
              
              <TouchableOpacity style={[styles.dateButton, { backgroundColor: accentColor }]} onPress={showDatePicker}>
                <ThemedText
                  style={styles.dateButtonText}
                  lightColor={Colors.dark.text}
                  darkColor={Colors.dark.text}
                >
                  {pinDate ? pinDate.toLocaleString() : 'Select Date & Time'}
                </ThemedText>
              </TouchableOpacity>
              
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={handleCloseModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ color: '#FF3B30', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSavePin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ color: accentColor, fontSize: 16, fontWeight: '600' }}>Save Pin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 22,
    paddingBottom: 40,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: 'black'
  },
  dateButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  clearButton: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    padding: 12,
    borderRadius: 30, // Make it circular
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});