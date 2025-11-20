/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-pink': '#FF90E8',
        'neo-yellow': '#FFC900',
        'neo-cyan': '#00F0FF',
        'neo-black': '#0D0D0D',
        'neo-white': '#FFFFFF',
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        'sans': ['"Public Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
