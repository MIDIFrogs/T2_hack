"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DayStatus, ScheduleDayPayload, ScheduleMeta } from "@/types";
import { useUIStore, useScheduleStore } from "@/lib/store";
import { formatDateForAPI } from "@/lib/utils";

export function DayModal() {
  const { selectedDate, isDayModalOpen, setIsDayModalOpen, setSelectedDate } = useUIStore();
  const { schedule, updateDay, currentPeriod } = useScheduleStore();

  const [status, setStatus] = useState<DayStatus>(DayStatus.WORK);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [hasSplitShift, setHasSplitShift] = useState(false);
  const [splitParts, setSplitParts] = useState<Array<{ start: string; end: string }>>([
    { start: "09:00", end: "13:00" },
    { start: "14:00", end: "18:00" },
  ]);
  const [note, setNote] = useState("");

  // Валидация времени
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateTime = () => {
    const newErrors: Record<string, string> = {};

    // Проверка обычной смены
    if (status === DayStatus.WORK && !hasSplitShift) {
      if (startTime >= endTime) {
        newErrors.time = "Начало должно быть раньше конца";
      }
    }

    // Проверка дробной смены
    if (hasSplitShift || status === DayStatus.SPLIT) {
      for (let i = 0; i < splitParts.length; i++) {
        const part = splitParts[i];
        if (part.start >= part.end) {
          newErrors[`split-${i}`] = "Часть ${i + 1}: начало должно быть раньше конца";
        }

        // Проверка: следующая часть должна начинаться после окончания предыдущей
        if (i > 0) {
          const prevPart = splitParts[i - 1];
          if (part.start <= prevPart.end) {
            newErrors[`split-${i}`] = `Часть ${i + 1}: начало должно быть позже конца части ${i}`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (selectedDate) {
      const dateStr = formatDateForAPI(selectedDate);
      const existingEntry = schedule[dateStr];

      // Load existing settings or use defaults
      if (existingEntry) {
        const entryStatus = existingEntry.status as DayStatus;
        setStatus(entryStatus);
        setStartTime(existingEntry.meta?.start || "09:00");
        setEndTime(existingEntry.meta?.end || "18:00");

        // Если статус SPLIT, включаем дробление
        const isSplit = entryStatus === DayStatus.SPLIT || existingEntry.meta?.splitShift;
        setHasSplitShift(isSplit);

        setSplitParts(existingEntry.meta?.splitParts || [
          { start: "09:00", end: "13:00" },
          { start: "14:00", end: "18:00" },
        ]);
        setNote(existingEntry.meta?.note || "");
      } else {
        // Defaults
        setStatus(DayStatus.WORK);
        setStartTime("09:00");
        setEndTime("18:00");
        setHasSplitShift(false);
        setSplitParts([
          { start: "09:00", end: "13:00" },
          { start: "14:00", end: "18:00" },
        ]);
        setNote("");
      }
    }
  }, [selectedDate, schedule]);

  const handleSave = () => {
    if (!selectedDate) return;

    // Валидация
    if (!validateTime()) {
      return;
    }

    // Если осталась только 1 часть, сохраняем как обычный рабочий день
    if (hasSplitShift && splitParts.length === 1) {
      const singlePart = splitParts[0];
      const meta: ScheduleMeta = {
        start: singlePart.start,
        end: singlePart.end,
        note: note || undefined,
      };

      // Проверяем, является ли день черновиком
      const isDayDraft = currentPeriod && selectedDate ? (
        selectedDate < new Date(currentPeriod.period_start) ||
        selectedDate > new Date(currentPeriod.period_end)
      ) : false;

      const payload: ScheduleDayPayload = {
        status: status === DayStatus.SPLIT ? DayStatus.WORK : status,
        meta,
        is_draft: isDayDraft,
      };

      const dateStr = formatDateForAPI(selectedDate);
      updateDay(dateStr, payload);
      setIsDayModalOpen(false);
      setSelectedDate(null);
      setErrors({});
      return;
    }

    const meta: ScheduleMeta = {
      start: startTime,
      end: endTime,
      note: note || undefined,
    };

    if (hasSplitShift) {
      meta.splitShift = true;
      meta.splitParts = splitParts;
    }

    // Проверяем, является ли день черновиком
    const isDayDraft = currentPeriod && selectedDate ? (
      selectedDate < new Date(currentPeriod.period_start) ||
      selectedDate > new Date(currentPeriod.period_end)
    ) : false;

    const payload: ScheduleDayPayload = {
      status: status,
      meta,
      is_draft: isDayDraft,
    };

    const dateStr = formatDateForAPI(selectedDate);
    updateDay(dateStr, payload);
    setIsDayModalOpen(false);
    setSelectedDate(null);
    setErrors({});
  };

  const handleCancel = () => {
    setIsDayModalOpen(false);
    setSelectedDate(null);
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

  return (
    <AnimatePresence>
      {isDayModalOpen && selectedDate && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-bento border-2 border-black w-full max-w-md mx-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200">
                <h3 className="text-h3 font-display text-base sm:text-lg lg:text-2xl">
                  {format(selectedDate, "d MMMM yyyy", { locale: ru })}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto scrollbar-t2">
                {/* Status Selection */}
                <div className="space-y-3">
                  <label className="font-body font-medium">Тип дня</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: DayStatus.WORK, label: "Рабочий день" },
                      { value: DayStatus.OFF, label: "Отгул" },
                      { value: DayStatus.VACATION, label: "Отпуск" },
                      { value: DayStatus.SICK, label: "Больничный" },
                      { value: DayStatus.SPLIT, label: "Дробящаяся смена" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={`px-4 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                          status === option.value
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => {
                          setStatus(option.value);

                          // Если выбираем дробящуюся смену, включаем дробление
                          if (option.value === DayStatus.SPLIT) {
                            setHasSplitShift(true);
                            if (splitParts.length === 0) {
                              setSplitParts([
                                { start: "09:00", end: "13:00" },
                                { start: "14:00", end: "18:00" },
                              ]);
                            }
                          }
                          // Если переключаемся с SPLIT на другой статус, выключаем дробление
                          else if (status === DayStatus.SPLIT) {
                            setHasSplitShift(false);
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work Hours */}
                {status === DayStatus.WORK && (
                  <div className="space-y-3">
                    <label className="font-body font-medium">Время работы</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">С</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            // Очищаем ошибку при изменении
                            if (errors.time) {
                              setErrors({ ...errors, time: '' });
                            }
                          }}
                          className={`input-t2 ${errors.time ? 'border-red-500' : ''}`}
                        />
                        {errors.time && (
                          <p className="text-xs text-red-500 mt-1">{errors.time}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">До</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                            // Очищаем ошибку при изменении
                            if (errors.time) {
                              setErrors({ ...errors, time: '' });
                            }
                          }}
                          className={`input-t2 ${errors.time ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Split Shift */}
                {(status === DayStatus.WORK || status === DayStatus.SPLIT) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-body font-medium">
                        {status === DayStatus.SPLIT ? "Части смены" : "Дробление смены"}
                      </label>
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          (status === DayStatus.SPLIT || hasSplitShift)
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => {
                          const newHasSplitShift = !hasSplitShift;
                          setHasSplitShift(newHasSplitShift);

                          // Если включили дробление, меняем статус на дробящаяся смена
                          if (newHasSplitShift) {
                            setStatus(DayStatus.SPLIT);
                            // Добавим части если их нет
                            if (splitParts.length === 0) {
                              setSplitParts([
                                { start: "09:00", end: "13:00" },
                                { start: "14:00", end: "18:00" },
                              ]);
                            }
                          } else if (status === DayStatus.SPLIT) {
                            // Если выключили дробление и был статус SPLIT, возвращаем на WORK
                            setStatus(DayStatus.WORK);
                          }

                          // Очищаем ошибки при переключении
                          setErrors({});
                        }}
                      >
                        {hasSplitShift ? "Выкл" : "Вкл"}
                      </button>
                    </div>

                    {hasSplitShift && (
                      <>
                        {errors.time && (
                          <p className="text-xs text-red-500 mb-2">{errors.time}</p>
                        )}
                        <div className="space-y-2">
                          {splitParts.map((part, index) => {
                            const errorKey = `split-${index}`;
                            const hasError = !!errors[errorKey];

                            return (
                              <div key={index} className={`flex items-center gap-2 ${hasError ? 'bg-red-50 p-2 rounded-lg' : ''}`}>
                                <span className="text-sm font-medium text-gray-500">
                                  Часть {index + 1}
                                </span>
                                <input
                                  type="time"
                                  value={part.start}
                                  onChange={(e) => {
                                    updateSplitPart(index, "start", e.target.value);
                                    // Очищаем ошибки для этой части и следующих
                                    const newErrors = { ...errors };
                                    for (let i = index; i < splitParts.length; i++) {
                                      delete newErrors[`split-${i}`];
                                    }
                                    setErrors(newErrors);
                                  }}
                                  className={`input-t2 flex-1 ${hasError ? 'border-red-500' : ''}`}
                                />
                                <span className="text-gray-400">—</span>
                                <input
                                  type="time"
                                  value={part.end}
                                  onChange={(e) => {
                                    updateSplitPart(index, "end", e.target.value);
                                    // Очищаем ошибки для этой части и следующих
                                    const errors = { ...errors };
                                    for (let i = index; i < splitParts.length; i++) {
                                      delete errors[`split-${i}`];
                                    }
                                    setErrors({ ...errors });
                                  }}
                                  className={`input-t2 flex-1 ${hasError ? 'border-red-500' : ''}`}
                                />
                                {splitParts.length > 1 && (
                                  <button
                                    onClick={() => {
                                      removeSplitPart(index);
                                      // Очищаем ошибки
                                      const errors = { ...errors };
                                      for (let i = index; i < splitParts.length; i++) {
                                        delete errors[`split-${i}`];
                                      }
                                      setErrors({ ...errors });
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                {hasError && (
                                  <span className="text-xs text-red-500">⚠️</span>
                                )}
                              </div>
                            );
                          })}

                          {/* Информация если осталась 1 часть */}
                          {splitParts.length === 1 && (
                            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                              При сохранении день станет обычным рабочим (время из части 1)
                            </div>
                          )}

                          <button
                            onClick={addSplitPart}
                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-black hover:text-black transition-all"
                          >
                            + Добавить часть
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Note */}
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
              </div>

              {/* Footer */}
              <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 lg:p-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-2 border-black rounded-xl font-body text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary text-sm sm:text-base"
                >
                  Сохранить
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
