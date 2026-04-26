"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { DayStatus, STATUS_LABELS, ScheduleMeta } from "@/types";
import { useUIStore, useScheduleStore } from "@/lib/store";
import { formatDateForAPI } from "@/lib/utils";

const WEEKDAYS = [
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 0, label: "Вс" },
];

const PERIODS = [
  { value: 7, label: "Неделя" },
  { value: 14, label: "2 недели" },
  { value: 30, label: "Месяц" },
];

export function QuickFillModal() {
  const { currentMonth, isQuickFillOpen, setIsQuickFillOpen } = useUIStore();
  const { schedule, updateDays } = useScheduleStore();

  const [selectedStatus, setSelectedStatus] = useState<DayStatus>(DayStatus.WORK);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [period, setPeriod] = useState<number>(30);

  // Настройки времени
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [hasSplitShift, setHasSplitShift] = useState(false);
  const [splitParts, setSplitParts] = useState<Array<{ start: string; end: string }>>([
    { start: "09:00", end: "13:00" },
    { start: "14:00", end: "18:00" },
  ]);
  const [note, setNote] = useState("");

  const handleWeekdayToggle = (dayValue: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    );
  };

  const addSplitPart = () => {
    setSplitParts([...splitParts, { start: "09:00", end: "18:00" }]);
  };

  const removeSplitPart = (index: number) => {
    setSplitParts(splitParts.filter((_, i) => i !== index));
  };

  const updateSplitPart = (index: number, field: "start" | "end", value: string) => {
    const newParts = [...splitParts];
    newParts[index][field] = value;
    setSplitParts(newParts);
  };

  const handleApply = () => {
    const updates: Record<string, ScheduleDayPayload> = {};
    const startDate = new Date(currentMonth);
    startDate.setDate(1); // Начало месяца

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Генерируем даты на выбранный период
    for (let i = 0; i < period; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Проверяем, что день не прошедший
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      if (compareDate < today) {
        continue; // Пропускаем прошедшие дни
      }

      // Проверяем день недели
      if (selectedWeekdays.includes(date.getDay())) {
        const dateStr = formatDateForAPI(date);

        const meta: ScheduleMeta = {
          start: startTime,
          end: endTime,
          note: note || undefined,
        };

        if (hasSplitShift) {
          meta.splitShift = true;
          meta.splitParts = splitParts;
        }

        updates[dateStr] = {
          status: selectedStatus,
          meta,
        };
      }
    }

    updateDays(updates);
    setIsQuickFillOpen(false);
  };

  const handleClose = () => {
    setIsQuickFillOpen(false);
  };

  return (
    <AnimatePresence>
      {isQuickFillOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-bento border-2 border-black w-full max-w-md max-h-[90vh] overflow-hidden mx-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-h3 font-display text-base sm:text-lg lg:text-2xl">Быстрое заполнение</h3>
                <button
                  onClick={handleClose}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] scrollbar-t2">
                {/* Тип дня */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="font-body font-medium text-sm sm:text-base">Тип дня</label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {([
                      DayStatus.WORK,
                      DayStatus.OFF,
                      DayStatus.VACATION,
                      DayStatus.SICK,
                      DayStatus.SPLIT,
                    ] as DayStatus[]).map((status) => (
                      <button
                        key={status}
                        className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-xl font-body text-xs sm:text-sm font-medium transition-all ${
                          selectedStatus === status
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => setSelectedStatus(status)}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Время работы (для рабочего дня и дробящейся смены) */}
                {(selectedStatus === DayStatus.WORK || selectedStatus === DayStatus.SPLIT) && (
                  <div className="space-y-3">
                    <label className="font-body font-medium">Время работы</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">С</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="input-t2"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">До</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="input-t2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Дробление смены */}
                {(selectedStatus === DayStatus.WORK || selectedStatus === DayStatus.SPLIT) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-body font-medium">Дробление смены</label>
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          hasSplitShift ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => setHasSplitShift(!hasSplitShift)}
                      >
                        {hasSplitShift ? "Выкл" : "Вкл"}
                      </button>
                    </div>

                    {hasSplitShift && (
                      <div className="space-y-2">
                        {splitParts.map((part, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Часть {index + 1}</span>
                            <input
                              type="time"
                              value={part.start}
                              onChange={(e) => updateSplitPart(index, "start", e.target.value)}
                              className="input-t2 flex-1"
                            />
                            <span className="text-gray-400">—</span>
                            <input
                              type="time"
                              value={part.end}
                              onChange={(e) => updateSplitPart(index, "end", e.target.value)}
                              className="input-t2 flex-1"
                            />
                            {splitParts.length > 1 && (
                              <button
                                onClick={() => removeSplitPart(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addSplitPart}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-black hover:text-black transition-all"
                        >
                          + Добавить часть
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Примечание */}
                <div className="space-y-3">
                  <label className="font-body font-medium">Примечание</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Работа из офиса, важная встреча..."
                    className="input-t2 resize-none"
                    rows={2}
                  />
                </div>

                {/* Дни недели */}
                <div className="space-y-3">
                  <label className="font-body font-medium">Дни недели</label>
                  <div className="flex gap-2">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day.value}
                        className={`flex-1 px-3 py-2 rounded-lg font-body text-sm font-medium transition-all ${
                          selectedWeekdays.includes(day.value)
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => handleWeekdayToggle(day.value)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Период */}
                <div className="space-y-3">
                  <label className="font-body font-medium">Период заполнения</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        className={`px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                          period === p.value
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => setPeriod(p.value)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border-2 border-black rounded-xl font-body font-medium hover:bg-gray-100 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 btn-primary"
                >
                  Применить
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
