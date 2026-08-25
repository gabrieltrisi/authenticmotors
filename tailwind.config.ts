import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B0B0B",
          secondary: "#151515",
        },
        copper: {
          DEFAULT: "#A65F3C",
          light: "#C47A4A",
          dark: "#7E472C",
        },
        foreground: {
          DEFAULT: "#FFFFFF",
          muted: "#CFCFCF",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderColor: {
        copper: "rgba(166,95,60,0.3)",
      },
      backgroundImage: {
        "copper-gradient":
          "linear-gradient(135deg, #C47A4A 0%, #A65F3C 50%, #7E472C 100%)",
        "dark-radial":
          "radial-gradient(120% 120% at 50% 0%, #1a1a1a 0%, #0B0B0B 55%)",
      },
      boxShadow: {
        copper: "0 10px 40px -12px rgba(166,95,60,0.45)",
        "copper-lg": "0 20px 60px -15px rgba(166,95,60,0.55)",
        card: "0 8px 30px -12px rgba(0,0,0,0.7)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.8s ease both",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
