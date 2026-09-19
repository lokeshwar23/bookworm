/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./store/**/*.{js,jsx}",
    "./services/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base palette matching wireframes
        bg: {
          base: "#0f0f0f",
          card: "#1a1a1a",
          elevated: "#222222",
        },
        border: {
          DEFAULT: "#2a2a2a",
          muted: "#333333",
        },
        accent: {
          indigo: "#4f46e5", // indigo-600
          purple: "#9333ea", // purple-600
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
