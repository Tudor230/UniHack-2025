import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
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
  const datesWithItems = Object.keys(groupedPlaces).sort();

  const allDatesToShow = useMemo(() => {
    if (datesWithItems.length === 0) {
      return [];
    }

    const lastScheduledDateStr = datesWithItems[datesWithItems.length - 1];
    
    const startDate = new Date(trip.details.startDate + 'T12:00:00Z');
    const lastScheduledDate = new Date(lastScheduledDateStr + 'T12:00:00Z');

    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= lastScheduledDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [trip.details.startDate, groupedPlaces]);
  
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
          
          {/* Check if there are *any* days to show */}
          {allDatesToShow.length === 0 ? (
            // Condition 1: No items scheduled at all
            <Text style={styles.emptyText}>
              No items scheduled for this trip yet.
            </Text>
          ) : (
            // Condition 2 & 3: Map over the *full range* of days
            allDatesToShow.map((date) => {
              const placesForDay = groupedPlaces[date] || []; // Get items, or an empty array
              return (
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
                    {placesForDay.length > 0 ? (
                      placesForDay.map((place) => (
                        <PlaceCard
                          key={place.id}
                          place={place}
                          onRemove={() => onRemovePlace(place.id)}
                          onSchedule={() => {}} // Not applicable
                          onUnschedule={() => onUnschedulePlace(place.id)}
                          onMarkAsVisited={() =>
                            onMarkPlaceAsVisited(place.id)
                          }
                          onUndoVisit={() => onUndoPlaceVisit(place.id)}
                        />
                      ))
                    ) : (
                      // This now handles empty days like Day 1 and Day 2
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
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});