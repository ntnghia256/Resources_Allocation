/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color schemes for dynamic premium UI
        brand: {
          light: '#2563eb', // blue-600
          dark: '#3b82f6',  // blue-500
        }
      }
    },
  },
  plugins: [],
}

