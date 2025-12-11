/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2563EB", // Blue-600
          foreground: "#FFFFFF",
          light: "#60A5FA", // Blue-400
          dark: "#1D4ED8", // Blue-700
        },
        secondary: {
          DEFAULT: "#10B981", // Emerald-500
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#EF4444", // Red-500
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F6", // Gray-100
          foreground: "#6B7280", // Gray-500
        },
        accent: {
          DEFAULT: "#F3F4F6", // Gray-100
          foreground: "#111827", // Gray-900
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
      },
    },
  },
  plugins: [],
};
