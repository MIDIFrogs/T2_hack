"use client";

import { motion } from "framer-motion";
import { Brush, Eraser, Undo, Trash2 } from "lucide-react";
import { DayStatus, STATUS_LABELS, STATUS_COLORS, PaintMode } from "@/types";
import { usePaintToolStore, useScheduleStore, useHistoryStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function PaintTool() {
  const { selectedStatus, mode, setSelectedStatus, reset } = usePaintToolStore();
  const { schedule } = useScheduleStore();
  const { canUndo, undo } = useHistoryStore();

  const handleStatusChange = (status: DayStatus) => {
    setSelectedStatus(status);
  };

  const handleClear = () => {
    // Clear all painted days
    useScheduleStore.getState().clearSchedule();
    reset();
  };

  const handleUndo = () => {
    const previousState = undo(schedule);
    if (previousState) {
      useScheduleStore.getState().setSchedule(previousState);
    }
  };

  const statuses: DayStatus[] = [
    DayStatus.WORK,
    DayStatus.OFF,
    DayStatus.VACATION,
    DayStatus.SICK,
    DayStatus.SPLIT,
  ];

  return (
    <motion.div
      className="bg-black rounded-full px-6 py-3 flex items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Brush Icon */}
      <div className="flex items-center gap-2 text-white">
        <Brush className="w-5 h-5" />
        <span className="font-body font-medium">Кисть</span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Status Selector */}
      <div className="flex items-center gap-2">
        {statuses.map((status) => (
          <motion.button
            key={status}
            className={cn(
              "px-4 py-2 rounded-full font-body text-sm font-medium transition-all",
              selectedStatus === status
                ? "text-black ring-2 ring-white ring-offset-2 ring-offset-black"
                : "text-white/70 hover:text-white"
            )}
            style={{
              backgroundColor: selectedStatus === status ? STATUS_COLORS[status] : "transparent",
            }}
            onClick={() => handleStatusChange(status)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {STATUS_LABELS[status]}
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Undo */}
        <motion.button
          className={cn(
            "p-2 rounded-full transition-all",
            canUndo
              ? "text-white hover:bg-white/10"
              : "text-white/20 cursor-not-allowed"
          )}
          onClick={handleUndo}
          disabled={!canUndo}
          whileHover={canUndo ? { scale: 1.1 } : {}}
          whileTap={canUndo ? { scale: 0.9 } : {}}
        >
          <Undo className="w-5 h-5" />
        </motion.button>

        {/* Clear */}
        <motion.button
          className="p-2 rounded-full text-white hover:bg-white/10 transition-all"
          onClick={handleClear}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
