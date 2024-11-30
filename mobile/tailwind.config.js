/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./Main.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}", // Ensure this is accurate for your structure
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}" // Ensure src is properly included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
  