/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#efb291',      // Peach/Orange accent
        secondary: '#0b2735',     // Dark teal/blue
        accent: '#e5e2db',       // Light beige/cream
        dark: '#0b2735',
        light: '#e5e2db',
        peach: '#efb291',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(11, 39, 53, 0.08)',
        'medium': '0 4px 16px rgba(11, 39, 53, 0.12)',
        'large': '0 8px 24px rgba(11, 39, 53, 0.16)',
      },
    },
  },
  plugins: [],
}

