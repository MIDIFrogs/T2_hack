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
  selectedStatus: DayStatus;
  mode: PaintMode;
  isPainting: boolean;
  selectedRange?: Date[];
}

/**
 * Day status with color mapping
 */
export const STATUS_COLORS: Record<DayStatus, string> = {
  [DayStatus.WORK]: "#A7FC00",      // Салатовый
  [DayStatus.OFF]: "#000000",       // Черный
  [DayStatus.VACATION]: "#FF3495",  // Маджента
  [DayStatus.SICK]: "#00BFFFF",     // Электрик-блю
  [DayStatus.SPLIT]: "#0000FF",     // Синий
};

/**
 * Status labels in Russian
 */
export const STATUS_LABELS: Record<DayStatus, string> = {
  [DayStatus.WORK]: "Рабочий день",
  [DayStatus.OFF]: "Выходной",
  [DayStatus.VACATION]: "Отпуск",
  [DayStatus.SICK]: "Больничный",
  [DayStatus.SPLIT]: "Дробящаяся смена",
};
