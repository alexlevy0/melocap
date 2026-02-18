import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Violet Électrique — Primaire
        primary: {
          50: "#f3f0ff",
          100: "#e9e3ff",
          200: "#d5caff",
          300: "#b8a5ff",
          400: "#9575ff",
          500: "#7c3aed", // Base
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b1578",
          950: "#2e1065",
        },
        // Orange Sunset — Secondaire
        secondary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Base
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        // Cyan Néon — Accent
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4", // Base
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        // Surfaces sombres
        surface: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a26",
          600: "#22223a",
          500: "#2d2d4a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glow-primary":
          "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
        "glow-accent":
          "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "flip": "flip 0.6s ease-in-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(124, 58, 237, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.9), 0 0 40px rgba(124, 58, 237, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        flip: {
          "0%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(124, 58, 237, 0.5)",
        "glow-accent": "0 0 20px rgba(6, 182, 212, 0.5)",
        "glow-secondary": "0 0 20px rgba(249, 115, 22, 0.5)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
