/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F2F6F4',
          ink: '#0F2A2E',
          mut: '#5B7276',
          teal: '#0F766E',
          deep: '#0B3C3F',
          mark: '#F4C84A',
          coral: '#E0573B',
          line: '#D5E1DD',
          card: '#FFFFFF',
        }
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      }
    },
  },
  plugins: [],
}
