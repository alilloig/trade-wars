/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#e6c966',
          dark: '#b8992f',
        },
        element: {
          erbium: '#ff6347',
          lanthanum: '#00ff7f',
          thorium: '#8a2be2',
        },
        status: {
          success: '#4baf4b',
          warning: '#ffa500',
          error: '#ff6b6b',
          info: '#6b9bd2',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
