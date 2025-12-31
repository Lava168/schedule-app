import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { EventCard } from '@/components/event-card';
import { useColors } from '@/hooks/use-colors';
import { useEvents } from '@/lib/event-store';
import { formatDateDisplay, getTodayString } from '@/lib/date-utils';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Event } from '@/types/event';

interface Section {
  title: string;
  data: Event[];
}

export default function ScheduleScreen() {
  const colors = useColors();
  const router = useRouter();
  const { getUpcomingEvents, isLoading } = useEvents();

  const sections = useMemo(() => {
    const events = getUpcomingEvents();
    const grouped: Record<string, Event[]> = {};

    events.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });

    return Object.entries(grouped).map(([date, data]) => ({
      title: date,
      data,
    }));
  }, [getUpcomingEvents]);

  const handleEventPress = useCallback((event: Event) => {
    router.push({
      pathname: '/event/[id]' as any,
      params: { id: event.id },
    });
  }, [router]);

  const handleAddEvent = useCallback(() => {
    router.push({
      pathname: '/event/create' as any,
      params: { date: getTodayString() },
    });
  }, [router]);

  const renderEvent = useCallback(
    ({ item }: { item: Event }) => (
      <EventCard event={item} onPress={() => handleEventPress(item)} />
    ),
    [handleEventPress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => {
      const today = getTodayString();
      const isToday = section.title === today;
      return (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {isToday ? '今天' : formatDateDisplay(section.title)}
          </Text>
        </View>
      );
    },
    [colors]
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="list.bullet" size={48} color={colors.muted} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        暂无日程
      </Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        点击下方按钮添加您的第一个日程
      </Text>
      <Pressable
        onPress={handleAddEvent}
        style={({ pressed }) => [
          styles.addButton,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.8 },
        ]}
      >
        <IconSymbol name="plus" size={18} color="#FFFFFF" />
        <Text style={styles.addButtonText}>添加日程</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>日程</Text>
        <Pressable
          onPress={handleAddEvent}
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 },
          ]}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {sections.length === 0 ? (
        renderEmptyList()
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderEvent}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
