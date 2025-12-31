import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useEvents } from '@/lib/event-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { REMINDER_OPTIONS } from '@/types/event';
import { formatDateDisplay, formatTime } from '@/lib/date-utils';
import * as Haptics from 'expo-haptics';

export default function EventDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEventById, updateEvent, deleteEvent } = useEvents();

  const event = useMemo(() => getEventById(id || ''), [getEventById, id]);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || '');
  const [startTime, setStartTime] = useState(event?.startTime || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [description, setDescription] = useState(event?.description || '');
  const [reminder, setReminder] = useState(event?.reminder ?? -1);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.notFound}>
          <IconSymbol name="calendar" size={48} color={colors.muted} />
          <Text style={[styles.notFoundText, { color: colors.muted }]}>事件不存在</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.backButtonText}>返回</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
      // Reset to original values
      setTitle(event.title);
      setDate(event.date);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setDescription(event.description || '');
      setReminder(event.reminder ?? -1);
    } else {
      router.back();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入事件标题');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('提示', '结束时间必须晚于开始时间');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateEvent({
        ...event,
        title: title.trim(),
        date,
        startTime,
        endTime,
        description: description.trim() || undefined,
        reminder: reminder >= 0 ? reminder : undefined,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setIsEditing(false);
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '删除事件',
      '确定要删除这个事件吗？此操作无法撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              router.back();
            } catch (error) {
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const getReminderLabel = () => {
    const option = REMINDER_OPTIONS.find((o) => o.value === reminder);
    return option?.label || '无提醒';
  };

  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    }
    if (cleaned.length >= 6) {
      formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
    }
    setDate(formatted);
  };

  const handleTimeChange = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
    }
    setter(formatted);
  };

  // View mode
  if (!isEditing) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
          >
            <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>事件详情</Text>
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
          >
            <IconSymbol name="pencil" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>

          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.infoRow}>
              <IconSymbol name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.foreground }]}>
                {formatDateDisplay(event.date)}
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <IconSymbol name="clock.fill" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.foreground }]}>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </Text>
            </View>
            {event.reminder !== undefined && event.reminder >= 0 && (
              <>
                <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <IconSymbol name="bell.fill" size={20} color={colors.warning} />
                  <Text style={[styles.infoLabel, { color: colors.foreground }]}>
                    {getReminderLabel()}
                  </Text>
                </View>
              </>
            )}
          </View>

          {event.description && (
            <View style={[styles.descriptionCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.descriptionTitle, { color: colors.muted }]}>备注</Text>
              <Text style={[styles.descriptionText, { color: colors.foreground }]}>
                {event.description}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              { backgroundColor: colors.error },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>删除事件</Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Edit mode
  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.cancelText, { color: colors.muted }]}>取消</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>编辑日程</Text>
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.6 },
              isSubmitting && { opacity: 0.5 },
            ]}
          >
            <Text style={[styles.saveText, { color: colors.primary }]}>保存</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={[styles.inputGroup, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.titleInput, { color: colors.foreground }]}
              placeholder="添加标题"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="done"
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.surface }]}>
            <View style={styles.row}>
              <IconSymbol name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.label, { color: colors.foreground }]}>日期</Text>
              <TextInput
                style={[styles.valueInput, { color: colors.foreground }]}
                value={date}
                onChangeText={handleDateChange}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <IconSymbol name="clock.fill" size={20} color={colors.primary} />
              <Text style={[styles.label, { color: colors.foreground }]}>开始</Text>
              <TextInput
                style={[styles.valueInput, { color: colors.foreground }]}
                value={startTime}
                onChangeText={(t) => handleTimeChange(t, setStartTime)}
                placeholder="HH:mm"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <IconSymbol name="clock.fill" size={20} color={colors.muted} />
              <Text style={[styles.label, { color: colors.foreground }]}>结束</Text>
              <TextInput
                style={[styles.valueInput, { color: colors.foreground }]}
                value={endTime}
                onChangeText={(t) => handleTimeChange(t, setEndTime)}
                placeholder="HH:mm"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.surface }]}>
            <Pressable
              onPress={() => setShowReminderPicker(!showReminderPicker)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <IconSymbol name="bell.fill" size={20} color={colors.warning} />
              <Text style={[styles.label, { color: colors.foreground }]}>提醒</Text>
              <Text style={[styles.value, { color: colors.muted }]}>{getReminderLabel()}</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </Pressable>
            {showReminderPicker && (
              <View style={styles.pickerContainer}>
                {REMINDER_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setReminder(option.value);
                      setShowReminderPicker(false);
                    }}
                    style={({ pressed }) => [
                      styles.pickerOption,
                      { borderBottomColor: colors.border },
                      pressed && { backgroundColor: colors.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        { color: reminder === option.value ? colors.primary : colors.foreground },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {reminder === option.value && (
                      <IconSymbol name="checkmark" size={18} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.inputGroup, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.descriptionInput, { color: colors.foreground }]}
              placeholder="添加备注"
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoDivider: {
    height: 1,
    marginLeft: 46,
  },
  descriptionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputGroup: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  titleInput: {
    fontSize: 17,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  value: {
    fontSize: 16,
  },
  valueInput: {
    fontSize: 16,
    textAlign: 'right',
    minWidth: 100,
  },
  divider: {
    height: 1,
    marginLeft: 46,
  },
  pickerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingLeft: 46,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 16,
    minHeight: 100,
  },
});
