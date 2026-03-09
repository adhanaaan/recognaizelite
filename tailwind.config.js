const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.tsx", "./src/**/*.ts", "./public/index.html"],
  theme: {
    fontFamily: {
      sans: [
        "Avenir",
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica",
        "Arial",
        "sans-serif",
      ],
      mono: ["Menlo", "Monaco", "Courier New", "monospace"],
    },
    extend: {
      screens: {
        tall: { raw: "(min-height: 720px)" },
        "tall-lg": { raw: "(min-height: 786px)" },
      },
      spacing: {
        90: "22.5rem",
      },
      colors: {
        accent: "var(--accent)",
        task1: "var(--task1)",
        task2: "var(--task2)",
        task3: "var(--task3)",
        task4: "var(--task4)",
        task5: "var(--task5)",
        task6: "var(--task6)",
      },
      width: {
        84: 4 * 84,
        "90vw": "90vw",
      },
      transitionDuration: {
        400: "400ms",
      },
      keyframes: {
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0.5" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(100%)" },
          to: { opacity: 1, transform: "translateY(0px)" },
        },
        "slide-down": {
          from: { opacity: 0, transform: "translateY(-100%)" },
          to: { opacity: 1, transform: "translateY(0px)" },
        },
        "slide-left": {
          from: { opacity: 0, transform: "translateX(-100%)" },
          to: { opacity: 1, transform: "translateX(0px)" },
        },
        "slide-right": {
          from: { opacity: 0, transform: "translateX(100%)" },
          to: { opacity: 1, transform: "translateX(0px)" },
        },
      },
      animation: {
        "fade-out": "fade-out 0.4s ease-in-out forwards",
        "fade-in": "fade-in 0.4s ease-in-out forwards",
        "slide-left": "slide-left 0.8s ease",
        "slide-right": "slide-right 0.4s ease",
        "slide-up": "slide-up 0.4s ease",
        "slide-down": "slide-down 0.4s ease",
      },
    },
  },

  plugins: [
    plugin(function ({ addVariant, addComponents }) {
      addVariant("ios", "@supports (-webkit-touch-callout: none)");
      addComponents({
        ".f": {
          display: "flex",
        },
        ".fc": {
          display: "flex",
          flexDirection: "column",
        },
        ".c": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        ".cc": {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
        ".full": {
          height: "100%",
          width: "100%",
        },
        ".r": {
          position: "relative",
        },
        ".text-base-22": {
          fontSize: "16px",
          lineHeight: "22px",
        },
      });
    }),
  ],
};
