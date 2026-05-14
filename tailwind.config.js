/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0d0f14",
          panel: "#161922",
          rail: "#111923",
          line: "#2a2d3a",
          muted: "#8a99a8",
          text: "#e5edf4",
          green: "#27d3a2",
          amber: "#f5c451",
          red: "#ff5d73",
          cyan: "#56c7ff",
          teal: "#00e5c3",
          blue: "#60a5fa",
          purple: "#a78bfa",
        },
      },
      boxShadow: {
        terminal: "0 24px 80px rgba(0, 0, 0, 0.35)",
        teal: "0 0 8px rgba(0, 229, 195, 0.3)",
      },
    },
  },
  plugins: [],
}
