import React, { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { 
  StyleSheet, 
  Modal, 
  View, 
  TextInput, 
  Button, 
  TouchableOpacity, 
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MapView, { MapEvent, Coordinate } from 'react-native-maps';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemedView } from '@/components/themed-view';
import { PinMarkers } from '@/components/map/PinMarkers';
import { usePins } from '@/state/pins';

export default function MapScreen() {
  const { state, addPin} = usePins();

  const [modalVisible, setModalVisible] = useState(false);
  const [newPinCoords, setNewPinCoords] = useState<Coordinate | null>(null);
  const [pinName, setPinName] = useState('');
  const [pinDate, setPinDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleMapLongPress = (event: MapEvent) => {
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

  return (
    <ThemedView style={styles.container}>
      <MapView
        style={styles.map}
        onLongPress={handleMapLongPress}
        onPress={handleCloseModal}
        initialRegion={{
          latitude: 37.33182,
          longitude: -122.03118,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <PinMarkers
          key={state.wantToGo.length + state.history.length + state.bookable.length}
          wantToGo={state.wantToGo}
          history={state.history}
          bookable={state.bookable}
        />
      </MapView>

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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Pin</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Pin Name (e.g., 'Coffee Shop')"
                placeholderTextColor="#999"
                value={pinName}
                onChangeText={setPinName}
              />
              
              <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
                <Text style={styles.dateButtonText}>
                  {pinDate ? pinDate.toLocaleString() : 'Select Date & Time'}
                </Text>
              </TouchableOpacity>
              
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
              />

              <View style={styles.buttonRow}>
                <Button title="Cancel" onPress={handleCloseModal} color="red" />
                <Button title="Save Pin" onPress={handleSavePin} />
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
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
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: 'black'
  },
  dateButton: {
    height: 44,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {
    color: 'white',
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
});