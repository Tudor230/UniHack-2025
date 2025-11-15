import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, MapPin, X } from 'lucide-react-native';
import { Place } from '../../types/planner-types';
import { formatTime } from '../../utils/formaters-planner';

interface PlaceCardProps {
  place: Place;
  // It just receives simple functions as props
  onRemove: () => void;
  onSchedule: () => void;
  onUnschedule: () => void;
}

export function PlaceCard({
  place,
  onRemove,
  onSchedule,
  onUnschedule,
}: PlaceCardProps) {
  const isScheduled = place.status === 'scheduled' && place.scheduledTime;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.name}>{place.name}</Text>
          {isScheduled ? (
            <View style={styles.statusRow}>
              <Clock size={16} color="#166534" style={styles.statusIcon} />
              <Text style={styles.statusScheduled}>
                {formatTime(place.scheduledTime)}
              </Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <MapPin size={16} color="#2563EB" style={styles.statusIcon} />
              <Text style={styles.statusUnscheduled}>Unscheduled</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <X size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomRow}>
        {!isScheduled ? (
          <TouchableOpacity
            style={[styles.button, styles.scheduleButton]}
            onPress={onSchedule} // Use the prop directly
          >
            <Text style={styles.scheduleButtonText}>Schedule</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.unscheduleButton]}
            onPress={onUnschedule} // Use the prop directly
          >
            <Text style={styles.unscheduleButtonText}>Unschedule</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusScheduled: {
    fontSize: 14,
    color: '#166534',
  },
  statusUnscheduled: {
    fontSize: 14,
    color: '#2563EB',
  },
  removeButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButton: {
    backgroundColor: '#3B82F6',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  unscheduleButton: {
    backgroundColor: '#E5E7EB',
  },
  unscheduleButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});