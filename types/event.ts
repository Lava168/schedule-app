export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description?: string;
  reminder?: number; // Minutes before event (0, 5, 10, 15, 30, 60)
  notificationId?: string; // For canceling scheduled notifications
  createdAt: string;
  updatedAt: string;
}

export type ReminderOption = {
  label: string;
  value: number;
};

export const REMINDER_OPTIONS: ReminderOption[] = [
  { label: '无提醒', value: -1 },
  { label: '事件开始时', value: 0 },
  { label: '5分钟前', value: 5 },
  { label: '10分钟前', value: 10 },
  { label: '15分钟前', value: 15 },
  { label: '30分钟前', value: 30 },
  { label: '1小时前', value: 60 },
];
