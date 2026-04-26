import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayStatus } from "@/types";
import {
  DayStatus,
  PaintMode,
  PaintToolState,
  PaintPreset,
  ScheduleDayPayload,
  User,
  CollectionPeriod,
  ScheduleTemplate,
} from "@/types";

/**
 * Auth Store
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "t2-auth",
    }
  )
);

/**
 * Schedule Store
 */
interface ScheduleState {
  schedule: Record<string, ScheduleDayPayload>;
  currentPeriod: CollectionPeriod | null;
  isLoading: boolean;
  error: string | null;
  setSchedule: (schedule: Record<string, ScheduleDayPayload>) => void;
  setCurrentPeriod: (period: CollectionPeriod | null) => void;
  updateDay: (date: string, payload: ScheduleDayPayload) => void;
  updateDays: (updates: Record<string, ScheduleDayPayload>) => void;
  removeDay: (date: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSchedule: () => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedule: {},
  currentPeriod: null,
  isLoading: false,
  error: null,
  setSchedule: (schedule) => set({ schedule }),
  setCurrentPeriod: (period) => set({ currentPeriod: period }),
  updateDay: (date, payload) =>
    set((state) => ({
      schedule: {
        ...state.schedule,
        [date]: payload,
      },
    })),
  updateDays: (updates) =>
    set((state) => ({
      schedule: {
        ...state.schedule,
        ...updates,
      },
    })),
  removeDay: (date) =>
    set((state) => {
      const newSchedule = { ...state.schedule };
      delete newSchedule[date];
      return { schedule: newSchedule };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearSchedule: () => set({ schedule: {} }),
}));

/**
 * Paint Tool Store
 */
interface PaintToolStore extends PaintToolState {
  presets: Record<DayStatus, PaintPreset>;
  isPaintSettingsOpen: boolean;
  isDeleting: boolean; // Режим удаления дней
  setSelectedStatus: (status: DayStatus | null) => void;
  setMode: (mode: PaintMode) => void;
  setIsPainting: (painting: boolean) => void;
  setSelectedRange: (dates: Date[] | undefined) => void;
  setIsPaintSettingsOpen: (open: boolean) => void;
  setIsDeleting: (deleting: boolean) => void;
  updatePreset: (status: DayStatus, preset: PaintPreset) => void;
  getPreset: (status: DayStatus) => PaintPreset;
  reset: () => void;
}

const defaultPresets: Record<DayStatus, PaintPreset> = {
  [DayStatus.WORK]: { start: "09:00", end: "18:00" },
  [DayStatus.OFF]: {},
  [DayStatus.VACATION]: {},
  [DayStatus.SICK]: {},
  [DayStatus.SPLIT]: {
    splitShift: true,
    splitParts: [
      { start: "09:00", end: "13:00" },
      { start: "14:00", end: "18:00" },
    ],
  },
};

export const usePaintToolStore = create<PaintToolStore>()(
  persist(
    (set, get) => ({
      selectedStatus: null,
      mode: PaintMode.DRAG,
      isPainting: false,
      selectedRange: undefined,
      presets: defaultPresets,
      isPaintSettingsOpen: false,
      isDeleting: false,
      setSelectedStatus: (status) => set({ selectedStatus: status, isDeleting: false }),
      setMode: (mode) => set({ mode }),
      setIsPainting: (painting) => set({ isPainting: painting }),
      setSelectedRange: (dates) => set({ selectedRange: dates }),
      setIsPaintSettingsOpen: (open) => set({ isPaintSettingsOpen: open }),
      setIsDeleting: (deleting) => set({ isDeleting: deleting, selectedStatus: deleting ? null : false }),
      updatePreset: (status, preset) =>
        set((state) => ({
          presets: {
            ...state.presets,
            [status]: preset,
          },
        })),
      getPreset: (status) => {
        const { presets } = get();
        return presets[status] || {};
      },
      reset: () =>
        set({
          selectedStatus: null,
          mode: PaintMode.DRAG,
          isPainting: false,
          selectedRange: undefined,
          isPaintSettingsOpen: false,
          isDeleting: false,
        }),
    }),
    {
      name: "t2-paint-tool",
    }
  )
);

/**
 * Templates Store
 */
interface TemplatesState {
  templates: ScheduleTemplate[];
  isLoading: boolean;
  error: string | null;
  setTemplates: (templates: ScheduleTemplate[]) => void;
  addTemplate: (template: ScheduleTemplate) => void;
  removeTemplate: (templateId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTemplatesStore = create<TemplatesState>((set) => ({
  templates: [],
  isLoading: false,
  error: null,
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({
      templates: [...state.templates, template],
    })),
  removeTemplate: (templateId) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== templateId),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

/**
 * UI Store
 */
interface UIState {
  selectedDate: Date | null;
  isDayModalOpen: boolean;
  isQuickFillOpen: boolean;
  currentMonth: Date;
  setSelectedDate: (date: Date | null) => void;
  setIsDayModalOpen: (open: boolean) => void;
  setIsQuickFillOpen: (open: boolean) => void;
  setCurrentMonth: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedDate: null,
  isDayModalOpen: false,
  isQuickFillOpen: false,
  currentMonth: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setIsDayModalOpen: (open) => set({ isDayModalOpen: open }),
  setIsQuickFillOpen: (open) => set({ isQuickFillOpen: open }),
  setCurrentMonth: (date) => set({ currentMonth: date }),
  nextMonth: () =>
    set((state) => {
      const newDate = new Date(state.currentMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      return { currentMonth: newDate };
    }),
  prevMonth: () =>
    set((state) => {
      const newDate = new Date(state.currentMonth);
      newDate.setMonth(newDate.getMonth() - 1);
      return { currentMonth: newDate };
    }),
}));

/**
 * History Store for Undo/Redo
 */
interface HistoryState {
  past: Record<string, ScheduleDayPayload>[];
  future: Record<string, ScheduleDayPayload>[];
  canUndo: boolean;
  canRedo: boolean;
  pushState: (state: Record<string, ScheduleDayPayload>) => void;
  undo: (currentState: Record<string, ScheduleDayPayload>) => Record<string, ScheduleDayPayload> | null;
  redo: (currentState: Record<string, ScheduleDayPayload>) => Record<string, ScheduleDayPayload> | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,
  pushState: (state) =>
    set((prevState) => ({
      past: [...prevState.past, state],
      future: [],
      canUndo: true,
      canRedo: false,
    })),
  undo: (currentState) => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      future: [currentState, ...future],
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    return previous;
  },
  redo: (currentState) => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, currentState],
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return next;
  },
  clear: () =>
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),
}));
