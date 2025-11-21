/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ol-base': '#111111',
        'ol-text': '#E0E0E0',
        'ol-accent': '#F0F0F0',
        'ol-gray': '#333333',
        'ol-dim': '#888888',
      },
      fontFamily: {
        'sans': ['"Noto Sans KR"', 'sans-serif'],
        'mono': ['"D2Coding"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'ol-glow': '0 0 10px rgba(240, 240, 240, 0.3)',
        'ol-glow-strong': '0 0 15px rgba(240, 240, 240, 0.5)',
      }
    },
  },
  plugins: [],
}
