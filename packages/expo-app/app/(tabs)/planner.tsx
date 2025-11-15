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
import { Trip, Place } from '../../types/planner-types';
import { TripItinerary } from '../../components/planner/TripItinerary';
import { PlaceCard } from '../../components/planner/PlaceCard';
import { MapPin } from 'lucide-react-native';
import mockdata from '../../assets/data/planned-trips.json'

export default function PlannerPage() {
  const [wantToGoPlaces, setWantToGoPlaces] = useState<Place[]>(mockdata.wantToGo);
  const [trips, setTrips] = useState<Trip[]>(mockdata.trips);
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
        ...placeToMoveGlobal,
        status: 'want-to-go',
        scheduledTime: null,
      };
      setWantToGoPlaces((currentPlaces) => [
        unscheduledPlace,
        ...currentPlaces,
      ]);
    }
  };

  /**
   * Marks a place as visited.
   */
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

    const scheduledPlace: Place = {
      ...placeToMove,
      status: 'scheduled',
      scheduledTime: `${selectedTrip.details.startDate}T09:00:00`,
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
    <View style={styles.pageContainer}>
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
          <Pressable style={styles.modalContainer} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to a Trip</Text>
            <Text style={styles.modalSubtitle}>
              Which trip do you want to add "{placeToMove?.name}" to?
            </Text>
            <View style={styles.tripListContainer}>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripSelectItem}
                  onPress={() => handleMovePlaceToTrip(trip.id)}
                >
                  <Text style={styles.tripSelectItemText}>
                    {trip.details.destination}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      {/* --- END MODAL --- */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Trips</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Global "Want to Go" Section --- */}
        <View style={styles.globalWantToGoSection}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#3B82F6" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Want to Go</Text>
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
              />
            ))
          ) : (
            <Text style={styles.emptyTripsText}>
              Your "Want to Go" list is empty.
            </Text>
          )}
        </View>

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
          <Text style={styles.emptyTripsText}>
            You have no trips planned.
          </Text>
        )}
      </ScrollView>
    </View>
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