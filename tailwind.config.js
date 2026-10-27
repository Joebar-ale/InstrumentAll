/** @type {import('tailwindcss').Config} */
module.exports = {
  // Rutas donde NativeWind busca clases Tailwind
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Preset obligatorio para React Native
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
