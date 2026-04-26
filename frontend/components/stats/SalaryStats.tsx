"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Calendar, Clock, TrendingUp, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { SalaryResponse } from "@/types";
import { format, subMonths, addMonths } from "date-fns";
import { ru } from "date-fns/locale";

interface SalaryStatsProps {
  initialPeriodStart?: Date;
  initialPeriodEnd?: Date;
  onRateChange?: () => void;
}

export function SalaryStats({
  initialPeriodStart,
  initialPeriodEnd,
  onRateChange
}: SalaryStatsProps) {
  // По умолчанию текущий месяц
  const now = new Date();
  const [periodStart, setPeriodStart] = useState<Date>(
    initialPeriodStart || new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [periodEnd, setPeriodEnd] = useState<Date>(
    initialPeriodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0)
  );

  const [salary, setSalary] = useState<SalaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevSalaryRef = useRef<SalaryResponse | null>(null);

  // Форматируем даты для API
  const periodStartStr = format(periodStart, "yyyy-MM-dd");
  const periodEndStr = format(periodEnd, "yyyy-MM-dd");

  // Загружаем данные о зарплате при изменении периода или при вызове триггера
  const fetchSalary = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getMySalary(periodStartStr, periodEndStr);
      prevSalaryRef.current = salary;
      setSalary(data);
      setIsInitialLoad(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки данных");
      console.error("Error fetching salary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, [periodStartStr, periodEndStr]);

  // Обработчик изменения периода (месяц назад)
  const handlePreviousMonth = () => {
    const newStart = subMonths(periodStart, 1);
    const newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
    setPeriodStart(newStart);
    setPeriodEnd(newEnd);
  };

  // Обработчик изменения периода (месяц вперед)
  const handleNextMonth = () => {
    const newStart = addMonths(periodStart, 1);
    const newEnd = new Date(newStart.getFullYear(), newStart.getMonth() + 1, 0);
    setPeriodStart(newStart);
    setPeriodEnd(newEnd);
  };

  // Текущий месяц
  const handleCurrentMonth = () => {
    const now = new Date();
    setPeriodStart(new Date(now.getFullYear(), now.getMonth(), 1));
    setPeriodEnd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  };

  // Форматирование суммы в рублях
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <motion.div
        className="bento-card p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          <h3 className="font-stencil text-lg sm:text-xl">Зарплата</h3>
        </div>
        <div className="text-sm text-gray-500">Загрузка...</div>
      </motion.div>
    );
  }

  if (error && !salary) {
    return (
      <motion.div
        className="bento-card p-4 sm:p-6 border-red-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          <h3 className="font-stencil text-lg sm:text-xl">Зарплата</h3>
        </div>
        <div className="text-sm text-red-500">{error}</div>
      </motion.div>
    );
  }

  if (!salary) {
    return null;
  }

  const { salary: salaryData, current_hourly_rate } = salary;
  const { breakdown, total_hours, days_summary } = salaryData;

  const salaryItems = [
    {
      label: "Рабочие дни",
      amount: breakdown.work_days,
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: Clock,
    },
    {
      label: "Отпускные",
      amount: breakdown.vacation,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      icon: Calendar,
    },
    {
      label: "Больничные",
      amount: breakdown.sick_leave,
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: Calendar,
    },
    {
      label: "Сверхурочные",
      amount: breakdown.overtime,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: TrendingUp,
    },
    {
      label: "Ночные часы",
      amount: breakdown.night_hours,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      icon: Clock,
    },
    {
      label: "Выходные",
      amount: breakdown.weekend_holiday,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: Calendar,
    },
    {
      label: "Разбитые смены",
      amount: breakdown.split_shift,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: Clock,
    },
  ];

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Заголовок с выбором периода */}
      <div className="bento-card p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h3 className="font-stencil text-base sm:text-lg">Зарплата</h3>
          </div>

          {/* Навигация по периоду */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreviousMonth}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Предыдущий месяц"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <button
              onClick={handleCurrentMonth}
              className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors min-w-[100px] sm:min-w-[140px]"
            >
              {format(periodStart, "MMMM yyyy", { locale: ru })}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Следующий месяц"
              disabled={periodStart >= now}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Общая информация */}
      <div className="grid grid-cols-1 gap-2">
        {/* Общая сумма */}
        <motion.div
          className="bento-card p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100"
          initial={isInitialLoad ? { opacity: 0, scale: 0.9 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: isInitialLoad ? 0.1 : 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm text-green-700 font-medium mb-1">
                Итого за период
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`total-${breakdown.total}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="font-stencil text-xl sm:text-2xl text-green-900"
                >
                  {formatMoney(breakdown.total)}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600">
                {format(periodStart, "dd MMM", { locale: ru })} – {format(periodEnd, "dd MMM yyyy", { locale: ru })}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {total_hours} ч.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Детализация по типам выплат */}
      <motion.div
        className="bento-card p-3 sm:p-4"
        initial={isInitialLoad ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: isInitialLoad ? 0.3 : 0 }}
      >
        <h4 className="font-stencil text-sm sm:text-base mb-3">Детализация выплат</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {salaryItems.map((item, index) => {
            if (item.amount === 0) return null;

            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                className={cn(
                  "flex items-center justify-between p-2 sm:p-3 rounded-lg",
                  item.bgColor
                )}
                initial={isInitialLoad ? { opacity: 0, x: -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: isInitialLoad ? 0.4 + index * 0.05 : 0 }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", item.color)} />
                  <span className={cn("text-xs sm:text-sm font-medium", item.color)}>
                    {item.label}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${item.label}-${item.amount}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className={cn("font-stencil text-xs sm:text-sm", item.color)}
                  >
                    {formatMoney(item.amount)}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {salaryItems.every((item) => item.amount === 0) && (
          <div className="text-center py-4 text-gray-400 text-xs sm:text-sm">
            За выбранный период нет начислений
          </div>
        )}
      </motion.div>

      {/* Информация о днях */}
      {Object.keys(days_summary).length > 0 && (
        <motion.div
          className="bento-card p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h4 className="font-stencil text-sm sm:text-base mb-2">Количество дней</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
            {Object.entries(days_summary).map(([status, count]) => (
              <div key={status} className="flex gap-2">
                <span className="text-gray-600 capitalize">{status}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Информация о расчете */}
      <motion.div
        className={cn(
          "bento-card p-2.5 sm:p-3",
          "flex items-start gap-2 text-xs",
          current_hourly_rate ? "text-gray-600" : "text-yellow-700 bg-yellow-50"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          {!current_hourly_rate && (
            <div className="font-medium text-yellow-800 text-xs">
              Укажите вашу почасовую ставку для расчета зарплаты
            </div>
          )}
          <div className="text-gray-500 text-[10px] sm:text-xs">
            Расчет производится на сервере согласно ТК РФ с учетом ночных часов (доплата 20%),
            сверхурочных (первые 2 часа x1.5, остальные x2), работы в выходные (x2).
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
