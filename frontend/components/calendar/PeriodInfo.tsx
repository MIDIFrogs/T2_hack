"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { CollectionPeriod } from "@/types";

interface PeriodInfoProps {
  period: CollectionPeriod | null;
}

export function PeriodInfo({ period }: PeriodInfoProps) {
  if (!period) {
    return (
      <motion.div
        className="bento-card p-4 flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertCircle className="w-5 h-5 text-t2-magenta" />
        <div className="font-body text-sm">
          Нет активного периода сбора графика
        </div>
      </motion.div>
    );
  }

  const startDate = new Date(period.period_start);
  const endDate = new Date(period.period_end);
  const deadline = new Date(period.deadline);
  const daysUntilDeadline = differenceInDays(deadline, new Date());
  const isDeadlineSoon = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;
  const isDeadlinePast = isPast(deadline);

  return (
    <motion.div
      className="bento-card p-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-black" />
            <h3 className="font-display text-lg">Период сбора</h3>
          </div>
          <p className="font-body text-black mt-1">
            {format(startDate, "dd.MM.yyyy")} — {format(endDate, "dd.MM.yyyy")}
          </p>
        </div>

        <div
          className={`px-4 py-2 rounded-full font-body text-sm font-medium flex items-center gap-2 flex-shrink-0 ${
            isDeadlinePast
              ? "bg-t2-magenta text-white"
              : isDeadlineSoon
              ? "bg-t2-salad text-black"
              : "bg-gray-200 text-black"
          }`}
        >
          <Clock className="w-4 h-4" />
          {isDeadlinePast
            ? "Дедлайн просрочен"
            : daysUntilDeadline === 0
            ? "Сегодня последний день"
            : daysUntilDeadline === 1
            ? "Остался 1 день"
            : `${daysUntilDeadline} дн.`}
        </div>
      </div>
    </motion.div>
  );
}
