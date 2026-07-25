/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dark-200': '#475467',
        'light-blue-100': 'rgba(193, 211, 248, 0.1)',
        'light-blue-200': 'rgba(167, 191, 241, 0.3)',
        'badge-green': '#d5faf1',
        'badge-red': '#f9e3e2',
        'badge-yellow': '#fceed8',
        'badge-green-text': '#254d4a',
        'badge-red-text': '#752522',
        'badge-yellow-text': '#73321b',
      },
      fontFamily: {
        sans: ['"Mona Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
}
