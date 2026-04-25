"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { getMonthGrid } from "@/lib/utils";
import { CalendarDay } from "./CalendarDay";
import { QuickFillMenu } from "./QuickFillMenu";
import { DayStatus, ScheduleDayPayload } from "@/types";

interface CalendarGridProps {
  month: Date;
  schedule: Record<string, ScheduleDayPayload>;
  onDayClick?: (date: Date) => void;
  onDayDragEnter?: (date: Date) => void;
  selectedDate?: Date | null;
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function CalendarGrid({
  month,
  schedule,
  onDayClick,
  onDayDragEnter,
  selectedDate,
}: CalendarGridProps) {
  const grid = useMemo(() => getMonthGrid(month.getFullYear(), month.getMonth()), [month]);
  const [contextMenuDate, setContextMenuDate] = useState<Date | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const today = new Date();

  const getDayStatus = (date: Date): DayStatus | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = schedule[dateStr];
    return entry?.status as DayStatus;
  };

  const handleContextMenu = (date: Date, position: { x: number; y: number }) => {
    setContextMenuDate(date);
    setContextMenuPosition(position);
  };

  const handleCloseContextMenu = () => {
    setContextMenuDate(null);
    setContextMenuPosition(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Month Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-h2 font-display uppercase">
            {format(month, "LLLL yyyy", { locale: ru })}
          </h2>
        </motion.div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day, index) => (
            <motion.div
              key={day}
              className="text-center font-body text-sm font-medium text-gray-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {day}
            </motion.div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {grid.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const globalIndex = weekIndex * 7 + dayIndex;
              const status = getDayStatus(date);
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              return (
                <CalendarDay
                  key={`${date.getTime()}`}
                  date={date}
                  currentMonth={month}
                  status={status}
                  isSelected={selectedDate ? date.getTime() === selectedDate.getTime() : false}
                  isToday={isToday}
                  onClick={() => onDayClick?.(date)}
                  onDragEnter={() => onDayDragEnter?.(date)}
                  onContextMenu={handleContextMenu}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenuDate && contextMenuPosition && (
        <div
          className="fixed inset-0 z-40"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <QuickFillMenu date={contextMenuDate} onClose={handleCloseContextMenu} />
        </div>
      )}
    </>
  );
}
