import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate hours worked for a day
 */
export function calculateHours(start: string, end: string): number {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return (endMinutes - startMinutes) / 60;
}

/**
 * Calculate total hours from schedule entries
 */
export function calculateTotalHours(entries: Record<string, ScheduleDayPayload>): number {
  let total = 0;

  for (const entry of Object.values(entries)) {
    if (entry.meta?.start && entry.meta?.end) {
      // If split shift, calculate all parts
      if (entry.meta.splitShift) {
        const parts = entry.meta.splitParts || [{ start: entry.meta.start, end: entry.meta.end }];
        for (const part of parts) {
          total += calculateHours(part.start, part.end);
        }
      } else {
        total += calculateHours(entry.meta.start, entry.meta.end);
      }
    }
  }

  return total;
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}ч ${m}м`;
}

/**
 * Format hours for display without minutes (for mobile)
 */
export function formatHoursShort(hours: number): string {
  const h = Math.floor(hours);
  return `${h}ч`;
}

/**
 * Get date range for a month
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

/**
 * Check if date is in range
 */
export function isDateInRange(date: Date, range: { start: Date; end: Date }): boolean {
  return date >= range.start && date <= range.end;
}

/**
 * Format date for API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date from API (YYYY-MM-DD)
 */
export function parseDateFromAPI(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get week dates for a date
 */
export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday

  const monday = new Date(d.setDate(diff));
  const week: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    week.push(nextDate);
  }

  return week;
}

/**
 * Get month dates grid
 */
export function getMonthGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1; // Adjust to Monday

  const grid: Date[][] = [];
  let week: Date[] = [];

  // Add empty days for first week
  for (let i = 0; i < adjustedStartDay; i++) {
    week.push(new Date(year, month, 1 - adjustedStartDay + i));
  }

  // Add all days of month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    week.push(new Date(year, month, day));

    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  // Add remaining days for last week
  if (week.length > 0) {
    const remainingDays = 7 - week.length;
    for (let i = 1; i <= remainingDays; i++) {
      week.push(new Date(year, month + 1, i));
    }
    grid.push(week);
  }

  return grid;
}

/**
 * Check if two dates are same day
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * Check if date is in current month
 */
export function isCurrentMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}
