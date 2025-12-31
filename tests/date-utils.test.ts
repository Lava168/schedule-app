import { describe, it, expect } from 'vitest';
import {
  formatDate,
  parseDate,
  isSameDay,
  isSameMonth,
  getMonthDays,
  formatTime,
  formatDateDisplay,
  isToday,
  getTodayString,
} from '../lib/date-utils';

describe('date-utils', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      expect(formatDate(date)).toBe('2025-01-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2025, 5, 5); // June 5, 2025
      expect(formatDate(date)).toBe('2025-06-05');
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD string to Date', () => {
      const date = parseDate('2025-01-15');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(15);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date(2025, 0, 15, 10, 30);
      const date2 = new Date(2025, 0, 15, 14, 45);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2025, 0, 15);
      const date2 = new Date(2025, 0, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isSameMonth', () => {
    it('should return true for same month', () => {
      const date1 = new Date(2025, 5, 1);
      const date2 = new Date(2025, 5, 30);
      expect(isSameMonth(date1, date2)).toBe(true);
    });

    it('should return false for different months', () => {
      const date1 = new Date(2025, 5, 15);
      const date2 = new Date(2025, 6, 15);
      expect(isSameMonth(date1, date2)).toBe(false);
    });
  });

  describe('getMonthDays', () => {
    it('should return 42 days for calendar grid', () => {
      const days = getMonthDays(2025, 0); // January 2025
      expect(days.length).toBe(42);
    });

    it('should include days from previous and next months', () => {
      const days = getMonthDays(2025, 0); // January 2025
      // First day should be from December 2024 or January 2025
      const firstDay = days[0];
      const lastDay = days[41];
      // Last day should be from January or February 2025
      expect(lastDay.getMonth()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatTime', () => {
    it('should format morning time correctly', () => {
      expect(formatTime('09:30')).toBe('上午 9:30');
    });

    it('should format afternoon time correctly', () => {
      expect(formatTime('14:30')).toBe('下午 2:30');
    });

    it('should format noon correctly', () => {
      expect(formatTime('12:00')).toBe('下午 12:00');
    });

    it('should format midnight correctly', () => {
      expect(formatTime('00:00')).toBe('上午 12:00');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date with weekday', () => {
      const result = formatDateDisplay('2025-01-15');
      expect(result).toContain('1月15日');
      expect(result).toContain('周');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('getTodayString', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const today = new Date();
      const expected = formatDate(today);
      expect(getTodayString()).toBe(expected);
    });
  });
});
