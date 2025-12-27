/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#efb291',
        secondary: '#0b2735',
        accent: '#1a3d52',
      },
    },
  },
  plugins: [],
}

