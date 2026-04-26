"use client";

import { motion } from "framer-motion";
import { isSameDay, isCurrentMonth } from "@/lib/utils";
import { DayStatus, STATUS_COLORS } from "@/types";
import { useState } from "react";
import { QuickFillMenu } from "./QuickFillMenu";
import { Lock, Pencil } from "lucide-react";

interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  status?: DayStatus;
  isSelected?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  isDraft?: boolean; // True если это черновик (планирование)
  isInDraftMode?: boolean; // True если день в режиме планирования (даже пустой)
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onContextMenu?: (date: Date, position: { x: number; y: number }) => void;
}

export function CalendarDay({
  date,
  currentMonth,
  status,
  isSelected = false,
  isToday = false,
  isPast = false,
  isDraft = false,
  isInDraftMode = false,
  onClick,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
}: CalendarDayProps) {
  const day = date.getDate();
  const inCurrentMonth = isCurrentMonth(date, currentMonth.getFullYear(), currentMonth.getMonth());

  const getStatusClass = () => {
    if (!inCurrentMonth) return "calendar-day-other-month";
    if (!status) return isDraft ? "calendar-day-draft" : "calendar-day-empty";
    switch (status) {
      case DayStatus.WORK:
        return isDraft ? "calendar-day-work-draft" : "calendar-day-work";
      case DayStatus.OFF:
        return isDraft ? "calendar-day-off-draft" : "calendar-day-off";
      case DayStatus.VACATION:
        return isDraft ? "calendar-day-vacation-draft" : "calendar-day-vacation";
      case DayStatus.SICK:
        return isDraft ? "calendar-day-sick-draft" : "calendar-day-sick";
      case DayStatus.SPLIT:
        return isDraft ? "calendar-day-split-draft" : "calendar-day-split";
      default:
        return isDraft ? "calendar-day-draft" : "calendar-day-empty";
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.preventDefault();
    onMouseEnter?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем native drag
    onMouseDown?.(e);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(date, { x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div
      className={`calendar-day ${getStatusClass()} ${isToday ? "calendar-day-today" : ""} ${
        isSelected ? "ring-4 ring-t2-magenta ring-offset-2" : ""
      } ${isPast ? "calendar-day-past opacity-60 cursor-not-allowed" : ""}${
        isInDraftMode ? " calendar-day-draft-mode" : ""
      }`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onContextMenu={handleContextMenu}
      whileHover={isPast ? {} : { scale: 1.05 }}
      whileTap={isPast ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <span className="relative z-10">{day}</span>
      {isPast && (
        <Lock className="absolute top-1 right-1 w-3 h-3 text-gray-400 opacity-50" />
      )}
      {isInDraftMode && !isPast && (
        <Pencil className="absolute top-1 right-1 w-4 h-4 text-blue-500 opacity-50" />
      )}
    </motion.div>
  );
}
