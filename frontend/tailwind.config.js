/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fbf2eb",
          100: "#f4dfcf",
          200: "#e7c1a4",
          300: "#d8a27b",
          400: "#c88456",
          500: "#b76a3c",
          600: "#9d552d",
          700: "#8c3b20",
          800: "#6f2d19",
          900: "#542115"
        }
      }
    }
  },
  plugins: []
};
