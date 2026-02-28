/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1717cf",
        "background-light": "#f6f6f8",
        "background-dark": "#0a0a0f",
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c2d2ff",
          300: "#93afff",
          400: "#6487fb",
          500: "#4563f5",
          600: "#3347e8",
          700: "#2a38cc",
          800: "#2733a4",
          900: "#263082",
          950: "#191e50",
        },
        surface: {
          900: "#0f1117",
          800: "#161b27",
          700: "#1e2535",
          600: "#252d42",
          500: "#2d3650",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        full: "9999px",
        // Keep rounded versions for inner pages
        "inner": "0.75rem",
        "inner-lg": "1rem",
        "inner-xl": "1.25rem",
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.35s ease-out",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        blink: {
          "50%": { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
