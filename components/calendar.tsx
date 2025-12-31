import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useEvents } from '@/lib/event-store';
import {
  getMonthDays,
  formatDate,
  isSameDay,
  isSameMonth,
  getMonthName,
  getWeekDayNames,
  isToday,
} from '@/lib/date-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function Calendar({
  currentMonth,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const colors = useColors();
  const { events } = useEvents();
  const weekDays = getWeekDayNames();

  const days = useMemo(
    () => getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    events.forEach((event) => dates.add(event.date));
    return dates;
  }, [events]);

  const renderDay = (date: Date, index: number) => {
    const dateStr = formatDate(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isSelected = isSameDay(date, selectedDate);
    const isTodayDate = isToday(date);
    const hasEvents = eventDates.has(dateStr);

    return (
      <Pressable
        key={index}
        onPress={() => onSelectDate(date)}
        style={({ pressed }) => [
          styles.dayCell,
          pressed && { opacity: 0.7 },
        ]}
      >
        <View
          style={[
            styles.dayContent,
            isSelected && { backgroundColor: colors.primary },
            isTodayDate && !isSelected && { borderWidth: 1, borderColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: isCurrentMonth ? colors.foreground : colors.muted },
              isSelected && { color: '#FFFFFF' },
            ]}
          >
            {date.getDate()}
          </Text>
        </View>
        {hasEvents && (
          <View
            style={[
              styles.eventDot,
              { backgroundColor: isSelected ? '#FFFFFF' : colors.primary },
            ]}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onPrevMonth}
          style={({ pressed }) => [
            styles.navButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="arrow.left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.monthTitle, { color: colors.foreground }]}>
          {currentMonth.getFullYear()}年 {getMonthName(currentMonth.getMonth())}
        </Text>
        <Pressable
          onPress={onNextMonth}
          style={({ pressed }) => [
            styles.navButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <IconSymbol name="chevron.right" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Week days header */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={[styles.weekDayText, { color: colors.muted }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.daysGrid}>
        {days.map((date, index) => renderDay(date, index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayContent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '400',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  },
});
