"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Target, TrendingUp, Award, Clock, Code, Coffee, Zap, Heart, Star, Flame, Lightbulb, Palette, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { calculateTotalHours, formatHours } from "@/lib/utils";
import { ScheduleDayPayload, DayStatus, UserRole } from "@/types";
import { SalaryStats } from "@/components/stats/SalaryStats";

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

      // Незаполненные дни считаем как выходные для статистики
      const totalOffDays = offDays + emptyDays;

      const totalDays = workDays + offDays + vacationDays + sickDays + splitDays;
      const completion = totalDays > 0 ? Math.round((totalDays / (totalDays + emptyDays)) * 100) : 0;

      setStats({
        totalHours,
        workDays,
        offDays: totalOffDays, // Включаем незаполненные дни
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
    { id: 1, title: "Hello World!", description: "Поставить первые часы", icon: Code, unlocked: (stats?.totalHours || 0) > 0 },
    { id: 2, title: "Упорядоченность", description: "Заполнить полностью график", icon: Trophy, unlocked: stats?.completion === 100 },
    { id: 3, title: "Идеальный месяц", description: "Ни разу не перенести задачу в течение месяца", icon: Star, unlocked: false },
    { id: 4, title: "Ранняя пташка", description: "Составить преимущественно утреннее расписание", icon: Lightbulb, unlocked: false },
    { id: 5, title: "Сова", description: "Составить вечернее расписание", icon: Clock, unlocked: false },
    { id: 6, title: "Плановый перекур", description: "Запланировать 5 перерывов по 10 минут в день", icon: Coffee, unlocked: false },
    { id: 7, title: "Золотая середина", description: "Заполнить 80% рабочих дней и 20% выходных", icon: Target, unlocked: false },
    { id: 8, title: "Шрёдингер", description: "Составить два взаимоисключающих варианта расписания", icon: Zap, unlocked: false },
    { id: 9, title: "Археолог", description: "Взять задачу, которую планировали год назад", icon: Award, unlocked: false },
    { id: 10, title: "Дубликат", description: "Составить расписание, идентичное другого сотрудника", icon: Copy, unlocked: false },
    { id: 11, title: "Да будет свет", description: "Назначить отпуск", icon: Heart, unlocked: false },
    { id: 12, title: "Художник", description: "Нарисуй фигуру в календаре и поделись ею", icon: Palette, unlocked: false },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <img src="/logo/t2_Logo_Black_sRGB.svg" alt="T2 Logo" className="w-full h-full" />
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
            className="bento-card p-4 sm:p-6 lg:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-t2-magenta rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-stencil text-2xl sm:text-3xl lg:text-4xl text-white">
                  {user?.full_name?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-h1 font-display mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-4xl">{user?.full_name || "Пользователь"}</h1>
                <p className="font-body text-gray-600 mb-1 text-sm sm:text-base">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                  {user?.alliance && (
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 rounded-full">{user.alliance}</span>
                  )}
                  {user?.category && (
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 rounded-full">{user.category}</span>
                  )}
                  <span className="px-2 sm:px-3 py-1 bg-t2-salad text-black rounded-full font-medium">
                    {user?.role === UserRole.USER ? "Сотрудник" : user?.role === UserRole.MANAGER ? "Руководитель" : "Админ"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Stats */}
          {stats && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4"
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
                label="Отгулов"
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
              className="bento-card p-3 sm:p-4 lg:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-h3 font-display mb-3 sm:mb-4 lg:mb-6 text-base sm:text-lg lg:text-2xl">Распределение по дням</h3>

              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <DistributionBar
                  label="Рабочие дни"
                  count={stats.workDays}
                  total={stats.workDays + stats.offDays + stats.vacationDays + stats.sickDays}
                  color="bg-status-work"
                  delay={0}
                />
                <DistributionBar
                  label="Отгулы"
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

                    {/* Salary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <SalaryStats />
          </motion.div>

          {/* Achievements */}
          <motion.div
            className="bento-card p-3 sm:p-4 lg:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-h3 font-display mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2 text-base sm:text-lg lg:text-2xl">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-t2-magenta" />
              <span>Достижения</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className={`p-2 sm:p-3 lg:p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? "bg-[#A7FC00] border-black"
                      : "bg-gray-100 border-gray-300 opacity-60"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={achievement.unlocked ? { scale: 1.02 } : {}}
                >
                  <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                    <achievement.icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${achievement.unlocked ? "text-t2-magenta" : "text-gray-400"}`} />
                    <div>
                      <h4 className={`font-display font-medium mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base ${achievement.unlocked ? "text-black" : "text-gray-600"}`}>{achievement.title}</h4>
                      <p className={`font-body text-xs sm:text-sm ${achievement.unlocked ? "text-black/70" : "text-gray-500"}`}>{achievement.description}</p>
                    </div>
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
      className={`bento-card p-2 sm:p-3 lg:p-4 flex flex-col items-center gap-1 sm:gap-2 ${color}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      <div className="font-stencil text-lg sm:text-xl lg:text-3xl">{value}</div>
      <div className="text-xs sm:text-xs lg:text-sm font-body font-medium">{label}</div>
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
