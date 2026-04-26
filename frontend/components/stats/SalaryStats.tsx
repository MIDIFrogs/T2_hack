"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Calendar, Clock, TrendingUp, ChevronLeft, ChevronRight, DollarSign, Palmtree, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, apiHelpers } from "@/lib/api";
import { SalaryResponse, HourlyRate } from "@/types";
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
  const [rates, setRates] = useState<HourlyRate[]>([]);
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

  // Загружаем историю ставок
  useEffect(() => {
    const fetchRates = async () => {
      if (!apiHelpers.isAuthenticated()) {
        return;
      }

      try {
        const data = await api.getHourlyRateHistory();
        setRates(data);
      } catch (err) {
        console.error("Error fetching hourly rates:", err);
      }
    };

    fetchRates();
  }, []);

  // Текущая ставка (самая свежая)
  const currentRate = rates.length > 0
    ? [...rates].sort(
        (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
      )[0]
    : null;

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

  // Форматирование даты
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy", { locale: ru });
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
      icon: Palmtree,
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
      icon: Sun,
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
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Заголовок с выбором периода */}
      <div className="bento-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="font-display text-lg sm:text-xl">Зарплата</h3>
          </div>

                    {/* Навигация по периоду */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-black transition-colors"
              title="Предыдущий месяц"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <button
              onClick={handleCurrentMonth}
              className="px-4 py-2 rounded-full text-sm font-display bg-t2-salad hover:opacity-90 text-black transition-colors min-w-fit"
            >
              {format(periodStart, "LLLL yyyy", { locale: ru })}
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 text-black transition-colors"
              title="Следующий месяц"
              disabled={periodStart >= now}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

            {/* Общая сумма */}
      <div className="bento-card p-4 sm:p-6 bg-t2-salad">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-black/70 font-body mb-2">
              Начислено за период
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`total-${breakdown.total}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="font-stencil text-3xl sm:text-4xl text-black"
              >
                {formatMoney(breakdown.total)}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="text-right text-sm text-black/70 font-body">
            <div>{format(periodStart, "d MMM", { locale: ru })} – {format(periodEnd, "d MMM yyyy", { locale: ru })}</div>
            <div className="mt-1 font-stencil text-black">{total_hours} часов</div>
          </div>
        </div>
      </div>

      {/* Почасовая ставка и дни */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Почасовая ставка */}
        <div className="bento-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5" />
            <h4 className="font-display text-base sm:text-lg">Почасовая ставка</h4>
          </div>

          {currentRate ? (
            <div>
              <div className="font-stencil text-2xl sm:text-3xl text-black mb-2">
                {formatMoney(currentRate.hourly_rate)}
                <span className="text-sm sm:text-base text-gray-600">/час</span>
              </div>
              <div className="text-xs text-gray-600 font-body">
                с {formatDate(currentRate.effective_date)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 font-body">
              Ставка не указана
            </div>
          )}
        </div>

                {/* Количество дней */}
        {Object.keys(days_summary).length > 0 && (
          <div className="bento-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              <h4 className="font-display text-base sm:text-lg">Статистика дней</h4>
            </div>

            <div className="space-y-3">
              {Object.entries(days_summary).map(([status, count]) => {
                let label = status;

                if (status.toLowerCase().includes("work")) {
                  label = "Рабочие дни";
                } else if (status.toLowerCase().includes("vacation")) {
                  label = "Отпуск";
                } else if (status.toLowerCase().includes("sick")) {
                  label = "Больничный";
                } else if (status.toLowerCase().includes("off")) {
                  label = "Выходные";
                }

                return (
                  <div key={status} className="p-3 rounded-xl flex items-center justify-between border border-black/10">
                    <span className="text-sm font-body text-black/70">{label}</span>
                    <span className="font-stencil text-lg text-black">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

                        {/* Детализация по типам выплат */}
      <div className="bento-card p-4 sm:p-6">
        <h4 className="font-display text-lg sm:text-xl mb-4">Детализация выплат</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {salaryItems.map((item, index) => {
            if (item.amount === 0) return null;

            const Icon = item.icon;
                        // Определяем цвет иконки и подложки на основе типа выплаты (пастельные тона)
            let iconBgColor = "bg-slate-100";
            let iconColor = "text-slate-600";

            if (item.label.includes("Рабочие")) {
              iconBgColor = "bg-green-100";
              iconColor = "text-green-600";
            } else if (item.label.includes("Отпуск")) {
              iconBgColor = "bg-pink-100";
              iconColor = "text-pink-600";
            } else if (item.label.includes("Больничные")) {
              iconBgColor = "bg-red-100";
              iconColor = "text-red-600";
            } else if (item.label.includes("Сверхурочные")) {
              iconBgColor = "bg-orange-100";
              iconColor = "text-orange-600";
            } else if (item.label.includes("Ночные")) {
              iconBgColor = "bg-indigo-100";
              iconColor = "text-indigo-600";
            } else if (item.label.includes("Выходные")) {
              iconBgColor = "bg-yellow-100";
              iconColor = "text-yellow-600";
            } else if (item.label.includes("Разбитые")) {
              iconBgColor = "bg-blue-100";
              iconColor = "text-blue-600";
            }

            return (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-white border border-black/10 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <span className="text-sm font-body text-black/70">
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
                    className="font-stencil text-base text-black"
                  >
                    {formatMoney(item.amount)}
                  </motion.span>
                </AnimatePresence>
              </div>
            );
          })}
        </div>

                {salaryItems.every((item) => item.amount === 0) && (
          <div className="text-center py-6 text-gray-400 text-sm font-body">
            За выбранный период нет начислений
          </div>
        )}
      </div>
    </motion.div>
  );
}
