"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { DayStatus, STATUS_LABELS, ScheduleMeta } from "@/types";
import { usePaintToolStore } from "@/lib/store";

export function PaintToolModal() {
  const {
    selectedStatus,
    presets,
    isPaintSettingsOpen,
    setIsPaintSettingsOpen,
    updatePreset,
  } = usePaintToolStore();

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
    if (selectedStatus === DayStatus.WORK && !hasSplitShift) {
      if (startTime >= endTime) {
        newErrors.time = "Начало должно быть раньше конца";
      }
    }

    // Проверка дробной смены
    if (hasSplitShift || selectedStatus === DayStatus.SPLIT) {
      for (let i = 0; i < splitParts.length; i++) {
        const part = splitParts[i];
        if (part.start >= part.end) {
          newErrors[`split-${i}`] = `Часть ${i + 1}: начало должно быть раньше конца`;
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
    if (selectedStatus && isPaintSettingsOpen) {
      const preset = presets[selectedStatus];
      setStartTime(preset.start || "09:00");
      setEndTime(preset.end || "18:00");
      setHasSplitShift(preset.splitShift || false);
      setSplitParts(
        preset.splitParts || [
          { start: "09:00", end: "13:00" },
          { start: "14:00", end: "18:00" },
        ]
      );
      setNote(preset.note || "");
    }
  }, [selectedStatus, isPaintSettingsOpen, presets]);

  const handleSave = () => {
    if (!selectedStatus) return;

    // Валидация
    if (!validateTime()) {
      return;
    }

    const preset: ScheduleMeta = {
      start: startTime,
      end: endTime,
      note: note || undefined,
    };

    if (hasSplitShift) {
      preset.splitShift = true;
      preset.splitParts = splitParts;
    }

    updatePreset(selectedStatus, preset);
    setIsPaintSettingsOpen(false);
    setErrors({});
  };

  const handleCancel = () => {
    setIsPaintSettingsOpen(false);
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

  if (!selectedStatus) return null;

  const showWorkHours = selectedStatus === DayStatus.WORK || selectedStatus === DayStatus.SPLIT;
  const showSplitShift = selectedStatus === DayStatus.WORK || selectedStatus === DayStatus.SPLIT;

  return (
    <AnimatePresence>
      {isPaintSettingsOpen && (
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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-bento border-2 border-black w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-h3 font-display">
                  Настройки: {STATUS_LABELS[selectedStatus]}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-t2">
                {/* Work Hours */}
                {showWorkHours && (
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
                            if (errors.time) {
                              setErrors({ ...errors, time: "" });
                            }
                          }}
                          className={`input-t2 ${errors.time ? "border-red-500" : ""}`}
                        />
                        {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">До</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                            if (errors.time) {
                              setErrors({ ...errors, time: "" });
                            }
                          }}
                          className={`input-t2 ${errors.time ? "border-red-500" : ""}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Split Shift */}
                {showSplitShift && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-body font-medium">
                        {selectedStatus === DayStatus.SPLIT ? "Части смены" : "Дробление смены"}
                      </label>
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          hasSplitShift ? "bg-black text-white" : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => {
                          const newHasSplitShift = !hasSplitShift;
                          setHasSplitShift(newHasSplitShift);
                          setErrors({});
                        }}
                      >
                        {hasSplitShift ? "Выкл" : "Вкл"}
                      </button>
                    </div>

                    {hasSplitShift && (
                      <>
                        {errors.time && <p className="text-xs text-red-500 mb-2">{errors.time}</p>}
                        <div className="space-y-2">
                          {splitParts.map((part, index) => {
                            const errorKey = `split-${index}`;
                            const hasError = !!errors[errorKey];

                            return (
                              <div
                                key={index}
                                className={`flex items-center gap-2 ${hasError ? "bg-red-50 p-2 rounded-lg" : ""}`}
                              >
                                <span className="text-sm font-medium text-gray-500">Часть {index + 1}</span>
                                <input
                                  type="time"
                                  value={part.start}
                                  onChange={(e) => {
                                    updateSplitPart(index, "start", e.target.value);
                                    const newErrors = { ...errors };
                                    for (let i = index; i < splitParts.length; i++) {
                                      delete newErrors[`split-${i}`];
                                    }
                                    setErrors(newErrors);
                                  }}
                                  className={`input-t2 flex-1 ${hasError ? "border-red-500" : ""}`}
                                />
                                <span className="text-gray-400">—</span>
                                <input
                                  type="time"
                                  value={part.end}
                                  onChange={(e) => {
                                    updateSplitPart(index, "end", e.target.value);
                                    const newErrors = { ...errors };
                                    for (let i = index; i < splitParts.length; i++) {
                                      delete newErrors[`split-${i}`];
                                    }
                                    setErrors(newErrors);
                                  }}
                                  className={`input-t2 flex-1 ${hasError ? "border-red-500" : ""}`}
                                />
                                {splitParts.length > 1 && (
                                  <button
                                    onClick={() => {
                                      removeSplitPart(index);
                                      const newErrors = { ...errors };
                                      for (let i = index; i < splitParts.length; i++) {
                                        delete newErrors[`split-${i}`];
                                      }
                                      setErrors(newErrors);
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                                {hasError && <span className="text-xs text-red-500">⚠️</span>}
                              </div>
                            );
                          })}
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
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border-2 border-black rounded-xl font-body font-medium hover:bg-gray-100 transition-colors"
                >
                  Отмена
                </button>
                <button onClick={handleSave} className="flex-1 btn-primary">
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
