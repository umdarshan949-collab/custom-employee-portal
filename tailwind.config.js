/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zoho: {
          red: '#F0483E',
          blue: '#1370F2',
          green: '#22B573',
          yellow: '#FFBC00',
          dark: '#1E293B',
        }
      }
    },
  },
  plugins: [],
}
