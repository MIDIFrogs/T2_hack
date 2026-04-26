"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { api, apiHelpers } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const tokenData = await api.login(email, password);

      // Сохраняем токен СРАЗУ после получения
      apiHelpers.saveToken(tokenData.access_token);

      const userData = await api.getCurrentUser();

      // Save to store
      setAuth(userData, tokenData.access_token);

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный email или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img src="/logo/t2_Logo_Black_sRGB.svg" alt="T2 Logo" className="w-full h-full" />
          </div>
          <h1 className="text-h2 font-display">Schedule</h1>
          <p className="font-body text-gray-600">Планирование рабочего времени</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bento-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-body font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-t2"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-body font-medium mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-t2"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                className="p-3 bg-t2-magenta text-white rounded-xl text-sm font-body"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center font-body text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          T2 Schedule System © 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
