/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./public/**/*.html",
    "./public/js/**/*.js"
  ],

  theme: {
    extend: {
      colors: {
        primary: "#001489",
        accent: "#ba0c2f",
        bgLight: "#f4f6f8",
        bgDark: "#0f1115",

        // merged + resolved
        capNavy: "#0B1E38",        // from newer config
        capBlue: "#003366",        // from newer config
        capBlueSoft: "#1E4BC2",
        capSurface: "#0F2F92",
        capBorder: "#335BBE",
        capGold: "#FFCC00",

        skyhawk: {
          50: "#f6f8fb",
          100: "#eef2f8",
          200: "#d9e3f0",
          300: "#b8cadd",
          400: "#8ca9c6",
          500: "#5e84af",
          600: "#456892",
          700: "#344f73",
          800: "#263a56",
          900: "#17243a"
        }
      },

      fontFamily: {
        heading: ["Ubuntu", "Helvetica", "sans-serif"]
      },

      fontSize: {
        h4: ["1.25rem", { lineHeight: "1.375em" }]
      },

      letterSpacing: {
        tightish: "0.01em"
      },

      boxShadow: {
        nav: "0 12px 28px -18px rgba(6, 17, 61, 0.65)",
        drawer: "8px 0 32px -18px rgba(4, 9, 32, 0.75)",
        glow: "0 24px 80px rgba(23, 36, 58, 0.18)"
      }
    }
  },

  plugins: [],
};