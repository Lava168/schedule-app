import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { Event } from '@/types/event';
import { formatTime } from '@/lib/date-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const colors = useColors();
  const hasReminder = event.reminder !== undefined && event.reminder >= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.timeIndicator, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {event.title}
          </Text>
          {hasReminder && (
            <IconSymbol name="bell.fill" size={14} color={colors.warning} />
          )}
        </View>
        <View style={styles.timeRow}>
          <IconSymbol name="clock.fill" size={12} color={colors.muted} />
          <Text style={[styles.time, { color: colors.muted }]}>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </Text>
        </View>
        {event.description && (
          <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
            {event.description}
          </Text>
        )}
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  timeIndicator: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 13,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
});
