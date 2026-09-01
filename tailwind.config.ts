import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          light: "#f7f8fa",
          dark: "#111317",
        },
        card: {
          light: "#ffffff",
          dark: "#181b20",
        },
        border: {
          light: "#e4e7ec",
          dark: "#2a2e35",
        },
        ink: {
          primary: {
            light: "#14181f",
            dark: "#eef0f3",
          },
          secondary: {
            light: "#4b5563",
            dark: "#a6adba",
          },
          muted: {
            light: "#8a919e",
            dark: "#767d8a",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
