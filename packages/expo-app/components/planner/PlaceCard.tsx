import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, MapPin, X, RotateCcw } from 'lucide-react-native';
import { Place } from '../../types/planner-types';
import { formatTime } from '../../utils/formaters-planner';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const isVisited = place.visited;
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const borderNeutral = colorScheme === 'dark' ? '#38383A' : '#E5E5EA';
  const surfaceCard = palette.background;
  const textSecondary = colorScheme === 'dark' ? '#9BA1A6' : '#6B7280';

  return (
    <ThemedView style={[styles.container, { backgroundColor: surfaceCard, borderColor: borderNeutral }]}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <ThemedText style={[styles.name, { color: palette.text }, isVisited && styles.nameVisited]}>
            {place.name}
          </ThemedText>

          {isScheduled || isVisited ? (
            <View style={styles.statusRow}>
              <Clock
                size={16}
                color={isVisited ? '#9CA3AF' : '#166534'}
                style={styles.statusIcon}
              />
              <ThemedText
                style={[
                  styles.statusScheduled,
                  { color: isVisited ? textSecondary : '#166534' },
                  isVisited && styles.statusVisited,
                ]}
              >
                {formatTime(place.scheduledTime)} {isVisited && '(Visited)'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <MapPin size={16} color="#2563EB" style={styles.statusIcon} />
              <ThemedText style={[styles.statusUnscheduled, { color: '#2563EB' } ]}>Unscheduled</ThemedText>
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
        <View style={[styles.bottomRow, { borderColor: borderNeutral }] }>
          {!isScheduled ? (
            // Case 1: "Want to Go"
            <TouchableOpacity
              style={[styles.button, styles.scheduleButton]}
              onPress={onSchedule}
            >
              <ThemedText style={styles.scheduleButtonText}>Schedule</ThemedText>
            </TouchableOpacity>
          ) : (
            // Case 2: "Scheduled" (but not visited)
            <>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.unscheduleButton,
                  { flex: 1, marginRight: 4, backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E7EB' },
                ]}
                onPress={onUnschedule}
              >
                <ThemedText style={[styles.unscheduleButtonText, { color: palette.text } ]}>Unschedule</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.markVisitedButton,
                  { flex: 1, marginLeft: 4 },
                ]}
                onPress={onMarkAsVisited}
              >
                <ThemedText style={styles.markVisitedButtonText}>Mark as Visited</ThemedText>
              </TouchableOpacity>
            </>
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
    backgroundColor: '#16A34A',
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