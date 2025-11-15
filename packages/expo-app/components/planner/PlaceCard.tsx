import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, MapPin, X, RotateCcw } from 'lucide-react-native';
import { Place } from '../../types/planner-types';
import { formatTime } from '../../utils/formaters-planner';

interface PlaceCardProps {
  place: Place;
  onRemove: () => void;
  onSchedule: () => void;
  onUnschedule: () => void;
  onMarkAsVisited: () => void;
  onUndoVisit: () => void;
}

export function PlaceCard({
  place,
  onRemove,
  onSchedule,
  onUnschedule,
  onMarkAsVisited,
  onUndoVisit,
}: PlaceCardProps) {
  const isScheduled = place.status === 'scheduled';
  const isVisited = place.status === 'visited';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={[styles.name, isVisited && styles.nameVisited]}>
            {place.name}
          </Text>

          {isScheduled || isVisited ? (
            <View style={styles.statusRow}>
              <Clock
                size={16}
                color={isVisited ? '#9CA3AF' : '#166534'}
                style={styles.statusIcon}
              />
              <Text
                style={[
                  styles.statusScheduled,
                  isVisited && styles.statusVisited,
                ]}
              >
                {formatTime(place.scheduledTime)} {isVisited && '(Visited)'}
              </Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <MapPin size={16} color="#2563EB" style={styles.statusIcon} />
              <Text style={styles.statusUnscheduled}>Unscheduled</Text>
            </View>
          )}
        </View>

        {isVisited && (
          <TouchableOpacity onPress={onUndoVisit} style={styles.undoButton}>
            <RotateCcw size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {!isScheduled && !isVisited && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {!isVisited && (
        <View style={styles.bottomRow}>
          {!isScheduled ? (
            // Case 1: "Want to Go"
            <TouchableOpacity
              style={[styles.button, styles.scheduleButton]}
              onPress={onSchedule}
            >
              <Text style={styles.scheduleButtonText}>Schedule</Text>
            </TouchableOpacity>
          ) : (
            // Case 2: "Scheduled" (but not visited)
            <>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.unscheduleButton,
                  { flex: 1, marginRight: 4 },
                ]}
                onPress={onUnschedule}
              >
                <Text style={styles.unscheduleButtonText}>Unschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.markVisitedButton,
                  { flex: 1, marginLeft: 4 },
                ]}
                onPress={onMarkAsVisited}
              >
                <Text style={styles.markVisitedButtonText}>Mark as Visited</Text>
              </TouchableOpacity>
            </>
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
  nameVisited: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
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
  statusVisited: {
    color: '#9CA3AF',
    fontStyle: 'italic',
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
  markVisitedButton: {
    backgroundColor: '#16A34A', // Green color
  },
  markVisitedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  undoButton: {
    padding: 4,
  },
  
});