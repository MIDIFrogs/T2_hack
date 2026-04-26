"use client";

import { motion } from "framer-motion";
import { Brush, Settings, Trash2, Eraser } from "lucide-react";
import { DayStatus, STATUS_LABELS, STATUS_COLORS } from "@/types";
import { usePaintToolStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PaintTool() {
  const { selectedStatus, setSelectedStatus, reset, setIsPaintSettingsOpen, presets, isDeleting, setIsDeleting } = usePaintToolStore();

  const handleStatusChange = (status: DayStatus) => {
    // Если кликнули на уже выбранный статус - открываем настройки
    if (selectedStatus === status) {
      setIsPaintSettingsOpen(true);
    } else {
      setSelectedStatus(status);
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleting(!isDeleting);
  };

  const statuses: DayStatus[] = [
    DayStatus.WORK,
    DayStatus.OFF,
    DayStatus.VACATION,
    DayStatus.SICK,
    DayStatus.SPLIT,
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Brush Icon */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-white flex-shrink-0">
        <Brush className={`w-4 h-4 sm:w-5 sm:h-5 ${!selectedStatus && !isDeleting ? "opacity-50" : ""}`} />
        <span className="font-body font-medium text-sm sm:text-base">Кисть</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 sm:h-8 bg-white/20 flex-shrink-0" />

      {/* Status Selector */}
      <div className="flex items-center gap-1 sm:gap-2">
        {statuses.map((status) => {
          const isSelected = selectedStatus === status;
          const preset = presets[status];
          const hasPreset = preset && (preset.start || preset.end || preset.note || preset.splitShift);

          // Определяем цвет текста в зависимости от фона
          const needsWhiteText = isSelected && (
            status === DayStatus.SPLIT ||  // Синий фон
            status === DayStatus.SICK       // Красный фон
          );

          return (
            <motion.button
              key={status}
              className={cn(
                "px-2 sm:px-3 py-1.5 sm:py-2 rounded-full font-body text-xs sm:text-sm font-medium transition-all relative flex items-center gap-0.5 sm:gap-1 flex-shrink-0",
                // Невыбранная кнопка - белый текст на прозрачном
                !isSelected && "text-white hover:bg-white/10",
                // Выбранная кнопка
                isSelected && needsWhiteText && "text-white",
                isSelected && !needsWhiteText && "text-black"
              )}
              style={{
                backgroundColor: isSelected ? STATUS_COLORS[status] : undefined,
              }}
              onClick={() => handleStatusChange(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="hidden xs:inline sm:inline">{STATUS_LABELS[status]}</span>
              <span className="xs:hidden sm:hidden">{status === DayStatus.WORK ? "Раб" : status === DayStatus.OFF ? "Вых" : status === DayStatus.VACATION ? "Отп" : status === DayStatus.SICK ? "Бол" : "Дроб"}</span>
              {isSelected && hasPreset && (
                <Settings className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 flex-shrink-0" />
              )}
            </motion.button>
          );
        })}

        {/* Delete Mode Button */}
        <motion.button
          className={cn(
            "px-2 sm:px-3 py-1.5 sm:py-2 rounded-full font-body text-xs sm:text-sm font-medium transition-all relative flex items-center gap-0.5 sm:gap-1 flex-shrink-0",
            isDeleting ? "bg-red-500 text-white" : "text-white hover:bg-white/10"
          )}
          onClick={toggleDeleteMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Режим удаления"
        >
          <Eraser className="w-4 h-4 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline sm:inline">{isDeleting ? "Удаление" : ""}</span>
        </motion.button>
      </div>
    </div>
  );
}
