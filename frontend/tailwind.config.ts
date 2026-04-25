import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // T2 Brand Colors
        t2: {
          black: "#000000",
          white: "#FFFFFF",
          magenta: "#FF3495",
          salad: "#A7FC00",
          electric: "#00BFFFF",
          blue: "#0000FF",
        },
        // Semantic colors for schedule
        status: {
          work: "#A7FC00",      // Салатовый - рабочий
          off: "#000000",       // Черный - выходной
          vacation: "#FF3495",  // Маджента - отпуск
          sick: "#00BFFFF",     // Электрик-блю - больничный
          split: "#0000FF",     // Синий - дробящаяся смена
          empty: "#FFFFFF",     // Белый - не заполнено
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // T2 specific - oval buttons
        xl: "9999px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "Arial Black", "sans-serif"],
        stencil: ["var(--font-stencil)", "Inter", "sans-serif"],
        body: ["var(--font-body)", "Inter", "Roboto", "sans-serif"],
      },
      fontSize: {
        // T2 Typography scale
        h1: ["48px", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        h2: ["32px", { lineHeight: "0.95", letterSpacing: "-0.01em" }],
        h3: ["24px", { lineHeight: "0.95" }],
        text: ["16px", { lineHeight: "1.4" }],
        textlg: ["24px", { lineHeight: "1.4" }],
      },
      spacing: {
        // T2 Bento spacing system (for 1200px container)
        bento: "32px",
        "bento-sm": "16px",
        gap: "8px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
