"use client";

import { useEffect, useState, useImperativeHandle, forwardRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Umbrella, Coffee } from "lucide-react";
import { api } from "@/lib/api";

interface Limits {
  available_vacation_days: number;
  available_off_days: number;
}

interface VacationLimitsProps {
  currentPeriod: { period_start: string; period_end: string } | null;
  schedule: Record<string, { status: string; meta?: any; is_draft?: boolean }>;
}

export interface VacationLimitsRef {
  refresh: () => Promise<void>;
}

export const VacationLimits = forwardRef<VacationLimitsRef, VacationLimitsProps>(
  ({ currentPeriod, schedule }, ref) => {
    const [limits, setLimits] = useState<Limits | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load available limits from API (only once)
    useEffect(() => {
      const loadAvailableLimits = async () => {
        try {
          setIsLoading(true);
          const data = await api.getMyLimits();
          setLimits({
            available_vacation_days: data.available_vacation_days,
            available_off_days: data.available_off_days,
          });
        } catch (error) {
          console.error("Failed to load limits:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadAvailableLimits();
    }, []); // Load only once on mount

        // Calculate used days dynamically from schedule
    const usedDays = useMemo(() => {
      if (!currentPeriod || !schedule) {
        return { used_vacation: 0, used_off: 0 };
      }

      const periodStart = new Date(currentPeriod.period_start);
      const periodEnd = new Date(currentPeriod.period_end);

      let used_vacation = 0;
      let used_off = 0;

      Object.entries(schedule).forEach(([dateStr, data]) => {
        const date = new Date(dateStr);
        // Only count days within the current period
        if (date >= periodStart && date <= periodEnd && !data.is_draft) {
          if (data.status === "vacation") {
            used_vacation++;
          } else if (data.status === "off") {
            used_off++;
          }
        }
      });

      return { used_vacation, used_off };
    }, [schedule, currentPeriod]);

    // Calculate remaining days
    const remainingDays = useMemo(() => {
      if (!limits) return { remaining_vacation: 0, remaining_off: 0 };
      return {
        remaining_vacation: Math.max(0, limits.available_vacation_days - usedDays.used_vacation),
        remaining_off: Math.max(0, limits.available_off_days - usedDays.used_off),
      };
    }, [limits, usedDays]);

    // Expose refresh function via ref
    useImperativeHandle(ref, () => ({
      refresh: async () => {
        try {
          const data = await api.getMyLimits();
          setLimits({
            available_vacation_days: data.available_vacation_days,
            available_off_days: data.available_off_days,
          });
        } catch (error) {
          console.error("Failed to refresh limits:", error);
        }
      },
    }));

    if (!currentPeriod || isLoading || !limits) {
      return null;
    }

    return (
                  <motion.div
        className="bento-card p-2 sm:p-4 lg:p-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {/* Отпускные */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Umbrella className="w-4 h-4 sm:w-5 sm:h-5 text-t2-magenta flex-shrink-0" />
              <span className="font-body text-xs sm:text-sm font-medium">Отпускные</span>
            </div>
                        <div className="flex items-baseline gap-1 sm:gap-2">
              <span className={`font-stencil text-xl sm:text-3xl ${remainingDays.remaining_vacation === 0 ? 'text-red-500' : ''}`}>
                {remainingDays.remaining_vacation}
              </span>
              <span className="font-body text-[10px] sm:text-xs text-gray-500">/{limits.available_vacation_days}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${remainingDays.remaining_vacation === 0 ? 'bg-red-500' : 'bg-t2-magenta'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((remainingDays.remaining_vacation / limits.available_vacation_days) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

                                        {/* Отгулы */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-t2-salad flex-shrink-0" />
              <span className="font-body text-xs sm:text-sm font-medium">Отгулы</span>
            </div>
                        <div className="flex items-baseline gap-1 sm:gap-2">
              <span className={`font-stencil text-xl sm:text-3xl ${remainingDays.remaining_off === 0 ? 'text-red-500' : ''}`}>
                {remainingDays.remaining_off}
              </span>
              <span className="font-body text-[10px] sm:text-xs text-gray-500">/{limits.available_off_days}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${remainingDays.remaining_off === 0 ? 'bg-red-500' : 'bg-t2-salad'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((remainingDays.remaining_off / limits.available_off_days) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

VacationLimits.displayName = "VacationLimits";
