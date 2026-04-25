"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, LogIn } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { PaintTool } from "@/components/calendar/PaintTool";
import { StatsCard } from "@/components/stats/StatsCard";
import { PeriodInfo } from "@/components/calendar/PeriodInfo";
import { DayModal } from "@/components/calendar/DayModal";

import { useScheduleStore, useUIStore, usePaintToolStore, useHistoryStore, useAuthStore } from "@/lib/store";
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

  const { currentMonth, setCurrentMonth, nextMonth, prevMonth, setSelectedDate, setIsDayModalOpen } =
    useUIStore();

  const { selectedStatus, isPainting } = usePaintToolStore();
  const { pushState } = useHistoryStore();

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // Handle day click
  const handleDayClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setIsDayModalOpen(true);
    },
    [setSelectedDate, setIsDayModalOpen]
  );

  // Handle day drag enter (paint tool)
  const handleDayDragEnter = useCallback(
    (date: Date) => {
      if (!isPainting) return;

      const dateStr = formatDateForAPI(date);
      const payload: ScheduleDayPayload = {
        status: selectedStatus,
      };

      // Add default meta for work days
      if (selectedStatus === DayStatus.WORK) {
        payload.meta = {
          start: "09:00",
          end: "18:00",
        };
      }

      updateDay(dateStr, payload);
      setHasUnsavedChanges(true);
    },
    [isPainting, selectedStatus, updateDay]
  );

  // Handle mouse events for paint tool
  const handleMouseDown = useCallback(() => {
    usePaintToolStore.setState({ isPainting: true });
  }, []);

  const handleMouseUp = useCallback(() => {
    usePaintToolStore.setState({ isPainting: false });
  }, []);

  // Save schedule
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Save current state for undo
      pushState(schedule);

      // Save to API
      const updatedSchedule = await api.updateMySchedule(schedule);
      setSchedule(updatedSchedule);
      setHasUnsavedChanges(false);

      // Show success animation or notification
      console.log("Schedule saved successfully!");
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
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="font-stencil text-4xl text-white">T2</span>
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
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-stencil text-3xl text-white">T2</span>
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Period Info */}
          <PeriodInfo period={currentPeriod} />

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <motion.button
              onClick={prevMonth}
              className="p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <div className="text-center">
              <h2 className="text-h2 font-display">
                {format(currentMonth, "LLLL yyyy", { locale: ru })}
              </h2>
            </div>

            <motion.button
              onClick={nextMonth}
              className="p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Paint Tool */}
          <PaintTool />

          {/* Calendar */}
          <div className="bento-card p-6">
            <CalendarGrid
              month={currentMonth}
              schedule={schedule}
              onDayClick={handleDayClick}
              onDayDragEnter={handleDayDragEnter}
            />
          </div>

          {/* Stats */}
          <StatsCard schedule={schedule} />

          {/* Save Button */}
          {hasUnsavedChanges && (
            <motion.div
              className="fixed bottom-6 right-6 z-30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2 shadow-lg"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Day Modal */}
      <DayModal />
    </div>
  );
}
