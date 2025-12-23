/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Noto Sans JP",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      colors: {
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        dracula: {
          background: "#282a36",
          currentLine: "#44475a",
          foreground: "#f8f8f2",
          comment: "#6272a4",
          cyan: "#8be9fd",
          green: "#50fa7b",
          orange: "#ffb86c",
          pink: "#ff79c6",
          purple: "#bd93f9",
          red: "#ff5555",
          yellow: "#f1fa8c",
        },
        oneDark: {
          background: "#282c34",
          currentLine: "#2c313c",
          foreground: "#abb2bf",
          comment: "#5c6370",
          cyan: "#56b6c2",
          green: "#98c379",
          orange: "#d19a66",
          pink: "#c678dd",
          purple: "#c678dd",
          red: "#e06c75",
          yellow: "#e5c07b",
        },
      },
    },
  },
  plugins: [],
};
