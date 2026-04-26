"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, LogIn, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { PaintTool } from "@/components/calendar/PaintTool";
import { PaintToolModal } from "@/components/calendar/PaintToolModal";
import { QuickFillModal } from "@/components/calendar/QuickFillModal";
import { StatsCard } from "@/components/stats/StatsCard";
import { PeriodInfo } from "@/components/calendar/PeriodInfo";
import { VacationLimits, VacationLimitsRef } from "@/components/calendar/VacationLimits";
import { DayModal } from "@/components/calendar/DayModal";

import { useScheduleStore, useUIStore, usePaintToolStore, useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatDateForAPI } from "@/lib/utils";
import { DayStatus, ScheduleDayPayload } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const {
    schedule,
    currentPeriod,
    isLoading,
    error,
    setSchedule,
    setCurrentPeriod,
    updateDay,
    updateDays,
    setLoading,
    setError,
  } = useScheduleStore();

  const { currentMonth, setCurrentMonth, nextMonth, prevMonth, setSelectedDate, setIsDayModalOpen, setIsQuickFillOpen } =
    useUIStore();

  const { selectedStatus, isPainting, getPreset, isDeleting } = usePaintToolStore();
  const { removeDay } = useScheduleStore();

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const vacationLimitsRef = useRef<VacationLimitsRef>(null);

  // Load initial data
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadInitialData();
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load current period
      const period = await api.getCurrentPeriod();
      setCurrentPeriod(period);

      if (period) {
        // Set current month to period start
        const startDate = new Date(period.period_start);
        setCurrentMonth(startDate);
      }

      // Load schedule
      const scheduleData = await api.getMySchedule();
      setSchedule(scheduleData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Track drag state for distinguishing click vs drag
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);

  // Handle day click
  const handleDayClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setIsDayModalOpen(true);
    },
    [setSelectedDate, setIsDayModalOpen]
  );

  // Handle day mouse down - remember position for drag detection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setDragStartPosition({ x: e.clientX, y: e.clientY });
    usePaintToolStore.setState({ isPainting: true });
  }, []);

  // Handle day mouse enter (paint tool)
  const handleDayMouseEnter = useCallback(
    (date: Date, e: React.MouseEvent) => {
      // Получаем актуальное состояние
      const { isPainting: currentIsPainting, selectedStatus: currentSelectedStatus, isDeleting: currentIsDeleting } = usePaintToolStore.getState();

      // Проверяем, что кнопка мыши нажата
      if (e.buttons !== 1) return;

      // Режим удаления
      if (currentIsDeleting) {
        // Проверяем, что это drag
        if (dragStartPosition) {
          const distance = Math.sqrt(
            Math.pow(e.clientX - dragStartPosition.x, 2) +
            Math.pow(e.clientY - dragStartPosition.y, 2)
          );
          if (distance < 5) return;
        }

        const dateStr = formatDateForAPI(date);

        // Удаляем день
        removeDay(dateStr);
        setHasUnsavedChanges(true);
        return;
      }

      // Режим рисования
      // Проверяем, что есть выбранный статус
      if (!currentSelectedStatus) return;

      // Проверяем, что это drag (мышь сдвинулась от начальной позиции)
      if (dragStartPosition) {
        const distance = Math.sqrt(
          Math.pow(e.clientX - dragStartPosition.x, 2) +
          Math.pow(e.clientY - dragStartPosition.y, 2)
        );
        // Если сдвиг меньше 5px - считаем кликом, не drag
        if (distance < 5) return;
      }

      const dateStr = formatDateForAPI(date);

      // Получаем пресет для выбранного статуса
      const preset = getPreset(currentSelectedStatus);

      // Проверяем, является ли день черновиком (вне периода)
      const isDayDraft = currentPeriod ? (
        date < new Date(currentPeriod.period_start) ||
        date > new Date(currentPeriod.period_end)
      ) : false;

      const payload: ScheduleDayPayload = {
        status: currentSelectedStatus,
        is_draft: isDayDraft,
      };

      // Добавляем meta из пресета, если он есть
      if (preset && (preset.start || preset.end || preset.note || preset.splitShift)) {
        payload.meta = {
          start: preset.start,
          end: preset.end,
          note: preset.note,
          splitShift: preset.splitShift,
          splitParts: preset.splitParts,
        };
      }

      updateDay(dateStr, payload);
      setHasUnsavedChanges(true);
    },
    [updateDay, removeDay, dragStartPosition, currentPeriod, getPreset]
  );

  // Handle mouse events for paint tool
  const handleMouseUp = useCallback(() => {
    usePaintToolStore.setState({ isPainting: false });
    setDragStartPosition(null);
  }, []);

  // Save schedule
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setWarnings([]);

    try {
      // Save to API
      const response = await api.updateMySchedule(schedule);
      setSchedule(response.schedule);
      setHasUnsavedChanges(false);

      // Show warnings if any
      if (response.warnings && response.warnings.length > 0) {
        setWarnings(response.warnings);
        // Auto-hide warnings after 5 seconds
        setTimeout(() => setWarnings([]), 5000);
      }

      // Schedule is now updated dynamically, no need to refresh limits
    } catch (err) {
      console.error("Failed to save schedule:", err);
      setError(err instanceof Error ? err.message : "Failed to save schedule");
    } finally {
      setIsSaving(false);
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <img src="/logo/t2_Logo_Black_sRGB.svg" alt="T2 Logo" className="w-full h-full" />
          </div>
          <h1 className="text-h1 font-display mb-4">T2 Schedule</h1>
          <p className="font-body text-gray-600 mb-8">Система планирования рабочего времени</p>
          <button
            onClick={() => router.push("/login")}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <LogIn className="w-5 h-5" />
            Войти
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src="/logo/t2_Logo_Black_sRGB.svg" alt="T2 Logo" className="w-full h-full" />
          </div>
          <p className="font-body text-gray-600">Загрузка...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-t2-magenta rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-h2 font-display mb-2">Ошибка</h2>
          <p className="font-body text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadInitialData}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
                <motion.div
          className="space-y-4 sm:space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Period Info */}
          <PeriodInfo period={currentPeriod} />

          {/* Vacation Limits */}
          <VacationLimits ref={vacationLimitsRef} currentPeriod={currentPeriod} schedule={schedule} />

          {/* Calendar and Paint Tool */}
          <div className="space-y-0">
            {/* Paint & Actions Container */}
            <motion.div
              className="bg-black rounded-t-3xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-4 overflow-x-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Paint Tool */}
              <div className="flex-shrink-0">
                <PaintTool />
              </div>

              {/* Divider */}
              <div className="w-px h-6 sm:h-8 bg-white/20 flex-shrink-0" />

              {/* Actions */}
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                {/* Quick Fill */}
                <div className="flex items-center gap-2 group">
                  <span className="hidden sm:block font-body text-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[200px]">
                    Быстрое заполнение
                  </span>
                  <motion.button
                    onClick={() => setIsQuickFillOpen(true)}
                    className="p-1.5 sm:p-2 text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-white/20 flex-shrink-0" />
              </div>
            </motion.div>

            {/* Calendar */}
            <div className="bento-card rounded-t-none p-3 sm:p-4 lg:p-6">
            <CalendarGrid
              month={currentMonth}
              schedule={schedule}
              onMonthChange={setCurrentMonth}
              onDayClick={handleDayClick}
              onDayMouseDown={handleMouseDown}
              onDayMouseEnter={handleDayMouseEnter}
              currentPeriod={currentPeriod}
            />
            </div>
          </div>

          {/* Stats */}
          <StatsCard schedule={schedule} currentMonth={currentMonth} />

          {/* Save Button */}
          {hasUnsavedChanges && (
            <motion.div
              className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-1 sm:gap-2 shadow-lg text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{isSaving ? "Сохранение..." : "Сохранить"}</span>
                <span className="sm:hidden">{isSaving ? "..." : "Сохранить"}</span>
              </button>
            </motion.div>
          )}

          {/* Warnings Toast */}
          {warnings.length > 0 && (
            <motion.div
              className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-30 max-w-sm"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded shadow-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-amber-800">Внимание</p>
                    <div className="mt-2 text-sm text-amber-700">
                      {warnings.map((warning, index) => (
                        <p key={index} className="mb-1 last:mb-0">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Day Modal */}
      <DayModal />

      {/* Paint Tool Modal */}
      <PaintToolModal />

      {/* Quick Fill Modal */}
      <QuickFillModal />
    </div>
  );
}
