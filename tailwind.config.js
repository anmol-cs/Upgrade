/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: { primary: "#000000", surface: "#0E0E0E", card: "#151515" },
        text: { primary: "#FFFFFF", secondary: "#9A9A9A", disabled: "#555555" },
        accent: "#D72638",
        border: "#242424",
      },
      spacing: {
        1: "4px", 2: "8px", 3: "12px", 4: "16px", 6: "24px", 8: "32px", 12: "48px", 16: "64px",
      },
      borderRadius: { sm: "8px", md: "16px", lg: "24px", full: "9999px" },
    },
  },
  plugins: [],
};
