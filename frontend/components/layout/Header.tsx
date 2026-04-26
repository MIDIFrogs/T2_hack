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
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
            <img src="/logo/t2_Logo_White_sRGB.svg" alt="T2 Logo" className="w-full h-full" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-base sm:text-lg lg:text-xl">Schedule</h1>
          </div>
        </motion.div>

        {/* User Info */}
        {user && (
          <motion.div
            className="flex items-center gap-2 sm:gap-3 lg:gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="hidden md:block text-right">
              <div className="font-body text-xs sm:text-sm font-medium">{user.full_name || user.email}</div>
              <div className="font-body text-xs text-gray-400">
                {user.alliance && `${user.alliance} • `}
                {user.category && user.category}
              </div>
            </div>
            <motion.button
              onClick={handleProfileClick}
              className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-t2-salad rounded-full flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Профиль"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-black" />
            </motion.button>
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              title="Выйти"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
