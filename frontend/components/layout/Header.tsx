"use client";

import { motion } from "framer-motion";
import { User, Calendar, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiHelpers } from "@/lib/api";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    apiHelpers.clearToken();
    window.location.href = "/login";
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <motion.header
      className="bg-black text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-12 h-12 bg-t2-magenta rounded-xl flex items-center justify-center">
            <span className="font-stencil text-2xl text-white">T2</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-xl">Schedule</h1>
            <p className="font-body text-xs text-gray-400">Планирование рабочего времени</p>
          </div>
        </motion.div>

        {/* User Info */}
        {user && (
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="hidden md:block text-right">
              <div className="font-body font-medium">{user.full_name || user.email}</div>
              <div className="font-body text-xs text-gray-400">
                {user.alliance && `${user.alliance} • `}
                {user.category && user.category}
              </div>
            </div>
            <motion.button
              onClick={handleProfileClick}
              className="w-10 h-10 bg-t2-salad rounded-full flex items-center justify-center hover:scale-110 transition-transform"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Профиль"
            >
              <User className="w-5 h-5 text-black" />
            </motion.button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
