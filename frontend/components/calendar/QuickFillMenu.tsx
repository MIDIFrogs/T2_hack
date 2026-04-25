"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Copy, Check } from "lucide-react";
import { format, addDays, addWeeks } from "date-fns";

import { useScheduleStore, useUIStore } from "@/lib/store";
import { formatDateForAPI } from "@/lib/utils";
import { DayStatus, ScheduleDayPayload } from "@/types";

interface QuickFillMenuProps {
  date: Date;
  onClose: () => void;
}

export function QuickFillMenu({ date, onClose }: QuickFillMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { schedule, updateDays } = useScheduleStore();
  const { currentMonth } = useUIStore();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const fillWorkDaysUntil = (endDate: Date) => {
    const updates: Record<string, ScheduleDayPayload> = {};
    let currentDate = new Date(date);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = formatDateForAPI(currentDate);
        updates[dateStr] = {
          status: DayStatus.WORK,
          meta: { start: "09:00", end: "18:00" },
        };
      }
      currentDate = addDays(currentDate, 1);
    }

    updateDays(updates);
    onClose();
  };

  const fillWeekPattern = () => {
    const updates: Record<string, ScheduleDayPayload> = {};

    // Fill next 4 weeks with pattern: Mon-Fri work, Sat-Sun off
    for (let week = 0; week < 4; week++) {
      const startOfWeek = addDays(date, week * 7);

      for (let day = 0; day < 7; day++) {
        const currentDate = addDays(startOfWeek, day);
        const dateStr = formatDateForAPI(currentDate);

        if (day < 5) {
          // Mon-Fri
          updates[dateStr] = {
            status: DayStatus.WORK,
            meta: { start: "09:00", end: "18:00" },
          };
        } else {
          // Sat-Sun
          updates[dateStr] = { status: DayStatus.OFF };
        }
      }
    }

    updateDays(updates);
    onClose();
  };

  const fillEveryOtherDay = () => {
    const updates: Record<string, ScheduleDayPayload> = {};

    for (let i = 0; i < 14; i++) {
      const currentDate = addDays(date, i);
      const dateStr = formatDateForAPI(currentDate);

      if (i % 2 === 0) {
        updates[dateStr] = {
          status: DayStatus.WORK,
          meta: { start: "09:00", end: "18:00" },
        };
      } else {
        updates[dateStr] = { status: DayStatus.OFF };
      }
    }

    updateDays(updates);
    onClose();
  };

  const fillAllWork = () => {
    const updates: Record<string, ScheduleDayPayload> = {};

    // Fill remaining days of current month
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    let currentDate = new Date(date);

    while (currentDate <= lastDay) {
      const dateStr = formatDateForAPI(currentDate);
      updates[dateStr] = {
        status: DayStatus.WORK,
        meta: { start: "09:00", end: "18:00" },
      };
      currentDate = addDays(currentDate, 1);
    }

    updateDays(updates);
    onClose();
  };

  const fillAllOff = () => {
    const updates: Record<string, ScheduleDayPayload> = {};

    // Fill remaining days of current month
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    let currentDate = new Date(date);

    while (currentDate <= lastDay) {
      const dateStr = formatDateForAPI(currentDate);
      updates[dateStr] = { status: DayStatus.OFF };
      currentDate = addDays(currentDate, 1);
    }

    updateDays(updates);
    onClose();
  };

  const fillFromTemplate = () => {
    // TODO: Implement template selection
    alert("Выбор шаблона будет доступен в следующей версии");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-bento border-2 border-black shadow-xl min-w-64 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="bg-black text-white px-4 py-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-body text-sm font-medium">
            Быстрое заполнение
          </span>
        </div>

        {/* Options */}
        <div className="p-2">
          <QuickFillOption
            label="До конца месяца (рабочие)"
            onClick={fillAllWork}
            icon="📅"
          />
          <QuickFillOption
            label="До конца месяца (выходные)"
            onClick={fillAllOff}
            icon="🏖️"
          />
          <QuickFillOption
            label="На 2 недели (Пн-Пт)"
            onClick={() => fillWorkDaysUntil(addDays(date, 14))}
            icon="📆"
          />
          <QuickFillOption
            label="На неделю (Пн-Вс)"
            onClick={() => fillWorkDaysUntil(addDays(date, 7))}
            icon="🗓️"
          />
          <QuickFillOption
            label="Каждую Пн-Пт (4 недели)"
            onClick={fillWeekPattern}
            icon="🔄"
          />
          <QuickFillOption
            label="Каждый второй день"
            onClick={fillEveryOtherDay}
            icon="↔️"
          />
          <QuickFillOption
            label="Из шаблона..."
            onClick={fillFromTemplate}
            icon="📋"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function QuickFillOption({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: string;
}) {
  return (
    <motion.button
      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 rounded-xl transition-colors text-left"
      onClick={onClick}
      whileHover={{ x: 4 }}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-body text-sm">{label}</span>
    </motion.button>
  );
}
