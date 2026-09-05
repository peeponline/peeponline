/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        exo: ['Exo 2', 'sans-serif'],
      },
      colors: {
        deep: '#050D1A',
        card: '#0B1A2E',
        // add other custom colors if needed
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulse: {
          '0%,100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.5)', opacity: 0.5 },
        },
        scanline: {
          '0%': { top: '-5%' },
          '100%': { top: '105%' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease both',
        ticker: 'ticker 28s linear infinite',
        pulse: 'pulse 1.8s infinite',
        scanline: 'scanline 5s linear infinite',
      },
    },
  },
  plugins: [],
};