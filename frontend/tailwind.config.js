/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        m3: {
          primary: "#2E7D32",
          primaryContainer: "#C8E6C9",
          secondary: "#66BB6A",
          surface: "#F7FAF6",
          surfaceLow: "#EEF5EE",
          onSurface: "#1B1C1A",
          outline: "#C5CDC4",
        },
        g: {
          blue: "#4285F4",
          red: "#EA4335",
          yellow: "#FBBC04",
          green: "#34A853",
        },
        wa: {
          green: "#25D366",
          bubble: "#DCF8C6",
          chat: "#E5DDD5",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "1.75rem",
        "5xl": "2rem",
      },
      boxShadow: {
        soft: "0 8px 28px rgba(46, 125, 50, 0.12)",
        float: "0 12px 40px rgba(27, 28, 26, 0.16)",
        glass: "0 8px 32px rgba(46, 125, 50, 0.1)",
      },
      keyframes: {
        geminiGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(66,133,244,0.45), 0 0 24px rgba(52,168,83,0.35)" },
          "33%": { boxShadow: "0 0 0 8px rgba(234,67,53,0.0), 0 0 28px rgba(251,188,4,0.45)" },
          "66%": { boxShadow: "0 0 0 4px rgba(52,168,83,0.15), 0 0 32px rgba(66,133,244,0.4)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      animation: {
        geminiGlow: "geminiGlow 2.4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        typing: "typing 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
