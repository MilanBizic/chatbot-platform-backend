/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2dae5',
          300: '#aabdd0',
          400: '#7c9bb7',
          500: '#5b7fa0',
          600: '#476685',
          700: '#3a526d',
          800: '#32465b',
          900: '#2d3c4d',
          950: '#1e2733',
        }
      }
    },
  },
  plugins: [],
}
