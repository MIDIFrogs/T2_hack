"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, apiHelpers } from "@/lib/api";
import { HourlyRate } from "@/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function HourlyRateEditor() {
  const [rates, setRates] = useState<HourlyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем историю ставок
  useEffect(() => {
    const fetchRates = async () => {
      if (!apiHelpers.isAuthenticated()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.getHourlyRateHistory();
        setRates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки данных");
        console.error("Error fetching hourly rates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Текущая ставка (самая свежая)
  const currentRate = useMemo(() => {
    if (rates.length === 0) return null;
    // Сортируем по дате убывания и берем первую
    const sorted = [...rates].sort(
      (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
    );
    return sorted[0];
  }, [rates]);

  // Форматирование суммы
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
        className="bento-card p-3 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          <h3 className="font-stencil text-base sm:text-lg">Почасовая ставка</h3>
        </div>
        <div className="text-xs text-gray-500">Загрузка...</div>
      </motion.div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Текущая ставка */}
      <div className="bento-card p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <h3 className="font-stencil text-base sm:text-lg">Почасовая ставка</h3>
        </div>

        {currentRate ? (
          <div>
            <div className="font-stencil text-2xl sm:text-3xl">
              {formatMoney(currentRate.hourly_rate)}
              <span className="text-sm sm:text-base text-gray-500">/час</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              с {formatDate(currentRate.effective_date)}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            Ставка не указана администратором
          </div>
        )}
      </div>

      {/* История изменений */}
      {rates.length > 1 && (
        <motion.div
          className="bento-card p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-stencil text-sm sm:text-base mb-3">История изменений</h4>
          <div className="space-y-2">
            {rates
              .sort(
                (a, b) =>
                  new Date(b.effective_date).getTime() -
                  new Date(a.effective_date).getTime()
              )
              .slice(1) // Пропускаем текущую ставку
              .map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDate(rate.effective_date)}
                    </span>
                  </div>
                  <span className="font-stencil text-gray-700">
                    {formatMoney(rate.hourly_rate)}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
