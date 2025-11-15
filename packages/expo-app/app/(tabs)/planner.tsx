import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Trip, Place } from '../../types/planner-types';
import { TripItinerary } from '../../components/planner/TripItinerary';

// --- MOCK DATA ---
// We keep the mock data right here for easy testing
const initialTrips: Trip[] = [
  {
    id: 'trip-1',
    details: {
      destination: 'Paris',
      startDate: '2025-10-20',
      endDate: '2025-10-22',
    },
    places: [
      {
        id: 'uuid-1',
        name: 'Eiffel Tower',
        location: { lat: 48.8584, lng: 2.2945 },
        status: 'want-to-go',
        scheduledTime: null,
        type: 'activity',
      },
      {
        id: 'uuid-2',
        name: 'Louvre Museum',
        location: { lat: 48.8606, lng: 2.3376 },
        status: 'scheduled',
        scheduledTime: '2025-10-20T10:00:00Z',
        type: 'activity',
      },
    ],
  },
  {
    id: 'trip-2',
    details: {
      destination: 'Tokyo',
      startDate: '2025-11-05',
      endDate: '2025-11-10',
    },
    places: [
      {
        id: 'uuid-4',
        name: 'Shinjuku Gyoen',
        location: { lat: 35.685, lng: 139.710 },
        status: 'want-to-go',
        scheduledTime: null,
        type: 'activity',
      },
    ],
  },
];
// --- END MOCK DATA ---

export default function PlannerPage() {
  // All state now lives inside this component
  const [trips, setTrips] = useState<Trip[]>(initialTrips);

  // --- LOGIC ---
  // All logic for updating state lives here
  
  /**
   * Removes a place from a specific trip
   */
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

  /**
   * Updates a place in a specific trip
   */
  const handleUpdatePlace = (
    tripId: string,
    placeId: string,
    updates: Partial<Place>
  ) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) => {
        if (trip.id === tripId) {
          return {
            ...trip,
            places: trip.places.map((place) =>
              place.id === placeId ? { ...place, ...updates } : place
            ),
          };
        }
        return trip;
      })
    );
  };
  // --- END LOGIC ---

  return (
    <View style={styles.pageContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Trips</Text>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {trips.length > 0 ? (
          trips.map((trip) => (
            <TripItinerary
              key={trip.id}
              trip={trip}
              // We pass the handler functions down as props
              onRemovePlace={(placeId) => handleRemovePlace(trip.id, placeId)}
              onUpdatePlace={(placeId, updates) =>
                handleUpdatePlace(trip.id, placeId, updates)
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

// Styles remain the same
export const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    paddingTop: 16, // Adjust as needed
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
    gap: 16, // Adds space between trip cards
  },
  emptyTripsText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 32,
  },
});