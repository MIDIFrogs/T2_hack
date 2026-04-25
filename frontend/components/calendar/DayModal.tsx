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
  const { updateDay } = useScheduleStore();

  const [status, setStatus] = useState<DayStatus>(DayStatus.WORK);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [hasSplitShift, setHasSplitShift] = useState(false);
  const [splitParts, setSplitParts] = useState<Array<{ start: string; end: string }>>([
    { start: "09:00", end: "13:00" },
    { start: "14:00", end: "18:00" },
  ]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (selectedDate) {
      // Reset form
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
  }, [selectedDate]);

  const handleSave = () => {
    if (!selectedDate) return;

    const meta: ScheduleMeta = {
      start: startTime,
      end: endTime,
      note: note || undefined,
    };

    if (hasSplitShift) {
      meta.splitShift = true;
      meta.splitParts = splitParts;
    }

    const payload: ScheduleDayPayload = {
      status: status,
      meta,
    };

    const dateStr = formatDateForAPI(selectedDate);
    updateDay(dateStr, payload);
    setIsDayModalOpen(false);
    setSelectedDate(null);
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
                  {format(selectedDate, "d MMMM yyyy", { locale: ru })}
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
                {/* Status Selection */}
                <div className="space-y-3">
                  <label className="font-body font-medium">Тип дня</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: DayStatus.WORK, label: "Рабочий день" },
                      { value: DayStatus.OFF, label: "Выходной" },
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
                        onClick={() => setStatus(option.value)}
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

                {/* Split Shift */}
                {(status === DayStatus.WORK || status === DayStatus.SPLIT) && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-body font-medium">Дробление смены</label>
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          hasSplitShift
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                        }`}
                        onClick={() => setHasSplitShift(!hasSplitShift)}
                      >
                        {hasSplitShift ? "Вкл" : "Выкл"}
                      </button>
                    </div>

                    {hasSplitShift && (
                      <div className="space-y-2">
                        {splitParts.map((part, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">
                              Часть {index + 1}
                            </span>
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
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary"
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
