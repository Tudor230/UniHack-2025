import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react-native';
import { Trip, Place } from '../../types/planner-types';
import { formatDateHeader, getDayNumber } from '../../utils/formaters-planner';
import { PlaceCard } from './PlaceCard';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const borderNeutral = colorScheme === 'dark' ? '#38383A' : '#E5E5EA';
  const surface = palette.background;
  const textSecondary = colorScheme === 'dark' ? '#9BA1A6' : '#6B7280';

  const groupedPlaces = useMemo(() => groupPlaces(trip), [trip]);

  // --- UPDATED ---
  // Derive effective dates and all days to show with conditional logic
  const { effectiveStartDate, effectiveEndDate, allDatesToShow } = useMemo(() => {
    const { details, dailyTravelTimes } = trip;

    // Get the sorted list of days from the travel times object
    const daysFromTravelTimes = Object.keys(dailyTravelTimes ?? {}).sort();

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
    <ThemedView style={[styles.container, { backgroundColor: palette.background, borderColor: borderNeutral }]}>
      <Pressable
        style={styles.header}
        onPress={() => setIsMinimized(!isMinimized)}
      >
        <View style={styles.headerTextContainer}>
          <ThemedText style={[styles.headerTitle, { color: palette.text }]}>
            Your {trip.details.destination} Trip
          </ThemedText>
          {/* --- UPDATED --- Use derived dates */}
          {effectiveStartDate && effectiveEndDate ? (
            <ThemedText style={[styles.headerDate, { color: textSecondary }]}>
              {formatDateHeader(effectiveStartDate)} -{' '}
              {formatDateHeader(effectiveEndDate)}
            </ThemedText>
          ) : (
            <ThemedText style={[styles.headerDate, { color: textSecondary }]}>No dates scheduled</ThemedText>
          )}
          {/* --- END UPDATE --- */}
        </View>
        {isMinimized ? (
          <ChevronDown size={24} color={textSecondary} />
        ) : (
          <ChevronUp size={24} color={textSecondary} />
        )}
      </Pressable>

      {/* --- Collapsible Content --- */}
      {!isMinimized && (
        <View style={[styles.content, { backgroundColor: surface, borderColor: borderNeutral }] }>
          
          {/* --- UPDATED --- Use allDatesToShow array */}
          {allDatesToShow.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: textSecondary }]}> 
              No items scheduled for this trip yet.
            </ThemedText>
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
                    <ThemedText style={[styles.sectionTitle, { color: palette.text }] }>
                      Day {getDayNumber(effectiveStartDate!, date)}:{' '}
                      {formatDateHeader(date)}
                    </ThemedText>
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
                                  color={textSecondary}
                                  style={styles.travelIcon}
                                />
                                <ThemedText style={[styles.travelText, { color: textSecondary }]}>
                                  ~ {travelTime} min travel
                                </ThemedText>
                              </View>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      // This now handles empty days
                      <ThemedText style={[styles.emptyText, { color: textSecondary }] }>
                        No plans for this day yet.
                      </ThemedText>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </ThemedView>
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