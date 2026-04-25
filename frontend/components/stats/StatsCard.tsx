"use client";

import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { calculateTotalHours, formatHours } from "@/lib/utils";
import { ScheduleDayPayload, DayStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  schedule: Record<string, ScheduleDayPayload>;
  targetHours?: number;
}

export function StatsCard({ schedule, targetHours = 160 }: StatsCardProps) {
  const totalHours = calculateTotalHours(schedule);
  const remainingHours = Math.max(0, targetHours - totalHours);
  const overworkHours = Math.max(0, totalHours - targetHours);
  const isOverwork = totalHours > targetHours;
  const isUnderwork = totalHours < targetHours && totalHours > 0;
  const isComplete = totalHours === targetHours;

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
      value: formatHours(targetHours),
      icon: CheckCircle,
      color: "text-black",
      bgColor: "bg-white",
    },
    {
      label: isOverwork ? "Переработка" : "Осталось",
      value: formatHours(isOverwork ? overworkHours : remainingHours),
      icon: isOverwork ? AlertCircle : TrendingUp,
      color: isOverwork ? "text-white" : "text-black",
      bgColor: isOverwork ? "bg-t2-magenta" : "bg-white",
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
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={cn("bento-card p-4 flex flex-col items-center gap-2", stat.bgColor)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Icon className={cn("w-6 h-6", stat.color)} />
              <div className={cn("font-stencil text-3xl", stat.color)}>
                {stat.value}
              </div>
              <div className={cn("text-xs font-body font-medium", stat.color)}>
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        className="bento-card p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-sm font-medium">Прогресс</span>
          <span className="font-stencil text-lg">{Math.round(progress)}%</span>
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
            Переработка {formatHours(overworkHours)}. Уберите лишние часы.
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
