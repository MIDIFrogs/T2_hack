/**
 * User roles
 */
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
}

/**
 * User data
 */
export interface User {
  id: number;
  external_id?: string;
  email?: string;
  full_name?: string;
  alliance?: string;
  category?: string;
  role: UserRole;
  registered: boolean;
  is_verified: boolean;
  available_vacation_days?: number;
  available_off_days?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Day status types
 */
export enum DayStatus {
  WORK = "work",
  OFF = "off",
  VACATION = "vacation",
  SICK = "sick",
  SPLIT = "split",
}

/**
 * Schedule day metadata
 */
export interface ScheduleMeta {
  start?: string; // HH:MM
  end?: string; // HH:MM
  note?: string;
  splitShift?: boolean;
  splitParts?: Array<{ start: string; end: string }>;
}

/**
 * Schedule day payload
 */
export interface ScheduleDayPayload {
  status: string;
  meta?: ScheduleMeta;
  is_draft?: boolean; // True если это черновик (вне активного периода)
}

/**
 * Schedule entry
 */
export interface ScheduleEntry {
  id: number;
  user_id: number;
  period_id: number;
  day: string; // YYYY-MM-DD
  status: string;
  meta?: ScheduleMeta;
  created_at: string;
  updated_at: string;
}

/**
 * Collection period
 */
export interface CollectionPeriod {
  id: number;
  alliance: string;
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  deadline: string; // ISO datetime
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Schedule template
 */
export interface ScheduleTemplate {
  id: number;
  user_id: number;
  name: string;
  work_days: number;
  rest_days: number;
  shift_start: string; // HH:MM
  shift_end: string; // HH:MM
  has_break: boolean;
  break_start?: string; // HH:MM
  break_end?: string; // HH:MM
  created_at: string;
  updated_at: string;
}

/**
 * Auth token
 */
export interface Token {
  access_token: string;
  token_type: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Schedule stats
 */
export interface ScheduleStats {
  totalHours: number;
  targetHours: number;
  remainingHours: number;
  overworkHours: number;
  workDays: number;
  offDays: number;
  vacationDays: number;
  sickDays: number;
  splitDays: number;
  emptyDays: number;
}

/**
 * Paint tool mode
 */
export enum PaintMode {
  SINGLE = "single",
  DRAG = "drag",
  RANGE = "range",
}

/**
 * Paint tool state
 */
export interface PaintToolState {
  selectedStatus: DayStatus | null;
  mode: PaintMode;
  isPainting: boolean;
  selectedRange?: Date[];
}

/**
 * Paint tool preset (settings for brush)
 */
export interface PaintPreset {
  start?: string;
  end?: string;
  note?: string;
  splitShift?: boolean;
  splitParts?: Array<{ start: string; end: string }>;
}

/**
 * Paint tool presets for all status types
 */
export interface PaintToolPresets {
  [DayStatus.WORK]: PaintPreset;
  [DayStatus.OFF]: PaintPreset;
  [DayStatus.VACATION]: PaintPreset;
  [DayStatus.SICK]: PaintPreset;
  [DayStatus.SPLIT]: PaintPreset;
}

/**
 * Day status with color mapping
 */
export const STATUS_COLORS: Record<DayStatus, string> = {
  [DayStatus.WORK]: "#A7FC00",      // Салатовый
  [DayStatus.OFF]: "#FFFF00",       // Кислотно-жёлтый
  [DayStatus.VACATION]: "#FF3495",  // Маджента
  [DayStatus.SICK]: "#FF4444",      // Кислотно-красный
  [DayStatus.SPLIT]: "#0000FF",     // Синий
};

/**
 * Status labels in Russian
 */
export const STATUS_LABELS: Record<DayStatus, string> = {
  [DayStatus.WORK]: "Рабочий день",
  [DayStatus.OFF]: "Отгул",
  [DayStatus.VACATION]: "Отпуск",
  [DayStatus.SICK]: "Больничный",
  [DayStatus.SPLIT]: "Дробящаяся смена",
};

/**
 * Hourly rate
 */
export interface HourlyRate {
  id: number;
  user_id: number;
  hourly_rate: number;
  effective_date: string; // YYYY-MM-DD
  created_at: string;
}

/**
 * Salary breakdown by type
 */
export interface SalaryBreakdown {
  work_days: number;
  vacation: number;
  sick_leave: number;
  overtime: number;
  night_hours: number;
  weekend_holiday: number;
  split_shift: number;
  total: number;
}

/**
 * Salary details for a period
 */
export interface SalaryDetails {
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  total_hours: number;
  breakdown: SalaryBreakdown;
  days_summary: Record<string, number>;
}

/**
 * Salary response
 */
export interface SalaryResponse {
  salary: SalaryDetails;
  current_hourly_rate?: number;
}
