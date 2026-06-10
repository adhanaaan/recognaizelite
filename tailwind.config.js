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
        "Noto Sans SC",
        "sans-serif",
      ],
      mono: ["Menlo", "Monaco", "Courier New", "monospace"],
      // Plus Jakarta Sans — used by the Brain Health Quiz screens (/demo-questions
      // + the /demo-report Brain Health Score panel) to match the sibling
      // b2cfunnel design language. Loaded in _app.tsx alongside Noto Sans SC.
      display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      jakarta: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
    },
    extend: {
      screens: {
        tall: { raw: "(min-height: 720px)" },
        "tall-lg": { raw: "(min-height: 786px)" },
      },
      spacing: {
        90: "22.5rem",
      },
      // Clinical Empathy palette — ported from b2cfunnel/tailwind.config.ts so
      // the Brain Health Quiz screens render in the same warm-cream design
      // language. Scoped under explicit names (quiz*, charcoal, etc.) so they
      // can't clash with the existing recognaize tokens.
      colors: {
        accent: "var(--accent)",
        task1: "var(--task1)",
        task2: "var(--task2)",
        task3: "var(--task3)",
        task4: "var(--task4)",
        task5: "var(--task5)",
        task6: "var(--task6)",
        quizPrimary: {
          DEFAULT: "#f77528",
          on: "#ffffff",
          container: "#ffdbcb",
          onContainer: "#331200",
        },
        quizSecondary: {
          DEFAULT: "#7d5747",
          on: "#ffffff",
        },
        quizTertiary: {
          DEFAULT: "#6c5d2e",
          on: "#ffffff",
        },
        quizError: {
          DEFAULT: "#ba1a1a",
          on: "#ffffff",
        },
        quizSurface: {
          DEFAULT: "#fff8f6",
          dim: "#ecd5cc",
          bright: "#fff8f6",
          lowest: "#ffffff",
          low: "#fff1eb",
          container: "#fbe7de",
          high: "#f9ddcf",
          highest: "#f7d2c1",
        },
        quizOutline: {
          DEFAULT: "#85736b",
          variant: "#d8c2b9",
        },
        charcoal: "#2d2d2d",
        quizPill: {
          text: "#993c1d",
          bg: "#faece7",
        },
        gauge: {
          low: "#97c459",
          moderate: "#fac775",
          elevated: "#ef9f27",
          high: "#f09595",
        },
      },
      width: {
        84: 4 * 84,
        "90vw": "90vw",
      },
      transitionDuration: {
        400: "400ms",
      },
      boxShadow: {
        // b2cfunnel "card" + "float" elevations — used by the option tiles
        // on /demo-questions so the hover lift matches the source design.
        card: "0 8px 24px -8px rgba(51, 18, 0, 0.12), 0 2px 8px -2px rgba(51, 18, 0, 0.08)",
        float: "0 16px 40px -12px rgba(51, 18, 0, 0.18)",
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
        // Per-screen entrance animation used by every Brain Health Quiz step.
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
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
        "fade-up": "fade-up 0.4s ease-out both",
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
