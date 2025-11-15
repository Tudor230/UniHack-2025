import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react-native';
import { Trip, Place } from '../../types/planner-types';
import { formatDateHeader, getDayNumber } from '../../utils/formaters-planner';
import { PlaceCard } from './PlaceCard';

function groupPlaces(trip: Trip): { [date: string]: Place[] } {
  const { places } = trip;
  const grouped: { [date: string]: Place[] } = {};

  places.forEach((place) => {
    if (place.status === 'scheduled' || place.status === 'visited') {
      const date = place.scheduledTime!.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(place);
      grouped[date].sort(
        (a, b) =>
          new Date(a.scheduledTime!).getTime() -
          new Date(b.scheduledTime!).getTime()
      );
    }
  });

  return grouped;
}

interface TripItineraryProps {
  trip: Trip;
  onRemovePlace: (placeId: string) => void;
  onUnschedulePlace: (placeId: string) => void;
  onMarkPlaceAsVisited: (placeId: string) => void;
  onUndoPlaceVisit: (placeId: string) => void;
}

export function TripItinerary({
  trip,
  onRemovePlace,
  onUnschedulePlace,
  onMarkPlaceAsVisited,
  onUndoPlaceVisit,
}: TripItineraryProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const groupedPlaces = useMemo(() => groupPlaces(trip), [trip]);

  // --- UPDATED ---
  // Derive effective dates and all days to show with conditional logic
  const { effectiveStartDate, effectiveEndDate, allDatesToShow } = useMemo(() => {
    const { details, dailyTravelTimes } = trip;

    // Get the sorted list of days from the travel times object
    const daysFromTravelTimes = Object.keys(dailyTravelTimes).sort();

    // LOGIC: Use details.startDate if it exists, otherwise fall back
    const startDate = details.startDate || (daysFromTravelTimes.length > 0 ? daysFromTravelTimes[0] : null);
    
    // LOGIC: Use details.endDate if it exists, otherwise fall back
    const endDate =
      details.endDate || (daysFromTravelTimes.length > 0 ? daysFromTravelTimes[daysFromTravelTimes.length - 1] : null);

    // This logic determines which days to RENDER.
    // It should be based on the most reliable source of *all* trip days,
    // which is the 'dailyTravelTimes' object keys.
    const allDays = daysFromTravelTimes;

    return {
      effectiveStartDate: startDate,
      effectiveEndDate: endDate,
      allDatesToShow: allDays,
    };
  }, [trip, groupedPlaces]);
  // --- END UPDATE ---

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setIsMinimized(!isMinimized)}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Your {trip.details.destination} Trip
          </Text>
          {/* --- UPDATED --- Use derived dates */}
          {effectiveStartDate && effectiveEndDate ? (
            <Text style={styles.headerDate}>
              {formatDateHeader(effectiveStartDate)} -{' '}
              {formatDateHeader(effectiveEndDate)}
            </Text>
          ) : (
            <Text style={styles.headerDate}>No dates scheduled</Text>
          )}
          {/* --- END UPDATE --- */}
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
          
          {/* --- UPDATED --- Use allDatesToShow array */}
          {allDatesToShow.length === 0 ? (
            <Text style={styles.emptyText}>
              No items scheduled for this trip yet.
            </Text>
          ) : (
            // Map over the *full range* of days from dailyTravelTimes
            allDatesToShow.map((date) => {
              const placesForDay = groupedPlaces[date] || []; // Get items, or an empty array
              const travelTimesForDay =(trip.dailyTravelTimes as Record<string, number[]>)[date] || [];
              return (
                <View style={styles.section} key={date}>
                  <View style={styles.sectionHeader}>
                    <Calendar
                      size={20}
                      color="#16A34A"
                      style={styles.sectionIcon}
                    />
                    {/* --- UPDATED --- Pass derived effectiveStartDate */}
                    <Text style={styles.sectionTitle}>
                      Day {getDayNumber(effectiveStartDate!, date)}:{' '}
                      {formatDateHeader(date)}
                    </Text>
                  </View>
                  <View style={styles.cardList}>
                    {placesForDay.length > 0 ? (
                      placesForDay.map((place, index) => {
                        // Get travel time from the array
                        const travelTime =
                          index < placesForDay.length - 1
                            ? travelTimesForDay[index] // Get time from our new array
                            : null;

                        return (
                          <View key={place.id}>
                            <PlaceCard
                              place={place}
                              onRemove={() => onRemovePlace(place.id)}
                              onSchedule={() => {}} // Not applicable
                              onUnschedule={() =>
                                onUnschedulePlace(place.id)
                              }
                              onMarkAsVisited={() =>
                                onMarkPlaceAsVisited(place.id)
                              }
                              onUndoVisit={() => onUndoPlaceVisit(place.id)}
                            />
                            {/* Render travel time if it exists */}
                            {travelTime != null && (
                              <View style={styles.travelTimeContainer}>
                                <MoreVertical
                                  size={16}
                                  color="#9CA3AF"
                                  style={styles.travelIcon}
                                />
                                <Text style={styles.travelText}>
                                  ~ {travelTime} min travel
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      // This now handles empty days
                      <Text style={styles.emptyText}>
                        No plans for this day yet.
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

// Styles
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
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  travelTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    height: 40, // Fixed height for the connector
  },
  travelIcon: {
    marginRight: 8,
  },
  travelText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});