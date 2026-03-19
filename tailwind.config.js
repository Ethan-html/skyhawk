/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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

        capNavy: "#0B1E38",
        capGold: "#FFCC00",
        capBlue: "#003366",

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
      boxShadow: {
        glow: "0 24px 80px rgba(23, 36, 58, 0.18)"
      }
    }
  },
  plugins: [],
}