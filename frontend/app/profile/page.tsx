"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, TrendingUp, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { calculateTotalHours, formatHours } from "@/lib/utils";
import { ScheduleDayPayload, DayStatus } from "@/types";

interface Stats {
  totalHours: number;
  workDays: number;
  offDays: number;
  vacationDays: number;
  sickDays: number;
  splitDays: number;
  emptyDays: number;
  completion: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const schedule = await api.getMySchedule();
      const entries = Object.values(schedule);

      const totalHours = calculateTotalHours(schedule);

      const workDays = entries.filter((e) => e.status === DayStatus.WORK).length;
      const offDays = entries.filter((e) => e.status === DayStatus.OFF).length;
      const vacationDays = entries.filter((e) => e.status === DayStatus.VACATION).length;
      const sickDays = entries.filter((e) => e.status === DayStatus.SICK).length;
      const splitDays = entries.filter((e) => e.status === DayStatus.SPLIT).length;
      const emptyDays = entries.filter((e) => !e.status || e.status === "").length;

      const totalDays = workDays + offDays + vacationDays + sickDays + splitDays;
      const completion = totalDays > 0 ? Math.round((totalDays / (totalDays + emptyDays)) * 100) : 0;

      setStats({
        totalHours,
        workDays,
        offDays,
        vacationDays,
        sickDays,
        splitDays,
        emptyDays,
        completion,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const achievements = [
    { id: 1, title: "Ранний пташка", description: "Заполнил в первый день", icon: "🌟", unlocked: true },
    { id: 2, title: "Перфекционист", description: "100% заполнено", icon: "🎯", unlocked: stats?.completion === 100 },
    { id: 3, title: "Трудоголик", description: "180+ часов", icon: "💪", unlocked: (stats?.totalHours || 0) >= 180 },
    { id: 4, title: "Надёжный", description: "Заполнился за неделю", icon: "⭐", unlocked: true },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="font-stencil text-3xl text-white">T2</span>
            </div>
            <p className="font-body text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body">Назад</span>
          </motion.button>

          {/* Profile Header */}
          <motion.div
            className="bento-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-t2-magenta rounded-full flex items-center justify-center">
                <span className="font-stencil text-4xl text-white">
                  {user?.full_name?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-h1 font-display mb-2">{user?.full_name || "Пользователь"}</h1>
                <p className="font-body text-gray-600 mb-1">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-500">
                  {user?.alliance && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full">{user.alliance}</span>
                  )}
                  {user?.category && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full">{user.category}</span>
                  )}
                  <span className="px-3 py-1 bg-t2-salad text-black rounded-full font-medium">
                    {user?.role === UserRole.USER ? "Сотрудник" : user?.role === UserRole.MANAGER ? "Руководитель" : "Админ"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Stats */}
          {stats && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatCard
                label="Отработано"
                value={formatHours(stats.totalHours)}
                icon={Clock}
                color="bg-t2-salad"
                delay={0}
              />
              <StatCard
                label="Рабочих дней"
                value={stats.workDays.toString()}
                icon={Target}
                color="bg-white"
                delay={0.1}
              />
              <StatCard
                label="Выходных"
                value={stats.offDays.toString()}
                icon={TrendingUp}
                color="bg-white"
                delay={0.2}
              />
              <StatCard
                label="Заполнено"
                value={`${stats.completion}%`}
                icon={Award}
                color="bg-white"
                delay={0.3}
              />
            </motion.div>
          )}

          {/* Distribution Chart */}
          {stats && (
            <motion.div
              className="bento-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-h3 font-display mb-6">Распределение по дням</h3>

              <div className="space-y-4">
                <DistributionBar
                  label="Рабочие дни"
                  count={stats.workDays}
                  total={stats.workDays + stats.offDays + stats.vacationDays + stats.sickDays}
                  color="bg-status-work"
                  delay={0}
                />
                <DistributionBar
                  label="Выходные"
                  count={stats.offDays}
                  total={stats.workDays + stats.offDays + stats.vacationDays + stats.sickDays}
                  color="bg-status-off"
                  delay={0.1}
                />
                <DistributionBar
                  label="Отпуск"
                  count={stats.vacationDays}
                  total={stats.workDays + stats.offDays + stats.vacationDays + stats.sickDays}
                  color="bg-status-vacation"
                  delay={0.2}
                />
                <DistributionBar
                  label="Больничный"
                  count={stats.sickDays}
                  total={stats.workDays + stats.offDays + stats.vacationDays + stats.sickDays}
                  color="bg-status-sick"
                  delay={0.3}
                />
              </div>
            </motion.div>
          )}

          {/* Achievements */}
          <motion.div
            className="bento-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-h3 font-display mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-t2-magenta" />
              Достижения
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? "bg-white border-black"
                      : "bg-gray-100 border-gray-300 opacity-60"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={achievement.unlocked ? { scale: 1.02 } : {}}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-display font-medium mb-1">{achievement.title}</h4>
                      <p className="font-body text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <div className="w-6 h-6 bg-t2-salad rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`bento-card p-4 flex flex-col items-center gap-2 ${color}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Icon className="w-6 h-6" />
      <div className="font-stencil text-3xl">{value}</div>
      <div className="text-xs font-body font-medium">{label}</div>
    </motion.div>
  );
}

function DistributionBar({
  label,
  count,
  total,
  color,
  delay,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  delay: number;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className="flex justify-between items-center">
        <span className="font-body text-sm">{label}</span>
        <span className="font-stencil text-sm">{count} дн.</span>
      </div>
      <div className="progress-bar h-3">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

// Import UserRole
import { UserRole } from "@/types";
import { Clock } from "lucide-react";
