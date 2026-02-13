/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#137fec",
        "accent-teal": "#2dd4bf",
        "background-dark": "#0b0f1a",
        "background-light": "#f6f6f8",
        "card-dark": "#161e2e",
        "navy-deep": "#082f80",


        "brand-navy": "#0a0c10",
        "brand-card": "#12161f",
        "brand-blue": "#1152d4",
        "brand-border": "#1f2937",
      },

      fontFamily: {
        display: ["Manrope", "sans-serif"],
        lexend: ["Lexend", "sans-serif"], 
      },

      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2rem",
        full: "9999px",
      },

      boxShadow: {
        glow: "0 0 80px rgba(19,127,236,0.2)",
      },

      backgroundImage: {
        mesh: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
