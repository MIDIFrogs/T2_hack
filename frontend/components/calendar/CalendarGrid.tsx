"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthGrid } from "@/lib/utils";
import { CalendarDay } from "./CalendarDay";
import { DayStatus, ScheduleDayPayload } from "@/types";

interface CalendarGridProps {
  month: Date;
  schedule: Record<string, ScheduleDayPayload>;
  onMonthChange?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  onDayMouseDown?: (e: React.MouseEvent) => void;
  onDayMouseEnter?: (date: Date, e: React.MouseEvent) => void;
  selectedDate?: Date | null;
  currentPeriod?: {
    period_start: string;
    period_end: string;
  } | null;
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function CalendarGrid({
  month,
  schedule,
  onMonthChange,
  onDayClick,
  onDayMouseDown,
  onDayMouseEnter,
  selectedDate,
  currentPeriod,
}: CalendarGridProps) {
  const grid = useMemo(() => getMonthGrid(month.getFullYear(), month.getMonth()), [month]);

  const today = new Date();

  // Проверяем, является ли день прошедшим (до сегодняшнего дня включительно)
  const isPastDay = (date: Date): boolean => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const compareToday = new Date(today);
    compareToday.setHours(0, 0, 0, 0);
    return compareDate < compareToday;
  };

  // Проверяем, является ли день черновиком (вне активного периода)
  const isDraftDay = (date: Date): boolean => {
    if (!currentPeriod) return false;

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const periodStart = new Date(currentPeriod.period_start);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(currentPeriod.period_end);
    periodEnd.setHours(23, 59, 59, 999);

    // День является черновиком, если он вне периода
    return compareDate < periodStart || compareDate > periodEnd;
  };

  // Проверяем, находится ли день в режиме планирования (для штриховки)
  const isDayInDraft = (date: Date): boolean => {
    return isDraftDay(date);
  };

  const getDayStatus = (date: Date): DayStatus | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = schedule[dateStr];
    return entry?.status as DayStatus;
  };

  const getDayDraft = (date: Date): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = schedule[dateStr];
    return entry?.is_draft || false;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Month Header with arrows inside */}
        <motion.div
          className="flex items-center justify-between px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={() => {
              const newDate = new Date(month);
              newDate.setMonth(newDate.getMonth() - 1);
              onMonthChange?.(newDate);
            }}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>

          <h2 className="text-h2 sm:text-h2 font-display uppercase flex-1 text-center text-base sm:text-xl lg:text-2xl">
            {format(month, "LLLL yyyy", { locale: ru })}
          </h2>

          <motion.button
            onClick={() => {
              const newDate = new Date(month);
              newDate.setMonth(newDate.getMonth() + 1);
              onMonthChange?.(newDate);
            }}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
        </motion.div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAYS.map((day, index) => (
            <motion.div
              key={day}
              className="text-center font-body text-xs sm:text-sm font-medium text-gray-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {day}
            </motion.div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {grid.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const globalIndex = weekIndex * 7 + dayIndex;
              const status = getDayStatus(date);
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              const isPast = isPastDay(date);
              const isDraft = getDayDraft(date);
              const isInDraftMode = isDayInDraft(date);

              return (
                <CalendarDay
                  key={`${date.getTime()}`}
                  date={date}
                  currentMonth={month}
                  status={status}
                  isSelected={selectedDate ? date.getTime() === selectedDate.getTime() : false}
                  isToday={isToday}
                  isPast={isPast}
                  isDraft={isDraft}
                  isInDraftMode={isInDraftMode}
                  onClick={isPast ? undefined : () => onDayClick?.(date)}
                  onMouseDown={isPast ? undefined : onDayMouseDown}
                  onMouseEnter={isPast ? undefined : (e) => onDayMouseEnter?.(date, e)}
                />
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
