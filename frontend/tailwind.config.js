/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B5A2B", // Cafe brown theme
        secondary: "#D2B48C", // Tan
        accent: "#CD853F", // Peru
        dark: "#2C1E16",
        light: "#FDFBF7",
      }
    },
  },
  plugins: [],
}
