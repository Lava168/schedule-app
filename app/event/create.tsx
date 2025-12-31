import React, { useState, useCallback } from 'react';
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
import { formatDateDisplay, getTodayString } from '@/lib/date-utils';
import * as Haptics from 'expo-haptics';

export default function CreateEventScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const { addEvent } = useEvents();

  const initialDate = params.date || getTodayString();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [reminder, setReminder] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const handleSave = useCallback(async () => {
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
      await addEvent({
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
      router.back();
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, date, startTime, endTime, description, reminder, addEvent, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const getReminderLabel = () => {
    const option = REMINDER_OPTIONS.find((o) => o.value === reminder);
    return option?.label || '无提醒';
  };

  // Simple date input for cross-platform
  const handleDateChange = (text: string) => {
    // Format: YYYY-MM-DD
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
    // Format: HH:mm
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
    }
    setter(formatted);
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.cancelText, { color: colors.muted }]}>取消</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>新建日程</Text>
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
          {/* Title */}
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

          {/* Date & Time */}
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

          {/* Reminder */}
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

          {/* Description */}
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
