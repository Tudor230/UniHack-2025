import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Trip, Place, PlaceStatus } from '../../types/planner-types';
import { TripItinerary } from '../../components/planner/TripItinerary';
import { PlaceCard } from '../../components/planner/PlaceCard';
import { MapPin } from 'lucide-react-native';
import mockdata from '../../assets/data/planned-trips.json'
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function PlannerPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const borderNeutral = colorScheme === 'dark' ? '#38383A' : '#E5E5EA';
  const surface = palette.background;
  const surfaceCard = palette.background;
  const textSecondary = colorScheme === 'dark' ? '#9BA1A6' : '#6B7280';
  const normalizedWantToGo: Place[] = (mockdata.wantToGo as Place[]).map((p : Place) => ({
    ...p,
    status: p.status as PlaceStatus,
  }));
  const normalizedTrips: Trip[] = (mockdata.trips as Trip[]).map((t: Trip) => ({
    ...t,
    places: (t.places as Place[]).map((p : Place) => ({
      ...p,
      status: p.status as PlaceStatus,
    })),
  }));
  const [wantToGoPlaces, setWantToGoPlaces] = useState<Place[]>(normalizedWantToGo);
  const [trips, setTrips] = useState<Trip[]>(normalizedTrips);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [placeToMove, setPlaceToMove] = useState<Place | null>(null);

  // --- LOGIC ---

  const handleRemovePlace = (tripId: string, placeId: string) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            places: trip.places.filter((place) => place.id !== placeId),
          };
        }
        return trip;
      })
    );
  };

  const handleMovePlaceToWantToGo = (tripId: string, placeId: string) => {
    let placeToMoveGlobal: Place | null = null;
    setTrips((currentTrips) =>
      currentTrips.map((trip) => {
        if (trip.id === tripId) {
          placeToMoveGlobal = trip.places.find((p) => p.id === placeId) || null;
          return {
            ...trip,
            places: trip.places.filter((place) => place.id !== placeId),
          };
        }
        return trip;
      })
    );

    if (placeToMoveGlobal) {
    const unscheduledPlace: Place = {
      ...(placeToMoveGlobal as Place),
      status: 'want-to-go',
      scheduledTime: null,
    };
      setWantToGoPlaces((currentPlaces) => [
        unscheduledPlace,
        ...currentPlaces,
      ]);
    }
  };

  const handleMarkAsVisited = (tripId: string, placeId: string) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            places: trip.places.map((place) =>
              place.id === placeId ? { ...place, status: 'visited' } : place
            ),
          };
        }
        return trip;
      })
    );
  };

  const handleUndoVisit = (tripId: string, placeId: string) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            places: trip.places.map((place) =>
              place.id === placeId ? { ...place, status: 'scheduled' } : place
            ),
          };
        }
        return trip;
      })
    );
  };

  const handleOpenMoveModal = (place: Place) => {
    setPlaceToMove(place);
    setIsModalVisible(true);
  };

  const handleMovePlaceToTrip = (tripId: string) => {
    if (!placeToMove) return;
    const selectedTrip = trips.find((trip) => trip.id === tripId);
    if (!selectedTrip) return;

    // --- UPDATED LOGIC ---
    // 1. Try to get the start date from 'details'
    let effectiveStartDate = selectedTrip.details.startDate;

    // 2. If it's null or empty, fall back to 'dailyTravelTimes'
    if (!effectiveStartDate) {
      const tripDays = Object.keys(selectedTrip.dailyTravelTimes ?? {}).sort();
      if (tripDays.length > 0) {
        effectiveStartDate = tripDays[0]; // Get the first day from the sorted list
      }
    }

    // 3. If there's still no date, we can't schedule.
    if (!effectiveStartDate) {
      alert('This trip has no days and cannot be scheduled.');
      return;
    }
    // --- END UPDATE ---

    const scheduledPlace: Place = {
      ...placeToMove,
      status: 'scheduled',
      // --- UPDATED ---
      // Use the 'effectiveStartDate' variable
      scheduledTime: `${effectiveStartDate}T09:00:00`,
      // --- END UPDATE ---
    };

    setTrips((currentTrips) =>
      currentTrips.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            places: [...trip.places, scheduledPlace],
          };
        }
        return trip;
      })
    );

    setWantToGoPlaces((currentPlaces) =>
      currentPlaces.filter((place) => place.id !== placeToMove.id)
    );

    setIsModalVisible(false);
    setPlaceToMove(null);
  };

  const handleRemoveWantToGoPlace = (placeId: string) => {
    setWantToGoPlaces((currentPlaces) =>
      currentPlaces.filter((place) => place.id !== placeId)
    );
  };

  // --- END LOGIC ---

  return (
    <ThemedView style={[styles.pageContainer, { backgroundColor: palette.background }]}>
      {/* --- Modal (Unchanged) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable style={[styles.modalContainer, { backgroundColor: surfaceCard, borderColor: borderNeutral }]} onPress={() => {}}>
            <ThemedText type="subtitle" style={[styles.modalTitle, { color: palette.text } ]}>Add to a Trip</ThemedText>
            <ThemedText style={[styles.modalSubtitle, { color: textSecondary }]}>
              Which trip do you want to add "{placeToMove?.name}" to?
            </ThemedText>
            <View style={styles.tripListContainer}>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.tripSelectItem, { backgroundColor: surface, borderColor: borderNeutral }]}
                  onPress={() => handleMovePlaceToTrip(trip.id)}
                >
                  <ThemedText style={[styles.tripSelectItemText, { color: palette.text }]}>
                    {trip.details.destination}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.modalButtonCancel, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA' }]}
              onPress={() => setIsModalVisible(false)}
            >
              <ThemedText style={[styles.modalButtonCancelText, { color: palette.text }]}>Cancel</ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      {/* --- END MODAL --- */}

      <ThemedView style={[styles.header, { borderColor: borderNeutral, backgroundColor: surfaceCard }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: palette.text }]}>Your Trips</ThemedText>
      </ThemedView>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Global "Want to Go" Section --- */}
        <ThemedView style={[styles.globalWantToGoSection, { borderColor: borderNeutral, backgroundColor: surfaceCard }] }>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={palette.tint} style={styles.sectionIcon} />
            <ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Want to Go</ThemedText>
          </View>
          {wantToGoPlaces.length > 0 ? (
            wantToGoPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onRemove={() => handleRemoveWantToGoPlace(place.id)}
                onSchedule={() => handleOpenMoveModal(place)}
                onUnschedule={() => {}} // Not applicable
                onMarkAsVisited={() => {}} // Not applicable
                onUndoVisit={() => {}} // --- NEW ---
              />
            ))
          ) : (
            <ThemedText style={[styles.emptyTripsText, { color: textSecondary }]}>
              Your "Want to Go" list is empty.
            </ThemedText>
          )}
        </ThemedView>

        {/* --- Trips Section --- */}
        {trips.length > 0 ? (
          trips.map((trip) => (
            <TripItinerary
              key={trip.id}
              trip={trip}
              onRemovePlace={(placeId) => handleRemovePlace(trip.id, placeId)}
              onUnschedulePlace={(placeId) =>
                handleMovePlaceToWantToGo(trip.id, placeId)
              }
              onMarkPlaceAsVisited={(placeId) =>
                handleMarkAsVisited(trip.id, placeId)
              }
              onUndoPlaceVisit={(placeId) =>
                handleUndoVisit(trip.id, placeId)
              }
            />
          ))
        ) : (
          <ThemedText style={[styles.emptyTripsText, { color: textSecondary }]}>
            You have no trips planned.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// --- Styles ---
export const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  emptyTripsText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  globalWantToGoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  tripListContainer: {
    maxHeight: 200,
  },
  tripSelectItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tripSelectItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonCancelText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 16,
  },
});