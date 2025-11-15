import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar, ChevronDown, ChevronUp, MapPin } from 'lucide-react-native';
import { Trip, Place } from '../../types/planner-types';
import { formatDateHeader, getDayNumber } from '../../utils/formaters-planner';
import { PlaceCard } from './PlaceCard';

// --- LOGIC from useGroupedPlaces hook ---
interface GroupedPlaces {
  unscheduled: Place[];
  [date: string]: Place[];
}

function groupPlaces(trip: Trip): GroupedPlaces {
  const { places, details } = trip;
  const grouped: GroupedPlaces = {
    unscheduled: [],
  };

  places.forEach((place : any) => {
    if (place.scheduledTime && place.status === 'scheduled') {
      const date = place.scheduledTime.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(place);
      grouped[date].sort(
        (a, b) =>
          new Date(a.scheduledTime!).getTime() -
          new Date(b.scheduledTime!).getTime()
      );
    } else {
      grouped.unscheduled.push(place);
    }
  });

  if (!grouped[details.startDate]) grouped[details.startDate] = [];
  if (trip.id === 'trip-1' && !grouped['2025-10-21']) grouped['2025-10-21'] = [];
  if (trip.id === 'trip-1' && !grouped['2025-10-22']) grouped['2025-10-22'] = [];

  return grouped;
}
// --- END LOGIC ---

interface TripItineraryProps {
  trip: Trip;
  // It receives functions from PlannerPage
  onRemovePlace: (placeId: string) => void;
  onUpdatePlace: (placeId: string, updates: Partial<Place>) => void;
}

export function TripItinerary({
  trip,
  onRemovePlace,
  onUpdatePlace,
}: TripItineraryProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  
  // We use useMemo to run the grouping logic only when the trip changes
  const groupedPlaces = useMemo(() => groupPlaces(trip), [trip]);

  const scheduledDates = Object.keys(groupedPlaces)
    .filter((key) => key !== 'unscheduled')
    .sort();

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <Pressable
        style={styles.header}
        onPress={() => setIsMinimized(!isMinimized)}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Your {trip.details.destination} Trip
          </Text>
          <Text style={styles.headerDate}>
            {formatDateHeader(trip.details.startDate)} -{' '}
            {formatDateHeader(trip.details.endDate)}
          </Text>
        </View>
        {isMinimized ? (
          <ChevronDown size={24} color="#6B7280" />
        ) : (
          <ChevronUp size={24} color="#6B7280" />
        )}
      </Pressable>

      {/* --- Collapsible Content --- */}
      {!isMinimized && (
        <View style={styles.content}>
          {/* --- Unscheduled Items --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#3B82F6" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Want to Go</Text>
            </View>
            <View style={styles.cardList}>
              {groupedPlaces.unscheduled.length > 0 ? (
                groupedPlaces.unscheduled.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    // Pass the functions down to the card
                    onRemove={() => onRemovePlace(place.id)}
                    onSchedule={() =>
                      onUpdatePlace(place.id, {
                        // Simplified schedule logic for demo
                        scheduledTime:
                          trip.id === 'trip-1'
                            ? '2025-10-21T14:00:00Z'
                            : '2025-11-07T11:00:00Z',
                        status: 'scheduled',
                      })
                    }
                    onUnschedule={() =>
                      onUpdatePlace(place.id, {
                        scheduledTime: null,
                        status: 'want-to-go',
                      })
                    }
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No unscheduled places.</Text>
              )}
            </View>
          </View>

          {/* --- Scheduled Items --- */}
          {scheduledDates.map((date) => (
            <View style={styles.section} key={date}>
              <View style={styles.sectionHeader}>
                <Calendar
                  size={20}
                  color="#16A34A"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>
                  Day {getDayNumber(trip.details.startDate, date)}:{' '}
                  {formatDateHeader(date)}
                </Text>
              </View>
              <View style={styles.cardList}>
                {groupedPlaces[date].length > 0 ? (
                  groupedPlaces[date].map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      // Pass the functions down to the card
                      onRemove={() => onRemovePlace(place.id)}
                      onSchedule={() =>
                        onUpdatePlace(place.id, {
                          scheduledTime:
                            trip.id === 'trip-1'
                              ? '2025-10-21T14:00:00Z'
                              : '2025-11-07T11:00:00Z',
                          status: 'scheduled',
                        })
                      }
                      onUnschedule={() =>
                        onUpdatePlace(place.id, {
                          scheduledTime: null,
                          status: 'want-to-go',
                        })
                      }
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No plans for this day yet.
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  cardList: {
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});