"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle, TrendingUp, Minus, Plus } from "lucide-react";
import { calculateTotalHours, formatHours, formatDateForAPI } from "@/lib/utils";
import { ScheduleDayPayload, DayStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  schedule: Record<string, ScheduleDayPayload>;
  currentMonth: Date;
  targetHours?: number;
}

export function StatsCard({ schedule, currentMonth, targetHours: initialTargetHours = 160 }: StatsCardProps) {
  const [targetHours, setTargetHours] = useState(initialTargetHours);

  // Фильтруем дни только за текущий месяц
  const monthlySchedule = useMemo(() => {
    const filtered: Record<string, ScheduleDayPayload> = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    Object.entries(schedule).forEach(([dateStr, payload]) => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year && date.getMonth() === month) {
        filtered[dateStr] = payload;
      }
    });

    return filtered;
  }, [schedule, currentMonth]);

  const totalHours = calculateTotalHours(monthlySchedule);
  const remainingHours = Math.max(0, targetHours - totalHours);
  const isOverwork = totalHours > targetHours;
  const isUnderwork = totalHours < targetHours && totalHours > 0;
  const isComplete = totalHours === targetHours;

  const handleDecreaseTarget = () => {
    setTargetHours((prev) => Math.max(0, prev - 8));
  };

  const handleIncreaseTarget = () => {
    setTargetHours((prev) => prev + 8);
  };

  const stats = [
    {
      label: "Отработано",
      value: formatHours(totalHours),
      icon: Clock,
      color: "text-black",
      bgColor: "bg-white",
    },
    {
            label: "Норма",
      value: (
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleDecreaseTarget}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <span className="font-stencil text-xl sm:text-3xl">{formatHours(targetHours)}</span>
          <button
            onClick={handleIncreaseTarget}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      ),
      icon: CheckCircle,
      color: "text-black",
      bgColor: "bg-white",
    },
    {
      label: "Остаток",
      value: formatHours(remainingHours),
      icon: TrendingUp,
      color: isOverwork ? "text-white" : "text-black",
      bgColor: isOverwork ? "bg-black" : "bg-white",
    },
  ];

  const progress = Math.min(100, (totalHours / targetHours) * 100);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={cn("bento-card p-2 sm:p-3 lg:p-4 flex flex-col items-center gap-1", stat.bgColor)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
              <div className={cn("font-stencil text-xl sm:text-2xl lg:text-3xl", stat.color)}>
                {stat.value}
              </div>
              <div className={cn("text-xs sm:text-sm font-body font-medium", stat.color)}>
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        className="bento-card p-2 sm:p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="font-body text-xs sm:text-sm font-medium">Прогресс</span>
          <span className="font-stencil text-sm sm:text-base lg:text-lg">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className={cn(
              "progress-bar-fill",
              isOverwork ? "progress-bar-fill-warning" : "progress-bar-fill-work"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Status Message */}
        {isComplete && (
          <motion.div
            className="mt-3 flex items-center gap-2 text-sm font-medium text-green-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <CheckCircle className="w-4 h-4" />
            Идеально! График заполнен полностью.
          </motion.div>
        )}

        {isUnderwork && (
          <motion.div
            className="mt-3 flex items-center gap-2 text-sm font-medium text-t2-magenta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AlertCircle className="w-4 h-4" />
            Нужно заполнить ещё {formatHours(remainingHours)}
          </motion.div>
        )}

        {isOverwork && (
          <motion.div
            className="mt-3 flex items-center gap-2 text-sm font-medium text-t2-magenta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AlertCircle className="w-4 h-4" />
            Переработка {formatHours(totalHours - targetHours)}. Уберите лишние часы.
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
