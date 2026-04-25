"use client";

import { motion } from "framer-motion";
import { isSameDay, isCurrentMonth } from "@/lib/utils";
import { DayStatus, STATUS_COLORS } from "@/types";
import { useState } from "react";
import { QuickFillMenu } from "./QuickFillMenu";

interface CalendarDayProps {
  date: Date;
  currentMonth: Date;
  status?: DayStatus;
  isSelected?: boolean;
  isToday?: boolean;
  onClick?: () => void;
  onDragEnter?: () => void;
  onContextMenu?: (date: Date, position: { x: number; y: number }) => void;
}

export function CalendarDay({
  date,
  currentMonth,
  status,
  isSelected = false,
  isToday = false,
  onClick,
  onDragEnter,
  onContextMenu,
}: CalendarDayProps) {
  const day = date.getDate();
  const inCurrentMonth = isCurrentMonth(date, currentMonth.getFullYear(), currentMonth.getMonth());

  const getStatusClass = () => {
    if (!inCurrentMonth) return "calendar-day-other-month";
    if (!status) return "calendar-day-empty";
    switch (status) {
      case DayStatus.WORK:
        return "calendar-day-work";
      case DayStatus.OFF:
        return "calendar-day-off";
      case DayStatus.VACATION:
        return "calendar-day-vacation";
      case DayStatus.SICK:
        return "calendar-day-sick";
      case DayStatus.SPLIT:
        return "calendar-day-split";
      default:
        return "calendar-day-empty";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    onDragEnter?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(date, { x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div
      className={`calendar-day ${getStatusClass()} ${isToday ? "calendar-day-today" : ""} ${
        isSelected ? "ring-4 ring-t2-magenta ring-offset-2" : ""
      }`}
      onClick={onClick}
      onDragEnter={handleDragEnter}
      onContextMenu={handleContextMenu}
      draggable
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <span className="relative z-10">{day}</span>
    </motion.div>
  );
}
