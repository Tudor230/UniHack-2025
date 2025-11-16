import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Trip, Place, PlaceStatus } from '../../types/planner-types';
import { TripItinerary } from '../../components/planner/TripItinerary';
import { PlaceCard } from '../../components/planner/PlaceCard';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { usePins, Pin } from '@/state/pins';

const TRIPS_API_URL = 'https://backend-507j.onrender.com/my/875812bb4985dff0ea018c65afc14ddf/trips';

// This converts the Pin object from usePins into the Place object your planner needs
function pinToPlace(pin: Pin): Place {
  return {
    id: pin.id,
    name: pin.title,
    location: {
      lat: pin.coords.latitude,
      lng: pin.coords.longitude,
    },
    status: 'want-to-go',
    scheduledTime: pin.eventDate ? new Date(pin.eventDate).toISOString() : null,
    type: 'activity', // Assuming all 'want-to-go' pins are 'activity'
  };
}

// This converts a Place object back into a Pin to save it
function placeToPin(place: Place): Pin {
  return {
    id: place.id,
    title: place.name,
    coords: {
      latitude: place.location.lat,
      longitude: place.location.lng,
    },
    type: 'want',
    eventDate: place.scheduledTime ? new Date(place.scheduledTime).getTime() : undefined,
    createdAt: Date.now(), // This will be a new creation timestamp
  };
}

export default function PlannerPage() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const borderNeutral = colorScheme === 'dark' ? '#38383A' : '#E5E5EA';
  const surface = palette.background;
  const surfaceCard = palette.background;
  const textSecondary = colorScheme === 'dark' ? '#9BA1A6' : '#6B7280';

  const { state: pinState, addPin, removePin } = usePins();

  const [wantToGoPlaces, setWantToGoPlaces] = useState<Place[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [placeToMove, setPlaceToMove] = useState<Place | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isWantToGoMinimized, setIsWantToGoMinimized] = useState(false);

  useEffect(() => {
    const normalized = pinState.wantToGo.map(pinToPlace);
    setWantToGoPlaces(normalized);
  }, [pinState.wantToGo]); // This runs when the component loads AND when pins change

  useEffect(() => {
    const fetchData = async () => {
      // Set loading to true only if it's not already loading (e.g. for a refresh)
      if (!isLoading) setIsLoading(true);
      try {
        // Fetch both endpoints concurrently
        const [tripsResponse] = await Promise.all([
          fetch(TRIPS_API_URL),
        ]);

        if (!tripsResponse.ok) {
          throw new Error('Network response was not ok');
        }

        // Parse the JSON data
        const tripsData = await tripsResponse.json();

        const normalizedTrips: Trip[] = (tripsData as Trip[]).map((t: Trip) => ({
          ...t,
          places: (t.places as Place[]).map((p: Place) => ({
            ...p,
            status: p.status as PlaceStatus,
          })),
        }));

        // SET the state with the fetched data
        setTrips(normalizedTrips);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
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
      // This updates the local UI
      setWantToGoPlaces((currentPlaces) => [unscheduledPlace, ...currentPlaces]);
      
      // Convert 'Place' back to 'Pin' and add to global state
      addPin(placeToPin(unscheduledPlace))
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

  const router = useRouter();

  // --- THIS IS THE MODIFIED FUNCTION ---
  const handleMovePlaceToTrip = (tripId: string) => {
    if (!placeToMove) return;
    const selectedTrip = trips.find((trip) => trip.id === tripId);
    if (!selectedTrip) return;

    // 1. Create a more detailed prompt string.
    // We use a template literal (backticks ``) to build a multi-line string.
    const generatedPrompt = `
Hi! Can you please schedule the following activity?

Activity Details:
- Name: ${placeToMove.name}
- Type: ${placeToMove.type}
- Location (Lat, Lng): ${placeToMove.location.lat}, ${placeToMove.location.lng}

Please add it to my trip to: ${selectedTrip.details.destination}.
    `.trim(); // .trim() removes any extra whitespace from the beginning or end

    // 2. Remove the place from "Want to Go"
    setWantToGoPlaces((currentPlaces) =>
      currentPlaces.filter((place) => place.id !== placeToMove.id)
    );

    // Remove from global state as well
    removePin(placeToMove.id);

    // 3. Close the modal
    setIsModalVisible(false);
    setPlaceToMove(null);

    // 4. Navigate to the 'guide' tab and pass the new, detailed prompt
    router.push({
      pathname: '/guide', // This is the path to guide.tsx in your (tabs) layout
      params: { autoPrompt: generatedPrompt },
    });
  };

  const handleRemoveWantToGoPlace = (placeId: string) => {
    // This updates the local UI
    setWantToGoPlaces((currentPlaces) =>
      currentPlaces.filter((place) => place.id !== placeId)
    );
    
    // Also remove it from the global state
    removePin(placeId);
  };

  // --- END LOGIC ---

  if (isLoading) {
    return (
      <ThemedView style={[styles.pageContainer, styles.centeredContainer,{backgroundColor:palette.background}]}>
        <ActivityIndicator size="large" color={palette.tint} />
        <ThemedText style={{ marginTop: 10 }}>Loading your plans...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.pageContainer, styles.centeredContainer,{backgroundColor:palette.background}]}>
        <ThemedText type="subtitle" style={{ color: 'red' }}>Error</ThemedText>
        <ThemedText>{error}</ThemedText>
        <TouchableOpacity onPress={() => {
          setIsLoading(true);
          setError(null);
          // You would re-run the fetch logic here, or just refresh
        }}>
          <ThemedText style={{ color: palette.tint, marginTop: 15 }}>Try again</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

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
          
          {/* 3a. Make the header pressable */}
          <Pressable
            style={styles.collapsibleSectionHeader}
            onPress={() => setIsWantToGoMinimized(!isWantToGoMinimized)}
          >
            <View style={styles.sectionHeaderLeft}>
              <MapPin size={20} color={palette.tint} style={styles.sectionIcon} />
              <ThemedText style={[styles.sectionTitle, { color: palette.text }]}>Want to Go</ThemedText>
            </View>
            {isWantToGoMinimized ? (
              <ChevronDown size={24} color={textSecondary} />
            ) : (
              <ChevronUp size={24} color={textSecondary} />
            )}
          </Pressable>

          {/* 3b. Conditionally render the content */}
          {!isWantToGoMinimized && (
            <View style={styles.wantToGoContent}>
              {wantToGoPlaces.length > 0 ? (
                wantToGoPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onRemove={() => handleRemoveWantToGoPlace(place.id)}
                    onSchedule={() => handleOpenMoveModal(place)}
                    onUnschedule={() => {}} // Not applicable
                    onMarkAsVisited={() => {}} // Not applicable
                    onUndoVisit={() => {}}
                  />
                ))
              ) : (
                <ThemedText style={[styles.emptyTripsText, { color: textSecondary }]}>
                  Your "Want toGo" list is empty.
                </ThemedText>
              )}
            </View>
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
  },
  collapsibleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  wantToGoContent: {
    paddingTop: 12, // Creates space from the header
    gap: 12, // Creates space between cards
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});